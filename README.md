# rezwoan.me — Portfolio (v2 rebuild)

Personal portfolio for **Din Muhammad Rezwoan** — Full Stack Developer, CSE student at
AIUB, Fiverr freelancer. A fast, SEO-first, conversion-focused site that wins clients
organically — with an AI-assisted admin (paste a GitHub repo, get a project) and a
Gemini-powered site assistant.

**Live:** https://rezwoan.me

> 🔁 **This repo is being rebuilt from scratch.** Old stack (Django/Wagtail/PostgreSQL)
> → new stack (**Next.js + NestJS + Prisma/SQLite**). If you're an AI agent or a new
> contributor, **read [`PLAN.md`](./PLAN.md) → [`AGENTS.md`](./AGENTS.md) → the relevant
> file in [`docs/`](./docs/) before writing any code.** The build is not started yet —
> the planning docs are the current deliverable.

---

## Tech stack
| | Technology |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Framer Motion |
| Backend | NestJS 10 · TypeScript · Prisma ORM |
| Database | SQLite (`backend/prisma/portfolio.db`) |
| AI | Google Gemini — GitHub→project importer + site assistant chat |
| Email | Resend (contact form) |
| Hosting | Raspberry Pi 5 · systemd · nginx · Cloudflare Tunnel |
| CI/CD | GitHub Actions → self-hosted runner → `scripts/deploy.sh` on push to `main` |

## Documentation map
| File | Purpose |
|---|---|
| [`PLAN.md`](./PLAN.md) | Master phased build plan (start here) |
| [`AGENTS.md`](./AGENTS.md) | Hard rules + Pi ground truth |
| [`PROGRESS.md`](./PROGRESS.md) | Session log / handoff notes |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Stack decisions + why |
| [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) | Prisma schema |
| [`docs/API_SPEC.md`](./docs/API_SPEC.md) | REST endpoints |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Colors, type, motion, components |
| [`docs/SEO_STRATEGY.md`](./docs/SEO_STRATEGY.md) | Keywords, metadata, JSON-LD, targets |
| [`docs/AI_FEATURES.md`](./docs/AI_FEATURES.md) | Importer, chat, email |
| [`docs/ADMIN_PANEL.md`](./docs/ADMIN_PANEL.md) | Admin UX |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Pi setup, CI/CD, cutover runbook |
| [`docs/RESEARCH.md`](./docs/RESEARCH.md) | Design/SEO research + sources |

## Local development (after Phase 0 scaffolding)
```bash
# Backend (NestJS) → http://localhost:3201/api
cd backend && npm install && cp .env.example .env
npx prisma migrate dev && npm run start:dev

# Frontend (Next.js) → http://localhost:3200
cd frontend && npm install && cp .env.local.example .env.local
npm run dev
```

## Project structure (target)
```
rezwoan-portfolio/
├── PLAN.md  AGENTS.md  README.md  PROGRESS.md
├── docs/                      # specs & design docs
├── .github/workflows/         # CI/CD
├── scripts/                   # pi-setup.sh, deploy.sh
├── backend/                   # NestJS + Prisma
└── frontend/                  # Next.js (public site + /admin)
```

## Security
The repo is **public** — never commit secrets. API keys (Resend, Gemini), the admin
password, and `JWT_SECRET` live only in `.env` files on the Pi. See [`PLAN.md`](./PLAN.md) §7.
