Good catch. Here's the complete picture of what we're building:

```
rezwoan.me        → Cloudflare Tunnel → Nginx → Next.js (port 3000)
manage.rezwoan.me → Cloudflare Tunnel → Nginx → Django/Gunicorn (port 8000)
raspap.rezwoan.me → Cloudflare Tunnel → Nginx → lighttpd (port 8080)
pi.rezwoan.me     → Cloudflare Tunnel → SSH (port 22)
```

---

## Step 1 — Add `manage.rezwoan.me` to Your Tunnel

On the Pi:

```bash
cloudflared tunnel route dns rezwoan-pi manage.rezwoan.me
```

Then update the tunnel config:

```bash
sudo msedit /etc/cloudflared/config.yml
```

Replace the entire contents with this:

```yaml
tunnel: 27a45beb-cb35-4793-ae4c-3ec398928907
credentials-file: /etc/cloudflared/27a45beb-cb35-4793-ae4c-3ec398928907.json

ingress:
  - hostname: rezwoan.me
    service: http://localhost:80
  - hostname: www.rezwoan.me
    service: http://localhost:80
  - hostname: manage.rezwoan.me
    service: http://localhost:80
  - hostname: raspap.rezwoan.me
    service: http://localhost:8080
  - hostname: pi.rezwoan.me
    service: ssh://localhost:22
  - service: http_status:404
```

Restart the tunnel:

```bash
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
```

---

## Step 2 — Configure Nginx (Two Server Blocks)

```bash
sudo msedit /etc/nginx/sites-available/rezwoan
```

Paste this — **two separate server blocks**, one per domain:

```nginx
# ── Frontend: rezwoan.me ────────────────────────────────────────
server {
    listen 80;
    server_name rezwoan.me www.rezwoan.me;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ── Backend CMS: manage.rezwoan.me ─────────────────────────────
server {
    listen 80;
    server_name manage.rezwoan.me;

    client_max_body_size 20M;

    # Serve Django media uploads directly from disk
    location /media/ {
        alias /var/www/rezwoan-portfolio/backend/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Serve Django collected static files directly from disk
    location /static/ {
        alias /var/www/rezwoan-portfolio/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else → Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and test:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/rezwoan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 3 — Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Python
sudo apt install -y python3 python3-venv python3-pip

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL + extras
sudo apt install -y git build-essential sqlite3

# Verify
node --version    # v20.x
python3 --version
sqlite3 --version
```

---

## Step 4 — Database Setup (SQLite)

Since we switched to SQLite, there is no database server to install or configure! 
Django will automatically create a `db.sqlite3` file in your `backend/` folder when you run the migrations in Step 6.

---

## Step 5 — Clone the Repo

```bash
sudo mkdir -p /var/www
sudo chown reezz:reezz /var/www
cd /var/www
git clone https://github.com/Rezwoan/rezwoan-portfolio.git rezwoan-portfolio
cd rezwoan-portfolio
```

---

## Step 6 — Set Up the Backend

```bash
cd /var/www/rezwoan-portfolio/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
msedit .env
```

Fill in your `.env` exactly like this:

```env
SECRET_KEY=django-insecure-32*s69&j7$1x(r$54(e*07z^b41n#s)t!y^r#$40f4p@0&a#u_
DEBUG=False
ALLOWED_HOSTS=manage.rezwoan.me,127.0.0.1,localhost
DJANGO_SETTINGS_MODULE=portfolio.settings.production
WAGTAIL_SITE_NAME=Rezwoan Portfolio
CORS_ALLOWED_ORIGINS=https://rezwoan.me,https://www.rezwoan.me
MEDIA_ROOT=/var/www/rezwoan-portfolio/backend/media
STATIC_ROOT=/var/www/rezwoan-portfolio/backend/static
```

Run Django setup:

```bash
export DJANGO_SETTINGS_MODULE=portfolio.settings.production

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

---

## Step 7 — Set Up the Frontend

```bash
cd /var/www/rezwoan-portfolio/frontend

npm ci

cp .env.local.example .env.local
msedit .env.local
```

Set these values — **note `manage.rezwoan.me` as the API URL**:

```env
NEXT_PUBLIC_API_URL=https://manage.rezwoan.me
NEXT_PUBLIC_SITE_URL=https://rezwoan.me
```

Build it (takes a few minutes on the Pi):

```bash
npm run build
```

---

## Step 8 — Create Log Directory

```bash
sudo mkdir -p /var/log/rezwoan
sudo chown reezz:reezz /var/log/rezwoan
```

---

## Step 9 — Create systemd Services

**Backend:**

```bash
sudo msedit /etc/systemd/system/rezwoan-backend.service
```

```ini
[Unit]
Description=Rezwoan Portfolio — Django/Gunicorn
After=network.target postgresql.service
Wants=postgresql.service

[Service]
User=reezz
Group=reezzw/rezwoan-portfolio/backend
Environment="DJANGO_SETTINGS_MODULE=portfolio.settings.production"
EnvironmentFile=/var/www/rezwoan-portfolio/backend/.env
ExecStart=/var/www/rezwoan-portfolio/backend/venv/bin/gunicorn \
    --workers 2 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/rezwoan/backend-access.log \
    --error-logfile /var/log/rezwoan/backend-error.log \
    portfolio.wsgi:application
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Frontend:**

```bash
sudo msedit /etc/systemd/system/rezwoan-frontend.service
```

```ini
[Unit]
Description=Rezwoan Portfolio — Next.js Frontend
After=network.target rezwoan-backend.service

[Service]
User=reezz
Group=reezz
WorkingDirectory=/var/www/rezwoan-portfolio/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/www/rezwoan-portfolio/frontend/.env.local
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/rezwoan/frontend.log
StandardError=append:/var/log/rezwoan/frontend-error.log

[Install]
WantedBy=multi-user.target
```

Enable and start everything:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rezwoan-backend rezwoan-frontend
sudo systemctl start rezwoan-backend rezwoan-frontend

# Verify both are running
sudo systemctl status rezwoan-backend
sudo systemctl status rezwoan-frontend
```

---

## Step 10 — Verify Everything is Live

```bash
# Check all ports are listening
sudo ss -tlnp | grep -E ':80|:3000|:8000|:8080'

# Should show:
# nginx  → :80
# node   → :3000
# gunicorn → :8000
# lighttpd → :8080
```

Then test from your PC:

```bash
curl -I https://rezwoan.me        # should return server: cloudflare
curl -I https://manage.rezwoan.me # should return server: cloudflare
```

Visit:
- `https://rezwoan.me` → your portfolio
- `https://manage.rezwoan.me/cms/` → Wagtail CMS admin
- `https://manage.rezwoan.me/api/site-settings/` → API working

---

## Step 11 — Auto-Deploy with GitHub Actions

**On the Pi**, set up a self-hosted runner:

Go to your GitHub repo → **Settings → Actions → Runners → New self-hosted runner** → choose **Linux / ARM64** and follow the commands GitHub gives you exactly.

After configuring, install it as a service:

```bash
cd ~/actions-runner
sudo ./svc.sh install reezz
sudo ./svc.sh start
```

Allow the runner to restart services without a password prompt:

```bash
sudo visudo
```

Add at the very bottom:

```
reezz ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart rezwoan-backend, /usr/bin/systemctl restart rezwoan-frontend
```

**On your PC**, create `.github/workflows/deploy.yml` in the repo:

```yaml
name: Deploy to Pi

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Pull latest code
        run: |
          cd /var/www/rezwoan-portfolio
          git pull

      - name: Deploy backend
        run: |
          cd /var/www/rezwoan-portfolio/backend
          source venv/bin/activate
          pip install -r requirements.txt
          export DJANGO_SETTINGS_MODULE=portfolio.settings.production
          python manage.py migrate --noinput
          python manage.py collectstatic --noinput
          sudo systemctl restart rezwoan-backend

      - name: Deploy frontend
        run: |
          cd /var/www/rezwoan-portfolio/frontend
          npm ci
          npm run build
          sudo systemctl restart rezwoan-frontend
```

Commit and push this file. Every `git push` to `main` will now automatically deploy to your Pi! 🚀

---

## Quick Cheat Sheet

```bash
# Manual redeploy anytime
cd /var/www/rezwoan-portfolio && make deploy

# Check logs
sudo journalctl -u rezwoan-backend -f
sudo journalctl -u rezwoan-frontend -f
sudo tail -f /var/log/rezwoan/backend-error.log

# Restart services
sudo systemctl restart rezwoan-backend rezwoan-frontend

# Check tunnel
sudo systemctl status cloudflared
```