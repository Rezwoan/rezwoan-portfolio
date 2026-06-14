# ADMIN_PANEL.md — The "Easy Site Updating" Console

> A custom admin built into the Next.js app at `/admin`, talking to the NestJS `/api`.
> Replaces Wagtail. Designed for one person (Rezwoan) to update the whole site from a
> phone or laptop in minutes. Lives in `frontend/src/app/admin/` + `components/admin/`.

---

## Principles
- **Fast to edit, hard to break.** Inline validation, autosave drafts where sensible,
  clear "Draft / Published" states, optimistic UI with toasts.
- **Same design language** as the public site (dark, accent), but denser/utilitarian.
- **Mobile-friendly** — Rezwoan should be able to publish a project from his phone.
- **No content is public until `published = true`.**

---

## Auth & routing
- `/admin/login` — email + password form → `POST /api/auth/login` (sets cookie).
- An `admin/layout.tsx` calls `GET /api/auth/me` on mount; if 401 → redirect to login.
  All `/admin/*` pages are client components behind this guard.
- Logout button → `POST /api/auth/logout` → back to login.
- Single seeded admin (env `ADMIN_EMAIL`/`ADMIN_PASSWORD`); a "change password" screen
  is a nice-to-have (PATCH on the user).

---

## Screens

### Dashboard (`/admin`)
At-a-glance: counts (projects, posts, unread messages), quick actions
("Import from GitHub", "New project", "New post"), recent contact messages,
links to the live site. Unread-message badge in the nav.

### Projects (`/admin/projects`)
- Table: title, category, featured, published, order, updated. Reorder via drag or an
  `order` field. Toggle `published`/`featured` inline.
- Editor (`/admin/projects/[id]` and `/new`): title, slug (auto, editable),
  shortDescription, **Markdown body** with live preview, cover image (upload widget),
  live/github URLs, category, tags (multi-select from existing `Tag`s + create new),
  featured/published toggles, SEO overrides (collapsible). Save = create/patch.
- **"Import from GitHub" button** → modal: paste repo URL → calls
  `POST /api/admin/import/github` → fills the editor with the AI draft → admin edits →
  Save. (See [`AI_FEATURES.md`](./AI_FEATURES.md) §Importer.) This is the flagship flow.

### Blog (`/admin/blog`)
List + editor mirroring Projects: title, slug, excerpt, **Markdown body** + preview,
cover image, tags (chips), published toggle + publishedAt, SEO overrides. `readingTime`
auto-computed on save.

### Skills (`/admin/skills`)
Compact editable grid: name, category, proficiency (1–5), iconName, context string
("React · 2y daily"), showOnHero, order. Add/remove rows quickly.

### Experience (`/admin/experience`)
List + form: company, role, employmentType, dates (start/end + "current" toggle),
location, Markdown description, tags, order.

### Testimonials (`/admin/testimonials`)
List + form: clientName, title, company, avatar (upload), quote, rating, source +
sourceUrl, featured, order.

### Tags (`/admin/tags`)
Manage the shared tech badges: name, slug (auto), color (hex picker), iconName. Used by
projects/experience and auto-created by the importer (dedupe by name/slug here).

### Site Settings (`/admin/settings`)
One form for the `SiteSettings` singleton: identity (name, short name, role line,
tagline, bios), availability toggle, contact email, all social URLs, resume upload,
default OG image, favicon, meta title suffix, GA id. PATCH on save.

### Inbox (`/admin/inbox`)
Contact submissions newest-first. Read/unread state, expand to view full message,
`reply_to` mailto link, delete. Unread count drives the nav badge.

### Media (`/admin/media`) — optional
Browse/delete uploaded files in `backend/uploads/`. Most uploads happen inline via the
cover-image widgets, so this is secondary.

---

## Shared admin components (`components/admin/`)
- `AdminNav` (sidebar/topbar with unread badge), `DataTable`, `FormField`,
  `MarkdownEditor` (textarea + live preview + toolbar), `ImageUploader` (drag-drop →
  `POST /api/admin/uploads` → returns `/uploads/...`), `TagSelect`, `Toggle`,
  `ConfirmDialog`, `Toast`.
- All admin API calls go through the `/admin/*` wrappers in `lib/api.ts` with
  `credentials: 'include'`.

---

## Publish → live propagation
Public pages are ISR. After an admin save, content appears within the `revalidate`
window. (Optional enhancement: an on-demand revalidation route the admin can ping after
publishing for instant updates — `revalidatePath`/tag. Document if added.)

---

## Acceptance (Phase 4 DoD)
Rezwoan can, from a browser: log in; import a project from a GitHub URL, review the AI
draft, edit, and publish; manually create/edit a project, blog post, skill, experience,
and testimonial; upload images; edit every site setting; read and clear contact
messages — without touching code or the database directly.
