/**
 * lib/utils.ts — General utility functions.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely.
 * Handles conditional classes and deduplication.
 *
 * Usage: cn("px-4 py-2", isActive && "bg-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a readable format.
 * e.g. "2024-01-15" → "January 2024"
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    ...options,
  });
}

/**
 * Format a date range for the Experience section.
 * e.g. "Jan 2023 – Present" or "Jan 2022 – Dec 2023"
 */
export function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (isCurrent || !endDate) return `${start} – Present`;
  const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${start} – ${end}`;
}
