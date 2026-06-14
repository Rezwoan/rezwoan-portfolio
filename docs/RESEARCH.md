# RESEARCH.md — Why the Design & SEO Choices

> Evidence behind [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and
> [`SEO_STRATEGY.md`](./SEO_STRATEGY.md). Sourced June 2026.

---

## 1. What makes a developer portfolio convert (2026)

- **You have ~3 seconds / recruiters spend ~15s** on first screening — the first
  viewport must answer *who you are, what you do, why you're different*, and surface your
  **best work immediately**. → Hero with a specific value prop (not "I am a developer"),
  featured projects high on the page.
- **Case studies, not screenshots** — explaining the *problem you solved* is what
  separates portfolios that get interviews/clients from galleries. → Each project is a
  Problem → Approach → Stack → Outcome case study.
- **Social proof front-and-center** — testimonials are a top conversion lever. → A
  testimonials section on the homepage, sourced from Fiverr/LinkedIn.
- **Make contact obvious** — don't make people hunt for your email. → Visible email +
  persistent CTA + a low-friction contact form (+ the AI assistant as another funnel).
- **Performance is a feature** — top portfolios load **< 2s**; speed correlates with
  trust and SEO. → Next.js ISR, `next/image`, self-hosted fonts, minimal JS.
- **Three traits of the best ones:** Clarity, (subtle) Creativity, Conversion.

## 2. Design trends shaping 2026

- **Dark mode as default & brand mood** — sites without considered dark mode look dated;
  treat it as intentional ("mood mode") with designed tokens, not a bolted-on toggle.
- **Off-white text on dark**, not pure `#FFF` (e.g. `#E0E0E0`/`#C9D1D9`) to cut eye
  strain; **desaturate vivid colors to ~70–80%** in dark UIs. → our `text #ECECE6`,
  toned semantic colors.
- **Neon micro-accents** are back in tech/SaaS UI — one electric accent against
  neutrals. → we keep the signature lime `#C8F04B` as a single, memorable accent.
- **Cinematic/soft-glow & mesh gradients**, not harsh rainbow blends. → hero glow.
- **Kinetic typography** — headlines that build letter/word-by-word, text reacting to
  scroll. → `TextReveal` hero animation.
- **Texture/grain + generous whitespace + minimalism** — clean, immersive, personal.
- **Micro-interactions** (hover, magnetic buttons, custom cursor) add craft without
  hurting performance when GPU-composited and reduced-motion-aware.

## 3. Getting clients organically (SEO/growth)

- **Content marketing + blogging** is a proven organic acquisition channel for devs;
  **personal branding** (custom domain, consistent palette, concise bio) compounds it.
- **Long-tail blog posts** are the biggest ranking opportunity (tutorials about the
  exact stack: self-hosting Next.js on a Pi + Cloudflare Tunnel, NestJS+Prisma, etc.).
- **Local SEO** is "the easiest win most developers ignore" — lean into Dhaka/Bangladesh
  + remote-worldwide in copy and `Person` schema.
- **Proof of results** (real projects, measurable outcomes) beats listing skills; list
  skills **with context** ("React · 2 years, daily") rather than bare logos.

## 4. How this maps to decisions
| Research finding | Decision in this repo |
|---|---|
| 3s/15s attention, best work first | Hero value prop + featured projects above the fold |
| Case studies win | Markdown case-study template per project; AI importer drafts them |
| Social proof converts | Homepage testimonials section |
| Make contact obvious | Visible email, persistent CTA, contact form, AI assistant funnel |
| < 2s load | Next.js ISR, `next/image`, self-hosted fonts, minimal client JS |
| Dark "mood mode", off-white text | Dark-first tokens, `text #ECECE6`, not pure white |
| One neon micro-accent | Signature lime accent as a single CSS var |
| Kinetic type, micro-interactions | `TextReveal`, magnetic buttons, custom cursor (reduced-motion-safe) |
| Content + long-tail + local SEO | Blog targeting stack tutorials; Dhaka + remote in schema/copy |
| Skills with context | `Skill.context` field surfaced in the UI |

---

## Sources
- [Best Modern Portfolio Website Design Examples (Wegic)](https://wegic.ai/inspiration/best-modern-portfolio-website-design-examples)
- [Portfolio design trends for 2026 (Envato)](https://elements.envato.com/learn/portfolio-trends)
- [19 Best Portfolio Design Trends 2026 (Colorlib)](https://colorlib.com/wp/portfolio-design-trends/)
- [The Top Website Design Trends Increasing Conversions in 2026 (ORAFOX)](https://orafox.com/modern-website-design-2026/)
- [How to Get Web Development Clients in 2025 (Saleshandy)](https://www.saleshandy.com/blog/how-to-get-clients-for-web-development/)
- [Best Web Developer Portfolio Examples (Twine)](https://www.twine.net/blog/best-web-developer-portfolio-examples/)
- [10 Web Design Trends for 2026 (Medium — A. M. Iqbal)](https://medium.com/@arsalanmuhammadiqbal/10-web-design-trends-for-2026-that-will-make-your-website-look-outdated-if-ignored-b3c139ac22bf)
- [Color Trends for 2026 (AND Academy)](https://www.andacademy.com/resources/blog/graphic-design/color-trends-for-designers/)
- [2026 Web Design Color Trends (Lounge Lizard)](https://www.loungelizard.com/blog/web-design-color-trends/)
- [Best Practices for Dark Mode 2026 (NateBal)](https://natebal.com/best-practices-for-dark-mode/)
- [UI/UX Color Trends That Define 2026 (Recursion)](https://recursion.software/blog/ui-color-trends-2026)
- [Developer Portfolio Guide 2026 (Hakia)](https://hakia.com/skills/building-portfolio/)
- [How to Build a Developer Portfolio That Gets You Hired 2026 (DEV)](https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn)
- [How to Build a Developer Portfolio That Gets You Hired (curious.page)](https://curious.page/blog/how-to-build-developer-portfolio-gets-hired)
