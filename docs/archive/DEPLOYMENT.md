# DEPLOYMENT.md — Production Setup Guide

> Target: Raspberry Pi 5 "BlackBox" running Ubuntu/Debian, Cloudflare Tunnel `rezwoan-pi`.
> No Docker. Services managed by systemd.

---

## Architecture Overview

```
Internet → Cloudflare (CDN + Tunnel) → Nginx (reverse proxy) → [
    Django/Gunicorn  :8000  (backend)
    Next.js          :3000  (frontend)
]
```

---

## Server Requirements

- Python 3.11+
- Node.js 20 LTS
- PostgreSQL 15+
- Redis (optional for Phase 5+)
- Nginx
- Certbot (SSL handled by Cloudflare, but keep for direct access)

```bash
sudo apt update && sudo apt install -y \
  python3.11 python3.11-venv python3-pip \
  nodejs npm \
  postgresql postgresql-contrib \
  nginx redis-server \
  git curl
```

---

## PostgreSQL Setup (first time)

```bash
sudo -u postgres psql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

---

## Backend Deployment

### 1. Clone and set up

```bash
cd /var/www
git clone https://github.com/Rezwoan/portfolio.git rezwoan-portfolio
cd rezwoan-portfolio/backend

python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env  # fill in production values
```

### 2. Run Django setup

```bash
export DJANGO_SETTINGS_MODULE=portfolio.settings.production
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 3. systemd service — `rezwoan-backend.service`

Create `/etc/systemd/system/rezwoan-backend.service`:

```ini
[Unit]
Description=Rezwoan Portfolio — Django/Gunicorn Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/rezwoan-portfolio/backend
Environment="DJANGO_SETTINGS_MODULE=portfolio.settings.production"
EnvironmentFile=/var/www/rezwoan-portfolio/backend/.env
ExecStart=/var/www/rezwoan-portfolio/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/rezwoan/backend-access.log \
    --error-logfile /var/log/rezwoan/backend-error.log \
    portfolio.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/log/rezwoan
sudo chown www-data:www-data /var/log/rezwoan
sudo systemctl daemon-reload
sudo systemctl enable rezwoan-backend
sudo systemctl start rezwoan-backend
sudo systemctl status rezwoan-backend
```

---

## Frontend Deployment

### 1. Build

```bash
cd /var/www/rezwoan-portfolio/frontend
npm ci
cp .env.local.example .env.local
nano .env.local  # set NEXT_PUBLIC_API_URL=https://rezwoan.me
npm run build
```

### 2. systemd service — `rezwoan-frontend.service`

Create `/etc/systemd/system/rezwoan-frontend.service`:

```ini
[Unit]
Description=Rezwoan Portfolio — Next.js Frontend
After=network.target rezwoan-backend.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/rezwoan-portfolio/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/www/rezwoan-portfolio/frontend/.env.local
ExecStart=/usr/bin/node_modules/.bin/next start
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/rezwoan/frontend.log
StandardError=append:/var/log/rezwoan/frontend-error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable rezwoan-frontend
sudo systemctl start rezwoan-frontend
```

---

## Nginx Configuration

Create `/etc/nginx/sites-available/rezwoan`:

```nginx
server {
    listen 80;
    server_name rezwoan.me www.rezwoan.me localhost;

    client_max_body_size 20M;

    # Django media files
    location /media/ {
        alias /var/www/rezwoan-portfolio/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Django static files
    location /static/ {
        alias /var/www/rezwoan-portfolio/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Django backend (API, admin, sitemap, robots)
    location ~ ^/(api|cms|admin|sitemap\.xml|robots\.txt|feed) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js static assets (high cache, immutable)
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js frontend (everything else)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rezwoan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cloudflare Tunnel

The existing tunnel `rezwoan-pi` should be pointed to `http://localhost:80` (Nginx).
Cloudflare handles HTTPS/TLS termination at the edge.

```bash
# Update tunnel config if needed
cloudflared tunnel route dns rezwoan-pi rezwoan.me
```

---

## Deployment After Code Changes

```bash
cd /var/www/rezwoan-portfolio
git pull

# Backend changes:
cd backend
source venv/bin/activate
pip install -r requirements.txt   # if requirements changed
python manage.py migrate          # if models changed
python manage.py collectstatic --noinput
sudo systemctl restart rezwoan-backend

# Frontend changes:
cd ../frontend
npm ci                            # if package.json changed
npm run build
sudo systemctl restart rezwoan-frontend
```

Or use the Makefile shortcut: `make deploy`

---

## Environment Variables Reference

### Backend `.env` (production)

```
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=rezwoan.me,www.rezwoan.me,127.0.0.1
DATABASE_URL=postgresql://portfolio_user:password@localhost:5432/portfolio_db
DJANGO_SETTINGS_MODULE=portfolio.settings.production
CORS_ALLOWED_ORIGINS=https://rezwoan.me
WAGTAIL_SITE_NAME=Rezwoan Portfolio
MEDIA_ROOT=/var/www/rezwoan-portfolio/backend/media
STATIC_ROOT=/var/www/rezwoan-portfolio/backend/static
```

### Frontend `.env.local` (production)

```
NEXT_PUBLIC_API_URL=https://rezwoan.me
NEXT_PUBLIC_SITE_URL=https://rezwoan.me
```
