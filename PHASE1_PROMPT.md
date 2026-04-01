# Phase 1 Backend — Agent Task Brief

You are working on the `rezwoan-portfolio` repository.
Read `AGENTS.md`, `ARCHITECTURE.md`, and `CONTENT_SCHEMA.md` before writing any code.

## Your Goal

Complete the Django REST Framework API layer so the Next.js frontend can fetch all
content from the Wagtail CMS. All models already exist in `backend/cms/models.py`.

---

## Files You Must Create or Replace

### 1. `backend/cms/serializers.py` (CREATE)

Write DRF serializers for every model in `cms/models.py`.

Requirements:
- Use `ModelSerializer` for all models.
- For `WagtailImage` fields (ForeignKey to `CustomImage`), write a nested serializer
  that returns `{ "url": "<full absolute URL>", "width": int, "height": int, "alt": str }`.
  Use `serializer.context['request']` to build absolute URLs with `request.build_absolute_uri`.
- For `TechTag` M2M fields, return `[{ "name": str, "color": str }]`.
- `SiteSettings`: serialize all fields. The `resume_pdf` should return a URL string or null.
- `Project`: include `tech_stack` as nested TechTag list. Include all SEO fields.
- `Experience`: include `tech_used` as nested TechTag list.
- `Skill`: all fields.
- `BlogPost` (list serializer — no `body`): title, slug, excerpt, cover_image, tags (list of
  strings), reading_time, published_date, meta_description (map from `search_description`).
- `BlogPostDetail` (detail serializer — includes `body` as raw StreamField JSON): extends list.
- `Testimonial`: all fields.
- `ContactSubmission`: write-only serializer for POST (name, email, subject, message only).

### 2. `backend/cms/views.py` (REPLACE the stub from session 2)

Write proper DRF APIViews and ViewSets. Requirements:

```
GET  /api/site-settings/         → SiteSettingsView (retrieve singleton from Wagtail Site)
GET  /api/projects/              → ProjectListView (filter: ?featured=true, ?category=web)
GET  /api/projects/<slug>/       → ProjectDetailView
GET  /api/experiences/           → ExperienceListView (ordered by -start_date)
GET  /api/skills/                → SkillListView (filter: ?show_on_hero=true)
GET  /api/blog/                  → BlogPostListView (paginated, PAGE_SIZE=10)
GET  /api/blog/<slug>/           → BlogPostDetailView (use Wagtail page slug lookup)
GET  /api/testimonials/          → TestimonialListView (filter: ?featured=true)
POST /api/contact/               → ContactSubmissionView (validate + save, return {success: true})
GET  /robots.txt                 → robots_txt (plain text response)
GET  /feed/rss/                  → rss_feed (basic RSS 2.0 for blog posts)
```

For `SiteSettingsView`:
- Use `SiteSettings.for_request(request)` to get the singleton.
- If no site settings exist yet, return safe defaults (full_name="Din Muhammad Rezwoan", etc.)
  so the frontend doesn't crash during development before the admin is seeded.

For `BlogPostListView`:
- Query `BlogPost.objects.live().public().order_by('-published_date')`.
- Use DRF pagination (PAGE_SIZE=10).

For `BlogPostDetailView`:
- Use `BlogPost.objects.live().get(slug=slug)`.
- Catch `BlogPost.DoesNotExist` and return 404.

For `ContactSubmissionView`:
- On valid POST, save the submission and optionally send an email notification
  (use `django.core.mail.send_mail`, catch exceptions so the API doesn't fail if email is misconfigured).
- Save `ip_address` from `request.META.get('REMOTE_ADDR')`.
- Return `{"success": True, "message": "Message sent successfully."}` on success.
- Return `{"success": False, "errors": serializer.errors}` on validation failure (HTTP 400).

For `robots_txt`:
```
User-agent: *
Disallow: /cms/
Disallow: /django-admin/
Sitemap: https://rezwoan.me/sitemap.xml
```

For `rss_feed`:
- Simple RSS 2.0 XML response with the 10 most recent published BlogPost pages.
- Fields: title, link (/blog/<slug>/), description (excerpt), pubDate.

### 3. `backend/cms/urls.py` (REPLACE the stub from session 2)

Wire up all the above views:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("site-settings/", views.SiteSettingsView.as_view()),
    path("projects/", views.ProjectListView.as_view()),
    path("projects/<slug:slug>/", views.ProjectDetailView.as_view()),
    path("experiences/", views.ExperienceListView.as_view()),
    path("skills/", views.SkillListView.as_view()),
    path("blog/", views.BlogPostListView.as_view()),
    path("blog/<slug:slug>/", views.BlogPostDetailView.as_view()),
    path("testimonials/", views.TestimonialListView.as_view()),
    path("contact/", views.ContactSubmissionView.as_view()),
]
```

### 4. `backend/cms/wagtail_hooks.py` (CREATE)

Register the non-Page models (Project, Experience, Skill, Testimonial, ContactSubmission)
in the Wagtail admin so they appear in the sidebar.

```python
from wagtail.snippets.views.snippets import SnippetViewSet, SnippetViewSetGroup
from wagtail.snippets.models import register_snippet
# Register each model with a SnippetViewSet
# Group Project + Testimonial under "Portfolio"
# Group Skill + Experience under "About"
# Register ContactSubmission as read-only (no add/edit, just list+detail)
```

For `ContactSubmission`, make the admin list show: name, email, subject, created_at, read.
Make the `read` field toggleable from the list view.

### 5. `backend/cms/admin.py` (CREATE)

Register `ContactSubmission` with `django.contrib.admin` as a fallback:
```python
from django.contrib import admin
from .models import ContactSubmission, TechTag

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at', 'read']
    list_filter = ['read']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at', 'ip_address']

@admin.register(TechTag)
class TechTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
```

---

## Constraints

- Do NOT modify `backend/cms/models.py`. All models are final.
- Do NOT modify `backend/portfolio/settings/`. Settings are final.
- Do NOT modify `backend/portfolio/urls.py`. URL routing is final.
- Serializers must pass `context={'request': request}` to nested serializers that need
  to build absolute image URLs.
- All list endpoints return an array `[]`. Only `/api/blog/` is paginated
  (returns `{count, next, previous, results[]}`).
- The development database is SQLite (`db.sqlite3`). Do not change this.
- After writing all files, run: `python manage.py makemigrations --check`
  (should produce no new migrations since models haven't changed).

---

## Verification Steps (run these after writing the files)

```bash
cd backend
source venv/bin/activate
python manage.py check          # should output "System check identified no issues."
python manage.py runserver      # should start without errors
```

Then test these URLs in the browser or with curl:
```
curl http://localhost:8000/api/site-settings/
curl http://localhost:8000/api/projects/
curl http://localhost:8000/api/skills/
curl http://localhost:8000/api/blog/
curl http://localhost:8000/robots.txt
```

All should return valid JSON (or plain text for robots.txt) with no 500 errors.

---

## Expected Output Quality

- No placeholder `pass` statements.
- No `TODO` comments left unimplemented.
- All imports explicit and correct for Django 5 + Wagtail 6 + DRF 3.15.
- Handle the case where Wagtail pages (BlogPost, BlogIndexPage) don't exist yet
  (return empty list, not 500 error).
- Consistent snake_case field names in all JSON responses matching `frontend/lib/api.ts` types.
