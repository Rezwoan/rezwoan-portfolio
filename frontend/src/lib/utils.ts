import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve an image/file path to an absolute URL (handles /uploads/* and externals). */
export function mediaUrl(path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (process.env.NODE_ENV === 'production') return path; // nginx serves /uploads on-origin
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201';
  return path.startsWith('/uploads') ? `${api}${path}` : path;
}

export function formatDate(d?: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function dateRange(start?: string | Date | null, end?: string | Date | null, isCurrent?: boolean): string {
  const fmt = (d?: string | Date | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
  return `${fmt(start)} — ${isCurrent || !end ? 'Present' : fmt(end)}`;
}
