"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Github, Linkedin, ExternalLink } from "lucide-react";
import TextReveal from "@/components/animations/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import type { SiteSettings, Skill } from "@/lib/api";

interface HeroSectionProps {
  settings: SiteSettings;
  heroSkills: Skill[];
}

// Terminal lines typed one by one
const TERMINAL_LINES = [
  { prefix: "$ ", text: "whoami", delay: 0.8 },
  { prefix: "", text: "din-muhammad-rezwoan", delay: 1.2, accent: true },
  { prefix: "$ ", text: "cat stack.txt", delay: 1.8 },
  { prefix: "", text: "next.js · django · typescript · postgres", delay: 2.2 },
  { prefix: "$ ", text: "echo $STATUS", delay: 2.8 },
];

function TerminalLine({
  prefix,
  text,
  delay,
  accent,
  available,
}: {
  prefix: string;
  text: string;
  delay: number;
  accent?: boolean;
  available?: boolean;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="flex items-center gap-1"
      initial={shouldReduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
    >
      {prefix && <span className="text-accent opacity-70">{prefix}</span>}
      <span className={accent ? "text-accent" : "text-text-secondary"}>
        {available !== undefined ? (
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
            <span className="text-success">available_for_work=true</span>
          </span>
        ) : (
          text
        )}
      </span>
    </motion.div>
  );
}

// Infinitely scrolling tech ticker
function TechTicker({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null;
  const items = [...skills, ...skills]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden -mx-6 md:-mx-10 lg:-mx-16 py-3 border-y border-border/40 my-10">
      <div className="flex gap-8 animate-ticker whitespace-nowrap w-max">
        {items.map((skill, i) => (
          <span
            key={`${skill.name}-${i}`}
            className="flex items-center gap-2 text-small text-text-muted font-mono shrink-0"
          >
            <span className="text-accent text-xs">▸</span>
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection({ settings, heroSkills }: HeroSectionProps) {
  const shouldReduce = useReducedMotion();
  const [terminalDone, setTerminalDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTerminalDone(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="section pt-8 md:pt-12 relative overflow-hidden" aria-label="Introduction">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#C8F04B 1px, transparent 1px), linear-gradient(90deg, #C8F04B 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] lg:gap-x-16 items-start">
          
          {/* Availability badge */}
          {settings.available_for_work && (
            <motion.div
              initial={shouldReduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="order-1 lg:col-start-1 lg:row-start-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 mb-4 lg:mb-6 w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Available for new projects
            </motion.div>
          )}

          {/* Left — main content starts here */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 max-w-2xl w-full">
            {/* Name */}
            <TextReveal
              text={settings.full_name}
              as="h1"
              className="text-hero font-display leading-[1.02] mb-4"
              delay={0.1}
              stagger={0.06}
              animateOnLoad={true}
            />

            {/* Tagline */}
            <motion.p
              className="text-heading font-display text-text-secondary mb-6 leading-snug"
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {settings.tagline || "Building fast, beautiful web products with Next.js & Django."}
            </motion.p>

            {/* Bio */}
            <motion.p
              className="text-body text-text-secondary mb-8 leading-relaxed"
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {settings.bio_short || "CSE student at AIUB and freelance full-stack developer. I turn ideas into products that actually ship."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton strength={0.35}>
                <Link href="/projects" className="btn-accent group">
                  See my work
                  <ArrowRight size={16} className="transition-transform duration-micro group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.3}>
                <Link href="/contact" className="btn-ghost">
                  Get in touch
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Social row */}
            <motion.div
              className="flex items-center gap-4 mt-8"
              initial={shouldReduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <span className="text-xs text-text-muted font-mono">find me on</span>
              <div className="flex items-center gap-3">
                {[
                  { href: settings.github_url, icon: <Github size={16} />, label: "GitHub" },
                  { href: settings.linkedin_url, icon: <Linkedin size={16} />, label: "LinkedIn" },
                  { href: settings.fiverr_url, icon: <ExternalLink size={16} />, label: "Fiverr" },
                ].filter(s => s.href).map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-accent hover:border-accent transition-all duration-micro"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — terminal card */}
          <motion.div
            className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full max-w-[360px] mx-auto lg:mx-0 lg:w-80 shrink-0 mb-3 lg:mb-0"
            initial={shouldReduce ? false : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-raised">
                <span className="w-3 h-3 rounded-full bg-error/70" />
                <span className="w-3 h-3 rounded-full bg-warning/70" />
                <span className="w-3 h-3 rounded-full bg-success/70" />
                <span className="ml-2 text-xs text-text-muted font-mono">
                  rezwoan@portfolio:~
                </span>
              </div>
              {/* Terminal body */}
              <div className="p-4 font-mono text-small space-y-1.5 min-h-[180px]">
                {TERMINAL_LINES.map((line, i) => (
                  <TerminalLine key={i} {...line} />
                ))}
                <motion.div
                  className="flex items-center gap-1"
                  initial={shouldReduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2, duration: 0.3 }}
                >
                  <span className="text-accent opacity-70">$ </span>
                  <span className="text-success flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                    available_for_work=true
                  </span>
                </motion.div>
                {/* Blinking cursor */}
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.6 }}
                >
                  <span className="text-accent opacity-70">$ </span>
                  <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* Stats row below terminal */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { value: "3+", label: "yrs exp" },
                { value: "20+", label: "projects" },
                { value: "100%", label: "committed" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-surface border border-border rounded-md p-3 text-center">
                  <div className="text-accent font-display font-bold text-lg leading-none">{value}</div>
                  <div className="text-xs text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tech ticker */}
        {heroSkills.length > 0 && <TechTicker skills={heroSkills} />}
      </div>
    </section>
  );
}
