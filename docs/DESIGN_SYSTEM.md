# DESIGN_SYSTEM.md — Visual Language & Components

> Source of truth for every visual decision. Values here must match
> `frontend/tailwind.config.ts` + `globals.css`. Grounded in the 2026 research in
> [`RESEARCH.md`](./RESEARCH.md). Supersedes the old `STYLE_GUIDE.md`.

---

## Design direction (the 30-second pitch)

**"Premium, dual-theme, one electric accent, real motion, zero clutter."**
The site ships with **first-class light AND dark themes** (system-aware, user-toggleable,
no flash) — some clients dislike dark mode, so neither theme is an afterthought. Deep
neutral surfaces, **off-white / near-black** text (never pure `#FFF` / `#000`), and a
single high-energy accent used sparingly. Generous whitespace, kinetic headline
typography, subtle grain, cinematic soft-glow gradients (no harsh rainbows). Smooth,
purposeful motion **everywhere** — page transitions, scroll reveals, hover micro-states —
always GPU-composited and reduced-motion-aware. The first viewport answers "who is this,
what does he do, can I hire him" in ~3 seconds.

---

## Theming (first-class light + dark)

- Implemented with **`next-themes`** (`attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, `disableTransitionOnChange` to avoid color flashes on toggle).
- Tailwind `darkMode: 'class'`. All colors are **CSS variables** defined twice — under
  `:root` (light) and `.dark` (dark) in `globals.css` — and referenced by semantic
  Tailwind tokens (`bg`, `text`, `accent`, …). A component never hardcodes a hex; it uses
  the token, so it's automatically correct in both themes.
- A **theme toggle** lives in the navbar (sun/moon, animated) and in the admin. Respect
  the stored choice; fall back to system.
- **No FOUC:** `next-themes` injects the theme class before paint. Keep the accent and
  bg tokens defined so the very first paint is themed.

---

## Color system — brand "Iris" (electric indigo/violet)

Chosen for: premium/modern tech feel, strong recall, and **safe contrast in BOTH themes**
(the old lime failed on light backgrounds). The accent is one CSS var — swappable later.

### Dark theme (`.dark`)
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0B0B0F` | Page background (near-black, faint cool) |
| `--bg-elevated` | `#131318` | Cards, panels |
| `--bg-raised` | `#1B1B22` | Modals, popovers |
| `--border` | `#272730` | Borders, dividers |
| `--border-muted` | `#1E1E25` | Subtle separators |
| `--text` | `#ECECEF` | Headings/primary (off-white, not `#FFF`) |
| `--text-secondary` | `#A2A2AE` | Body |
| `--text-muted` | `#6C6C7A` | Captions, labels |
| `--accent` | `#7C6CFF` | CTAs, highlights, focus, active |
| `--accent-hover` | `#8E80FF` | Hover |
| `--accent-contrast` | `#0B0B0F` | Text on the accent |
| `--accent-soft` | `rgba(124,108,255,0.14)` | Tints, glow |
| `--accent-2` | `#22D3EE` | Secondary glow (cyan), used sparingly in gradients |

### Light theme (`:root`)
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#FBFBFD` | Page background (soft off-white) |
| `--bg-elevated` | `#FFFFFF` | Cards, panels |
| `--bg-raised` | `#FFFFFF` | Modals (with shadow) |
| `--border` | `#E7E7EE` | Borders, dividers |
| `--border-muted` | `#F0F0F4` | Subtle separators |
| `--text` | `#15151A` | Headings/primary (near-black, not `#000`) |
| `--text-secondary` | `#52525E` | Body |
| `--text-muted` | `#8A8A96` | Captions, labels |
| `--accent` | `#5B4FE0` | CTAs (deeper violet for contrast on white) |
| `--accent-hover` | `#4C40D6` | Hover |
| `--accent-contrast` | `#FFFFFF` | Text on the accent |
| `--accent-soft` | `rgba(91,79,224,0.10)` | Tints, glow |
| `--accent-2` | `#0EA5C4` | Secondary glow (deeper cyan) |

### Semantic (both themes, theme-tuned values)
`info #5B8CFF` · `success #2FB873` · `warning #E0962A` · `error #E25555`
(slightly desaturated; lighten ~10% in dark for legibility per research.)

### Gradients / glow
Cinematic, low-contrast: a radial `accent-soft → transparent` glow behind the hero name;
an optional `accent → accent-2` mesh on feature cards. No multi-hue rainbow gradients.

---

## Typography

| Role | Family | Source | Notes |
|---|---|---|---|
| Display / headings | **Clash Display** (or Cabinet Grotesk) | fontshare (free) | Kinetic hero |
| Body / UI | **Satoshi** (or Inter) | fontshare / Google | Legibility |
| Mono / code | **JetBrains Mono** | Google | Code blocks, hero terminal flourish |

Self-host via `next/font/local` in `frontend/src/app` (no layout shift, no extra request).
Preload the display weight used above the fold.

### Type scale (fluid `clamp()` — prevents the old responsive-overflow bug)
| Token | clamp() | Use |
|---|---|---|
| `display-xl` | `clamp(2.5rem, 6vw, 4.5rem)` | Hero name |
| `display` | `clamp(2rem, 4.5vw, 3rem)` | Section headings |
| `heading` | `clamp(1.4rem, 3vw, 2rem)` | Card titles |
| `subheading` | `1.25rem` | Feature/labels |
| `body` | `1rem` (≥16px) | Paragraphs, line-height 1.7 |
| `small` | `0.875rem` | Tags, secondary |
| `xs` | `0.75rem` | Captions (floor — never smaller) |

---

## Spacing, radius, layout
- **Spacing:** 4px base; multiples (4/8/12/16/24/32/48/64/80/96). Section rhythm
  `clamp(4rem, 10vw, 8rem)`.
- **Container:** max-width `1200px`, side padding `clamp(1rem, 5vw, 2rem)`.
- **Radius:** `sm 6` · `md 10` · `lg 14` · `xl 20` · `full`.
- **Bento grid** for skills/stats (named `grid-template-areas`).
- **No horizontal scroll ever.** No `100vw` without `overflow-x: clip`. Test at 320px.

---

## Motion — smooth animation everywhere (Framer Motion)

Motion is a feature here, applied consistently but never gratuitously.

| Where | Animation | Spec |
|---|---|---|
| Route change | Fade/slide page transition | `AnimatePresence`, 350–500ms ease-in-out |
| Section entry | Scroll reveal `FadeUp` + stagger | 400ms cubic-bezier(0.16,1,0.3,1), `whileInView once` |
| Hero headline | Word-by-word `TextReveal` | 40ms stagger, ≤800ms total |
| Cards | Hover lift + border/glow | `translateY(-4px)`, 150–200ms ease-out |
| Buttons/links | Magnetic + color micro | ≤8px pull, 150ms |
| Lists/grids | Staggered children | `staggerChildren: 0.06–0.08` |
| Numbers/stats | Count-up on view | 800ms |
| Theme toggle | Icon morph | 250ms |
| Nav | Blur-in on scroll, active underline `layoutId` | 200–250ms |
| Chat widget | Spring expand/collapse | spring, soft |

**Rules (hard):**
- Cap 800ms. GPU-only props (`transform`, `opacity`) — never `width/height/top/left`.
- **Every** animated component calls `useReducedMotion()` → instant fallback.
- Above-the-fold content defaults to visible then reveals (never hide-until-seen).
- Presets in `components/animations/`: `FadeUp`, `StaggerChildren`, `ScaleIn`,
  `TextReveal`, `PageTransition`, `CountUp`, `Magnetic`.

---

## Signature interactions (non-touch / `pointer: fine` only)
- **Custom cursor:** accent dot + lagging hollow ring; expands on hover of links/cards.
- **Magnetic** primary CTAs + social icons.
- **Card hover:** lift + border→accent-soft + faint glow.
- **AI chat:** floating accent pill bottom-right → spring-expands to a grounded chat panel.

---

## Page / section inventory
**Homepage** (best work + value prop above the fold): Hero (kinetic name, role, value prop,
availability badge→/contact, primary+secondary CTA, tech ticker) → Featured Projects (3) →
Skills (bento, with context) → Experience (timeline) → Testimonials (social proof) →
Contact CTA (email visible).
**Routes:** `/` · `/projects` · `/projects/[slug]` · `/about` · `/blog` · `/blog/[slug]` ·
`/contact` · `not-found` · `/admin/*`.
**Case study template:** Problem → Approach → Stack → What I built → Outcome/links.

---

## Accessibility (non-negotiable)
Contrast ≥4.5:1 body text (both themes verified), visible accent focus rings, full keyboard
nav, semantic landmarks, `alt` on every image, labelled fields, reduced-motion respected,
Lighthouse Accessibility ≥95.

## What NOT to do
No generic "I am a developer" H1 · no project carousel · no skeleton flash (ISR) · no
scroll-jacking · no emojis as structural icons · no pure `#FFF`/`#000` text · no
full-saturation reds on dark · no static `px` font sizes that overflow.
