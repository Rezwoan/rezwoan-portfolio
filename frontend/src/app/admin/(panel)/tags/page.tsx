'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Input, useToast, ConfirmButton } from '@/components/admin/ui';

export default function TagsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => { adminApi.tags.list().then(setItems).catch(() => {}); }, []);
  const update = (i: number, k: string, v: any) => setItems((it) => it.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  async function saveRow(s: any) {
    try {
      if (s.id?.startsWith('new-')) { const c = await adminApi.tags.create({ name: s.name, color: s.color }); setItems((it) => it.map((x) => (x.id === s.id ? c : x))); }
      else await adminApi.tags.update(s.id, { name: s.name, color: s.color });
      toast('Saved');
    } catch { toast('Failed', 'error'); }
  }
  async function remove(s: any, i: number) {
    if (s.id?.startsWith('new-')) return setItems((it) => it.filter((_, idx) => idx !== i));
    try { await adminApi.tags.remove(s.id); setItems((it) => it.filter((x) => x.id !== s.id)); } catch { toast('Failed', 'error'); }
  }
  const addRow = () => setItems((it) => [...it, { id: `new-${Date.now()}`, name: '', color: '#7C6CFF' }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Tags</h1>
        <button onClick={addRow} className="btn-primary text-sm"><Plus size={16} /> Add tag</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <div key={s.id} className="card flex items-center gap-2 p-3">
            <input type="color" value={s.color} onChange={(e) => update(i, 'color', e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent" />
            <Input value={s.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Tag name" />
            <button onClick={() => saveRow(s)} className="btn-ghost px-2"><Save size={15} /></button>
            <ConfirmButton onConfirm={() => remove(s, i)} className="btn-ghost px-2 text-error"><Trash2 size={15} /></ConfirmButton>
          </div>
        ))}
        {items.length === 0 && <p className="text-text-muted">No tags yet.</p>}
      </div>
    </div>
  );
}
