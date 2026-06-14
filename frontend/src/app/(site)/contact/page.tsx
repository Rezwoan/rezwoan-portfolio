import type { Metadata } from 'next';
import { Mail, Github, Linkedin, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/api';
import { ContactForm } from './contact-form';
import { FadeUp } from '@/components/animations';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Get in touch with Din Muhammad Rezwoan for freelance work, collaborations or questions.',
  path: '/contact',
});

export default async function ContactPage() {
  const s = await getSiteSettings();
  const items = [
    { icon: Mail, label: 'Email', value: s?.email, href: s?.email ? `mailto:${s.email}` : undefined },
    { icon: Github, label: 'GitHub', value: 'github.com/Rezwoan', href: s?.githubUrl },
    { icon: Linkedin, label: 'LinkedIn', value: 'Connect with me', href: s?.linkedinUrl },
    { icon: MapPin, label: 'Location', value: s?.location || 'Dhaka, Bangladesh', href: undefined },
  ].filter((i) => i.value);

  return (
    <div className="container-page section">
      <div className="grid gap-12 lg:grid-cols-[360px_1fr]">
        <FadeUp>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
            <span className="h-px w-6 bg-accent" /> Contact
          </p>
          <h1 className="text-display font-bold">Let&apos;s build something.</h1>
          <p className="mt-3 text-text-secondary">
            Whether it&apos;s a SaaS MVP, a marketing site, or a tricky integration — tell me about it. I usually
            reply within a day or two.
          </p>
          <div className="mt-8 space-y-3">
            {items.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-4 transition-colors hover:border-accent/40">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-sm font-medium text-text">{value}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="block">
                  {content}
                </a>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <ContactForm />
        </FadeUp>
      </div>
    </div>
  );
}
