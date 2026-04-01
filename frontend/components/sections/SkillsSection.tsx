"use client";
import { motion, useReducedMotion } from "framer-motion";
import FadeUp from "@/components/animations/FadeUp";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  design: "Design",
  other: "Other",
};

// Proficiency ring SVG
function ProficiencyRing({ value }: { value: number }) {
  const pct = (value / 5) * 100;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#242424" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="#C8F04B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="22" y="27" textAnchor="middle" fill="#F5F5F0" fontSize="11" fontWeight="500">
        {value}/5
      </text>
    </svg>
  );
}

function SkillItem({ skill, index }: { skill: Skill; index: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-[#333] transition-colors duration-micro"
    >
      <span className="text-small font-medium text-text-primary">{skill.name}</span>
      <ProficiencyRing value={skill.proficiency} />
    </motion.div>
  );
}

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills.length) return null;

  // Group by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <section className="section" id="skills" aria-labelledby="skills-heading">
      <div className="container-site">
        <FadeUp>
          <p className="section-label">Capabilities</p>
          <h2 id="skills-heading" className="text-display font-display mb-3">
            My toolkit
          </h2>
          <p className="text-body text-text-secondary mb-10 max-w-xl">
            Technologies I reach for to build production-ready products.
          </p>
        </FadeUp>

        {/* Bento grid — asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat, catIdx) => (
            <FadeUp
              key={cat}
              delay={catIdx * 0.07}
              className={cn(
                "bg-surface border border-border rounded-xl p-5",
                // Make first category span 2 cols on xl if it has many skills
                catIdx === 0 && grouped[cat].length >= 4 ? "xl:col-span-2" : ""
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-subheading font-display font-semibold">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h3>
                <span className="text-xs text-text-muted font-mono bg-surface-raised px-2 py-0.5 rounded-sm">
                  {grouped[cat].length} tools
                </span>
              </div>
              <div className={cn(
                "grid gap-2",
                grouped[cat].length >= 4 && catIdx === 0
                  ? "sm:grid-cols-2"
                  : "grid-cols-1"
              )}>
                {grouped[cat].map((skill, i) => (
                  <SkillItem key={skill.id} skill={skill} index={i} />
                ))}
              </div>
            </FadeUp>
          ))}

          {/* Accent block — availability CTA */}
          <FadeUp
            delay={categories.length * 0.07}
            className="bg-accent rounded-xl p-5 flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <p className="text-text-inverse font-display font-bold text-subheading mb-2">
                Always learning
              </p>
              <p className="text-text-inverse/70 text-small">
                Currently exploring AI integration, edge computing & system design.
              </p>
            </div>
            <div className="mt-4 font-mono text-xs text-text-inverse/60">
              rezwoan@portfolio ~
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
