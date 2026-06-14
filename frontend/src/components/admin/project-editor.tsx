'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Github, Save, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';
import { Field, Input, Textarea, Toggle, useToast } from './ui';
import { ImageUploader } from './image-uploader';
import { MarkdownEditor } from './markdown-editor';

const CATEGORIES = ['web', 'mobile', 'tool', 'open-source', 'ai'];

const empty = {
  title: '', slug: '', shortDescription: '', body: '', coverImageUrl: '', liveUrl: '', githubUrl: '',
  category: 'web', featured: false, published: false, order: 0,
  repoStars: undefined as number | undefined, repoForks: undefined as number | undefined,
  repoLanguage: '' as string | null, importedFrom: '',
  seoTitle: '', seoDescription: '', seoOgImageUrl: '', tagNames: [] as string[],
};

export function ProjectEditor({ id }: { id?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [form, setForm] = useState({ ...empty });
  const [tagsText, setTagsText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(params.get('import') === '1');

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    adminApi.projects.get(id).then((p: any) => {
      setForm({ ...empty, ...p, tagNames: (p.tags || []).map((t: any) => t.name) });
      setTagsText((p.tags || []).map((t: any) => t.name).join(', '));
    }).catch(() => toast('Could not load project', 'error'));
  }, [id]);

  async function runImport() {
    if (!repoUrl.trim()) return;
    setImporting(true);
    try {
      const draft = await adminApi.importGithub(repoUrl.trim());
      setForm((f) => ({ ...f, ...draft }));
      setTagsText((draft.tagNames || []).join(', '));
      setShowImport(false);
      toast('Imported! Review and publish.');
    } catch (e) {
      toast((e as Error).message || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  }

  async function save(publish?: boolean) {
    setSaving(true);
    const payload = {
      ...form,
      published: publish ?? form.published,
      tagNames: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (id) await adminApi.projects.update(id, payload as any);
      else await adminApi.projects.create(payload as any);
      toast('Saved');
      router.push('/admin/projects');
    } catch (e) {
      toast((e as Error).message || 'Save failed', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={14} /> Projects
        </Link>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="btn-secondary text-sm">
            <Save size={15} /> Save draft
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card space-y-3 border-accent/40 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-accent"><Sparkles size={16} /> Import from a GitHub repo</p>
          <div className="flex gap-2">
            <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" />
            <button onClick={runImport} disabled={importing} className="btn-primary shrink-0 text-sm">
              <Github size={15} /> {importing ? 'Importing…' : 'Import'}
            </button>
          </div>
          <p className="text-xs text-text-muted">AI reads the README and drafts the title, description, case study and tech tags. You review before publishing.</p>
        </div>
      )}

      <h1 className="text-heading font-bold">{id ? 'Edit project' : 'New project'}</h1>

      <div className="card space-y-5 p-6">
        <Field label="Title"><Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Project name" /></Field>
        <Field label="Slug" hint="Auto-generated from the title if left blank.">
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="my-project" />
        </Field>
        <Field label="Short description" hint="Card subtitle + meta description (≤160 chars).">
          <Textarea value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} rows={2} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Live URL"><Input value={form.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} placeholder="https://…" /></Field>
          <Field label="GitHub URL"><Input value={form.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} placeholder="https://github.com/…" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm capitalize outline-none focus:border-accent">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Tags" hint="Comma-separated tech names.">
            <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Next.js, NestJS, Prisma" />
          </Field>
        </div>
        <ImageUploader value={form.coverImageUrl} onChange={(url) => set('coverImageUrl', url)} label="Cover image" />
        <MarkdownEditor value={form.body} onChange={(v) => set('body', v)} label="Case study (Markdown)" />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">Featured <Toggle checked={form.featured} onChange={(v) => set('featured', v)} /></label>
          <label className="flex items-center gap-2 text-sm">Published <Toggle checked={form.published} onChange={(v) => set('published', v)} /></label>
        </div>
      </div>

      <details className="card p-6">
        <summary className="cursor-pointer text-sm font-medium text-text-secondary">SEO overrides (optional)</summary>
        <div className="mt-4 space-y-4">
          <Field label="SEO title"><Input value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></Field>
          <Field label="SEO description"><Textarea value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={2} /></Field>
        </div>
      </details>
    </div>
  );
}
