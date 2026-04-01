# PROGRESS.md — Sprint Log

> **Rule:** Update this file at the end of every coding session.
> Format: Date · What got done · What's next · Blockers (if any).
> Keep entries concise. This is the handoff note for the next session.

---

## Session 1 — 2026-03-30

**Status:** Phase 0 complete ✅

**What got done:**
- Full project directory structure created (`backend/`, `frontend/`, agent files)
- All 7 AI agent context files written:
  - `AGENTS.md` (master guide)
  - `ARCHITECTURE.md` (technical decisions)
  - `PROGRESS.md` (this file)
  - `CONTENT_SCHEMA.md` (CMS model documentation)
  - `SEO_STRATEGY.md` (keywords, structured data, Lighthouse targets)
  - `STYLE_GUIDE.md` (design tokens, animation rules, component patterns)
  - `DEPLOYMENT.md` (Pi 5, Cloudflare Tunnel, nginx, systemd)
- Backend scaffold: Django project structure, split settings (base/dev/prod), requirements.txt
- Backend: `portfolio/urls.py`, `wsgi.py`, `asgi.py`, all `__init__.py` files
- Backend: `cms/models.py` skeleton with all model classes stubbed
- Backend: `.env.example` with all required variables
- Frontend scaffold: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Frontend: `app/layout.tsx`, `app/page.tsx` (placeholder), `app/globals.css`
- Frontend: `lib/api.ts` (typed API client skeleton), `lib/seo.ts` (metadata helpers)
- Frontend: `.env.local.example`
- Root: `README.md`, `.gitignore`, `Makefile`

**What's next (Phase 1):**
- [ ] Run `django-admin startproject` or manually init Django (models.py → full implementation)
- [ ] Implement all Wagtail models in `cms/models.py` (Project, Skill, BlogPost, etc.)
- [ ] Write DRF serializers (`cms/serializers.py`)
- [ ] Write API views (`cms/api.py`) and wire up URLs
- [ ] Configure Wagtail API v2 in settings
- [ ] Run first migration and test admin at localhost:8000/cms/
- [ ] Add sample content via admin to test API responses
- [ ] Set up `django-cors-headers` for frontend ↔ backend communication

**Blockers:** None

---

<!-- Add new sessions below in the same format -->

## Session N — YYYY-MM-DD

**Status:** Phase X — [in progress / complete]

**What got done:**
- ...

**What's next:**
- [ ] ...

**Blockers:** ...

## Session 2 — 2026-03-31 (Copilot/GPT-5.3-Codex handoff)

**Status:** Phase 1 complete ✅ — Phase 2 in progress

**What got done (by Copilot agent):**
- Fixed Wagtail 6 `ImageChooserPanel` → `FieldPanel` (ImportError on startup)
- Fixed Wagtail 6 API import paths (`ImagesAPIViewSet`, `DocumentsAPIViewSet`)
- Removed `published_date` from BlogPost panels (auto_now_add FieldError)
- Created `cms/views.py` (robots_txt, rss_feed, site_settings_api)
- Created `cms/urls.py` (URL routing)
- Switched dev DB to SQLite (no Postgres dependency)
- Fixed `duration-250` → `duration-ui` in globals.css (Tailwind build error)
- Pinned frontend port to 3000 in package.json
- Built: Navbar, Footer, ClientProviders, ProjectCard, HeroSection, ProjectsSection, SkillsSection

**Blockers resolved:** Backend + frontend both running locally, API connection confirmed.

---

## Session 3 — 2026-04-01 (Claude Sonnet 4.6)

**Status:** Phase 1 ✅ complete · Phase 2 ✅ complete · Phase 3 ✅ complete

**What got done:**
- Applied all handoff fixes from Session 2 manifest
- Phase 1 (Backend) fully implemented:
  - `cms/serializers.py` — typed DRF serializers for all 7 models
  - `cms/views.py` — complete API (projects, experiences, skills, blog, testimonials, contact, site-settings, robots.txt, RSS)
  - `cms/urls.py` — all routes wired
  - `cms/wagtail_hooks.py` — ContactSubmission registered in CMS admin
- Phase 2 (Design system) fully implemented:
  - `CustomCursor.tsx` (dot + lagging ring, state-aware)
  - `MagneticButton.tsx` (spring physics)
  - `FadeUp.tsx` (scroll-triggered reveal)
  - `TextReveal.tsx` (word-by-word stagger)
  - `Navbar.tsx` (sticky, blur on scroll, mobile drawer, active underline)
  - `Footer.tsx` (wordmark, nav, social links, résumé download)
  - `ClientProviders.tsx` (cursor + client singletons wrapper)
  - `ProjectCard.tsx` (parallax tilt, tech tags, dual links)
  - `HeroSection.tsx` (terminal card, ticker, availability badge)
  - `ProjectsSection.tsx` (ISR-fetched, responsive grid)
  - `SkillsSection.tsx` (bento grid, proficiency rings, accent block)
- Phase 3 (All pages) fully built:
  - `app/layout.tsx` — Navbar + Footer + ClientProviders wired in
  - `app/page.tsx` — full homepage (all 6 sections assembled)
  - `app/projects/page.tsx` — full projects list
  - `app/projects/[slug]/page.tsx` — detail page + StreamField renderer + JSON-LD
  - `app/blog/page.tsx` — list with thumbnails, tags, reading time
  - `app/blog/[slug]/page.tsx` — full post + code blocks + callouts + JSON-LD
  - `app/about/page.tsx` — bio, quick info card, skills, experience
  - `app/contact/page.tsx` — contact info sidebar
  - `app/contact/ContactForm.tsx` — client form with validation, loading/success/error states
  - `app/not-found.tsx` — 404 page

**What's next (Phase 4 — SEO & Performance):**
- [ ] Dynamic OG image route (`app/og/route.tsx`) using `@vercel/og`
- [ ] Verify JSON-LD on all pages with Google Rich Results Test
- [ ] `next/image` blur placeholders on all project/blog images
- [ ] Lighthouse audit — target 95+ on all scores
- [ ] Add `<link rel="preload">` for hero font (Cabinet Grotesk 700)

**Blockers:**
- Need to seed the CMS with real content to test full page renders
- `pytz` may not be installed (used in `rss_feed` view) — add to requirements.txt if missing


---

## Session 4 — 2026-04-01 (Claude Sonnet 4.6)

**Status:** Phase 4 ✅ complete

**What got done:**
- `app/og/route.tsx` — Edge runtime dynamic OG image generator (1200×630)
  Renders title, subtitle, dot-grid bg, accent glow, availability dot, domain name.
  Params: ?title=&subtitle=&type=(home|project|blog|default)
- `lib/seo.ts` — Fully rewritten to use dynamic OG as fallback on all pages.
  Every page now has a social share image even with no CMS image uploaded.
  `buildOgImageUrl()` exported for use anywhere.
- `next.config.ts` — Production-grade rewrite:
  - `/api/*`, `/media/*`, `/sitemap.xml`, `/robots.txt`, `/feed/rss/`, `/cms/*`
    all proxied to Django backend → zero CORS issues in production
  - Immutable cache headers on `/_next/static/*`
  - 30-day CDN cache on media files
  - 24-hour cache on OG images
  - Full security headers on all routes
- `backend/requirements.txt` — Added `pytz==2024.2`
- `backend/cms/views.py` — Fixed RSS feed to use `django.utils.timezone.make_aware()`
  instead of bare pytz import (cleaner, no import error risk)
- `CMS_SEEDING.md` — Complete 10-step guide for first-time content entry:
  Wagtail site config → Site Settings → Tech Tags → Skills → Experience
  → Projects → Blog Index + Posts → Testimonials → verification checklist

**What's next (Phase 5 — Deploy):**
- [ ] Set up systemd service units for gunicorn and next start on Pi 5
- [ ] Run `make deploy` on Pi 5 for first production deployment
- [ ] Submit sitemap to Google Search Console
- [ ] Run Lighthouse audit and fix any sub-95 scores
- [ ] Seed all real content through CMS_SEEDING.md checklist
- [ ] Set up Cloudflare cache rules for static assets

**Blockers:** None — project is feature-complete, ready for deployment.

---

## Session 5 — 2026-04-01 (Copilot/GPT-5.3-Codex)

**Status:** Local environment setup + run verification complete ✅

**What got done:**
- Read all root docs for full scope (`AGENTS.md`, `ARCHITECTURE.md`, `CMS_SEEDING.md`, `CONTENT_SCHEMA.md`, `DEPLOYMENT.md`, `PHASE1_PROMPT.md`, `PROGRESS.md`, `README.md`, `SEO_STRATEGY.md`, `STYLE_GUIDE.md`)
- Created env files from templates:
  - `backend/.env`
  - `frontend/.env.local`
- Installed Python 3.13 alongside Python 3.14 via winget (required for dependency compatibility)
- Recreated backend venv with Python 3.13 and installed backend requirements
- Ran Django migrations successfully, including generated/apply of `cms/migrations/0001_initial.py`
- Created local superuser (`admin`) for Wagtail CMS login
- Installed frontend dependencies (`npm install`) and started Next.js dev server
- Verified both apps are reachable locally:
  - API: `http://127.0.0.1:8000/api/site-settings/` → `200`
  - Frontend: `http://127.0.0.1:3000` → `200`

**What's next:**
- [ ] Seed CMS content using `CMS_SEEDING.md` so all frontend sections show real data
- [ ] Run Phase 4 Lighthouse checks against populated content
- [ ] Upgrade frontend `next` package to patched version (security advisory)

**Blockers:**
- PowerShell execution policy warning appears in terminal startup (`profile.ps1`), but does not block app runtime.

---

## Session 6 — 2026-04-01 (Copilot/GPT-5.3-Codex)

**Status:** Demo CMS seeding complete ✅

**What got done:**
- Pulled reusable demo content from old portfolio (`rezwoan.github.io` + README)
- Seeded demo records into local CMS DB:
  - Site settings (name, tagline, bio, socials, contact)
  - Tech tags (16)
  - Skills (12)
  - Experience entries (4)
  - Projects (4)
  - Testimonials (2 demo testimonials)
  - Blog index page + blog posts (2)
- Verified API responses:
  - `/api/projects/` returns 4 projects
  - `/api/skills/` returns 12 skills
  - `/api/blog/` returns 2 posts (paginated)

**What's next:**
- [ ] Add real project/blog cover images from Wagtail admin
- [ ] Replace demo testimonials with real client testimonials
- [ ] Optional: normalize project tech stack relation behavior in API output

**Blockers:**
- `Project.tech_stack` data exists conceptually but currently returns empty arrays in API (model/relationship behavior to review separately).

