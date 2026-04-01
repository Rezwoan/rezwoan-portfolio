/**
 * lib/seo.ts — Metadata and structured data helpers.
 *
 * Phase 4 update: all metadata functions now use the dynamic OG image
 * route (/og?...) as the fallback when the CMS has no custom OG image set.
 */

import type { Metadata } from "next";
import type { SiteSettings, Project, BlogPostDetail } from "./api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rezwoan.me";

// ── OG image URL builder ───────────────────────────────────────────────────

/**
 * Build a URL for the dynamic OG image route.
 * Falls back to this when the CMS has no custom OG image for a page.
 */
export function buildOgImageUrl(params: {
  title: string;
  subtitle?: string;
  type?: "home" | "project" | "blog" | "default";
}): string {
  const url = new URL(`${SITE_URL}/og`);
  url.searchParams.set("title", params.title);
  if (params.subtitle) url.searchParams.set("subtitle", params.subtitle);
  if (params.type) url.searchParams.set("type", params.type);
  return url.toString();
}

// ── Base metadata ──────────────────────────────────────────────────────────

export function buildBaseMetadata(settings: SiteSettings): Metadata {
  const ogImageUrl = settings.og_image?.url
    ?? buildOgImageUrl({
        title: settings.full_name,
        subtitle: settings.tagline || "Full Stack Developer · Dhaka, Bangladesh",
        type: "home",
      });

  return {
    title: {
      default: `${settings.full_name}${settings.meta_title_suffix}`,
      template: `%s${settings.meta_title_suffix}`,
    },
    description: settings.bio_short,
    authors: [{ name: settings.full_name, url: SITE_URL }],
    creator: settings.full_name,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: `${settings.full_name} — Portfolio`,
      title: `${settings.full_name}${settings.meta_title_suffix}`,
      description: settings.bio_short,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${settings.full_name} — Portfolio` }],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@XRezwoan",
      title: `${settings.full_name}${settings.meta_title_suffix}`,
      description: settings.bio_short,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: SITE_URL,
      types: { "application/rss+xml": `${SITE_URL}/feed/rss/` },
    },
  };
}

// ── Project page metadata ──────────────────────────────────────────────────

export function buildProjectMetadata(project: Project, settings: SiteSettings): Metadata {
  const title = project.seo_title || project.title;
  const description = project.seo_description || project.short_description;
  const url = `${SITE_URL}/projects/${project.slug}`;

  const cmsImage = project.seo_og_image || project.cover_image;
  const ogImageUrl = cmsImage?.url
    ?? buildOgImageUrl({
        title: project.title,
        subtitle: project.tech_stack.map((t) => t.name).join(" · ") || "Project",
        type: "project",
      });

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

// ── Blog post metadata ─────────────────────────────────────────────────────

export function buildBlogMetadata(post: BlogPostDetail, settings: SiteSettings): Metadata {
  const title = post.title;
  const description = post.meta_description || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;

  const ogImageUrl = post.cover_image?.url
    ?? buildOgImageUrl({ title: post.title, subtitle: post.excerpt, type: "blog" });

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: post.published_date,
      authors: [settings.full_name],
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

// ── JSON-LD structured data ────────────────────────────────────────────────

export function buildPersonSchema(settings: SiteSettings): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: settings.full_name,
        url: SITE_URL,
        jobTitle: "Full Stack Developer",
        description: settings.bio_short,
        knowsAbout: ["Next.js", "React", "Django", "Python", "TypeScript", "PostgreSQL", "Docker"],
        sameAs: [
          settings.github_url,
          settings.linkedin_url,
          settings.twitter_url,
          settings.fiverr_url,
        ].filter(Boolean),
        image: settings.og_image?.url
          ?? buildOgImageUrl({ title: settings.full_name, type: "home" }),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: `${settings.full_name} — Portfolio`,
        author: { "@id": `${SITE_URL}/#person` },
        inLanguage: "en-US",
      },
    ],
  };
}

export function buildProjectSchema(project: Project, settings: SiteSettings): object {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.short_description,
    url: `${SITE_URL}/projects/${project.slug}`,
    author: { "@type": "Person", name: settings.full_name, url: SITE_URL },
    dateCreated: project.created_at,
    ...(project.live_url && { sameAs: project.live_url }),
    ...(project.cover_image && { image: project.cover_image.url }),
  };
}

export function buildBlogSchema(post: BlogPostDetail, settings: SiteSettings): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_date,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Person", name: settings.full_name, url: SITE_URL },
    publisher: { "@type": "Person", name: settings.full_name },
    ...(post.cover_image && { image: post.cover_image.url }),
    timeRequired: `PT${post.reading_time}M`,
    wordCount: post.reading_time * 200,
  };
}

export function jsonLd(data: object): string {
  return JSON.stringify(data);
}
