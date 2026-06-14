# ARCHITECTURE.md — Stack Decisions & Rationale

> Every major technical decision, with the *why*. A future agent should never have
> to guess why something was chosen. Supersedes the old Django-era `ARCHITECTURE.md`.

---

## High-level shape

```
Internet
 └── Cloudflare (DNS + TLS + CDN + DDoS)
      └── Cloudflare Tunnel (cloudflared, systemd) ── no public IP, no port-forward
           └── rezwoan.me / www.rezwoan.me → http://localhost:80
                └── nginx vhost (server_name rezwoan.me)
                     ├── /api/      → NestJS  (127.0.0.1:3201)
                     ├── /uploads/  → static files on disk (backend/uploads)
                     └── /          → Next.js (127.0.0.1:3200)
```

Two processes managed by **systemd** (`rezwoan-api.service`, `rezwoan-web.service`),
one SQLite file, one git checkout at `/var/www/rezwoan-portfolio`. This mirrors the
proven RepRush deployment on the same Pi.

---

## Frontend: Next.js 14 (App Router)

**Decision:** Next.js **14.2.x**, App Router, TypeScript, Tailwind CSS, Framer Motion,
Radix UI primitives, lucide-react icons.

- **Why Next.js:** SSR/ISR gives Google fully-rendered HTML — the #1 SEO lever for a
  portfolio meant to rank and convert. `generateMetadata()` makes per-page SEO trivial.
  `next/image` handles AVIF/WebP, lazy loading, and blur placeholders.
- **Why App Router:** nested layouts (public `(site)` layout vs `admin` layout share
  almost nothing), Server Components ship less JS, route groups keep admin and site
  cleanly separated in one app.
- **Why v14 (not 15):** v14.2.x is the exact version battle-tested on this Pi by
  RepRush. ARM64 `next build` + `next start` are known-good. v15's `params: Promise`
  changes already bit the old site. Lower deployment risk for the same feature set.
  (Upgrading to 15 later is a deliberate, isolated task — not part of the rebuild.)
- **Why Framer Motion:** declarative, pairs with React, has `useReducedMotion()` for
  accessibility, and `AnimatePresence` for page transitions.

## Backend: NestJS 10

**Decision:** NestJS 10 + TypeScript, structured into feature modules.

- **Why NestJS over a thin Express server:** opinionated module/DI structure keeps a
  growing API (public content + admin CRUD + AI + mail + uploads) organized; built-in
  `ValidationPipe` + `class-validator` DTOs; Guards for JWT auth; Swagger in dev. It is
  the same framework RepRush uses on this Pi, so the deploy story is identical.
- **Global prefix `/api`**, CORS limited to `FRONTEND_URL`, JWT via httpOnly cookie,
  cookie-parser, `json` body limit raised for base64/image payloads.

## Database: SQLite via Prisma

**Decision:** SQLite, one file `backend/prisma/portfolio.db`, accessed through **Prisma**.

- **Why SQLite (not Postgres):** the user explicitly wants a "direct `.db` database."
  A portfolio is read-heavy with a single writer (the admin) — SQLite is more than
  enough, needs zero server, and the file persists trivially across deploys. No Python,
  no DB server to babysit on the Pi.
- **Why Prisma (not TypeORM like RepRush):** the user explicitly asked for Prisma.
  Benefits: a typed schema as a single source of truth, real **migration history**
  committed to git (safer than TypeORM's `synchronize: true`), great DX, first-class
  TypeScript types shared across services.
- **ARM64 note:** Prisma ships ARM64 query-engine binaries; `prisma generate` runs in
  the build, `prisma migrate deploy` runs in deploy. Set
  `binaryTargets = ["native"]` (or the Pi's `linux-arm64-openssl-*`) in the schema if
  the engine download ever needs pinning. Verified during Phase 7.
- **Production rule:** `prisma migrate deploy` only. Never `db push`, never
  `migrate reset` on the Pi.

## Auth: JWT in an httpOnly cookie

**Decision:** One admin user, seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Login issues a
JWT stored in an httpOnly, Secure, SameSite=Lax cookie; a `JwtAuthGuard` protects all
`/api/admin/*` and other mutating routes. bcrypt for the password hash.

- **Why cookie (not localStorage token):** httpOnly cookies aren't readable by JS
  (XSS-resistant) and are sent automatically, so the admin SPA needs no token plumbing.
  Same pattern as RepRush.

## Content bodies: Markdown

**Decision:** Project case studies and blog posts are stored as **Markdown** and
rendered with a markdown renderer + syntax highlighting (e.g. `react-markdown` +
`rehype`/`shiki`), with a small set of allowed embeds.

- **Why (not Wagtail StreamField / a block JSON editor):** Markdown is dramatically
  simpler to build, edit, version, and — crucially — it's exactly what the **AI
  importer** produces from a README. One format end-to-end (AI → admin textarea →
  rendered page).

## Images / uploads

**Decision:** NestJS handles multipart uploads → files written to `backend/uploads/`
→ nginx serves them directly at `/uploads/<file>` (fast, no Node in the path) → the DB
stores the relative path. `next/image` `remotePatterns` allows the `rezwoan.me` host
(and `localhost` in dev).

- **Why disk + nginx (not a cloud bucket):** zero cost, no extra service, survives
  deploys (gitignored `uploads/`), and nginx static serving is faster than proxying.

## Data fetching: ISR

**Decision:** Public pages use Next.js ISR (`export const revalidate = 60` or per-page
tags). Admin pages are client-rendered and always live.

- **Why ISR:** visitors always get a fast cached, fully-rendered page (good for SEO and
  Core Web Vitals); content edits in the admin appear within the revalidate window.
  Avoids client-side `useEffect` fetching that would hand crawlers an empty shell.

## Frontend data layer: one typed client

**Decision:** `frontend/src/lib/api.ts` is the **only** file that knows the backend URL.
Everything imports typed functions from it. No raw `fetch`/`axios` to the backend
anywhere else. If the URL/contract changes, there's exactly one file to edit.

## AI: Google Gemini

**Decision:** Gemini (model from `GEMINI_MODEL`, default a current `gemini-*-flash`)
via the official `@google/genai` SDK, called only from the backend so the key never
reaches the browser. Two uses:
1. **GitHub importer** — summarize a README into a polished description + extract tech.
2. **Site assistant chat** — answer visitor questions grounded on the site's own data.

See [`AI_FEATURES.md`](./AI_FEATURES.md) for prompts, grounding, and rate-limits.

## Email: Resend

**Decision:** Resend for transactional email (contact-form notification + auto-reply),
from `Rezwoan <noreply@rezwoan.me>` (the `rezwoan.me` domain is already verified in the
user's Resend account). Backend-only.

## Hosting: Raspberry Pi 5 via Cloudflare Tunnel

**Decision:** Self-host on the existing Pi using the existing Cloudflare Tunnel. Zero
hosting cost, infra already running, Cloudflare provides HTTPS/CDN/DDoS at the edge.
systemd manages both Node processes; nginx is the reverse proxy. No Docker (matches the
rest of the Pi and keeps memory/CPU low on ARM).

## What changed vs the old site (summary)

| Concern | Old | New |
|---|---|---|
| Backend | Django 5 + Wagtail 6 (Python) | NestJS 10 (TypeScript) |
| DB | PostgreSQL | SQLite via Prisma |
| Admin | Wagtail at `manage.rezwoan.me/cms/` | Custom panel at `rezwoan.me/admin` |
| Content body | StreamField | Markdown |
| AI | none | Gemini importer + chat |
| Ports | 3000 / 8000 | 3200 / 3201 |
| Domains | rezwoan.me + manage.rezwoan.me | rezwoan.me only |
