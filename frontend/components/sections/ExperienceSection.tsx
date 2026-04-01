import FadeUp from "@/components/animations/FadeUp";
import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/api";

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  return (
    <FadeUp delay={index * 0.08} className="relative pl-8 pb-10 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-1.5 bottom-0 w-px bg-border last:hidden" aria-hidden="true" />
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3px]",
          exp.is_current ? "bg-accent shadow-[0_0_0_3px_rgba(200,240,75,0.2)]" : "bg-border"
        )}
        aria-hidden="true"
      />

      <div className="group bg-surface border border-border rounded-xl p-5 hover:border-[#333] transition-colors duration-ui">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display font-bold text-subheading leading-snug">{exp.role}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {exp.company_url ? (
                <a
                  href={exp.company_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-small text-accent hover:underline underline-offset-2"
                >
                  {exp.company_name}
                </a>
              ) : (
                <span className="text-small text-accent">{exp.company_name}</span>
              )}
              <span className="text-text-muted text-xs">·</span>
              <span className="text-small text-text-muted">{exp.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-mono text-xs text-text-muted">{exp.date_range}</span>
            <span className="tech-tag text-[10px]">
              {exp.employment_type.replace("-", " ")}
            </span>
          </div>
        </div>

        {exp.description && (
          <div
            className="text-small text-text-secondary leading-relaxed prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: exp.description }}
          />
        )}

        {exp.tech_used.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/50">
            {exp.tech_used.map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono font-medium bg-surface-raised border border-border text-text-muted"
                style={{ borderColor: `${tag.color}30`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </FadeUp>
  );
}

export default function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  if (!experiences.length) return null;

  return (
    <section className="section" id="experience" aria-labelledby="experience-heading">
      <div className="container-site">
        <FadeUp>
          <p className="section-label">Background</p>
          <h2 id="experience-heading" className="text-display font-display mb-10">
            Where I&apos;ve worked
          </h2>
        </FadeUp>

        <div className="max-w-2xl">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
