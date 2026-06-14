#!/usr/bin/env bash
# ============================================================
# rezwoan.me portfolio — Raspberry Pi first-time setup (idempotent)
#
# The BlackBox Pi already runs other projects:
#   - process manager: systemd (NOT pm2 / docker)
#   - reverse proxy:    nginx (vhost per hostname; cloudflared -> :80)
#   - taken ports: 80, 3000/8000 (old portfolio), 3100/3101 (RepRush), 3001/3005/8080
#       -> this app uses 3200 (web) and 3201 (api)
#   - app in /var/www/<project>, logs in /var/log/<project>
#
# Brings up the NEW services alongside the old ones (different ports) and STAGES the
# nginx vhost but does NOT reload nginx — the human flips traffic after smoke-testing
# (see docs/DEPLOYMENT.md "Cutover runbook"). Re-runnable; never regenerates secrets.
#
# Bootstrap (after the rebuild is on main):
#   curl -fsSL https://raw.githubusercontent.com/Rezwoan/rezwoan-portfolio/main/scripts/pi-setup.sh | bash
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/Rezwoan/rezwoan-portfolio.git"
APP_DIR="/var/www/rezwoan-portfolio"
LOG_DIR="/var/log/rezwoan"
DOMAIN="rezwoan.me"
WEB_PORT=3200
API_PORT=3201
USER_NAME="$(whoami)"

echo "=== rezwoan.me portfolio — Pi setup ==="
command -v node >/dev/null || { echo "Node.js required"; exit 1; }
command -v git  >/dev/null || { echo "git required"; exit 1; }
echo "node $(node -v), npm $(npm -v)"

# ── 1. Repo ───────────────────────────────────────────────
echo "[1/9] Repo at $APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  sudo mkdir -p "$APP_DIR"; sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
fi

# ── 2. Dirs ───────────────────────────────────────────────
echo "[2/9] Log + upload dirs"
sudo mkdir -p "$LOG_DIR"; sudo chown -R "$USER_NAME:$USER_NAME" "$LOG_DIR"
mkdir -p "$APP_DIR/backend/uploads"

# ── 3. Env files (only created if missing — never overwrite secrets) ──
echo "[3/9] Environment files"
if [ ! -f "$APP_DIR/backend/.env" ]; then
  JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
  cat > "$APP_DIR/backend/.env" <<EOF
NODE_ENV=production
PORT=$API_PORT
FRONTEND_URL=https://$DOMAIN
DATABASE_URL=file:./portfolio.db
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
ADMIN_EMAIL=frezwoan@gmail.com
ADMIN_PASSWORD=CHANGE_ME_ON_PI
RESEND_API_KEY=PUT_REAL_KEY_HERE
RESEND_FROM_EMAIL=Rezwoan <noreply@rezwoan.me>
CONTACT_TO_EMAIL=frezwoan@gmail.com
GEMINI_API_KEY=PUT_REAL_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=
EOF
  echo "  created backend/.env (fresh JWT secret) — FILL the PUT_REAL_KEY_HERE values + ADMIN_PASSWORD, then re-run."
else
  echo "  backend/.env exists — left untouched"
fi
if [ ! -f "$APP_DIR/frontend/.env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=https://$DOMAIN" > "$APP_DIR/frontend/.env.local"
  echo "  created frontend/.env.local"
else
  echo "  frontend/.env.local exists — left untouched"
fi

# ── 4. Backend build (deps -> prisma -> migrate -> seed-if-new -> build) ──
echo "[4/9] Building backend"
cd "$APP_DIR/backend"
npm ci --no-audit --no-fund
npx prisma generate
FRESH_DB=0; [ -f "$APP_DIR/backend/prisma/portfolio.db" ] || FRESH_DB=1
npx prisma migrate deploy
if [ "$FRESH_DB" = "1" ]; then
  echo "  fresh DB — seeding"; npm run seed || node dist/prisma/seed.js || true
fi
npm run build

# ── 5. Frontend build ─────────────────────────────────────
echo "[5/9] Building frontend"
cd "$APP_DIR/frontend"
npm ci --no-audit --no-fund
npm run build

# ── 6. systemd services ───────────────────────────────────
echo "[6/9] systemd services"
sudo tee /etc/systemd/system/rezwoan-api.service >/dev/null <<EOF
[Unit]
Description=Rezwoan Portfolio — NestJS API
After=network.target

[Service]
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$APP_DIR/backend
EnvironmentFile=$APP_DIR/backend/.env
Environment=NODE_ENV=production
Environment=PORT=$API_PORT
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
RestartSec=5s
StandardOutput=append:$LOG_DIR/api.log
StandardError=append:$LOG_DIR/api-error.log

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/rezwoan-web.service >/dev/null <<EOF
[Unit]
Description=Rezwoan Portfolio — Next.js Frontend
After=network.target rezwoan-api.service

[Service]
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$APP_DIR/frontend
EnvironmentFile=$APP_DIR/frontend/.env.local
Environment=NODE_ENV=production
Environment=PORT=$WEB_PORT
ExecStart=/usr/bin/node node_modules/.bin/next start -p $WEB_PORT
Restart=on-failure
RestartSec=5s
StandardOutput=append:$LOG_DIR/web.log
StandardError=append:$LOG_DIR/web-error.log

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable rezwoan-api.service rezwoan-web.service
sudo systemctl restart rezwoan-api.service
sudo systemctl restart rezwoan-web.service

# ── 7. Stage nginx vhost (validate only — DO NOT reload yet) ──
echo "[7/9] Staging nginx vhost (not reloading)"
[ -f /etc/nginx/sites-available/rezwoan ] && sudo cp /etc/nginx/sites-available/rezwoan /etc/nginx/sites-available/rezwoan.django.bak || true
sudo tee /etc/nginx/sites-available/rezwoan >/dev/null <<'EOF'
server {
    listen 80;
    server_name rezwoan.me www.rezwoan.me;

    set_real_ip_from 103.21.244.0/22; set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;  set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;  set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;  set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15; set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20; set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20; set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    client_max_body_size 15M;

    location /api/ {
        proxy_pass http://127.0.0.1:3201;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 120s;
        proxy_buffering off;
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
EOF
sudo ln -sf /etc/nginx/sites-available/rezwoan /etc/nginx/sites-enabled/rezwoan
sudo nginx -t

# ── 8. Status ─────────────────────────────────────────────
echo "[8/9] Service status"
systemctl --no-pager --no-legend status rezwoan-api.service  | head -3 || true
systemctl --no-pager --no-legend status rezwoan-web.service  | head -3 || true
echo "  local web  -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$WEB_PORT || echo 000)"
echo "  local api  -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$API_PORT/api/health || echo 000)"

# ── 9. Manual steps ───────────────────────────────────────
cat <<EOF

[9/9] Remaining MANUAL steps (one-time) — see docs/DEPLOYMENT.md "Cutover runbook":

  A) Fill real secrets in $APP_DIR/backend/.env (RESEND_API_KEY, GEMINI_API_KEY,
     ADMIN_PASSWORD), then re-run this script to rebuild, and:
       sudo systemctl restart rezwoan-api rezwoan-web

  B) Allow the runner to restart services without a password — sudo visudo, add:
       $USER_NAME ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart rezwoan-api.service, /usr/bin/systemctl restart rezwoan-web.service

  C) Smoke-test locally (above codes should be 200), then FLIP TRAFFIC:
       sudo systemctl reload nginx          # rezwoan.me now serves the NEW site
       # verify https://rezwoan.me and https://rezwoan.me/admin

  D) Retire the old Django site (keep as rollback for a day):
       sudo systemctl disable --now rezwoan-backend.service rezwoan-frontend.service

  E) GitHub Actions runner (label MUST be 'rezwoan' to match deploy.yml). Reuse the
     existing portfolio runner or register a new one (see docs/DEPLOYMENT.md).

Done. Local web: http://localhost:$WEB_PORT  |  api: http://localhost:$API_PORT/api
EOF
