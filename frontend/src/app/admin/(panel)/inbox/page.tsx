'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, MailOpen } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { useToast, ConfirmButton } from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';

export default function InboxAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const toast = useToast();
  const load = () => adminApi.contact.list().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  async function expand(m: any) {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) {
      setItems((it) => it.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      adminApi.contact.markRead(m.id, true).catch(() => {});
    }
  }
  async function remove(id: string) {
    try { await adminApi.contact.remove(id); setItems((it) => it.filter((x) => x.id !== id)); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-bold">Inbox</h1>
      {items.length === 0 ? (
        <p className="text-text-muted">No messages yet.</p>
      ) : (
        <div className="card divide-y divide-border">
          {items.map((m) => (
            <div key={m.id}>
              <button onClick={() => expand(m)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-bg-raised">
                <span className="text-text-muted">{m.read ? <MailOpen size={16} /> : <Mail size={16} className="text-accent" />}</span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${m.read ? '' : 'font-semibold'}`}>{m.name} <span className="text-text-muted">· {m.email}</span></p>
                  <p className="truncate text-sm text-text-secondary">{m.subject || m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">{formatDate(m.createdAt)}</span>
              </button>
              {open === m.id && (
                <div className="space-y-3 border-t border-border-muted bg-bg p-4">
                  {m.subject && <p className="text-sm font-medium">{m.subject}</p>}
                  <p className="whitespace-pre-wrap text-sm text-text-secondary">{m.message}</p>
                  <div className="flex gap-2">
                    <a href={`mailto:${m.email}`} className="btn-secondary text-sm">Reply</a>
                    <ConfirmButton onConfirm={() => remove(m.id)} className="btn-ghost text-sm text-error"><Trash2 size={14} /> Delete</ConfirmButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
