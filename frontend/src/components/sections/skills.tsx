import type { Skill } from '@/lib/api';
import { SectionHeader } from '@/components/ui/section-header';
import { StaggerChildren, StaggerItem } from '@/components/animations';

const CATEGORY_LABEL: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  design: 'Design',
  ai: 'AI',
  other: 'Other',
};

export function Skills({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null;
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <section className="section border-t border-border-muted">
      <div className="container-page">
        <SectionHeader
          eyebrow="Toolbox"
          title="Skills & technologies"
          description="The stack I reach for, with how deeply I use each."
        />
        <StaggerChildren className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <StaggerItem key={cat}>
              <div className="card h-full p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  {CATEGORY_LABEL[cat] || cat}
                </h3>
                <ul className="space-y-3">
                  {grouped[cat].map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-text">{s.name}</span>
                        {s.context && <span className="text-xs text-text-muted">{s.context}</span>}
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-raised">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(s.proficiency / 5) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
