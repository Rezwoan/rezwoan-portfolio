# DEPLOYMENT.md — Raspberry Pi Production & CI/CD

> Live URL: **https://rezwoan.me** · Pi: `blackbox.local` (user `reezz`) ·
> App dir: `/var/www/rezwoan-portfolio` · Ports: web **3200**, api **3201**.
> This mirrors the proven RepRush deployment on the same Pi, adapted for Prisma and a
> safe **cutover from the old Django site**. Supersedes old `DEPLOYMENT.md`/`deploymentToPi.md`.

---

## Architecture

```
Internet → Cloudflare (DNS+TLS+CDN) → Cloudflare Tunnel (cloudflared, systemd)
  → rezwoan.me / www.rezwoan.me → http://localhost:80
    → nginx vhost (server_name rezwoan.me www.rezwoan.me)
        ├── /api/      → 127.0.0.1:3201  (NestJS, systemd: rezwoan-api)
        ├── /uploads/  → /var/www/rezwoan-portfolio/backend/uploads/ (static, on disk)
        ├── /_next/static/ → 127.0.0.1:3200 (immutable cache)
        └── /          → 127.0.0.1:3200  (Next.js, systemd: rezwoan-web)
```
The Cloudflare Tunnel **already** routes `rezwoan.me`→`localhost:80` (old site). The
cutover is purely an **nginx vhost swap** + bringing up the new services — no Cloudflare
DNS change needed.

---

## Ports (must stay in sync: systemd ⇄ nginx ⇄ deploy.sh)
- Web **3200**, API **3201**. Nothing else on the Pi uses 32xx.
- Verify free before first start: `sudo ss -tlnp | grep -E ':3200|:3201'` (empty = good).
- Owned by neighbours — never reuse: 80, 3000/8000 (old portfolio), 3100/3101 (RepRush),
  3001, 3005, 8080, 5432, 22.

---

## Environment variables

### Backend — `/var/www/rezwoan-portfolio/backend/.env` (Pi only, gitignored)
```
NODE_ENV=production
PORT=3201
FRONTEND_URL=https://rezwoan.me
DATABASE_URL=file:./portfolio.db          # relative to backend/prisma at runtime
JWT_SECRET=<generated 96-hex on the Pi>
JWT_EXPIRY=7d
ADMIN_EMAIL=frezwoan@gmail.com
ADMIN_PASSWORD=<set on the Pi>
RESEND_API_KEY=<real key, Pi only>
RESEND_FROM_EMAIL=Rezwoan <noreply@rezwoan.me>
CONTACT_TO_EMAIL=frezwoan@gmail.com
GEMINI_API_KEY=<real key, Pi only>
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=<optional, raises rate limit>
```
> `PORT`/`NODE_ENV` are also set by systemd; dotenv won't override them — intended.
> `DATABASE_URL` points Prisma at the SQLite file. Confirm Prisma resolves the path from
> `backend/prisma/` (use `file:./portfolio.db` in `schema.prisma`'s datasource).

### Frontend — `/var/www/rezwoan-portfolio/frontend/.env.local` (Pi only)
```
NEXT_PUBLIC_API_URL=https://rezwoan.me     # baked into the build
```

These survive `git reset --hard` because they're untracked. **Never commit them.**

---

## `scripts/deploy.sh` (run by CI on every push to main; safe to run by hand)
```bash
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/var/www/rezwoan-portfolio"
WEB_PORT=3200
API_PORT=3201
echo "[deploy] $(date) starting"

# 1. latest code (gitignored .env, prisma/*.db, uploads/ survive)
git -C "$APP_DIR" fetch origin main
git -C "$APP_DIR" reset --hard origin/main

# 2. backend: deps → prisma client → migrate → build
cd "$APP_DIR/backend"
npm ci --no-audit --no-fund
npx prisma generate
npx prisma migrate deploy
npm run build

# 3. frontend
cd "$APP_DIR/frontend"
npm ci --no-audit --no-fund
npm run build

# 4. restart services
sudo systemctl restart rezwoan-api.service
sudo systemctl restart rezwoan-web.service

# 5. health check
sleep 6
API=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${API_PORT}/api/health" || echo 000)
WEB=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${WEB_PORT}" || echo 000)
echo "  api :${API_PORT} -> $API | web :${WEB_PORT} -> $WEB"
[[ "$API" == "200" ]] || { echo "api down"; sudo journalctl -u rezwoan-api -n 30 --no-pager; exit 1; }
[[ "$WEB" =~ ^(200|307|302)$ ]] || { echo "web down"; sudo journalctl -u rezwoan-web -n 30 --no-pager; exit 1; }
echo "[deploy] ✓ $(date)"
```

## `.github/workflows/deploy.yml`
```yaml
name: Deploy to Raspberry Pi
on:
  push: { branches: [main] }
  workflow_dispatch:
concurrency: { group: rezwoan-deploy, cancel-in-progress: false }
jobs:
  deploy:
    runs-on: [self-hosted, rezwoan]
    steps:
      - name: Deploy
        run: bash /var/www/rezwoan-portfolio/scripts/deploy.sh
```

## systemd units (created by `pi-setup.sh`)
`/etc/systemd/system/rezwoan-api.service`
```ini
[Unit]
Description=Rezwoan Portfolio — NestJS API
After=network.target
[Service]
User=reezz
WorkingDirectory=/var/www/rezwoan-portfolio/backend
EnvironmentFile=/var/www/rezwoan-portfolio/backend/.env
Environment=NODE_ENV=production
Environment=PORT=3201
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/rezwoan/api.log
StandardError=append:/var/log/rezwoan/api-error.log
[Install]
WantedBy=multi-user.target
```
`/etc/systemd/system/rezwoan-web.service`
```ini
[Unit]
Description=Rezwoan Portfolio — Next.js
After=network.target rezwoan-api.service
[Service]
User=reezz
WorkingDirectory=/var/www/rezwoan-portfolio/frontend
EnvironmentFile=/var/www/rezwoan-portfolio/frontend/.env.local
Environment=NODE_ENV=production
Environment=PORT=3200
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3200
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/rezwoan/web.log
StandardError=append:/var/log/rezwoan/web-error.log
[Install]
WantedBy=multi-user.target
```

## nginx vhost — `/etc/nginx/sites-available/rezwoan`
```nginx
server {
    listen 80;
    server_name rezwoan.me www.rezwoan.me;

    # Real client IP from Cloudflare
    set_real_ip_from 103.21.244.0/22; set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;  set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;  set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;  set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15; set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20; set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20; set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    client_max_body_size 15M;       # image/CV uploads

    location /api/ {
        proxy_pass http://127.0.0.1:3201;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 120s;     # AI/streaming endpoints
        proxy_buffering off;         # for chat streaming
    }

    location /uploads/ {
        alias /var/www/rezwoan-portfolio/backend/uploads/;
        expires 30d; add_header Cache-Control "public";
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3200;
        expires 1y; add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## First-time setup — `scripts/pi-setup.sh`
Idempotent. Builds the new app and brings up new services **alongside** the old ones
(different ports), stages the nginx vhost, and **validates but does not reload** nginx —
the human flips traffic in the cutover step after smoke-testing.

Outline (write the full script to match):
1. Require node+git; `git fetch/reset` `/var/www/rezwoan-portfolio` to `main` (clone if absent).
2. `mkdir -p /var/log/rezwoan`, `backend/uploads`; chown to `reezz`.
3. Create `backend/.env` (only if missing; generate `JWT_SECRET`) + `frontend/.env.local` (only if missing). **Leave real API keys as TODO placeholders for the human to fill, then re-run.**
4. Backend: `npm ci` → `npx prisma generate` → `npx prisma migrate deploy` →
   `node prisma/seed` (only if DB absent) → `npm run build`.
5. Frontend: `npm ci` → `npm run build`.
6. Write the two systemd units (above), `daemon-reload`, `enable --now` both.
7. Smoke values: print `curl localhost:3200` and `localhost:3201/api/health` codes.
8. Back up the current live vhost: `cp /etc/nginx/sites-available/rezwoan{,.django.bak}`
   (if it exists), then write the new vhost (above) to `/etc/nginx/sites-available/rezwoan`,
   run `sudo nginx -t` (validate only — **do not reload yet**).
9. Print the remaining MANUAL steps (cutover, sudoers, runner, Cloudflare check).

Bootstrap (first run, before repo exists on the new stack — only after the rebuild is on `main`):
```bash
ssh reezz@blackbox.local
curl -fsSL https://raw.githubusercontent.com/Rezwoan/rezwoan-portfolio/main/scripts/pi-setup.sh | bash
```

---

## ⭐ Cutover runbook (old Django site → new site) — do this ONCE

> Goal: zero-/near-zero-downtime swap. New services run on 3200/3201; old run on
> 3000/8000. We only flip when the new app is verified.

1. **Pause auto-deploy** so the first push doesn't race the setup: on the Pi,
   `sudo ~/actions-runner*/svc.sh stop` (or temporarily remove the `rezwoan` label), OR
   land the rebuild on a branch and merge to `main` only after step 5.
2. **Get the code on `main`** (merge the rebuild). Old site keeps serving (old services + old vhost untouched so far).
3. **Run setup:** `bash /var/www/rezwoan-portfolio/scripts/pi-setup.sh`.
   Fill real API keys/`ADMIN_PASSWORD` into `backend/.env`, then re-run setup to rebuild.
4. **Add sudoers** (so the runner can restart without a prompt) — `sudo visudo`, add:
   ```
   reezz ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart rezwoan-api.service, /usr/bin/systemctl restart rezwoan-web.service
   ```
5. **Smoke test the new app locally on the Pi:**
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3201/api/health   # 200
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3200              # 200
   curl -s http://localhost:3201/api/site-settings | head                       # real JSON
   ```
6. **Flip traffic:** `sudo systemctl reload nginx` (the new vhost is already staged +
   validated). `https://rezwoan.me` now serves the new site through the tunnel.
7. **Verify live:** open https://rezwoan.me and https://rezwoan.me/admin; submit a test
   contact message; confirm email arrives.
8. **Retire the old site:** stop + disable the old units (do **not** delete yet):
   ```bash
   sudo systemctl disable --now rezwoan-backend.service rezwoan-frontend.service
   ```
   (These are the old Django/Next units from the previous deploy.) Optionally remove the
   `manage.rezwoan.me` ingress from `/etc/cloudflared/config.yml` + restart cloudflared.
9. **Re-enable auto-deploy:** start the runner again (`svc.sh start`). Push a trivial
   commit to confirm CI deploys green.
10. **Rollback (if needed within the grace period):**
    `sudo cp /etc/nginx/sites-available/rezwoan.django.bak /etc/nginx/sites-available/rezwoan`
    `&& sudo systemctl reload nginx && sudo systemctl enable --now rezwoan-backend rezwoan-frontend`.
11. After a stable day or two, delete the old units/venv to reclaim space.

---

## CI/CD runner (one-time)
The Pi has no public inbound; a self-hosted runner polls GitHub. Reuse the existing
portfolio runner if present, but ensure its label is **`rezwoan`** (matching deploy.yml).
If you need a fresh one:
```bash
mkdir -p ~/actions-runner-rezwoan && cd ~/actions-runner-rezwoan
curl -O -L https://github.com/actions/runner/releases/download/v2.334.0/actions-runner-linux-arm64-2.334.0.tar.gz
tar xzf actions-runner-linux-arm64-2.334.0.tar.gz
./config.sh --url https://github.com/Rezwoan/rezwoan-portfolio \
  --token <REG_TOKEN from repo Settings ▸ Actions ▸ Runners ▸ New> \
  --name blackbox-rezwoan --labels rezwoan --unattended
sudo ./svc.sh install reezz && sudo ./svc.sh start
```

## Cloudflare Tunnel
`rezwoan.me`/`www.rezwoan.me` already route to `localhost:80` in
`/etc/cloudflared/config.yml` (tunnel `27a45beb-cb35-4793-ae4c-3ec398928907`). No change
needed for the cutover. Only edit if retiring `manage.rezwoan.me`.

---

## Operations
```bash
systemctl status rezwoan-api rezwoan-web
sudo journalctl -u rezwoan-api -f
tail -f /var/log/rezwoan/web.log
sudo systemctl restart rezwoan-api rezwoan-web
bash /var/www/rezwoan-portfolio/scripts/deploy.sh        # manual deploy
# DB backup (before risky migrations)
cp /var/www/rezwoan-portfolio/backend/prisma/portfolio.db ~/portfolio-backup-$(date +%Y%m%d).db
```

## Troubleshooting
- **Site down:** check both services, `sudo nginx -t && systemctl status nginx`,
  `systemctl status cloudflared`.
- **Deploy failed:** open the Actions run, or `sudo journalctl -u rezwoan-api -n 100`.
- **Prisma engine error on ARM:** ensure `npx prisma generate` ran in the build; if the
  engine can't download, pin `binaryTargets` in `schema.prisma` to the Pi's
  `linux-arm64-openssl-*` and redeploy.
- **Port in use:** `sudo ss -tlnp | grep -E ':3200|:3201'` — new app must own these only.
- **Emails not arriving:** verify `RESEND_*` in `.env`, check Resend dashboard, confirm
  `noreply@rezwoan.me` domain is verified.
