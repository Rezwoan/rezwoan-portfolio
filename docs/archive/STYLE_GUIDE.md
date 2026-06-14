# STYLE_GUIDE.md — Design System & Component Rules

> The source of truth for all visual decisions. When in doubt, look here first.
> All values below should match exactly what's in `frontend/tailwind.config.ts`.

---

## Color System

### Base Palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#080808` | Page background |
| `surface` | `#111111` | Cards, panels |
| `surface-raised` | `#1A1A1A` | Elevated cards, modals |
| `border` | `#242424` | Subtle dividers, card borders |
| `border-muted` | `#1C1C1C` | Very subtle separators |

### Text

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#F5F5F0` | Headings, primary content |
| `text-secondary` | `#A0A09A` | Body paragraphs, descriptions |
| `text-muted` | `#666660` | Labels, timestamps, captions |
| `text-inverse` | `#080808` | Text on accent backgrounds |

### Brand Accent

| Token | Hex | Usage |
|---|---|---|
| `accent` | `#C8F04B` | Primary CTA buttons, highlights, active states |
| `accent-hover` | `#B8E040` | Hover state of accent |
| `accent-muted` | `#C8F04B1A` | Light accent background (10% opacity) |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `info` | `#3B82F6` | Links, info states |
| `success` | `#22C55E` | Success states |
| `warning` | `#F59E0B` | Warning states |
| `error` | `#EF4444` | Error states |

---

## Typography

### Font Families

| Role | Family | Source |
|---|---|---|
| Display / Headings | Cabinet Grotesk | fontshare.com/fonts/cabinet-grotesk (free) |
| Body | Satoshi | fontshare.com/fonts/satoshi (free) |
| Monospace / Code | JetBrains Mono | fonts.google.com (free) |

Download and place in `frontend/public/fonts/`. Use `@font-face` in `globals.css`.

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-hero` | 4.5rem (72px) | 700 | 1.05 | Hero section name |
| `text-display` | 3rem (48px) | 700 | 1.1 | Section headings |
| `text-heading` | 2rem (32px) | 600 | 1.2 | Sub-headings, card titles |
| `text-subheading` | 1.25rem (20px) | 600 | 1.3 | Labels, feature titles |
| `text-body` | 1rem (16px) | 400 | 1.75 | Body text (minimum size) |
| `text-small` | 0.875rem (14px) | 400 | 1.6 | Secondary text, tags |
| `text-xs` | 0.75rem (12px) | 400 | 1.5 | Captions, timestamps (minimum) |

**Never go below 12px** — this is the accessibility floor.

---

## Spacing Scale

Using 4px base unit. Only use multiples of 4.

```
1  →  4px    (tight gaps between related elements)
2  →  8px    (component internal padding)
3  →  12px   (small component gaps)
4  →  16px   (standard spacing)
5  →  20px   (comfortable spacing)
6  →  24px   (section sub-element spacing)
8  →  32px   (card padding)
10 →  40px   (section top/bottom padding mobile)
12 →  48px   (between section elements)
16 →  64px   (section padding desktop)
20 →  80px   (major section separation)
24 →  96px   (page-level vertical rhythm)
```

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Tags, badges, small chips |
| `rounded-md` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Large cards, panels |
| `rounded-2xl` | 20px | Feature highlight cards |
| `rounded-full` | 9999px | Pill buttons, avatars |

---

## Animation Rules

### Timing

| Type | Duration | Easing | Notes |
|---|---|---|---|
| Micro (hover state) | 150ms | ease-out | Button color, icon swap |
| UI transition | 250ms | ease-out | Modal open, menu expand |
| Page element reveal | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | Scroll-triggered entry |
| Page transition | 500ms | ease-in-out | Route change fade/slide |
| Hero sequence | 800ms | cubic-bezier(0.16, 1, 0.3, 1) | Initial load animation |

**Hard limit:** Nothing slower than 800ms. Users feel animations over 1s as broken/slow.

### Framer Motion Presets (use in `components/animations/`)

**`FadeUp`** — entry from below, most common:
```tsx
const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}
```

**`StaggerChildren`** — parent that staggers its children:
```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
```

**`ScaleIn`** — for cards and images:
```tsx
const variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } }
}
```

### Reduced Motion Rule

```tsx
import { useReducedMotion } from 'framer-motion'

// In every animated component:
const shouldReduce = useReducedMotion()
const variants = shouldReduce ? {} : myAnimationVariants
```

---

## Signature UI Components

### Custom Cursor
- Small filled circle (8px, accent color) that follows mouse precisely.
- Larger hollow ring (40px) that follows with a 120ms delay (lerp).
- On hovering a link or button: ring expands to 60px, circle shrinks to 4px.
- On hovering an image/project card: ring becomes a rounded square.
- Implementation: `components/ui/CustomCursor.tsx` — only renders on non-touch devices.

### Magnetic Button
- On hover, the button element moves up to 10px toward the cursor.
- Implementation: Track mouse position relative to button center, apply a `transform` based on distance.
- Apply to: primary CTA buttons, social links, "view project" cards.
- `components/ui/MagneticButton.tsx`

### Text Reveal Animation
- Heading text splits into words or lines.
- Each word/line animates up with a stagger of 40ms.
- Triggered when the element enters the viewport.
- `components/animations/TextReveal.tsx`

### Bento Grid
- Asymmetric CSS Grid for skills/stats section.
- Uses `grid-template-areas` for named regions.
- Cards have subtle hover state: `translateY(-4px)` + border brightens.
- `components/sections/BentoGrid.tsx`

---

## Component Naming Conventions

- **Pages:** `app/projects/page.tsx` — Next.js App Router convention.
- **Section components:** `PascalCase`, suffix `Section` → `HeroSection`, `ProjectsSection`.
- **UI primitives:** `PascalCase`, no suffix → `Button`, `Badge`, `Card`, `Tag`.
- **Animation wrappers:** `PascalCase`, prefix or suffix with animation intent → `FadeUp`, `TextReveal`, `MagneticButton`.
- **API-fetching hooks:** prefix `use` → `useProjects`, `useSiteSettings`.

---

## What NOT to Do

- No generic hero section with "I am a developer" as the H1 — too generic to rank or impress.
- No carousel for projects — they perform poorly on mobile and kill LCP scores.
- No skeleton loaders that flash on every visit — use ISR so content is pre-baked.
- No scroll-jacking (overriding native scroll behavior) — accessibility nightmare.
- No emojis as structural icons — use proper SVG icons (Lucide React).
- No `width: 100vw` with no `overflow: hidden` — causes horizontal scrollbar on Windows.
