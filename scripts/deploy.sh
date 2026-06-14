#!/usr/bin/env bash
# ============================================================
# rezwoan.me portfolio — Deploy script
# Run by the self-hosted GitHub Actions runner on every push to main.
# Safe to run by hand: ssh reezz@blackbox.local 'bash /var/www/rezwoan-portfolio/scripts/deploy.sh'
#
# Model: the live dir is a git checkout of `main`. We hard-reset to the pushed
# commit, regenerate the Prisma client, apply migrations, rebuild both apps, then
# restart the systemd services. Gitignored files (.env, prisma/*.db, uploads/,
# node_modules/, .next/, dist/) survive the reset.
# ============================================================
set -euo pipefail

APP_DIR="/var/www/rezwoan-portfolio"
WEB_PORT=3200
API_PORT=3201

echo "[deploy] $(date) — starting"

# ── 1. Pull latest ────────────────────────────────────────
echo "[1/5] Fetching latest main..."
git -C "$APP_DIR" fetch origin main
git -C "$APP_DIR" reset --hard origin/main

# ── 2. Backend: deps → prisma client → migrate → build ────
echo "[2/5] Building backend..."
cd "$APP_DIR/backend"
npm ci --no-audit --no-fund
npx prisma generate
npx prisma migrate deploy
npm run build

# ── 3. Frontend ───────────────────────────────────────────
echo "[3/5] Building frontend..."
cd "$APP_DIR/frontend"
npm ci --no-audit --no-fund
npm run build

# ── 4. Restart services ───────────────────────────────────
echo "[4/5] Restarting services..."
sudo systemctl restart rezwoan-api.service
sudo systemctl restart rezwoan-web.service

# ── 5. Health check ───────────────────────────────────────
echo "[5/5] Health check..."
sleep 6
API=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${API_PORT}/api/health" 2>/dev/null || echo 000)
WEB=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${WEB_PORT}" 2>/dev/null || echo 000)
echo "  api  :${API_PORT} -> HTTP $API"
echo "  web  :${WEB_PORT} -> HTTP $WEB"

if [[ "$API" != "200" ]]; then
  echo "[deploy] ✗ api not healthy"; sudo journalctl -u rezwoan-api.service -n 30 --no-pager; exit 1
fi
if [[ ! "$WEB" =~ ^(200|307|302)$ ]]; then
  echo "[deploy] ✗ web health check failed ($WEB)"; sudo journalctl -u rezwoan-web.service -n 30 --no-pager; exit 1
fi

echo "[deploy] ✓ success — $(date)"
