# DESIGN_SYSTEM.md — Visual Language & Components

> Source of truth for every visual decision. Values here must match
> `frontend/tailwind.config.ts` and `globals.css`. Grounded in the 2026 research in
> [`RESEARCH.md`](./RESEARCH.md). Supersedes the old `STYLE_GUIDE.md`.

---

## Design direction (the 30-second pitch)

**"Confident dark, one electric accent, real motion, zero clutter."**
A dark-mode-first portfolio (a 2026 default, not a toggle) treated as deliberate brand
mood — deep neutral background, **off-white** text (never pure `#FFF`), and a single
high-energy accent used sparingly as a neon micro-accent. Generous whitespace, kinetic
headline typography, subtle texture/grain, and cinematic soft-glow gradients instead of
harsh rainbow ones. Every section earns its place; the first viewport answers "who is
this, what does he do, can I hire him" within ~3 seconds.

A **light theme** is provided as a secondary mode (system-aware) but the brand is dark.

---

## Color system

Dark is the canonical theme. Tokens are CSS variables so a light theme can re-map them.

### Dark (default)
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0A0A0B` | Page background (near-black, faint warm) |
| `bg-elevated` | `#101012` | Cards, panels |
| `bg-raised` | `#17171A` | Modals, popovers, raised cards |
| `border` | `#26262B` | Card borders, dividers |
| `border-muted` | `#1C1C20` | Very subtle separators |
| `text` | `#ECECE6` | Headings / primary (off-white — research: avoid `#FFF`) |
| `text-secondary` | `#A6A6A0` | Body paragraphs |
| `text-muted` | `#6C6C68` | Labels, captions, timestamps |
| `text-inverse` | `#0A0A0B` | Text on the accent |

### Accent (signature)
| Token | Hex | Usage |
|---|---|---|
| `accent` | `#C8F04B` | Primary CTAs, highlights, active states, focus rings |
| `accent-hover` | `#D6F76A` | Hover |
| `accent-soft` | `rgba(200,240,75,0.12)` | Tinted backgrounds, glow |

> The lime/chartreuse from the old site is **kept as the signature** — it's distinctive,
> reads as "neon micro-accent" (on-trend), and pops on near-black. It is the one color
> a visitor will remember. **Alternative palettes** (swap only `accent*`): Electric
> Indigo `#7C6CFF`, Aqua Teal `#3CE0C8`, Honeyed Gold `#F0B33C`. The accent is a single
> CSS var — changing the brand color later is a one-line edit. (Ask the user before
> changing the signature.)

### Semantic
`info #5B8CFF` · `success #34D399` · `warning #FBBF24` · `error #F87171`
(slightly desaturated for dark mode per research — no full-saturation reds.)

### Gradients / glow
Cinematic, low-contrast: radial `accent-soft` glow behind the hero name; a faint
top-down `bg → bg-elevated` wash on sections. No multi-hue rainbow gradients.

---

## Typography

| Role | Family | Source | Notes |
|---|---|---|---|
| Display / headings | **Clash Display** or Cabinet Grotesk | fontshare.com (free) | Bold, characterful; used for the kinetic hero |
| Body / UI | **Satoshi** or Inter | fontshare.com / Google (free) | High legibility |
| Mono / code | **JetBrains Mono** | Google (free) | Code blocks, the hero "terminal" accent |

Self-host in `frontend/public/fonts/` via `next/font/local` (no layout shift, no extra
network). Preload the display weight used in the hero.

### Type scale (fluid — clamp, learned from the old site's overflow bug)
Use `clamp()` so headings never overflow on small screens.
| Token | clamp() | Use |
|---|---|---|
| `display-xl` | `clamp(2.5rem, 6vw, 4.5rem)` | Hero name |
| `display` | `clamp(2rem, 4.5vw, 3rem)` | Section headings |
| `heading` | `clamp(1.4rem, 3vw, 2rem)` | Card titles, sub-headings |
| `subheading` | `1.25rem` | Feature/labels |
| `body` | `1rem` (min 16px) | Paragraphs, line-height 1.7 |
| `small` | `0.875rem` | Tags, secondary |
| `xs` | `0.75rem` | Captions (the floor — never smaller) |

---

## Spacing, radius, layout

- **Spacing:** 4px base; use multiples (4/8/12/16/24/32/48/64/80/96). Section vertical
  rhythm: `clamp(4rem, 10vw, 8rem)`.
- **Container:** max-width `1200px`, side padding `clamp(1rem, 5vw, 2rem)`.
- **Radius:** `sm 6px` chips · `md 10px` buttons/inputs · `lg 14px` cards ·
  `xl 20px` feature cards · `full` pills/avatars.
- **Grid:** mobile-first. Bento grid for skills/stats (named `grid-template-areas`).
- **No horizontal scroll, ever.** No `100vw` without `overflow-x: clip`. Test at 320px.

---

## Motion (Framer Motion)

| Type | Duration | Easing |
|---|---|---|
| Micro (hover) | 150ms | ease-out |
| UI transition | 250ms | ease-out |
| Scroll reveal | 400ms | cubic-bezier(0.16,1,0.3,1) |
| Page transition | 500ms | ease-in-out |
| Hero sequence | ≤800ms | cubic-bezier(0.16,1,0.3,1) |

Rules:
- **Hard cap 800ms.** Anything slower feels broken.
- GPU-only props: animate `transform` + `opacity`. Never `width/height/top/left`.
- **Every** animated component honors `useReducedMotion()` → instant show fallback.
- Scroll reveals use `whileInView` with `viewport={{ once: true, margin: '-10%' }}`.
  (The old site had a bug where off-screen text froze at `opacity:0` — default to
  visible and reveal, never hide-until-seen for above-the-fold content.)
- **Kinetic headline** (on-trend): hero name reveals word-by-word with a 40ms stagger.

### Presets to build in `components/animations/`
`FadeUp` (`y:24→0, opacity`), `StaggerChildren` (`staggerChildren:0.08`),
`ScaleIn` (`scale:0.96→1`), `TextReveal` (word stagger).

---

## Signature interactions (desktop / non-touch only)
- **Custom cursor:** 8px accent dot (precise) + 36px hollow ring (lerp lag); ring
  expands on hover of links/cards. Render only when `pointer: fine`.
- **Magnetic buttons:** primary CTAs/social links drift ≤8px toward the cursor.
- **Card hover:** `translateY(-4px)` + border brightens to accent-soft + faint glow.
- **AI chat:** floating pill button bottom-right → expands to a grounded chat panel.

---

## Page / section inventory

**Homepage** (order matters — best work + value prop above the fold):
1. **Hero** — name (kinetic), role line, one-sentence value prop, availability badge
   (links to /contact), primary CTA ("Start a project") + secondary ("View work"),
   subtle mono "terminal" flourish, hero tech ticker.
2. **Featured projects** — 3 best, big cards, live + code links, tech badges.
3. **Skills** — bento grid by category, proficiency, with context ("React · 2y daily").
4. **Experience** — condensed timeline.
5. **Testimonials** — social proof front-and-center (research: top converter).
6. **Contact CTA** — bold, single clear action; email visible, not hidden.

**Routes:** `/` · `/projects` · `/projects/[slug]` (case study) · `/about` ·
`/blog` · `/blog/[slug]` · `/contact` · `not-found` · `/admin/*`.

**Case study template** (research: case studies separate juniors from hires):
Problem → Approach → Stack → What I built → Outcome/links. Markdown body + a metadata
header card (role, year, stack, live/code).

---

## Accessibility (non-negotiable)
- Contrast ≥ 4.5:1 for body text (off-white on near-black passes; check accent-on-bg
  for text — use accent for large/bold or non-text only).
- Visible focus rings (accent), full keyboard nav, semantic landmarks, `alt` on every
  image, labelled form fields, `prefers-reduced-motion` respected.
- Lighthouse Accessibility ≥ 95 (see [`SEO_STRATEGY.md`](./SEO_STRATEGY.md)).

---

## What NOT to do
- No generic "I am a developer" H1 — lead with a specific value proposition.
- No project carousel (bad mobile, hurts LCP) — use a grid.
- No skeleton flashes on every visit — ISR pre-bakes content.
- No scroll-jacking. No emojis as structural icons (use Lucide SVGs).
- No pure-white text, no full-saturation reds on dark (research).
- No static `px` font sizes that overflow — use the fluid `clamp` scale.
