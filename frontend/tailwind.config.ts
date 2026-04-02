import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────
      colors: {
        background:    "#080808",
        surface:       "#111111",
        "surface-raised": "#1A1A1A",
        border:        "#242424",
        "border-muted":"#1C1C1C",

        // Text
        "text-primary":   "#F5F5F0",
        "text-secondary": "#A0A09A",
        "text-muted":     "#666660",
        "text-inverse":   "#080808",

        // Brand accent
        accent:        "#C8F04B",
        "accent-hover":"#B8E040",
        "accent-muted":"rgba(200, 240, 75, 0.10)",

        // Semantic
        info:    "#3B82F6",
        success: "#22C55E",
        warning: "#F59E0B",
        error:   "#EF4444",
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        display: ["Cabinet Grotesk", "system-ui", "sans-serif"],
        body:    ["Satoshi", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Menlo", "monospace"],
        sans:    ["Satoshi", "system-ui", "sans-serif"],
      },
      fontSize: {
          "hero":       ["clamp(2.75rem, 8vw, 4.5rem)",   { lineHeight: "1.05", fontWeight: "700" }],
          "display":    ["clamp(2rem, 5vw, 3rem)",     { lineHeight: "1.1",  fontWeight: "700" }],
          "heading":    ["clamp(1.5rem, 4vw, 2rem)",     { lineHeight: "1.2",  fontWeight: "600" }],
        "subheading": ["1.25rem",  { lineHeight: "1.3",  fontWeight: "600" }],
        "body":       ["1rem",     { lineHeight: "1.75", fontWeight: "400" }],
        "small":      ["0.875rem", { lineHeight: "1.6",  fontWeight: "400" }],
        "xs":         ["0.75rem",  { lineHeight: "1.5",  fontWeight: "400" }],
      },

      // ── Spacing ─────────────────────────────────────────────
      // Using default Tailwind scale (4px base) — no overrides needed
      // Only add custom spacing here if the default scale doesn't cover it

      // ── Border Radius ───────────────────────────────────────
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl":"20px",
        full: "9999px",
      },

      // ── Animation ───────────────────────────────────────────
      transitionDuration: {
        micro:    "150ms",
        ui:       "250ms",
        reveal:   "400ms",
        page:     "500ms",
        hero:     "800ms",
      },
      transitionTimingFunction: {
        "spring":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-expo":"cubic-bezier(0.7, 0, 0.84, 0)",
        "ease-out-expo":"cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ticker": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-accent": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200, 240, 75, 0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(200, 240, 75, 0)" },
        },
      },
      animation: {
        "fade-up":     "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":     "fade-in 0.25s ease-out forwards",
        "ticker":      "ticker 20s linear infinite",
        "pulse-accent":"pulse-accent 2s ease-in-out infinite",
      },

      // ── Container ───────────────────────────────────────────
      maxWidth: {
        "container": "1200px",
        "content":   "760px",
      },
    },
  },
  plugins: [],
};

export default config;
