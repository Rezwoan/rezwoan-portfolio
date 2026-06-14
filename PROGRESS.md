# PROGRESS.md — Session Log (Portfolio v2 rebuild)

> **Rule:** update this at the end of every session. Format: date · what got done ·
> what's next · blockers. This is the handoff note for the next agent/session.
> Phase definitions live in [`PLAN.md`](./PLAN.md) §5.

---

## Session 1 — 2026-06-14 (Claude / Opus 4.8) — PLANNING

**Status:** Planning complete ✅ — no code written yet (by request). Awaiting approval
to start Phase 0.

**What got done:**
- Clarified scope with the user: this is the **main rezwoan.me** portfolio (the
  `classmate.rezwoan.me` line was a copy-paste slip — ignore). The new
  **NestJS + Next.js + Prisma/SQLite** site **replaces** the old Django site at
  rezwoan.me. AI scope = GitHub importer **+** Gemini site-assistant chat.
- Analyzed the Pi deployment model from the sibling project **RepRush** (same Pi,
  same stack family) — systemd + nginx + Cloudflare Tunnel + self-hosted runner. This
  is the proven blueprint the new deploy adapts.
- Analyzed the old portfolio's content model, design system, and SEO work to carry
  forward what's valuable.
- Researched 2026 portfolio design / SEO / UI-UX trends (sources in `docs/RESEARCH.md`).
- Wrote the full plan as docs:
  - `PLAN.md` (master phased roadmap), `AGENTS.md` (rules + Pi ground truth),
    `README.md` (refreshed), this file.
  - `docs/`: `ARCHITECTURE.md`, `DATA_MODEL.md`, `API_SPEC.md`, `DESIGN_SYSTEM.md`,
    `SEO_STRATEGY.md`, `AI_FEATURES.md`, `ADMIN_PANEL.md`, `DEPLOYMENT.md`, `RESEARCH.md`.

**Key decisions locked (see `PLAN.md` §4):**
- Monorepo `backend/` (NestJS) + `frontend/` (Next.js 14). Ports **3200 web / 3201 api**.
- Prisma + SQLite; Markdown content bodies; uploads on disk served by nginx.
- JWT-cookie admin at `/admin`; one seeded admin user.
- Cutover = nginx vhost swap (new services coexist on 3200/3201 with old 3000/8000).

**What's next (Phase 0 — Foundation):**
- [ ] Archive/remove the Django backend + superseded root docs (move to `docs/archive/`).
- [ ] Scaffold NestJS (`backend/`) + Prisma; scaffold Next.js 14 (`frontend/`, `src/`).
- [ ] Root `.gitignore` (node_modules, .next, dist, `*.db`, `.env*`, `uploads/`).
- [ ] `backend/.env.example` + `frontend/.env.local.example` (placeholders only).
- [ ] `scripts/` + `.github/workflows/deploy.yml` stubs.
- [ ] Confirm both apps `npm run build` clean and run empty.

**Blockers / open items:**
- Awaiting user go-ahead to begin coding (Phase 0).
- **Security:** rotate the Resend + Gemini keys shared in chat before launch; they must
  only ever live in `backend/.env` on the Pi (repo is public).
- Verify on the Pi during Phase 7: ports 3200/3201 are free; Prisma ARM64 engine builds;
  the existing portfolio runner's label is `rezwoan`.

---

## Session 2 — 2026-06-14 (Claude / Opus 4.8) — FULL BUILD

**Status:** Phases 0–6 built & verified locally. Not yet deployed to the Pi.

**What got done:**
- **Backend (NestJS + Prisma/SQLite)** — complete & verified: Prisma schema + initial
  migration + idempotent seed; JWT-cookie auth; public read API for every resource;
  admin CRUD; contact (honeypot + throttle + Resend email); AI GitHub importer +
  grounded streaming chat; uploads (multer → `/uploads`); `llms.txt`; `/api/health`.
  Build passes, server boots, endpoints verified by curl.
- **Frontend (Next.js 14)** — complete & verified: dual light/dark theme (next-themes +
  CSS-var tokens), electric-indigo accent; self-hosted Google fonts; Framer Motion
  everywhere (reduced-motion safe); homepage (hero/featured/skills/experience/
  testimonials/CTA); /projects, /projects/[slug], /about, /blog, /blog/[slug], /contact,
  404; AI chat widget; SEO (per-page metadata, JSON-LD, dynamic OG, sitemap, robots).
- **Admin panel** at `/admin` — login, dashboard, projects (+ GitHub importer), blog,
  skills, experience, testimonials, tags, inbox, settings, image uploads.
- `next build` passes (22 routes); runtime smoke test = all routes 200, OG renders.
- Decisions applied this session: use the provided API keys on the Pi (rotate later);
  AI brand color chosen from research = **electric indigo/violet** (one CSS var, swappable);
  **dual theme** + **animations everywhere** as requested.

**What's next — Phase 7 (DEPLOY, needs the Pi; do via SSH):**
- [ ] Merge this branch (`rebuild/v2`) → `main` (PR open).
- [ ] On the Pi: run `scripts/pi-setup.sh`, fill real keys + ADMIN_PASSWORD in
  `backend/.env`, re-run, add sudoers line, then follow the **cutover runbook** in
  `docs/DEPLOYMENT.md` (smoke-test :3200 → `reload nginx` → retire old Django services).
- [ ] Ensure the Pi runner label is `rezwoan`.
- [ ] Phase 8: import real projects via the importer, write case studies, add
  testimonials/experience, submit sitemap to GSC, **rotate the API keys**.

**Notes for the next agent:**
- Local dev: `cd backend && npm i && npx prisma migrate dev && npm run seed && npm run start:dev`,
  then `cd frontend && npm i && npm run dev`. Default admin: `frezwoan@gmail.com` / `admin12345`.
- The `node node_modules/.bin/next` form only works on Linux (symlink → JS). On Windows
  use `node node_modules/next/dist/bin/next`. systemd unit is correct for the Pi.
- Email + AI degrade gracefully when keys are absent (no crash), so local build/run
  works without secrets.

<!-- Add new sessions below in the same format. -->
