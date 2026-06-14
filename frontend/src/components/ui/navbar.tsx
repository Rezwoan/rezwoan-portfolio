'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar({ shortName = 'Rezwoan' }: { shortName?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-border bg-bg/80 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {shortName}
          <span className="text-accent">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'relative rounded-md px-3 py-2 text-sm transition-colors',
                isActive(l.href) ? 'text-text' : 'text-text-secondary hover:text-text',
              )}
            >
              {l.label}
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-3 -bottom-px h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/contact" className="btn-primary hidden text-sm md:inline-flex">
            Start a project
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-bg-elevated text-text md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-border bg-bg md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-base',
                    isActive(l.href) ? 'bg-bg-elevated text-text' : 'text-text-secondary',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/contact" className="btn-primary mt-2">
                Start a project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
