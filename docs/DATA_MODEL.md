# DATA_MODEL.md — Prisma Schema & Content Model

> The complete data model. Implement `backend/prisma/schema.prisma` to match this.
> Supersedes the old `CONTENT_SCHEMA.md`. When you add a field, update this file.

SQLite via Prisma. IDs are `cuid()` strings unless noted. All timestamps are UTC.
SQLite has no native arrays/enums — we model "enums" as `String` with a documented
allowed set, and lists either as relations or `Json`.

---

## schema.prisma (target)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")   // file:./portfolio.db
}

// ─────────────────────────────────────────────────────────────
// Admin user (single user expected, but table supports more)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String                  // bcrypt hash
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────────────────────────
// Site-wide settings — SINGLETON. Always row id = "singleton".
model SiteSettings {
  id               String   @id @default("singleton")
  fullName         String   @default("Din Muhammad Rezwoan")
  shortName        String   @default("Rezwoan")
  tagline          String   @default("")        // one-liner under the hero name
  roleLine         String   @default("Full Stack Developer")
  bioShort         String   @default("")        // 2–3 sentences, used in meta descriptions
  bioLong          String   @default("")        // Markdown, the About page body
  location         String   @default("Dhaka, Bangladesh")
  availableForWork Boolean  @default(true)       // shows the "open to work" badge
  email            String   @default("frezwoan@gmail.com")
  githubUrl        String   @default("https://github.com/Rezwoan")
  linkedinUrl      String   @default("")
  twitterUrl       String   @default("")
  fiverrUrl        String   @default("")
  resumeUrl        String   @default("")        // /uploads/... path to CV pdf
  ogImageUrl       String   @default("")        // default social share image
  faviconUrl       String   @default("")
  metaTitleSuffix  String   @default(" — Rezwoan")
  googleAnalyticsId String  @default("")        // "G-XXXX", blank disables GA
  updatedAt        DateTime @updatedAt
}

// ─────────────────────────────────────────────────────────────
// Reusable tech tag (badge). Shared by Project + Skill + Experience.
model Tag {
  id          String        @id @default(cuid())
  name        String        @unique          // "Next.js", "NestJS", "Prisma"
  slug        String        @unique
  color       String        @default("#C8F04B")  // hex for the badge
  iconName    String?                          // simple-icons / devicon slug, optional
  projects    Project[]     @relation("ProjectTags")
  experiences Experience[]  @relation("ExperienceTags")
  createdAt   DateTime      @default(now())
}

// ─────────────────────────────────────────────────────────────
// Project / case study
model Project {
  id               String   @id @default(cuid())
  title            String
  slug             String   @unique
  shortDescription String                       // card subtitle + meta description
  body             String   @default("")        // Markdown case study
  coverImageUrl    String   @default("")
  liveUrl          String   @default("")
  githubUrl        String   @default("")
  category         String   @default("web")     // web | mobile | tool | open-source | ai
  featured         Boolean  @default(false)      // homepage featured section
  published        Boolean  @default(false)      // draft/live toggle
  order            Int      @default(0)          // manual sort, lower = first
  // GitHub importer metadata (nullable; populated when imported)
  repoStars        Int?
  repoForks        Int?
  repoLanguage     String?
  importedFrom     String?                       // the source repo URL
  // SEO overrides
  seoTitle         String   @default("")
  seoDescription   String   @default("")
  seoOgImageUrl    String   @default("")
  tags             Tag[]    @relation("ProjectTags")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([published, featured, order])
}

// ─────────────────────────────────────────────────────────────
// Work / education history
model Experience {
  id             String    @id @default(cuid())
  company        String
  role           String
  employmentType String    @default("freelance") // full-time|part-time|freelance|internship|education
  companyUrl     String    @default("")
  companyLogoUrl String    @default("")
  location       String    @default("")
  startDate      DateTime
  endDate        DateTime?                         // null = current
  isCurrent      Boolean   @default(false)
  description    String    @default("")            // Markdown
  order          Int       @default(0)
  tags           Tag[]     @relation("ExperienceTags")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

// ─────────────────────────────────────────────────────────────
// Skill with proficiency
model Skill {
  id          String   @id @default(cuid())
  name        String
  category    String   @default("frontend")  // frontend|backend|database|devops|design|ai|other
  proficiency Int      @default(3)            // 1–5
  iconName    String   @default("")           // simple-icons/devicon slug
  context     String   @default("")           // e.g. "2 yrs, daily" (research: show context)
  order       Int      @default(0)
  showOnHero  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// ─────────────────────────────────────────────────────────────
// Blog post (Markdown)
model BlogPost {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  excerpt      String    @default("")     // list card + meta description
  body         String    @default("")     // Markdown
  coverImageUrl String   @default("")
  tags         String    @default("[]")   // Json string: ["nextjs","seo"]
  readingTime  Int       @default(0)      // minutes, auto-calculated on save
  published    Boolean   @default(false)
  publishedAt  DateTime?
  seoTitle     String    @default("")
  seoDescription String  @default("")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([published, publishedAt])
}

// ─────────────────────────────────────────────────────────────
// Testimonial / social proof
model Testimonial {
  id           String   @id @default(cuid())
  clientName   String
  clientTitle  String   @default("")   // "CEO at Acme"
  clientCompany String  @default("")
  avatarUrl    String   @default("")
  quote        String
  rating       Int      @default(5)    // 1–5
  source       String   @default("fiverr") // fiverr|linkedin|email|direct
  sourceUrl    String   @default("")
  featured     Boolean  @default(false)
  order        Int      @default(0)
  createdAt    DateTime @default(now())
}

// ─────────────────────────────────────────────────────────────
// Contact form submission (write from site, read in admin)
model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String   @default("")
  message   String
  read      Boolean  @default(false)
  ipAddress String   @default("")
  createdAt DateTime @default(now())

  @@index([read, createdAt])
}

// ─────────────────────────────────────────────────────────────
// AI chat transcript (optional analytics; helps tune grounding)
model ChatLog {
  id        String   @id @default(cuid())
  sessionId String
  question  String
  answer    String
  createdAt DateTime @default(now())

  @@index([sessionId, createdAt])
}
```

---

## Notes & conventions

- **SiteSettings singleton:** always upsert/read the row with id `"singleton"`. The
  seed creates it. The admin "Site Settings" screen edits that one row.
- **Tags vs Skills:** `Tag` is for the small coloured tech badges on projects/experience;
  `Skill` is the richer homepage skills section (category, proficiency, context). The
  GitHub importer creates/links `Tag`s; the admin curates `Skill`s.
- **Markdown fields:** `Project.body`, `Experience.description`, `BlogPost.body`,
  `SiteSettings.bioLong`. Rendered client-side with a sanitizing markdown renderer.
- **`BlogPost.tags`** is a JSON-encoded string array (SQLite has no array type); parse
  on read. Project/Experience use a real `Tag` relation because those badges are shared
  and coloured.
- **Image fields** store `/uploads/<filename>` paths (or absolute URLs for external
  images). nginx serves `/uploads/` from `backend/uploads/`.
- **`readingTime`** is computed on save from word count (~200 wpm).
- **Dates:** `startDate`/`endDate` are dates; everything else uses `DateTime` defaults.

---

## Seed (`prisma/seed.ts`) — minimum

1. `User` — `ADMIN_EMAIL` + bcrypt(`ADMIN_PASSWORD`).
2. `SiteSettings` singleton — the identity facts from `PLAN.md` §1.
3. A starter set of `Tag`s (Next.js, NestJS, React, TypeScript, Prisma, Tailwind,
   Python, PostgreSQL, Node.js, Docker…) with brand colors.
4. A handful of `Skill`s grouped by category with `showOnHero` on the top ones.
5. (Optional) one example draft `Project` so the homepage isn't empty before real
   content is imported.

Seed must be **idempotent** (upsert by unique keys) so re-running never duplicates.
