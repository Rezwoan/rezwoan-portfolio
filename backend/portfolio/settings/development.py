"""
Development settings — SQLite for frictionless local dev (no Postgres needed).
Switch DB_ENGINE to postgresql when you want production parity locally.
"""
from .base import *  # noqa
from decouple import config

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# SQLite by default for local dev — zero setup required.
# Set DB_ENGINE=postgresql in .env to use Postgres instead.
DB_ENGINE = config("DB_ENGINE", default="sqlite")

if DB_ENGINE == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="portfolio_db"),
            "USER": config("DB_USER", default="portfolio_user"),
            "PASSWORD": config("DB_PASSWORD", default=""),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

CORS_ALLOW_ALL_ORIGINS = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
