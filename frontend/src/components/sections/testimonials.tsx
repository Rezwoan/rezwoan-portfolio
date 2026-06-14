import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/api';
import { SectionHeader } from '@/components/ui/section-header';
import { StaggerChildren, StaggerItem } from '@/components/animations';

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="section border-t border-border-muted">
      <div className="container-page">
        <SectionHeader
          eyebrow="Social proof"
          title="What clients say"
          description="Feedback from people I've shipped work for."
          align="center"
        />
        <StaggerChildren className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <StaggerItem key={t.id}>
              <figure className="card flex h-full flex-col p-6">
                <Quote className="text-accent/40" size={24} />
                <blockquote className="mt-3 flex-1 text-sm text-text-secondary">“{t.quote}”</blockquote>
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < t.rating ? 'fill-accent text-accent' : 'text-border'}
                    />
                  ))}
                </div>
                <figcaption className="mt-4 border-t border-border-muted pt-4">
                  <p className="text-sm font-semibold text-text">{t.clientName}</p>
                  {(t.clientTitle || t.clientCompany) && (
                    <p className="text-xs text-text-muted">
                      {[t.clientTitle, t.clientCompany].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
