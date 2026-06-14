# PLAN.md — Master Build Plan (Portfolio v2)

> **This is the single source of truth for the full rebuild of rezwoan.me.**
> If you are an AI agent (or human) picking this up cold: read this file top to
> bottom, then read [`AGENTS.md`](./AGENTS.md), then the relevant file in
> [`docs/`](./docs/). Do not write code until you've read those three.
>
> The plan is written so that **any** capable coding agent can execute it
> phase by phase and arrive at the same result. Every phase has concrete tasks,
> the exact files to create, and acceptance criteria you can verify.

---

## 0. TL;DR — What we are building

A complete from-scratch rebuild of **Din Muhammad Rezwoan's** personal portfolio
at **https://rezwoan.me**, replacing the old Django/Wagtail/PostgreSQL site.

| Aspect | Decision |
|---|---|
| **Goal** | A fast, SEO-first, conversion-focused portfolio that wins freelance clients organically |
| **Frontend** | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion |
| **Backend** | NestJS 10 · TypeScript · Prisma ORM |
| **Database** | SQLite (a single `.db` file) via Prisma — no Postgres, no Python |
| **Auth** | JWT in an httpOnly cookie; one seeded admin user |
| **Email** | Resend (contact form → inbox + auto-reply) |
| **AI** | Google Gemini — (1) GitHub-repo → project importer/summarizer, (2) site assistant chat |
| **Admin** | Custom admin panel built into the Next.js app at `/admin`, talking to the NestJS API (replaces Wagtail) |
| **Hosting** | Raspberry Pi 5 (`blackbox.local`), systemd + nginx + Cloudflare Tunnel |
| **CI/CD** | GitHub Actions → self-hosted runner on the Pi → `scripts/deploy.sh` on every push to `main` |
| **Domain** | `rezwoan.me` + `www.rezwoan.me` — **the new site replaces the old one** |
| **Ports (Pi)** | Frontend **3200**, Backend **3201** (chosen to avoid every other app on the Pi during a safe cutover) |

This repo stays **monorepo**: `backend/` (NestJS) + `frontend/` (Next.js).

---

## 1. Identity & content facts (use these everywhere)

- **Name:** Din Muhammad Rezwoan — short name "Rezwoan"
- **Role:** Full Stack Developer · CSE student at AIUB · Fiverr freelancer
- **Location:** Dhaka, Bangladesh (works remote)
- **GitHub:** https://github.com/Rezwoan
- **LinkedIn:** https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a
- **Twitter/X:** https://twitter.com/XRezwoan (handle `@XRezwoan`)
- **Contact inbox:** frezwoan@gmail.com (where contact-form mail is delivered)
- **Live site:** https://rezwoan.me

> These are seed defaults for `SiteSettings`. Everything is editable later in the admin panel.

---

## 2. Document map (read what you need)

| File | What's in it |
|---|---|
| [`PLAN.md`](./PLAN.md) | **(this file)** phased roadmap + global decisions |
| [`AGENTS.md`](./AGENTS.md) | Hard rules, ground truth about the Pi, "do not break" list |
| [`README.md`](./README.md) | Human onboarding + local dev quick start |
| [`PROGRESS.md`](./PROGRESS.md) | Running session log / handoff notes — **update at the end of every session** |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Stack choices + the *why* behind each |
| [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) | Full Prisma schema, every model + field |
| [`docs/API_SPEC.md`](./docs/API_SPEC.md) | Every REST endpoint, request/response shapes |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Colors, type, spacing, motion, components (2026 research-backed) |
| [`docs/SEO_STRATEGY.md`](./docs/SEO_STRATEGY.md) | Keywords, metadata, JSON-LD, OG, sitemap, Lighthouse targets |
| [`docs/AI_FEATURES.md`](./docs/AI_FEATURES.md) | GitHub importer, Gemini chat, Resend email — exact design |
| [`docs/ADMIN_PANEL.md`](./docs/ADMIN_PANEL.md) | Admin UX, screens, auth flow |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Pi setup, ports, nginx, systemd, Cloudflare, CI/CD, **the cutover runbook** |
| [`docs/RESEARCH.md`](./docs/RESEARCH.md) | Design/SEO/UX research findings + sources that justify the choices |

> The old root docs (`ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `STYLE_GUIDE.md`,
> `SEO_STRATEGY.md`, `DEPLOYMENT.md`, `CMS_SEEDING.md`, `PHASE1_PROMPT.md`,
> `deploymentToPi.md`, `Makefile`) are **Django-era and superseded**. Phase 0
> archives/removes them. Until then, the authoritative versions live in `docs/`.

---

## 3. Repository layout (target)

```
rezwoan-portfolio/
├── PLAN.md  AGENTS.md  README.md  PROGRESS.md
├── docs/                         ← all design/spec docs
├── .github/workflows/deploy.yml  ← CI/CD (runs on the Pi runner)
├── scripts/
│   ├── pi-setup.sh               ← one-time idempotent Pi bootstrap
│   └── deploy.sh                 ← what CI runs on every push
├── backend/                      ← NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── portfolio.db          ← gitignored, lives only on the Pi
│   ├── src/
│   │   ├── main.ts               ← port, CORS, global /api prefix, cookies
│   │   ├── app.module.ts
│   │   ├── prisma/               ← PrismaModule + PrismaService
│   │   ├── auth/                 ← JWT login/me/logout, guards
│   │   ├── site-settings/  projects/  experiences/  skills/
│   │   ├── testimonials/  blog/  contact/
│   │   ├── ai/                   ← github-import + gemini chat
│   │   ├── mail/                 ← Resend wrapper
│   │   ├── uploads/              ← image upload handling
│   │   └── common/               ← DTOs, pipes, decorators, filters
│   ├── uploads/                  ← uploaded media (gitignored, served by nginx)
│   ├── .env.example
│   ├── nest-cli.json  tsconfig*.json  package.json
└── frontend/                     ← Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── (site)/            ← public site routes + layout
    │   │   │   ├── page.tsx       ← homepage
    │   │   │   ├── projects/  about/  blog/  contact/
    │   │   ├── admin/             ← admin panel (auth-gated)
    │   │   ├── og/route.tsx       ← dynamic OG image
    │   │   ├── sitemap.ts  robots.ts  layout.tsx
    │   ├── components/            ← ui/ sections/ animations/ admin/ chat/
    │   └── lib/                   ← api.ts (single API client), seo.ts, utils.ts
    ├── public/  ├── .env.local.example
    ├── next.config.js  tailwind.config.ts  package.json
```

---

## 4. Global decisions (locked — do not silently change)

1. **No Python anywhere.** Backend is NestJS only.
2. **SQLite via Prisma.** One file `backend/prisma/portfolio.db`. It is gitignored
   and **persists on the Pi across deploys**. Migrations run with
   `prisma migrate deploy`; never `db push` in production.
3. **API contract:** NestJS uses global prefix `/api`. nginx routes `/api/` →
   backend, everything else → frontend. The frontend's only backend reference is
   `NEXT_PUBLIC_API_URL` (see `docs/API_SPEC.md`). No hardcoded `localhost`.
4. **Ports:** frontend **3200**, backend **3201**. These are set by systemd and
   referenced by nginx. Changing them means updating systemd units + the nginx
   vhost on the Pi (see `docs/DEPLOYMENT.md`).
5. **Secrets never get committed.** `.env` / `.env.local` are gitignored and live
   only on the Pi. Tracked files use placeholders. The repo is **public**.
6. **Admin is part of the Next.js app** (`/admin`), not a separate service. It is
   a client of the same `/api`. One admin user, seeded from env.
7. **Content bodies are Markdown** (project case studies + blog posts), rendered
   with a markdown renderer + syntax highlighting. (Replaces Wagtail StreamField.)
8. **Images** are uploaded to `backend/uploads/`, served by nginx at `/uploads/`,
   referenced by path in the DB. `next/image` is configured for the rezwoan.me host.
9. **Dual theme is first-class.** Light + dark, system-aware + user-toggle via
   `next-themes`, all colors as CSS variables (no hardcoded hex in components). Brand
   accent = electric indigo/violet (one CSS var, swappable). See `docs/DESIGN_SYSTEM.md`.
10. **Smooth animation everywhere** (Framer Motion): page transitions, scroll reveals,
    hover micro-states, kinetic hero — all GPU-composited and `useReducedMotion`-aware.
11. **Keys:** the provided Resend/Gemini keys are used as-is on the Pi `.env` for now
    (owner rotates later). Still never committed — placeholders only in tracked files.

---

## 5. Build phases

> Each phase is independently shippable and testable. Do them in order. Mark
> progress in [`PROGRESS.md`](./PROGRESS.md). "DoD" = Definition of Done.

### Phase 0 — Foundation & cleanup
**Goal:** clean repo, scaffolds for both apps, tooling, env templates.
- Remove/archive the Django backend (`backend/cms`, `backend/portfolio`,
  `requirements*.txt`, `manage.py`) and superseded root docs (move to
  `docs/archive/` or delete — see §2).
- Scaffold NestJS in `backend/` (`@nestjs/cli`), Prisma installed, `PrismaModule`.
- Scaffold Next.js 14 in `frontend/` (TS, Tailwind, App Router, `src/` dir).
- Add `scripts/`, `.github/workflows/deploy.yml`, root `.gitignore` (node_modules,
  .next, dist, `*.db`, `.env*`, `uploads/`).
- `backend/.env.example` + `frontend/.env.local.example` with placeholders.
- **DoD:** `npm run build` succeeds in both apps locally; both start with empty data.

### Phase 1 — Backend core (DB + auth)
**Goal:** Prisma schema, migrations, seed, working JWT admin auth.
- Write `prisma/schema.prisma` exactly per [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md).
- `prisma migrate dev` → initial migration. Write `prisma/seed.ts` (SiteSettings
  singleton with the §1 identity facts, admin user from `ADMIN_EMAIL/PASSWORD`,
  a few sample skills/tags).
- `PrismaService` (onModuleInit connect), `main.ts` (port from env, `setGlobalPrefix('api')`,
  cookie-parser, global `ValidationPipe`, CORS from `FRONTEND_URL`).
- `AuthModule`: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`,
  bcrypt password check, JWT in httpOnly cookie, `JwtAuthGuard`.
- **DoD:** can log in as admin and hit a protected route; seed runs clean.

### Phase 2 — Public read API + contact/email
**Goal:** every public endpoint the frontend needs.
- Modules: `site-settings`, `projects`, `experiences`, `skills`, `testimonials`,
  `blog` — all per [`docs/API_SPEC.md`](./docs/API_SPEC.md). Read endpoints are public.
- `contact`: `POST /api/contact` validates, stores `ContactSubmission`, sends mail
  via the `mail` module (Resend), basic rate-limit + honeypot.
- `mail` module: thin Resend wrapper; notification to `frezwoan@gmail.com` + a
  branded auto-reply to the sender. See [`docs/AI_FEATURES.md`](./docs/AI_FEATURES.md) §Email.
- **DoD:** frontend (Phase 5) can render fully from these endpoints; a test contact
  submission lands in the inbox and is stored in the DB.

### Phase 3 — AI features
**Goal:** the GitHub importer and the site assistant chat.
- `ai/github-import`: `POST /api/admin/import/github` (admin-only). Fetch repo
  metadata + languages + README via GitHub REST, send README to Gemini for a
  polished description + tech-stack extraction, return a **draft** Project (not
  saved) for admin review. Full spec in [`docs/AI_FEATURES.md`](./docs/AI_FEATURES.md).
- `ai/chat`: `POST /api/chat` (public, rate-limited). Gemini chat grounded on the
  site's real data (projects/skills/experience/bio injected as context). Streamed.
- **DoD:** pasting a public repo URL produces a sensible draft project; the chat
  answers questions about Rezwoan using only real data and refuses off-topic asks.

### Phase 4 — Admin panel
**Goal:** the "easy site updating" experience.
- `/admin/login`, auth guard on all `/admin/*` routes (redirect if no session).
- Dashboard + CRUD screens for Projects, Skills, Experience, Testimonials, Blog,
  Site Settings; a contact **inbox**; the **GitHub importer** flow (paste URL →
  review AI draft → edit → publish); image uploads. Spec: [`docs/ADMIN_PANEL.md`](./docs/ADMIN_PANEL.md).
- **DoD:** Rezwoan can add a project end-to-end (via importer or manually), upload
  an image, edit site settings, and read contact messages — all from the browser.

### Phase 5 — Public site (design + pages)
**Goal:** the on-brand, animated, conversion-focused site.
- Implement the design system in `tailwind.config.ts` + `globals.css` per
  [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md).
- Build sections/pages: Hero, Featured Projects, Skills, Experience, Testimonials,
  Contact CTA (home); `/projects` (+ `/projects/[slug]` case study), `/about`,
  `/blog` (+ `/blog/[slug]`), `/contact`, `not-found`. Floating AI chat widget.
- Data via the typed API client with ISR (`revalidate`). Framer Motion with
  `useReducedMotion`. Custom cursor + magnetic buttons (non-touch only).
- **DoD:** site renders real seeded content, looks polished on mobile + desktop,
  no layout shift, no horizontal scroll.

### Phase 6 — SEO & performance
**Goal:** Lighthouse ≥95 across the board, rich search presence.
- `generateMetadata` on every page, canonical URLs, `sitemap.ts`, `robots.ts`,
  JSON-LD (Person/WebSite/CreativeWork/BlogPosting), dynamic OG (`app/og/route.tsx`),
  RSS feed, `llms.txt`. All per [`docs/SEO_STRATEGY.md`](./docs/SEO_STRATEGY.md).
- `next/image` everywhere with width/height, font preloading, minimal client JS.
- **DoD:** Lighthouse Performance/Accessibility/Best-Practices ≥95, SEO 100;
  Rich Results test passes; OG preview renders.

### Phase 7 — Deployment & cutover
**Goal:** the new site live at rezwoan.me, old site retired, CI/CD green.
- `scripts/pi-setup.sh` (idempotent) + `scripts/deploy.sh` + `deploy.yml` adapted
  from the RepRush pattern but for ports 3200/3201 and Prisma.
- Follow the **cutover runbook** in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md):
  stand up new services alongside the old, smoke-test on `:3200`, flip the
  rezwoan.me nginx vhost, verify live, then stop+disable the old Django/Next services.
- **DoD:** https://rezwoan.me serves the new site over the tunnel; a push to `main`
  auto-deploys and passes the health check; old services are off (kept as rollback).

### Phase 8 — Content seeding & launch
**Goal:** real content + search visibility.
- Import real projects via the GitHub importer; write 2–3 real case studies; add
  real skills/experience/testimonials; upload images; finalize SiteSettings.
- Submit `sitemap.xml` to Google Search Console; verify OG on socials; rotate the
  exposed API keys (see §7 security).
- **DoD:** site is content-complete and indexed; analytics/GSC connected.

---

## 6. Order of operations / dependencies

```
Phase 0 ─▶ Phase 1 ─▶ Phase 2 ─▶ Phase 3 ─▶ Phase 4
                    └▶ Phase 5 (needs Phase 2 read API) ─▶ Phase 6
Phase 7 needs Phases 1–6 building cleanly. Phase 8 needs Phase 7 live.
```
Phases 4 and 5 can be worked in parallel once Phase 2 is done (admin and public
site are independent UIs over the same API).

---

## 7. Security & secrets (read before committing anything)

- **The GitHub repo is public.** Never commit real keys/passwords.
- Secrets live only in `backend/.env` on the Pi (created by `pi-setup.sh`, never
  overwritten). Tracked files contain placeholders only.
- Secrets in play (names only — real values go on the Pi):
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (`Rezwoan <noreply@rezwoan.me>`),
  `GEMINI_API_KEY`, `GEMINI_MODEL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
  `GITHUB_TOKEN` (optional, raises GitHub API rate limit), `CONTACT_TO_EMAIL`.
- **Action item (Phase 8):** the Resend and Gemini keys were shared in plaintext
  during planning — **rotate them** and store the new values only on the Pi.

---

## 8. How to verify you're done (global acceptance)

1. `npm run build` passes in both `backend/` and `frontend/` (CI runs both).
2. https://rezwoan.me loads the new site; `/admin` works; contact email arrives.
3. GitHub importer turns a repo URL into a publishable project.
4. AI chat answers grounded questions and refuses off-topic.
5. Lighthouse ≥95 / SEO 100. No console errors, no CLS, no horizontal scroll.
6. Pushing to `main` deploys automatically and the health check passes.

---

_Last updated: 2026-06-14. Keep this file current when decisions change._
