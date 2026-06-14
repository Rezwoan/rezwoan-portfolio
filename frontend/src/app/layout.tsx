import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SITE_URL } from '@/lib/seo';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Din Muhammad Rezwoan — Full Stack Developer',
    template: '%s — Rezwoan',
  },
  description:
    'Full Stack Developer from Dhaka, Bangladesh. I build fast, polished web apps with Next.js, NestJS and TypeScript. Available for freelance work worldwide.',
  keywords: [
    'Full Stack Developer Bangladesh',
    'Next.js developer for hire',
    'React developer Dhaka',
    'NestJS developer',
    'freelance web developer',
  ],
  authors: [{ name: 'Din Muhammad Rezwoan', url: SITE_URL }],
  creator: 'Din Muhammad Rezwoan',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFBFD' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0F' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
