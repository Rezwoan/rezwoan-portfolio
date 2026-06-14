import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import type { SiteSettings } from '@/lib/api';

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear();
  const name = settings?.fullName || 'Din Muhammad Rezwoan';
  const socials = [
    { href: settings?.githubUrl, icon: Github, label: 'GitHub' },
    { href: settings?.linkedinUrl, icon: Linkedin, label: 'LinkedIn' },
    { href: settings?.twitterUrl, icon: Twitter, label: 'Twitter' },
    { href: settings?.email ? `mailto:${settings.email}` : undefined, icon: Mail, label: 'Email' },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="font-display text-lg font-bold">
            {settings?.shortName || 'Rezwoan'}
            <span className="text-accent">.</span>
          </Link>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            {settings?.roleLine || 'Full Stack Developer'} · {settings?.location || 'Dhaka, Bangladesh'}.
            Open to freelance work worldwide.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href as string}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-md border border-border bg-bg-elevated text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <Link href="/contact" className="text-sm text-text-secondary link-underline">
            Let&apos;s work together →
          </Link>
        </div>
      </div>
      <div className="container-page border-t border-border-muted py-6 text-center text-xs text-text-muted">
        © {year} {name}. Built with Next.js, NestJS &amp; a Raspberry Pi.
      </div>
    </footer>
  );
}
