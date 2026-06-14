'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { adminApi } from '@/lib/admin';
import { mediaUrl } from '@/lib/utils';
import { useToast } from './ui';

export function ImageUploader({ value, onChange, label = 'Image' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await adminApi.upload(file);
      onChange(r.url);
      toast('Uploaded');
    } catch (e) {
      toast((e as Error).message || 'Upload failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      {value ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-48 overflow-hidden rounded-md border border-border">
            <Image src={mediaUrl(value)} alt="" fill className="object-cover" sizes="192px" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-bg-raised text-text-muted hover:text-error"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="flex h-32 w-48 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg text-text-muted hover:border-accent/50 hover:text-text"
        >
          <Upload size={20} />
          <span className="text-xs">{busy ? 'Uploading…' : 'Upload'}</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
