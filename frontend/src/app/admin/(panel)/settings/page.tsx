'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Field, Input, Textarea, Toggle, useToast } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';

export default function SettingsAdmin() {
  const [s, setS] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  useEffect(() => { adminApi.settings.get().then(setS).catch(() => {}); }, []);
  const set = (k: string, v: any) => setS((p: any) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    const { id, updatedAt, ...payload } = s;
    try { await adminApi.settings.update(payload); toast('Settings saved'); }
    catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  }

  if (!s) return <p className="text-text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold">Site settings</h1>
        <button onClick={save} disabled={saving} className="btn-primary text-sm"><Save size={15} /> {saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div className="card space-y-5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Identity</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name"><Input value={s.fullName} onChange={(e) => set('fullName', e.target.value)} /></Field>
          <Field label="Short name"><Input value={s.shortName} onChange={(e) => set('shortName', e.target.value)} /></Field>
        </div>
        <Field label="Role line"><Input value={s.roleLine} onChange={(e) => set('roleLine', e.target.value)} /></Field>
        <Field label="Tagline (hero)"><Input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
        <Field label="Short bio" hint="Used in meta descriptions."><Textarea value={s.bioShort} onChange={(e) => set('bioShort', e.target.value)} rows={2} /></Field>
        <Field label="Long bio (Markdown, About page)"><Textarea value={s.bioLong} onChange={(e) => set('bioLong', e.target.value)} rows={6} className="font-mono text-[0.8rem]" /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location"><Input value={s.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <label className="flex items-end gap-2 pb-2 text-sm">Available for work <Toggle checked={s.availableForWork} onChange={(v) => set('availableForWork', v)} /></label>
        </div>
      </div>

      <div className="card space-y-5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Contact & socials</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email"><Input value={s.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="GitHub URL"><Input value={s.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} /></Field>
          <Field label="LinkedIn URL"><Input value={s.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} /></Field>
          <Field label="Twitter/X URL"><Input value={s.twitterUrl} onChange={(e) => set('twitterUrl', e.target.value)} /></Field>
          <Field label="Fiverr URL"><Input value={s.fiverrUrl} onChange={(e) => set('fiverrUrl', e.target.value)} /></Field>
          <Field label="Résumé URL"><Input value={s.resumeUrl} onChange={(e) => set('resumeUrl', e.target.value)} /></Field>
        </div>
      </div>

      <div className="card space-y-5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Branding & SEO</h2>
        <div className="flex flex-wrap gap-8">
          <ImageUploader value={s.ogImageUrl} onChange={(url) => set('ogImageUrl', url)} label="Default OG image" />
          <ImageUploader value={s.faviconUrl} onChange={(url) => set('faviconUrl', url)} label="Favicon" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Meta title suffix"><Input value={s.metaTitleSuffix} onChange={(e) => set('metaTitleSuffix', e.target.value)} /></Field>
          <Field label="Google Analytics ID" hint="G-XXXX, blank disables."><Input value={s.googleAnalyticsId} onChange={(e) => set('googleAnalyticsId', e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}
