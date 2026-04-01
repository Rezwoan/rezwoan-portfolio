import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import FadeUp from "@/components/animations/FadeUp";
import MagneticButton from "@/components/ui/MagneticButton";
import type { SiteSettings } from "@/lib/api";

export default function ContactCTA({ settings }: { settings: SiteSettings | null }) {
  return (
    <section className="section" aria-labelledby="contact-cta-heading">
      <div className="container-site">
        <FadeUp>
          <div className="relative rounded-2xl border border-border bg-surface overflow-hidden px-8 py-14 md:px-16 md:py-20 text-center">
            {/* Background accent glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, #C8F04B, transparent)",
              }}
              aria-hidden="true"
            />

            <p className="section-label justify-center mb-4">Let&apos;s work together</p>
            <h2
              id="contact-cta-heading"
              className="text-display font-display mb-4"
            >
              Got a project in mind?
            </h2>
            <p className="text-body text-text-secondary max-w-md mx-auto mb-8">
              I&apos;m available for freelance work, remote positions, and interesting collaborations.
              {settings?.available_for_work && " Currently open to new opportunities."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.35}>
                <Link href="/contact" className="btn-accent group">
                  Start a conversation
                  <ArrowRight size={16} className="transition-transform duration-micro group-hover:translate-x-1" />
                </Link>
              </MagneticButton>
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Mail size={16} />
                  {settings.email}
                </a>
              )}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
