'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="text-success" size={40} />
        <h3 className="font-display text-xl font-semibold">Message sent!</h3>
        <p className="text-text-secondary">Thanks for reaching out — I&apos;ll reply within a day or two.</p>
        <button onClick={() => setStatus('idle')} className="btn-secondary mt-2">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 md:p-8">
      {/* honeypot — visually hidden */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set('website')}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input required value={form.name} onChange={set('name')} className="input" placeholder="Your name" />
        </Field>
        <Field label="Email" required>
          <input required type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@email.com" />
        </Field>
      </div>
      <Field label="Subject">
        <input value={form.subject} onChange={set('subject')} className="input" placeholder="What's this about?" />
      </Field>
      <Field label="Message" required>
        <textarea
          required
          value={form.message}
          onChange={set('message')}
          rows={6}
          className="input resize-y"
          placeholder="Tell me about your project…"
        />
      </Field>

      {status === 'error' && (
        <p className="flex items-center gap-2 text-sm text-error">
          <AlertCircle size={16} /> Something went wrong. Please try again or email me directly.
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? 'Sending…' : (<>Send message <Send size={16} /></>)}
      </button>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgb(var(--border));
          background: rgb(var(--bg));
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
          color: rgb(var(--text));
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          border-color: rgb(var(--accent));
        }
        :global(.input::placeholder) {
          color: rgb(var(--text-muted));
        }
      `}</style>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
