# AGENTS.md — Rules for AI Agents Working in This Repo

> Read this **before** making any change. This repo deploys to a **live**
> Raspberry Pi that **also hosts other projects**. A bad build, a port collision,
> or a proxy mistake can take down rezwoan.me **and** the neighbours.
> Pair this with [`PLAN.md`](./PLAN.md) (what to build) and [`docs/`](./docs/) (how).

---

## What this project is

The personal portfolio of **Din Muhammad Rezwoan**, live at **https://rezwoan.me**.
It is being **rebuilt from scratch**: out goes Django/Wagtail/PostgreSQL, in comes
**NestJS + Next.js + Prisma (SQLite)**. The new site **replaces** the old one at the
same domain. CI/CD auto-deploys every push to `main`.

---

## Ground truth — the Pi (do not assume otherwise)

| Thing | Reality |
|---|---|
| Host | Raspberry Pi 5, `blackbox.local`, user `reezz` (`ssh reezz@blackbox.local`) |
| Process manager | **systemd** — NOT pm2, NOT docker |
| Reverse proxy | **nginx**, one vhost per hostname (`/etc/nginx/sites-available/…`) |
| Public routing | **Cloudflare Tunnel** (`cloudflared`, systemd). Tunnel → nginx `:80`. No port-forwarding, no public IP. Tunnel ID `27a45beb-cb35-4793-ae4c-3ec398928907` |
| App directory | **`/var/www/rezwoan-portfolio`** (a git checkout of `main`) |
| Logs | `/var/log/rezwoan/` |
| **Frontend port** | **3200** (Next.js) |
| **Backend port** | **3201** (NestJS, global prefix `/api`) |
| DB | SQLite file `backend/prisma/portfolio.db` (gitignored, persists across deploys) |
| CI runner | self-hosted on the Pi, label **`rezwoan`** |

> **Ports owned by OTHER apps on this Pi — never bind to them:**
> `80` (nginx), `3000`/`8000` (old portfolio, being retired), `3100`/`3101` (RepRush),
> `3001`, `3005`, `8080` (RaspAP/lighttpd), `5432`, `22`.
> The new portfolio uses **3200/3201** — nothing else uses the 32xx range.
> Always confirm with `sudo ss -tlnp | grep -E ':3200|:3201'` before first start.

---

## The most important rules

### 1. Do not break the build
Every push to `main` triggers a production deploy: `npm ci && npm run build` in
**both** `backend/` and `frontend/`, then `prisma migrate deploy`, then a service
restart. If any step fails, the deploy fails. **Run both builds locally before committing.**

### 2. Do not change ports
Frontend **3200**, backend **3201**. They are set by systemd and referenced by the
nginx vhost. Changing them requires editing the systemd units + nginx on the Pi.

### 3. Do not change the API prefix or the URL contract
Backend uses `app.setGlobalPrefix('api')`. nginx sends `/api/` → backend, everything
else → frontend. The frontend talks to `process.env.NEXT_PUBLIC_API_URL` only
(prod: `https://rezwoan.me`, baked in at build). Never hardcode `localhost`.

### 4. Never commit secrets — the repo is PUBLIC
`.env` / `.env.local` are gitignored and live only on the Pi. Tracked files use
placeholders. If you add an env var: add it to `*.env.example`, document it in
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md), then set the real value on the Pi and
restart the service.

### 5. Database migrations are real migrations
Prisma with a committed migration history. Adding tables/columns is safe. **Removing
or renaming columns loses data** — if a change is destructive, back up first:
```bash
ssh reezz@blackbox.local 'cp /var/www/rezwoan-portfolio/backend/prisma/portfolio.db ~/portfolio-backup-$(date +%Y%m%d).db'
```
Production runs `prisma migrate deploy` (never `db push` / never `migrate reset`).

### 6. The `.db`, `uploads/`, and `.env` files survive deploys
`scripts/deploy.sh` runs `git reset --hard origin/main`. That resets tracked files to
match `main` but leaves untracked/gitignored files (the database, uploaded images, env
files) in place. Keep those paths gitignored forever.

### 7. Don't break CI/CD
`.github/workflows/deploy.yml` runs on the Pi runner (`runs-on: [self-hosted, rezwoan]`)
and calls `/var/www/rezwoan-portfolio/scripts/deploy.sh`. Don't change the runner
label or rewrite deploy to use pm2/docker.

### 8. Respect the cutover
Until the Phase 7 cutover is done, the **old Django site still serves rezwoan.me**.
Don't delete the old systemd services or edit the rezwoan.me nginx vhost except by
following the runbook in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

### 9. Content & feature freeze unless asked
Once a page/feature is built and approved it's the contract. Make the smallest change
that satisfies a request; don't refactor or restyle working code as a side effect.

---

## Safe changes (no special care)
UI components, Tailwind classes, copy, new pages, new API endpoints, new npm
packages, **additive** Prisma fields, bug fixes that keep the API contract.

## Risky changes (test locally, call them out)
Auth/JWT/cookie logic, removing/renaming endpoints or Prisma fields, `main.ts`
CORS/ports/prefix, `next.config.js`, the AI prompt/grounding, the deploy scripts,
major version bumps (NestJS/Next/Prisma).

---

## Stack quick reference

| Layer | Tech | Port | Run by |
|---|---|---|---|
| Backend | NestJS 10 + Prisma + SQLite | 3201 | `node dist/main.js` (systemd `rezwoan-api.service`) |
| Frontend | Next.js 14 + Tailwind + Framer Motion | 3200 | `next start -p 3200` (systemd `rezwoan-web.service`) |
| Proxy | nginx | 80 | system service |
| Tunnel/DNS | Cloudflare Tunnel + DNS | — | `cloudflared` (systemd) |
| AI | Google Gemini (`GEMINI_MODEL`) | — | called from backend |
| Email | Resend | — | called from backend |

## Local dev
```bash
# backend
cd backend && npm install && cp .env.example .env
npx prisma migrate dev && npm run start:dev        # http://localhost:3201/api
# frontend
cd frontend && npm install && cp .env.local.example .env.local
npm run dev                                          # http://localhost:3200
```

## Manual deploy / ops (on the Pi)
```bash
ssh reezz@blackbox.local 'bash /var/www/rezwoan-portfolio/scripts/deploy.sh'
systemctl status rezwoan-api rezwoan-web
sudo journalctl -u rezwoan-api -f
```

## Identity / accounts (seed defaults for SiteSettings)
- Din Muhammad Rezwoan · Full Stack Developer · CSE @ AIUB · Dhaka, Bangladesh
- GitHub `Rezwoan` · LinkedIn `din-muhammad-rezwoan-b4b87020a` · X `@XRezwoan`
- Fiverr username `rezwoanfaisal` · Contact inbox `frezwoan@gmail.com`
- Cloudflare domain `rezwoan.me`, tunnel `27a45beb-cb35-4793-ae4c-3ec398928907`

## End-of-session ritual
Update [`PROGRESS.md`](./PROGRESS.md): date · what got done · what's next · blockers.
That file is the handoff note for whoever (or whatever) continues next.
