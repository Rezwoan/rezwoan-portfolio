'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TextReveal } from '@/components/animations';
import { Magnetic } from '@/components/ui/magnetic';
import type { SiteSettings, Skill } from '@/lib/api';

export function Hero({ settings, heroSkills }: { settings: SiteSettings | null; heroSkills: Skill[] }) {
  const name = settings?.fullName || 'Din Muhammad Rezwoan';
  const role = settings?.roleLine || 'Full Stack Developer';
  const tagline = settings?.tagline || 'I build fast, polished web apps that turn ideas into products.';
  const available = settings?.availableForWork ?? true;
  const ticker = heroSkills.length ? heroSkills : null;

  return (
    <section className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent) / 0.18), transparent 60%)' }}
      />
      <div className="container-page flex flex-col items-center pb-20 pt-20 text-center md:pt-28">
        {available && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/contact"
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/50 hover:text-text"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Available for new projects
            </Link>
          </motion.div>
        )}

        <h1 className="text-display-xl font-bold">
          <TextReveal text={name} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 max-w-2xl text-balance text-lg text-text-secondary md:text-xl"
        >
          <span className="font-medium text-text">{role}.</span> {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <Link href="/contact" className="btn-primary">
              Start a project <ArrowRight size={16} />
            </Link>
          </Magnetic>
          <Link href="/projects" className="btn-secondary">
            View work
          </Link>
        </motion.div>

        {ticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative mt-16 w-full max-w-2xl overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]"
          >
            <div className="flex w-max animate-marquee gap-3">
              {[...ticker, ...ticker].map((s, i) => (
                <span key={i} className="chip whitespace-nowrap">
                  <Sparkles size={12} className="text-accent" /> {s.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
