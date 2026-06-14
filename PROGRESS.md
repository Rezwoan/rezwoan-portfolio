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

<!-- Add new sessions below in the same format. -->
