# CMS_SEEDING.md — First-Time Content Setup Guide

> Run through this checklist once after your first `migrate` + `createsuperuser`.
> Everything below is done through the Wagtail admin at http://localhost:8000/cms/

---

## Step 1 — Configure the Wagtail Site

Before content shows up in the API, Wagtail needs to know which domain it's serving.

1. Go to **Settings → Sites** in the Wagtail admin
2. Click the default "localhost" entry
3. Set:
   - **Hostname:** `localhost` (dev) or `rezwoan.me` (production)
   - **Port:** `8000` (dev) or `80` (production)
   - **Root page:** Welcome to your new Wagtail site (or any page)
   - **Is default site:** ✓ checked
4. Save

---

## Step 2 — Site Settings

Go to **Settings → Site Settings** in the sidebar.

Fill in every field. This feeds the homepage hero, footer, metadata, and the "Open to work" badge.

**Required fields:**
```
Full name:        Din Muhammad Rezwoan
Short name:       Rezwoan
Tagline:          Full Stack Developer · CSE Student · Freelancer based in Dhaka
Bio short:        2-3 sentences. Used as meta description. Max 160 chars.
Bio long:         Rich text. Used on the About page.
Available for work: ✓ (check to show green "Open to work" badge)
Email:            your@email.com
GitHub URL:       https://github.com/Rezwoan
LinkedIn URL:     https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a
Twitter URL:      https://twitter.com/XRezwoan
Fiverr URL:       https://www.fiverr.com/rezwoanfaisal
Meta title suffix:  — Rezwoan
```

**Optional but recommended:**
- Upload an OG image (1200×630px). Used as the default social share image.
- Upload your résumé PDF. Shows a "Download résumé" link in the footer.
- Add your Google Analytics ID (G-XXXXXXXXXX).

---

## Step 3 — Add Tech Tags

Go to **Snippets → Tech Tags**.

Add one entry per technology. The color is used for tag badges on project cards.

Suggested starter set:
```
Next.js       #000000
React         #61DAFB
TypeScript    #3178C6
Python        #3776AB
Django        #092E20
PostgreSQL    #336791
Docker        #2496ED
Tailwind CSS  #38BDF8
REST API      #888888
Redis         #DC382D
Raspberry Pi  #A22846
Cloudflare    #F6821F
```

---

## Step 4 — Add Skills

Go to **Snippets → Skills**.

Add each skill with its category, proficiency (1–5), and icon name.

The `icon_name` field accepts [devicon](https://devicons.github.io/devicon/) slugs
(e.g. `nextjs`, `django`, `postgresql`). Used in future icon display improvements.

Set `Show on hero = ✓` for the ~8 skills you want in the scrolling tech ticker on the homepage.

**Suggested hero skills:** Next.js, Django, TypeScript, Python, PostgreSQL, React, Docker, Tailwind CSS

---

## Step 5 — Add Experience

Go to **Snippets → Experiences**.

Add one entry per role/education. Ordered by the `order` field (lower = higher on page).

Example entries for your profile:
```
Role:              Freelance Web Developer
Company:           Fiverr (Self-employed)
Type:              Freelance
Location:          Remote
Start date:        2022-01-01
Is current:        ✓
Description:       [Rich text — key projects and technologies]

Role:              CSE Student
Company:           American International University Bangladesh (AIUB)
Type:              Education
Location:          Dhaka, Bangladesh
Start date:        2023-01-01
Is current:        ✓
```

---

## Step 6 — Add Projects

Go to **Snippets → Projects**.

Add your real projects. Set `Featured = ✓` on the 3–4 you want on the homepage.
Set `Order` to control sort (lower = first).

**PlayChike** (example):
```
Title:             PlayChike
Short description: [2-3 sentences about what it does]
Category:          web
Featured:          ✓
Order:             1
Live URL:          https://playchike.com
GitHub URL:        https://github.com/Rezwoan/...
Tech stack:        [select tags you added in Step 3]
Cover image:       [upload a screenshot]
```

**SEO fields** — fill these in for each project:
```
SEO title:         PlayChike — Live Music Streaming Platform
SEO description:   [Under 160 chars. What does it do? Who is it for?]
```

---

## Step 7 — Set Up Blog (optional but highly recommended for SEO)

The blog needs a **parent container page** in Wagtail's page tree before you can add posts.

### Create the Blog Index page:
1. Go to **Pages** in the Wagtail admin
2. Click on "Welcome to your new Wagtail site" (the root page)
3. Click **Add child page**
4. Choose **Blog Index**
5. Set:
   - **Title:** Blog
   - **Slug:** blog ← important, must match the Next.js route
6. **Publish** it

### Add your first Blog Post:
1. Go to **Pages → Blog → Add child page → Blog Post**
2. Fill in title, slug, excerpt, and body (use the StreamField blocks)
3. **Publish** it

The post will immediately appear at `/blog/<slug>` in the Next.js frontend.

---

## Step 8 — Add Testimonials (optional)

Go to **Snippets → Testimonials**.

Add client reviews from Fiverr orders. Set `Featured = ✓` to show on homepage.
Keep quotes concise — 2–4 sentences works best in the carousel.

---

## Step 9 — Verify Everything

After seeding content, open the frontend at http://localhost:3000 and check:

- [ ] Homepage loads with your name and tagline (not the error state)
- [ ] Hero tech ticker shows skills with `show_on_hero = true`
- [ ] Projects section shows your featured projects
- [ ] Skills bento grid shows all skill categories
- [ ] Experience timeline shows your entries
- [ ] `/about` shows bio, skills, and experience
- [ ] `/projects` lists all published projects
- [ ] `/projects/<slug>` shows a project detail page
- [ ] `/blog` shows your posts (if any added)
- [ ] `/contact` form submits and creates a ContactSubmission in the admin
- [ ] http://localhost:8000/sitemap.xml loads without errors
- [ ] http://localhost:8000/robots.txt loads correctly
- [ ] http://localhost:3000/og?title=Test+Title renders an OG image

---

## Step 10 — SEO verification (pre-launch)

Before going live, run these checks:

1. **Rich Results Test** — paste each page URL into https://search.google.com/test/rich-results
   and confirm the Person + CreativeWork + BlogPosting schemas validate.

2. **OG preview** — paste the site URL into https://www.opengraph.xyz to confirm
   social share previews look correct.

3. **Lighthouse** — run `npx lighthouse https://rezwoan.me --view` and confirm:
   - Performance ≥ 95
   - Accessibility ≥ 95
   - Best Practices = 100
   - SEO = 100

4. **Google Search Console** — after going live, submit `/sitemap.xml` and monitor
   index coverage over the first 2 weeks.
