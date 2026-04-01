# Makefile — Common shortcuts for local development
# Usage: make <target>

.PHONY: help backend frontend install migrate superuser lint typecheck

help:
	@echo ""
	@echo "  make backend      Start Django dev server (localhost:8000)"
	@echo "  make frontend     Start Next.js dev server (localhost:3000)"
	@echo "  make install      Install all dependencies (backend + frontend)"
	@echo "  make migrate      Run Django migrations"
	@echo "  make superuser    Create a Django superuser"
	@echo "  make lint         Run ESLint on frontend"
	@echo "  make typecheck    Run TypeScript type checker"
	@echo "  make deploy       Pull latest code and restart production services"
	@echo ""

# ── Development ────────────────────────────────────────────────────────────

backend:
	cd backend && \
	  DJANGO_SETTINGS_MODULE=portfolio.settings.development \
	  ./venv/bin/python manage.py runserver

frontend:
	cd frontend && npm run dev

install:
	@echo "→ Installing backend dependencies..."
	cd backend && python -m venv venv && ./venv/bin/pip install -r requirements.txt
	@echo "→ Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Done. Copy .env files:"
	@echo "  backend/.env.example  → backend/.env"
	@echo "  frontend/.env.local.example → frontend/.env.local"

migrate:
	cd backend && \
	  DJANGO_SETTINGS_MODULE=portfolio.settings.development \
	  ./venv/bin/python manage.py migrate

superuser:
	cd backend && \
	  DJANGO_SETTINGS_MODULE=portfolio.settings.development \
	  ./venv/bin/python manage.py createsuperuser

# ── Quality checks ─────────────────────────────────────────────────────────

lint:
	cd frontend && npm run lint

typecheck:
	cd frontend && npm run type-check

# ── Production ─────────────────────────────────────────────────────────────

deploy:
	@echo "→ Pulling latest code..."
	git pull
	@echo "→ Installing backend dependencies..."
	cd backend && ./venv/bin/pip install -r requirements.txt
	@echo "→ Running migrations..."
	cd backend && \
	  DJANGO_SETTINGS_MODULE=portfolio.settings.production \
	  ./venv/bin/python manage.py migrate
	@echo "→ Collecting static files..."
	cd backend && \
	  DJANGO_SETTINGS_MODULE=portfolio.settings.production \
	  ./venv/bin/python manage.py collectstatic --noinput
	@echo "→ Building frontend..."
	cd frontend && npm ci && npm run build
	@echo "→ Restarting services..."
	sudo systemctl restart rezwoan-backend
	sudo systemctl restart rezwoan-frontend
	@echo "✓ Deployment complete."
