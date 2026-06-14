import type { Experience } from '@/lib/api';
import { SectionHeader } from '@/components/ui/section-header';
import { FadeUp } from '@/components/animations';
import { dateRange } from '@/lib/utils';

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  if (!items.length) return null;
  return (
    <section className="section border-t border-border-muted">
      <div className="container-page">
        <SectionHeader eyebrow="Journey" title="Experience" />
        <div className="mt-10 max-w-3xl">
          {items.map((e, i) => (
            <FadeUp key={e.id} delay={i * 0.05}>
              <div className="relative border-l border-border pb-10 pl-8 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-xs text-text-muted">{dateRange(e.startDate, e.endDate, e.isCurrent)}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">
                  {e.role} <span className="text-text-secondary">· {e.company}</span>
                </h3>
                {e.location && <p className="text-sm text-text-muted">{e.location}</p>}
                {e.description && <p className="mt-2 text-sm text-text-secondary">{e.description}</p>}
                {e.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <span key={t.name} className="chip">{t.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
