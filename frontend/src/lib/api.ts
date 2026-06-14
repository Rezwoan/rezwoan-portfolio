/**
 * The ONLY module that talks to the backend. Everything imports typed helpers from here.
 * Server Components call the read helpers (with ISR revalidate); client/admin code uses
 * the apiFetch wrapper with credentials for cookie auth.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201';
const REVALIDATE = 60;

// ── Types ──────────────────────────────────────────────────────────────────
export interface SiteSettings {
  fullName: string;
  shortName: string;
  tagline: string;
  roleLine: string;
  bioShort: string;
  bioLong: string;
  location: string;
  availableForWork: boolean;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  fiverrUrl: string;
  resumeUrl: string;
  ogImageUrl: string;
  faviconUrl: string;
  metaTitleSuffix: string;
  googleAnalyticsId: string;
}

export interface Tag { name: string; color: string; iconName?: string | null }

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  body: string;
  coverImageUrl: string;
  liveUrl: string;
  githubUrl: string;
  category: string;
  featured: boolean;
  published: boolean;
  order: number;
  repoStars?: number | null;
  repoForks?: number | null;
  repoLanguage?: string | null;
  seoTitle: string;
  seoDescription: string;
  seoOgImageUrl: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  iconName: string;
  context: string;
  order: number;
  showOnHero: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  employmentType: string;
  companyUrl: string;
  companyLogoUrl: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  order: number;
  tags: Tag[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  source: string;
  sourceUrl: string;
  featured: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  tags: string[];
  readingTime: number;
  published: boolean;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Low-level fetch ────────────────────────────────────────────────────────
async function getJSON<T>(path: string, revalidate = REVALIDATE): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}

/** Safe variant for build time / empty DB — returns a fallback instead of throwing. */
async function getJSONSafe<T>(path: string, fallback: T, revalidate = REVALIDATE): Promise<T> {
  try {
    return await getJSON<T>(path, revalidate);
  } catch {
    return fallback;
  }
}

/** Client-side fetch with cookie credentials (admin + chat). */
export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
}

// ── Public read helpers (Server Components) ────────────────────────────────
export const getSiteSettings = () =>
  getJSONSafe<SiteSettings | null>('/site-settings', null);
export const getProjects = (q = '') =>
  getJSONSafe<Project[]>(`/projects${q}`, []);
export const getProject = (slug: string) => getJSON<Project>(`/projects/${slug}`);
export const getSkills = (hero = false) =>
  getJSONSafe<Skill[]>(`/skills${hero ? '?hero=true' : ''}`, []);
export const getExperiences = () => getJSONSafe<Experience[]>('/experiences', []);
export const getTestimonials = (featured = false) =>
  getJSONSafe<Testimonial[]>(`/testimonials${featured ? '?featured=true' : ''}`, []);
export const getBlogList = (page = 1) =>
  getJSONSafe<{ items: BlogPost[]; total: number; page: number; limit: number }>(
    `/blog?page=${page}`,
    { items: [], total: 0, page: 1, limit: 12 },
  );
export const getBlogPost = (slug: string) => getJSON<BlogPost>(`/blog/${slug}`);
