# AGENTS.md — Master Guide for AI Agents

> **READ THIS FIRST.** Every AI agent, every new session, every context reset — start here.
> This file is the single source of truth for project state and rules.

---

## What This Project Is

A personal portfolio website for **Din Muhammad Rezwoan** (rezwoan.me) — a full-stack developer,
CSE student at AIUB, and Fiverr freelancer. The site targets potential clients, remote employers,
and Google search traffic. It is built as a **headless CMS portfolio** where the backend (Wagtail
admin) controls all content and the frontend (Next.js) renders it with zero hardcoded strings.

**Live URL:** https://rezwoan.me
**Admin URL:** https://rezwoan.me/cms/ (production) | http://localhost:8000/cms/ (local)
**GitHub:** https://github.com/Rezwoan/portfolio

---

## Stack at a Glance

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router), TypeScript | `/frontend` |
| Styling | Tailwind CSS + Framer Motion | Custom design tokens in `tailwind.config.ts` |
| Backend | Django 5 + Wagtail 6 | `/backend` |
| API | Django REST Framework (Wagtail API v2) | All endpoints under `/api/v2/` |
| Database | PostgreSQL | Local: `portfolio_db` |
| Cache | Redis (optional for now) | Only needed in production for ISR |
| Hosting | Raspberry Pi 5 "BlackBox" via Cloudflare Tunnel | Tunnel name: `rezwoan-pi` |

---

## How to Run Locally (No Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then fill in values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # then fill in values
npm run dev                        # runs on http://localhost:3000
```

### Required local services
- PostgreSQL running with a database named `portfolio_db`
- (Optional) Redis on port 6379

---

## Project Rules — Never Break These

1. **Never hardcode content in JSX or Python.** Every visible string must come from the CMS.
   If you want to add something new, add a Wagtail model field first.
2. **Never push secrets.** Use `.env` files. The `.env.example` files show what's needed.
3. **Never skip the PROGRESS.md update.** At the end of every coding session, log what was
   done, what's next, and any blockers. This is the handoff note.
4. **Never use `px` for font sizes in Tailwind.** Use the design tokens defined in
   `tailwind.config.ts` (rem-based scale).
5. **Every page must have metadata.** Use the `generateMetadata()` function pattern in Next.js
   and pull `seo_title`, `seo_description`, `og_image` from the CMS API.
6. **Every animation must respect `prefers-reduced-motion`.** Wrap Framer Motion animations
   in the `useReducedMotion()` hook.

---

## Where to Find Things

| What | Where |
|---|---|
| CMS content models | `backend/cms/models.py` |
| API serializers | `backend/cms/serializers.py` |
| API endpoints | `backend/cms/api.py` |
| Django URL routing | `backend/portfolio/urls.py` |
| Frontend API client | `frontend/lib/api.ts` |
| SEO / metadata helpers | `frontend/lib/seo.ts` |
| Design tokens (colors, fonts, spacing) | `frontend/tailwind.config.ts` |
| Reusable animations | `frontend/components/animations/` |
| Page sections | `frontend/components/sections/` |
| Base UI components | `frontend/components/ui/` |

---

## Current Phase

See `PROGRESS.md` for the live sprint log.

**Phases overview:**
- [x] Phase 0 — Project scaffold, all config, all agent .md files
- [ ] Phase 1 — Backend: Django models, Wagtail admin, REST API, sitemap
- [ ] Phase 2 — Frontend: Design system, Tailwind config, animation primitives
- [ ] Phase 3 — Frontend: All pages built and connected to CMS API
- [ ] Phase 4 — SEO: JSON-LD, OG images, Lighthouse audit to 95+
- [ ] Phase 5 — Deploy: Pi 5, Cloudflare Tunnel, Search Console, content seeding

---

## Key Contacts / Accounts

- Cloudflare: tunnel named `rezwoan-pi`, domain `rezwoan.me`
- Fiverr: username `rezwoanfaisal`
- LinkedIn: linkedin.com/in/din-muhammad-rezwoan-b4b87020a

---

## Other Agent Files in This Repo

| File | Contents |
|---|---|
| `ARCHITECTURE.md` | All technical decisions with reasoning |
| `PROGRESS.md` | Sprint-by-sprint log, always current |
| `CONTENT_SCHEMA.md` | Every CMS model field documented |
| `SEO_STRATEGY.md` | Target keywords, structured data rules, Lighthouse targets |
| `STYLE_GUIDE.md` | Design tokens, animation rules, component patterns |
| `DEPLOYMENT.md` | Pi 5 setup, Cloudflare Tunnel, env vars, nginx config |
