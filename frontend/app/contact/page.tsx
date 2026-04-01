import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/api";
import ContactForm from "./ContactForm";
import FadeUp from "@/components/animations/FadeUp";
import TextReveal from "@/components/animations/TextReveal";
import { Github, Linkedin, ExternalLink, Mail, MapPin } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch for freelance work, job opportunities, or collaborations.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);

  const socials = [
    { label: "GitHub", href: settings?.github_url, icon: <Github size={16} /> },
    { label: "LinkedIn", href: settings?.linkedin_url, icon: <Linkedin size={16} /> },
    { label: "Fiverr", href: settings?.fiverr_url, icon: <ExternalLink size={16} /> },
  ].filter((s) => s.href);

  return (
    <div className="container-site section pt-8">
      <FadeUp>
        <p className="section-label">Contact</p>
      </FadeUp>
      <TextReveal text="Let's build something" as="h1" className="text-display font-display mb-4" delay={0.05} />
      <FadeUp delay={0.15}>
        <p className="text-body text-text-secondary max-w-xl mb-12">
          Whether it&apos;s a project, a job opportunity, or just a hello — my inbox is open.
          I usually respond within 24 hours.
        </p>
      </FadeUp>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Form */}
        <FadeUp delay={0.2}>
          <ContactForm />
        </FadeUp>

        {/* Info sidebar */}
        <FadeUp delay={0.3} className="space-y-4">
          {/* Direct email */}
          {settings?.email && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-text-muted text-small mb-2">
                <Mail size={14} />
                <span>Email directly</span>
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-text-primary hover:text-accent transition-colors duration-micro break-all"
              >
                {settings.email}
              </a>
            </div>
          )}

          {/* Location */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-text-muted text-small mb-2">
              <MapPin size={14} />
              <span>Location</span>
            </div>
            <p className="font-medium text-text-primary">Dhaka, Bangladesh</p>
            <p className="text-xs text-text-muted mt-1">BST (UTC+6) · Open to remote worldwide</p>
          </div>

          {/* Availability */}
          {settings?.available_for_work && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success font-medium text-small">Available for work</span>
              </div>
              <p className="text-xs text-text-secondary">
                Currently open to freelance projects and remote full-time positions.
              </p>
            </div>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-small text-text-muted mb-3">Find me on</p>
              <div className="space-y-2">
                {socials.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-small text-text-secondary hover:text-accent transition-colors duration-micro group"
                  >
                    <span className="text-text-muted group-hover:text-accent transition-colors">{icon}</span>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </FadeUp>
      </div>
    </div>
  );
}
