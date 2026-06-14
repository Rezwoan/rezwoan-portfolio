# API_SPEC.md — NestJS REST API

> Every endpoint the system exposes. Backend uses global prefix `/api`. In prod,
> nginx routes `/api/` → NestJS (`:3201`); the frontend calls
> `NEXT_PUBLIC_API_URL + '/api/...'`. Public reads need no auth; everything that
> mutates content (and the importer) requires the admin JWT cookie.

Conventions: JSON in/out. Validation via `class-validator` DTOs. Errors use Nest's
standard shape `{ statusCode, message, error }`. Auth = httpOnly cookie `access_token`.

---

## Auth

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/login` | public | `{ email, password }` | sets cookie; `{ user: {id,email,name} }` |
| GET | `/api/auth/me` | cookie | — | `{ id, email, name }` or 401 |
| POST | `/api/auth/logout` | cookie | — | clears cookie; `{ ok: true }` |

- Login: bcrypt-compare, sign JWT (`JWT_SECRET`, `JWT_EXPIRY` e.g. `7d`), set
  httpOnly Secure SameSite=Lax cookie.
- `JwtAuthGuard` reads the cookie. A `401` from `/auth/me` means "logged out" and is
  the signal the admin UI uses to show the login screen.

---

## Public content (read-only, no auth)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/site-settings` | the `SiteSettings` singleton (safe public fields) |
| GET | `/api/projects` | published projects, ordered; `?featured=true` filter; `?category=web` |
| GET | `/api/projects/:slug` | one published project (with `tags`) or 404 |
| GET | `/api/experiences` | all, ordered |
| GET | `/api/skills` | all, grouped-able by `category`; `?hero=true` for the ticker |
| GET | `/api/testimonials` | all; `?featured=true` |
| GET | `/api/blog` | published posts, newest first; `?page=&limit=` pagination |
| GET | `/api/blog/:slug` | one published post or 404 |
| GET | `/api/llms.txt` | text/markdown summary of the site for LLMs (served raw) |

Response example — `GET /api/projects`:
```json
[
  {
    "id": "ckx...",
    "title": "RepRush",
    "slug": "reprush",
    "shortDescription": "A gym-tracking PWA for friends.",
    "coverImageUrl": "/uploads/reprush-cover.webp",
    "liveUrl": "https://reprush.rezwoan.me",
    "githubUrl": "https://github.com/Rezwoan/RepRush-web",
    "category": "web",
    "featured": true,
    "repoStars": 3,
    "tags": [{ "name": "NestJS", "color": "#E0234E" }, { "name": "Next.js", "color": "#000" }]
  }
]
```

---

## Contact

| Method | Path | Auth | Body | Behaviour |
|---|---|---|---|---|
| POST | `/api/contact` | public | `{ name, email, subject?, message, website? }` | validate → store `ContactSubmission` → Resend notify + auto-reply → `{ ok: true }` |

- `website` is a **honeypot** (hidden field): if non-empty, silently accept and drop.
- Rate-limit per IP (e.g. `@nestjs/throttler`, 5/min). Store `ipAddress` (from
  `CF-Connecting-IP`/`X-Forwarded-For`). Never expose stored submissions publicly.
- Email behaviour: see [`AI_FEATURES.md`](./AI_FEATURES.md) §Email.

---

## AI — site assistant chat (public, rate-limited)

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/chat` | public | `{ sessionId, message, history?: [{role,content}] }` | streamed assistant text (SSE/chunked) |

- Grounded only on real site data (projects/skills/experience/bio). Refuses
  off-topic / prompt-injection. Logs to `ChatLog`. Throttled per IP/session.
- Full prompt + grounding contract in [`AI_FEATURES.md`](./AI_FEATURES.md) §Chat.

---

## Admin — content management (cookie auth required on ALL)

All under `/api/admin`. Each resource has standard CRUD. `JwtAuthGuard` on the whole
controller group.

### Generic CRUD pattern (applies to projects, experiences, skills, testimonials, blog, tags)
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/admin/<resource>` | — | ALL rows incl. drafts |
| GET | `/api/admin/<resource>/:id` | — | one row |
| POST | `/api/admin/<resource>` | create DTO | created row |
| PATCH | `/api/admin/<resource>/:id` | partial DTO | updated row |
| DELETE | `/api/admin/<resource>/:id` | — | `{ ok: true }` |

`<resource>` ∈ `projects | experiences | skills | testimonials | blog | tags`.

### Site settings
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/admin/site-settings` | — | full singleton (all fields) |
| PATCH | `/api/admin/site-settings` | partial | updated singleton |

### Contact inbox
| Method | Path | Returns |
|---|---|---|
| GET | `/api/admin/contact` | all submissions, newest first |
| PATCH | `/api/admin/contact/:id` | mark `{ read: true }` |
| DELETE | `/api/admin/contact/:id` | delete |

### Uploads
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/admin/uploads` | multipart `file` | `{ url: "/uploads/<name>", width, height }` |
| GET | `/api/admin/uploads` | — | list of uploaded files |
| DELETE | `/api/admin/uploads/:name` | — | `{ ok: true }` |

- Accept images (png/jpg/webp/svg) + pdf (CV). Validate mime + size (≤ ~12MB).
  Generate a safe unique filename. Optionally produce a `.webp` rendition.

### GitHub importer
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/admin/import/github` | `{ repoUrl }` | a **draft** `Project` (NOT saved) |

- Fetches repo metadata + languages + README, runs Gemini, returns a populated draft
  for the admin to review/edit, then the admin saves it via `POST /api/admin/projects`.
  Full spec in [`AI_FEATURES.md`](./AI_FEATURES.md) §Importer.

---

## Cross-cutting

- **Validation:** global `ValidationPipe({ whitelist:true, transform:true })`. DTOs per
  resource in `src/<resource>/dto/`.
- **CORS:** `origin: FRONTEND_URL, credentials: true`. In prod same-origin via nginx, so
  CORS mostly matters for local dev (`http://localhost:3200`).
- **Errors:** a global exception filter normalizes shapes and hides stack traces in prod.
- **Swagger:** enabled only when `NODE_ENV !== 'production'` at `/api/docs`.
- **Health:** `GET /api/health` → `{ status:'ok' }` (used by `deploy.sh` health check).
- **Slugs:** generated from title on create (kebab-case, deduped). Editable in admin.

---

## Frontend API client (`frontend/src/lib/api.ts`)

The single module that knows the backend. Shape:
```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3201';
const api = (p: string, init?: RequestInit) =>
  fetch(`${BASE}/api${p}`, { credentials: 'include', ...init });

export const getSiteSettings = () => api('/site-settings').then(r => r.json());
export const getProjects = (q = '') => api(`/projects${q}`).then(r => r.json());
// ...typed wrappers for every endpoint above. No fetch to the backend lives elsewhere.
```
Server Components call these directly (with `next: { revalidate }`); the admin client
components call the `/admin/*` variants with `credentials:'include'`.
