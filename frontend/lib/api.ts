/**
 * lib/api.ts — The single API client for the Django/Wagtail backend.
 *
 * RULE: Every component that needs backend data must use a function from
 * this file. No raw `fetch` calls anywhere else in the codebase.
 *
 * All functions use Next.js ISR via `next: { revalidate: 60 }`.
 * This means pages are cached and silently re-fetched after 60 seconds.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Generic fetch wrapper ──────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const { revalidate = 60, ...fetchOptions } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    next: { revalidate },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface WagtailImage {
  id: number;
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface TechTag {
  name: string;
  color: string;
}

export interface SiteSettings {
  full_name: string;
  short_name: string;
  tagline: string;
  bio_short: string;
  bio_long: string;
  available_for_work: boolean;
  email: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  fiverr_url: string;
  resume_pdf: string | null;
  og_image: WagtailImage | null;
  google_analytics_id: string;
  meta_title_suffix: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  body: unknown; // StreamField JSON — rendered on detail page
  cover_image: WagtailImage | null;
  live_url: string;
  github_url: string;
  tech_stack: TechTag[];
  category: string;
  featured: boolean;
  order: number;
  created_at: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: WagtailImage | null;
}

export interface Experience {
  id: number;
  company_name: string;
  role: string;
  employment_type: string;
  company_logo: WagtailImage | null;
  company_url: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  tech_used: TechTag[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string;
  show_on_hero: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: WagtailImage | null;
  tags: string[];
  reading_time: number;
  published_date: string;
  meta_description: string;
}

export interface BlogPostDetail extends BlogPost {
  body: unknown; // StreamField JSON
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_title: string;
  client_company: string;
  avatar: WagtailImage | null;
  quote: string;
  rating: number;
  source: string;
  source_url: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── API functions ──────────────────────────────────────────────────────────

/**
 * Site-wide settings (name, tagline, social links, availability status).
 * Cached for 60s — changes in Wagtail admin appear within a minute.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>("/api/site-settings/");
}

/**
 * All published projects, ordered by the `order` field in the admin.
 * Pass `featured: true` to get only featured projects for the homepage.
 */
export async function getProjects(params?: {
  featured?: boolean;
  category?: string;
}): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.featured) query.set("featured", "true");
  if (params?.category) query.set("category", params.category);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<Project[]>(`/api/projects/${qs}`);
}

/**
 * A single project by slug. Used on /projects/[slug] pages.
 */
export async function getProject(slug: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${slug}/`);
}

/**
 * All slugs for static generation of project pages.
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  const projects = await getProjects();
  return projects.map((p) => p.slug);
}

/**
 * Work experience entries, ordered by start_date descending.
 */
export async function getExperiences(): Promise<Experience[]> {
  return apiFetch<Experience[]>("/api/experiences/");
}

/**
 * Skills grouped by category.
 */
export async function getSkills(): Promise<Skill[]> {
  return apiFetch<Skill[]>("/api/skills/");
}

/**
 * Skills to show in the hero tech ticker (show_on_hero=true).
 */
export async function getHeroSkills(): Promise<Skill[]> {
  return apiFetch<Skill[]>("/api/skills/?show_on_hero=true");
}

/**
 * Paginated blog posts. Pass `page` for pagination.
 */
export async function getBlogPosts(page = 1): Promise<PaginatedResponse<BlogPost>> {
  return apiFetch<PaginatedResponse<BlogPost>>(`/api/blog/?page=${page}`);
}

/**
 * A single blog post by slug. Used on /blog/[slug] pages.
 */
export async function getBlogPost(slug: string): Promise<BlogPostDetail> {
  return apiFetch<BlogPostDetail>(`/api/blog/${slug}/`);
}

/**
 * All blog post slugs for static generation.
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const data = await getBlogPosts();
  return data.results.map((p) => p.slug);
}

/**
 * Featured testimonials for the homepage.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>("/api/testimonials/?featured=true");
}

// ── Write operations ───────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Submit the contact form. No cache — always a live POST.
 */
export async function submitContact(data: ContactFormData): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/api/contact/", {
    method: "POST",
    body: JSON.stringify(data),
    revalidate: 0, // No caching for mutations
  });
}
