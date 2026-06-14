'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Input, Textarea, Toggle, useToast, ConfirmButton, Field } from '@/components/admin/ui';

const TYPES = ['full-time', 'part-time', 'freelance', 'internship', 'education'];
const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ExperienceAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => { adminApi.experiences.list().then(setItems).catch(() => {}); }, []);
  const update = (i: number, k: string, v: any) => setItems((it) => it.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  async function saveRow(s: any) {
    const payload = {
      company: s.company, role: s.role, employmentType: s.employmentType, location: s.location,
      startDate: s.startDate ? new Date(s.startDate).toISOString() : new Date().toISOString(),
      endDate: s.isCurrent ? '' : s.endDate ? new Date(s.endDate).toISOString() : '',
      isCurrent: s.isCurrent, description: s.description, companyUrl: s.companyUrl,
      tagNames: (s.tagsText || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      order: Number(s.order) || 0,
    };
    try {
      if (s.id?.startsWith('new-')) { const c = await adminApi.experiences.create(payload); setItems((it) => it.map((x) => (x.id === s.id ? { ...c, tagsText: s.tagsText } : x))); }
      else await adminApi.experiences.update(s.id, payload);
      toast('Saved');
    } catch { toast('Failed', 'error'); }
  }
  async function remove(s: any, i: number) {
    if (s.id?.startsWith('new-')) return setItems((it) => it.filter((_, idx) => idx !== i));
    try { await adminApi.experiences.remove(s.id); setItems((it) => it.filter((x) => x.id !== s.id)); } catch { toast('Failed', 'error'); }
  }
  const addRow = () => setItems((it) => [...it, { id: `new-${Date.now()}`, company: '', role: '', employmentType: 'freelance', location: '', startDate: '', endDate: '', isCurrent: false, description: '', companyUrl: '', tagsText: '', order: it.length }]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Experience</h1>
        <button onClick={addRow} className="btn-primary text-sm"><Plus size={16} /> Add</button>
      </div>
      <div className="space-y-4">
        {items.map((s, i) => (
          <div key={s.id} className="card space-y-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Role"><Input value={s.role} onChange={(e) => update(i, 'role', e.target.value)} /></Field>
              <Field label="Company"><Input value={s.company} onChange={(e) => update(i, 'company', e.target.value)} /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Type">
                <select value={s.employmentType} onChange={(e) => update(i, 'employmentType', e.target.value)} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm">
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Location"><Input value={s.location} onChange={(e) => update(i, 'location', e.target.value)} /></Field>
              <Field label="Start"><Input type="date" value={toDateInput(s.startDate)} onChange={(e) => update(i, 'startDate', e.target.value)} /></Field>
              <Field label="End"><Input type="date" value={toDateInput(s.endDate)} disabled={s.isCurrent} onChange={(e) => update(i, 'endDate', e.target.value)} /></Field>
            </div>
            <Field label="Description"><Textarea value={s.description} onChange={(e) => update(i, 'description', e.target.value)} rows={2} /></Field>
            <Field label="Tags (comma-separated)"><Input value={s.tagsText ?? (s.tags || []).map((t: any) => t.name).join(', ')} onChange={(e) => update(i, 'tagsText', e.target.value)} /></Field>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">Current <Toggle checked={s.isCurrent} onChange={(v) => update(i, 'isCurrent', v)} /></label>
              <div className="ml-auto flex gap-1">
                <button onClick={() => saveRow(s)} className="btn-secondary text-sm"><Save size={15} /> Save</button>
                <ConfirmButton onConfirm={() => remove(s, i)} className="btn-ghost px-2 text-error"><Trash2 size={15} /></ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-text-muted">No experience entries yet.</p>}
      </div>
    </div>
  );
}
