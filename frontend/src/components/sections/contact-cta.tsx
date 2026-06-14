import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import type { SiteSettings } from '@/lib/api';
import { FadeUp } from '@/components/animations';

export function ContactCTA({ settings }: { settings: SiteSettings | null }) {
  const email = settings?.email || 'frezwoan@gmail.com';
  return (
    <section className="section">
      <div className="container-page">
        <FadeUp>
          <div className="relative overflow-hidden rounded-xl border border-border bg-bg-elevated px-6 py-16 text-center md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-70"
              style={{ background: 'radial-gradient(60% 80% at 50% 0%, rgb(var(--accent) / 0.14), transparent)' }}
            />
            <h2 className="text-display font-bold">Have a project in mind?</h2>
            <p className="mx-auto mt-3 max-w-xl text-text-secondary">
              I&apos;m available for freelance work and collaborations. Tell me what you&apos;re building and
              I&apos;ll get back to you within a day or two.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn-primary">
                Start a project <ArrowRight size={16} />
              </Link>
              <a href={`mailto:${email}`} className="btn-secondary">
                <Mail size={16} /> {email}
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
