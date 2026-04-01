# rezwoan.me — Portfolio

Personal portfolio website for Din Muhammad Rezwoan — Full Stack Developer, CSE student at AIUB, Fiverr freelancer.

**Live:** https://rezwoan.me

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20 LTS
- PostgreSQL running locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # http://localhost:8000/cms/
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                   # http://localhost:3000
```

---

## For AI Agents

**Start here:** [`AGENTS.md`](./AGENTS.md)

All project context, rules, file locations, and phase status are documented in the agent files.
Never start coding without reading `AGENTS.md` and `PROGRESS.md` first.

---

## Tech Stack

| | Technology |
|---|---|
| Frontend | Next.js 15 · TypeScript · Tailwind · Framer Motion |
| Backend | Django 5 · Wagtail 6 · Django REST Framework |
| Database | PostgreSQL |
| Hosting | Raspberry Pi 5 via Cloudflare Tunnel |

---

## Project Structure

```
rezwoan-portfolio/
├── backend/           Django + Wagtail backend
├── frontend/          Next.js frontend
├── AGENTS.md          AI agent master guide ← start here
├── ARCHITECTURE.md    Technical decisions
├── PROGRESS.md        Sprint log
├── CONTENT_SCHEMA.md  CMS model documentation
├── SEO_STRATEGY.md    SEO rules and targets
├── STYLE_GUIDE.md     Design system
└── DEPLOYMENT.md      Pi 5 production setup
```
