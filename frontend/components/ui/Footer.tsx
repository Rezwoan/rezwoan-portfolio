import Link from "next/link";
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/api";

const NAV = [
  { label: "Work", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

interface FooterProps {
  settings: SiteSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container-site py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left — wordmark + tagline */}
          <div className="space-y-2">
            <Link
              href="/"
              className="font-display font-bold text-lg tracking-tight hover:text-accent transition-colors duration-micro"
            >
              <span className="text-accent">R</span>ezwoan
            </Link>
            <p className="text-small text-text-muted max-w-xs">
              {settings?.tagline ?? "Full Stack Developer · Dhaka, Bangladesh"}
            </p>
          </div>

          {/* Center — nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-small text-text-muted hover:text-text-primary transition-colors duration-micro"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right — socials */}
          <div className="flex items-center gap-3">
            {settings?.github_url && (
              <SocialLink href={settings.github_url} label="GitHub">
                <Github size={16} />
              </SocialLink>
            )}
            {settings?.linkedin_url && (
              <SocialLink href={settings.linkedin_url} label="LinkedIn">
                <Linkedin size={16} />
              </SocialLink>
            )}
            {settings?.twitter_url && (
              <SocialLink href={settings.twitter_url} label="Twitter / X">
                <Twitter size={16} />
              </SocialLink>
            )}
            {settings?.fiverr_url && (
              <SocialLink href={settings.fiverr_url} label="Fiverr">
                <ExternalLink size={16} />
              </SocialLink>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-muted">
            © {year} {settings?.full_name ?? "Din Muhammad Rezwoan"}. Built with Next.js & Wagtail.
          </p>
          {settings?.resume_pdf_url && (
            <a
              href={settings.resume_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-muted hover:text-accent transition-colors duration-micro flex items-center gap-1"
            >
              Download résumé <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-accent hover:border-accent transition-all duration-micro"
    >
      {children}
    </a>
  );
}
