'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Msg { role: 'user' | 'model'; text: string }

const STARTERS = ['What can Rezwoan build?', 'Is he available for work?', 'Show me his best project'];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'model', text: "Hi! I'm Rezwoan's assistant. Ask me about his skills, projects, or how to hire him." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    const history = messages.filter((m) => m.text);
    setMessages((m) => [...m, { role: 'user', text: message }, { role: 'model', text: '' }]);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'web', message, history }),
      });
      if (!res.body) throw new Error('no stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: 'model', text: next[next.length - 1].text + chunk };
          return next;
        });
      }
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: 'model', text: 'Sorry, I had trouble responding. Please use the contact page.' };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
        className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full border border-border bg-accent px-5 text-accent-contrast shadow-glow"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
        <span className="hidden text-sm font-medium sm:inline">{open ? 'Close' : 'Ask AI'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-card"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent">
                <MessageCircle size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-none">Rezwoan&apos;s assistant</p>
                <p className="mt-0.5 text-xs text-text-muted">AI · grounded on real data</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-lg rounded-br-sm bg-accent px-3 py-2 text-sm text-accent-contrast'
                        : 'max-w-[85%] rounded-lg rounded-bl-sm bg-bg-raised px-3 py-2 text-sm text-text-secondary'
                    }
                  >
                    {m.text || <span className="animate-pulse-soft">…</span>}
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="chip hover:border-accent/50 hover:text-text"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 rounded-md bg-bg px-3 py-2 text-sm outline-none placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-contrast disabled:opacity-40"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
