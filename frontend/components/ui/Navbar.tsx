"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MagneticButton from "./MagneticButton";

const NAV_LINKS = [
  { label: "Work", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ availableForWork = false }: { availableForWork?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <motion.header
        initial={shouldReduce ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-ui",
          scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        )}
      >
        <div className="container-site">
          <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
            {/* Wordmark */}
            <div className="flex items-center">
              <Link
                href="/"
                className="font-display font-bold text-lg tracking-tight hover:text-accent transition-colors duration-micro"
              >
                <span className="text-accent">R</span>ezwoan
              </Link>
              {availableForWork && (
                <Link
                  href="/contact"
                  className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20 align-middle hover:bg-success/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Open
                </Link>
              )}
            </div>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative px-4 py-2 rounded-md text-small font-medium transition-colors duration-micro",
                        active ? "text-accent" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {label}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-4 right-4 h-px bg-accent"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <MagneticButton strength={0.3}>
                <Link href="/contact" className="btn-accent text-xs px-5 py-2.5">
                  Hire me
                </Link>
              </MagneticButton>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors duration-micro"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={shouldReduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 bg-background/97 backdrop-blur-md border-b border-border md:hidden"
          >
            <div className="container-site py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "block px-4 py-3 rounded-md text-body font-medium transition-colors duration-micro",
                    pathname === href
                      ? "text-accent bg-accent-muted"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border mt-1">
                <Link href="/contact" className="btn-accent w-full justify-center">Hire me</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" aria-hidden="true" />
    </>
  );
}
