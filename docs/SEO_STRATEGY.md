# SEO_STRATEGY.md — Rank & Convert Organically

> The portfolio's job is to be found on Google and turn visitors into clients.
> This file is the SEO contract. Supersedes the old root `SEO_STRATEGY.md`.

---

## North-star metrics
| Metric | Target | Floor |
|---|---|---|
| Lighthouse Performance | ≥ 95 | 90 |
| Lighthouse Accessibility | ≥ 95 | 90 |
| Lighthouse Best Practices | 100 | 95 |
| Lighthouse SEO | 100 | 100 |
| LCP | < 2.0s (research: portfolios should load < 2s) | 2.5s |
| CLS | < 0.05 | 0.1 |
| INP | < 200ms | 200ms |

These are enforced in Phase 6 and re-checked before every notable release.

---

## Target keywords
**Primary (home + meta):** "full stack developer Bangladesh", "Next.js developer for
hire", "React developer Dhaka", "freelance web developer Bangladesh", "hire NestJS
developer".
**Secondary (project/case-study pages):** "SaaS MVP developer", "Figma to React",
"Next.js NestJS developer", "AI web app developer", "PWA developer".
**Long-tail (blog — biggest opportunity):** "self-hosting Next.js on Raspberry Pi with
Cloudflare Tunnel", "NestJS + Prisma SQLite tutorial", "build a portfolio that gets
clients", "Next.js ISR vs SSR for portfolios".

> Strategy (from research): **content marketing + case studies** is the proven organic
> channel. Each real project becomes a case study targeting a secondary keyword; each
> blog post targets a long-tail keyword. Testimonials provide the conversion push.

---

## Technical SEO checklist (Phase 6 DoD)
- [ ] `app/sitemap.ts` — dynamic, pulls slugs from the API (projects, blog, static).
- [ ] `app/robots.ts` — allow all except `/admin`; points to the sitemap.
- [ ] Canonical URL on every page via metadata `alternates.canonical`.
- [ ] `generateMetadata()` on every route (title, description, OG, Twitter).
- [ ] Title fallback chain: `seoTitle → title → SiteSettings default`. Never empty.
- [ ] All images `next/image` with explicit width/height (kills CLS) + meaningful `alt`.
- [ ] Hero LCP image/text preloaded; display font preloaded.
- [ ] One H1 per page; logical heading order.
- [ ] No broken internal links; trailing-slash consistency.
- [ ] `llms.txt` route — markdown profile for AI crawlers (carry over the old idea).
- [ ] RSS feed at `/blog/rss.xml` with `<link rel="alternate">` autodiscovery.

---

## Metadata pattern (Next.js)
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const p = await getProject(params.slug);
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.shortDescription;
  const url = `https://rezwoan.me/projects/${p.slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article',
      images: [{ url: p.seoOgImageUrl || buildOgUrl(title, 'project') }] },
    twitter: { card: 'summary_large_image', creator: '@XRezwoan' },
  };
}
```
`metadataBase: new URL('https://rezwoan.me')` set once in the root layout.

---

## JSON-LD structured data
- **Homepage:** `Person` + `WebSite`.
```json
{ "@context":"https://schema.org","@type":"Person",
  "name":"Din Muhammad Rezwoan","url":"https://rezwoan.me",
  "jobTitle":"Full Stack Developer","worksFor":"Freelance",
  "knowsAbout":["Next.js","NestJS","React","TypeScript","Prisma","Python"],
  "sameAs":["https://github.com/Rezwoan",
    "https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a",
    "https://twitter.com/XRezwoan"] }
```
- **Project page:** `CreativeWork` (name, description, url, author Person, dateCreated).
- **Blog post:** `BlogPosting` (headline, description, datePublished, author, image).
- **Breadcrumbs:** `BreadcrumbList` on project/blog detail pages.
Inject via a `<script type="application/ld+json">` server component.

---

## Dynamic OG images
`app/og/route.tsx` using `next/og` `ImageResponse` (1200×630): dark bg + accent glow +
dot grid + large title + role/subtitle + `rezwoan.me`. Every project/blog page gets a
unique share image even with no uploaded cover. `buildOgUrl(title, type)` helper in
`lib/seo.ts`. Cache 24h.

---

## Off-page / growth (Phase 8+)
- Google Search Console: add `rezwoan.me`, verify via Cloudflare DNS TXT, submit sitemap,
  watch Core Web Vitals + Index Coverage weekly for the first month.
- Bing Webmaster Tools likewise.
- Backlinks: GitHub profile README → site; dev.to/Hashnode cross-posts of blog articles
  with canonical back to rezwoan.me; LinkedIn featured; Fiverr profile link.
- Local SEO angle (research calls it the easiest ignored win): mention Dhaka/Bangladesh
  + "available remote worldwide" in copy and `Person` schema.
- Analytics: GA4 via `SiteSettings.googleAnalyticsId` (blank disables). Keep it
  lightweight / deferred so it doesn't hurt INP.

---

## Performance guardrails (so the targets hold)
- Server Components by default; mark client components only where interactive.
- ISR (`revalidate`) on public pages — pre-rendered HTML for crawlers + speed.
- Self-hosted fonts via `next/font` (no FOIT/FOUT, no extra requests).
- Defer the AI chat + analytics JS; never block the main thread on first paint.
- nginx: immutable cache on `/_next/static/`, long cache on `/uploads/`.
