'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Github, Star, ExternalLink, Pencil } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { useToast, Toggle, ConfirmButton } from '@/components/admin/ui';

export default function ProjectsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => adminApi.projects.list().then(setItems).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function toggle(id: string, field: 'published' | 'featured', value: boolean) {
    setItems((it) => it.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    try { await adminApi.projects.update(id, { [field]: value } as any); } catch { toast('Update failed', 'error'); load(); }
  }
  async function remove(id: string) {
    try { await adminApi.projects.remove(id); setItems((it) => it.filter((p) => p.id !== id)); toast('Deleted'); }
    catch { toast('Delete failed', 'error'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Projects</h1>
        <div className="flex gap-2">
          <Link href="/admin/projects/new?import=1" className="btn-primary text-sm"><Github size={16} /> Import</Link>
          <Link href="/admin/projects/new" className="btn-secondary text-sm"><Plus size={16} /> New</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">No projects yet. Import one from GitHub to get started.</p>
      ) : (
        <div className="card divide-y divide-border">
          {items.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-accent">{p.title}</Link>
                  {p.repoStars ? <span className="inline-flex items-center gap-0.5 text-xs text-text-muted"><Star size={11} /> {p.repoStars}</span> : null}
                </div>
                <p className="truncate text-sm text-text-muted">{p.shortDescription}</p>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-text-muted">Featured<Toggle checked={p.featured} onChange={(v) => toggle(p.id, 'featured', v)} /></label>
              <label className="flex items-center gap-1.5 text-xs text-text-muted">Published<Toggle checked={p.published} onChange={(v) => toggle(p.id, 'published', v)} /></label>
              <div className="flex gap-1">
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn-ghost px-2"><ExternalLink size={15} /></a>}
                <Link href={`/admin/projects/${p.id}`} className="btn-ghost px-2"><Pencil size={15} /></Link>
                <ConfirmButton onConfirm={() => remove(p.id)} className="btn-ghost px-2 text-error">Del</ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
