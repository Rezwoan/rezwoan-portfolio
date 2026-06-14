'use client';

import { useState } from 'react';
import { Markdown } from '@/components/ui/markdown';
import { inputClass } from './ui';

export function MarkdownEditor({ value, onChange, label = 'Body (Markdown)', rows = 14 }: { value: string; onChange: (v: string) => void; label?: string; rows?: number }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-text">{label}</span>
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setPreview(false)} className={`rounded px-2 py-1 ${!preview ? 'bg-accent/15 text-accent' : 'text-text-muted'}`}>Write</button>
          <button type="button" onClick={() => setPreview(true)} className={`rounded px-2 py-1 ${preview ? 'bg-accent/15 text-accent' : 'text-text-muted'}`}>Preview</button>
        </div>
      </div>
      {preview ? (
        <div className="min-h-[12rem] rounded-md border border-border bg-bg p-4">
          {value ? <Markdown content={value} /> : <p className="text-text-muted">Nothing to preview.</p>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${inputClass} resize-y font-mono text-[0.8rem]`}
          placeholder="## Overview&#10;&#10;Write your case study in Markdown…"
        />
      )}
    </div>
  );
}
