'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { useToast, Toggle, ConfirmButton } from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';

export default function BlogAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const load = () => adminApi.blog.list().then(setItems).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function togglePub(id: string, v: boolean) {
    setItems((it) => it.map((p) => (p.id === id ? { ...p, published: v } : p)));
    try { await adminApi.blog.update(id, { published: v } as any); } catch { toast('Failed', 'error'); load(); }
  }
  async function remove(id: string) {
    try { await adminApi.blog.remove(id); setItems((it) => it.filter((p) => p.id !== id)); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Blog</h1>
        <Link href="/admin/blog/new" className="btn-primary text-sm"><Plus size={16} /> New post</Link>
      </div>
      {loading ? <p className="text-text-muted">Loading…</p> : items.length === 0 ? (
        <p className="text-text-muted">No posts yet.</p>
      ) : (
        <div className="card divide-y divide-border">
          {items.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-accent">{p.title}</Link>
                <p className="text-xs text-text-muted">{p.publishedAt ? formatDate(p.publishedAt) : 'draft'} · {p.readingTime} min</p>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-text-muted">Published<Toggle checked={p.published} onChange={(v) => togglePub(p.id, v)} /></label>
              <Link href={`/admin/blog/${p.id}`} className="btn-ghost px-2"><Pencil size={15} /></Link>
              <ConfirmButton onConfirm={() => remove(p.id)} className="btn-ghost px-2 text-error">Del</ConfirmButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
