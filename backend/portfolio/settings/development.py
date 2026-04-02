"""
Development settings - SQLite for frictionless local dev.
"""
from .base import *  # noqa
from decouple import config

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# DATABASES inherited from base.py (using sqlite3)

CORS_ALLOW_ALL_ORIGINS = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
