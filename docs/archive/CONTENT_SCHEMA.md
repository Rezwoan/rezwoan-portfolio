# CONTENT_SCHEMA.md — CMS Content Models

> Every content type that lives in the Wagtail admin, with every field documented.
> When adding a new field to the CMS, document it here immediately.

---

## SiteSettings (Singleton — one record only)

Wagtail `BaseSetting` — site-wide global values.

| Field | Type | Purpose |
|---|---|---|
| `full_name` | CharField(100) | "Din Muhammad Rezwoan" |
| `short_name` | CharField(50) | "Rezwoan" — used in nav/footer |
| `tagline` | CharField(200) | One-liner under the name in hero |
| `bio_short` | TextField | 2–3 sentence bio for meta descriptions |
| `bio_long` | RichTextField | Full about section content |
| `available_for_work` | BooleanField | Shows "Open to work" badge when True |
| `email` | EmailField | Contact email (shown on contact page) |
| `github_url` | URLField | |
| `linkedin_url` | URLField | |
| `twitter_url` | URLField | Optional |
| `fiverr_url` | URLField | |
| `resume_pdf` | DocumentChooserPanel | Uploadable PDF resume |
| `og_image` | ImageChooserPanel | Default OG image for social sharing |
| `favicon` | ImageChooserPanel | |
| `google_analytics_id` | CharField(30) | "G-XXXXXXXXXX" — blank disables GA |
| `meta_title_suffix` | CharField(60) | e.g. " — Rezwoan" appended to page titles |

---

## Project

Custom Django model (not a Wagtail Page — simpler for list/detail API pattern).

| Field | Type | Purpose |
|---|---|---|
| `title` | CharField(200) | Project name |
| `slug` | SlugField(unique) | URL-safe identifier, auto-generated |
| `short_description` | CharField(300) | Card subtitle, also used for meta description |
| `body` | StreamField | Full case study (text, images, code blocks) |
| `cover_image` | ForeignKey(Image) | Main card and OG image |
| `live_url` | URLField(blank) | Link to deployed project |
| `github_url` | URLField(blank) | Source code link |
| `tech_stack` | ManyToManyField(TechTag) | e.g. "Next.js", "Django", "PostgreSQL" |
| `category` | CharField(choices) | web / mobile / tool / open-source |
| `featured` | BooleanField | Show in hero/homepage featured section |
| `order` | PositiveIntegerField | Manual sort order in the projects list |
| `published` | BooleanField | Draft/live toggle |
| `created_at` | DateField | Auto-set |
| `seo_title` | CharField(70, blank) | Overrides page title for Google |
| `seo_description` | CharField(160, blank) | Custom meta description |
| `seo_og_image` | ForeignKey(Image, blank) | Custom OG image for this project |

**TechTag model:**
| Field | Type | Purpose |
|---|---|---|
| `name` | CharField(50) | "Next.js", "Django", etc. |
| `color` | CharField(7) | Hex color for the tag badge |

---

## Experience

Work history / education entries.

| Field | Type | Purpose |
|---|---|---|
| `company_name` | CharField(200) | |
| `role` | CharField(200) | Job title |
| `employment_type` | CharField(choices) | full-time / part-time / freelance / internship / education |
| `company_logo` | ForeignKey(Image, blank) | |
| `company_url` | URLField(blank) | |
| `location` | CharField(100) | "Remote" or "Dhaka, Bangladesh" |
| `start_date` | DateField | |
| `end_date` | DateField(null) | Null means currently working here |
| `is_current` | BooleanField | Shows "Present" instead of end date |
| `description` | RichTextField | Key achievements / responsibilities |
| `tech_used` | ManyToManyField(TechTag) | Technologies used at this role |
| `order` | PositiveIntegerField | Display order |

---

## Skill

Individual skill with proficiency level.

| Field | Type | Purpose |
|---|---|---|
| `name` | CharField(100) | "Next.js", "PostgreSQL", etc. |
| `category` | CharField(choices) | frontend / backend / database / devops / design / other |
| `proficiency` | PositiveSmallIntegerField | 1–5 (used to render a visual bar or dots) |
| `icon_name` | CharField(50, blank) | Name of the devicon/simple-icon e.g. "nextjs" |
| `order` | PositiveIntegerField | Display order within category |
| `show_on_hero` | BooleanField | Show in the hero tech stack ticker |

---

## BlogPost (Wagtail Page)

Uses Wagtail's `Page` base class for URL routing, SEO, and search indexing.

| Field | Type | Purpose |
|---|---|---|
| `title` | CharField (from Page) | Post title |
| `slug` | SlugField (from Page) | URL: /blog/my-post-slug/ |
| `search_description` (from Page) | TextField | Meta description — fill this in admin |
| `cover_image` | ForeignKey(Image) | Hero image |
| `excerpt` | TextField(300) | Short summary for list cards |
| `body` | StreamField | Post content — blocks below |
| `tags` | ManyToManyField(Tag) | Wagtail tagging — for filtering |
| `reading_time` | PositiveIntegerField | Auto-calculated from body word count |
| `published_date` | DateField | Shown as post date |

**StreamField blocks available in `body`:**
- `RichTextBlock` — formatted text paragraphs
- `ImageBlock` — image with caption
- `CodeBlock` — syntax highlighted code (language selector)
- `QuoteBlock` — styled blockquote
- `CalloutBlock` — info / warning / tip callout box

---

## Testimonial

Client reviews and social proof.

| Field | Type | Purpose |
|---|---|---|
| `client_name` | CharField(100) | |
| `client_title` | CharField(100) | "CEO at Acme Corp" |
| `client_company` | CharField(100, blank) | |
| `avatar` | ForeignKey(Image, blank) | Client headshot |
| `quote` | TextField | The testimonial text |
| `rating` | PositiveSmallIntegerField | 1–5 stars |
| `source` | CharField(choices) | fiverr / linkedin / email / direct |
| `source_url` | URLField(blank) | Link to original Fiverr/LinkedIn review |
| `featured` | BooleanField | Show on homepage |
| `order` | PositiveIntegerField | Display order |

---

## ContactSubmission (write-only from frontend, read in admin)

| Field | Type | Purpose |
|---|---|---|
| `name` | CharField(100) | |
| `email` | EmailField | |
| `subject` | CharField(200) | |
| `message` | TextField | |
| `created_at` | DateTimeField(auto) | |
| `read` | BooleanField | Mark as read in admin |
| `ip_address` | GenericIPAddressField(blank) | For spam detection |

---

## API Response Shapes (reference)

### GET /api/projects/
```json
[
  {
    "id": 1,
    "title": "PlayChike",
    "slug": "playchike",
    "short_description": "...",
    "cover_image": { "url": "...", "width": 1200, "height": 630 },
    "live_url": "https://playchike.com",
    "github_url": "...",
    "tech_stack": [{ "name": "Next.js", "color": "#000000" }],
    "featured": true,
    "category": "web"
  }
]
```

### GET /api/site-settings/
```json
{
  "full_name": "Din Muhammad Rezwoan",
  "tagline": "...",
  "available_for_work": true,
  "github_url": "https://github.com/Rezwoan",
  "og_image": { "url": "..." }
}
```
