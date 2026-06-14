'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Input, Textarea, Toggle, useToast, ConfirmButton, Field } from '@/components/admin/ui';

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => { adminApi.testimonials.list().then(setItems).catch(() => {}); }, []);
  const update = (i: number, k: string, v: any) => setItems((it) => it.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  async function saveRow(s: any) {
    const payload = { clientName: s.clientName, clientTitle: s.clientTitle, clientCompany: s.clientCompany, quote: s.quote, rating: Number(s.rating) || 5, source: s.source, sourceUrl: s.sourceUrl, featured: s.featured, avatarUrl: s.avatarUrl, order: Number(s.order) || 0 };
    try {
      if (s.id?.startsWith('new-')) { const c = await adminApi.testimonials.create(payload); setItems((it) => it.map((x) => (x.id === s.id ? c : x))); }
      else await adminApi.testimonials.update(s.id, payload);
      toast('Saved');
    } catch { toast('Failed', 'error'); }
  }
  async function remove(s: any, i: number) {
    if (s.id?.startsWith('new-')) return setItems((it) => it.filter((_, idx) => idx !== i));
    try { await adminApi.testimonials.remove(s.id); setItems((it) => it.filter((x) => x.id !== s.id)); } catch { toast('Failed', 'error'); }
  }
  const addRow = () => setItems((it) => [...it, { id: `new-${Date.now()}`, clientName: '', clientTitle: '', clientCompany: '', quote: '', rating: 5, source: 'fiverr', sourceUrl: '', featured: true, avatarUrl: '', order: it.length }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Testimonials</h1>
        <button onClick={addRow} className="btn-primary text-sm"><Plus size={16} /> Add</button>
      </div>
      <div className="space-y-4">
        {items.map((s, i) => (
          <div key={s.id} className="card space-y-3 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Client name"><Input value={s.clientName} onChange={(e) => update(i, 'clientName', e.target.value)} /></Field>
              <Field label="Title"><Input value={s.clientTitle} onChange={(e) => update(i, 'clientTitle', e.target.value)} placeholder="CEO" /></Field>
              <Field label="Company"><Input value={s.clientCompany} onChange={(e) => update(i, 'clientCompany', e.target.value)} /></Field>
            </div>
            <Field label="Quote"><Textarea value={s.quote} onChange={(e) => update(i, 'quote', e.target.value)} rows={2} /></Field>
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Rating"><Input type="number" min={1} max={5} value={s.rating} onChange={(e) => update(i, 'rating', e.target.value)} className="w-20" /></Field>
              <Field label="Source"><Input value={s.source} onChange={(e) => update(i, 'source', e.target.value)} className="w-28" placeholder="fiverr" /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm">Featured <Toggle checked={s.featured} onChange={(v) => update(i, 'featured', v)} /></label>
              <div className="ml-auto flex gap-1">
                <button onClick={() => saveRow(s)} className="btn-secondary text-sm"><Save size={15} /> Save</button>
                <ConfirmButton onConfirm={() => remove(s, i)} className="btn-ghost px-2 text-error"><Trash2 size={15} /></ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-text-muted">No testimonials yet.</p>}
      </div>
    </div>
  );
}
