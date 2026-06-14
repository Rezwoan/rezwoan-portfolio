'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Input, Toggle, useToast, ConfirmButton } from '@/components/admin/ui';

const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'design', 'ai', 'other'];

export default function SkillsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => { adminApi.skills.list().then(setItems).catch(() => {}); }, []);

  const update = (i: number, k: string, v: any) =>
    setItems((it) => it.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  async function saveRow(s: any) {
    try {
      const payload = { name: s.name, category: s.category, proficiency: Number(s.proficiency), context: s.context, iconName: s.iconName, order: Number(s.order) || 0, showOnHero: s.showOnHero };
      if (s.id?.startsWith('new-')) {
        const created = await adminApi.skills.create(payload);
        setItems((it) => it.map((x) => (x.id === s.id ? created : x)));
      } else {
        await adminApi.skills.update(s.id, payload);
      }
      toast('Saved');
    } catch { toast('Save failed', 'error'); }
  }
  async function remove(s: any, i: number) {
    if (s.id?.startsWith('new-')) { setItems((it) => it.filter((_, idx) => idx !== i)); return; }
    try { await adminApi.skills.remove(s.id); setItems((it) => it.filter((x) => x.id !== s.id)); toast('Deleted'); }
    catch { toast('Failed', 'error'); }
  }
  const addRow = () =>
    setItems((it) => [...it, { id: `new-${Date.now()}`, name: '', category: 'frontend', proficiency: 3, context: '', iconName: '', order: it.length, showOnHero: false }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Skills</h1>
        <button onClick={addRow} className="btn-primary text-sm"><Plus size={16} /> Add skill</button>
      </div>
      <div className="space-y-3">
        {items.map((s, i) => (
          <div key={s.id} className="card grid grid-cols-2 items-end gap-3 p-4 md:grid-cols-[1.5fr_1fr_0.8fr_1.2fr_auto_auto]">
            <Input value={s.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Skill name" />
            <select value={s.category} onChange={(e) => update(i, 'category', e.target.value)} className="rounded-md border border-border bg-bg px-3 py-2 text-sm capitalize">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Input type="number" min={1} max={5} value={s.proficiency} onChange={(e) => update(i, 'proficiency', e.target.value)} />
            <Input value={s.context} onChange={(e) => update(i, 'context', e.target.value)} placeholder="2y, daily" />
            <label className="flex items-center gap-1 text-xs text-text-muted">Hero<Toggle checked={s.showOnHero} onChange={(v) => update(i, 'showOnHero', v)} /></label>
            <div className="flex gap-1">
              <button onClick={() => saveRow(s)} className="btn-ghost px-2"><Save size={15} /></button>
              <ConfirmButton onConfirm={() => remove(s, i)} className="btn-ghost px-2 text-error"><Trash2 size={15} /></ConfirmButton>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-text-muted">No skills yet.</p>}
      </div>
    </div>
  );
}
