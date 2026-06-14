import type { Config } from 'tailwindcss';

const withVar = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: withVar('--bg'),
        'bg-elevated': withVar('--bg-elevated'),
        'bg-raised': withVar('--bg-raised'),
        border: withVar('--border'),
        'border-muted': withVar('--border-muted'),
        text: withVar('--text'),
        'text-secondary': withVar('--text-secondary'),
        'text-muted': withVar('--text-muted'),
        accent: withVar('--accent'),
        'accent-hover': withVar('--accent-hover'),
        'accent-contrast': withVar('--accent-contrast'),
        'accent-2': withVar('--accent-2'),
        info: '#5B8CFF',
        success: '#2FB873',
        warning: '#E0962A',
        error: '#E25555',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        display: ['clamp(2rem, 4.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        heading: ['clamp(1.4rem, 3vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        subheading: ['1.25rem', { lineHeight: '1.3' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        glow: '0 0 60px -12px rgb(var(--accent) / 0.45)',
        card: '0 1px 3px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'pulse-soft': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        marquee: 'marquee 28s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
