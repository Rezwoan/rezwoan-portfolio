'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { Field, Input, Textarea, Toggle, useToast } from './ui';
import { ImageUploader } from './image-uploader';
import { MarkdownEditor } from './markdown-editor';

const empty = {
  title: '', slug: '', excerpt: '', body: '', coverImageUrl: '',
  published: false, seoTitle: '', seoDescription: '',
};

export function BlogEditor({ id }: { id?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ ...empty });
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    adminApi.blog.get(id).then((p: any) => {
      setForm({ ...empty, ...p });
      setTagsText((p.tags || []).join(', '));
    }).catch(() => toast('Could not load post', 'error'));
  }, [id]);

  async function save(publish?: boolean) {
    setSaving(true);
    const payload = {
      ...form,
      published: publish ?? form.published,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (id) await adminApi.blog.update(id, payload as any);
      else await adminApi.blog.create(payload as any);
      toast('Saved');
      router.push('/admin/blog');
    } catch (e) {
      toast((e as Error).message || 'Save failed', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"><ArrowLeft size={14} /> Blog</Link>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="btn-secondary text-sm"><Save size={15} /> Save draft</button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save & publish'}</button>
        </div>
      </div>
      <h1 className="text-heading font-bold">{id ? 'Edit post' : 'New post'}</h1>
      <div className="card space-y-5 p-6">
        <Field label="Title"><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Slug" hint="Auto from title if blank."><Input value={form.slug} onChange={(e) => set('slug', e.target.value)} /></Field>
        <Field label="Excerpt" hint="List card + meta description."><Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} /></Field>
        <Field label="Tags" hint="Comma-separated."><Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="nextjs, seo" /></Field>
        <ImageUploader value={form.coverImageUrl} onChange={(url) => set('coverImageUrl', url)} label="Cover image" />
        <MarkdownEditor value={form.body} onChange={(v) => set('body', v)} label="Post body (Markdown)" rows={18} />
        <label className="flex items-center gap-2 text-sm">Published <Toggle checked={form.published} onChange={(v) => set('published', v)} /></label>
      </div>
    </div>
  );
}
