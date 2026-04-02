import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { getSiteSettings, getSkills, getExperiences } from "@/lib/api";
import ExperienceSection from "@/components/sections/ExperienceSection";
import SkillsSection from "@/components/sections/SkillsSection";
import FadeUp from "@/components/animations/FadeUp";
import TextReveal from "@/components/animations/TextReveal";
import MagneticButton from "@/components/ui/MagneticButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "Full Stack Developer and CSE student at AIUB. I build web products with Next.js, Django, and Python.",
};

export default async function AboutPage() {
  const [settings, skills, experiences] = await Promise.allSettled([
    getSiteSettings(),
    getSkills(),
    getExperiences(),
  ]);

  const s = settings.status === "fulfilled" ? settings.value : null;
  const allSkills = skills.status === "fulfilled" ? skills.value : [];
  const allExperiences = experiences.status === "fulfilled" ? experiences.value : [];

  return (
    <>
      {/* Hero */}
      <div className="container-site section pt-8 pb-0">
        <FadeUp>
          <p className="section-label">About me</p>
        </FadeUp>
        <TextReveal
          text={s?.full_name ?? "Din Muhammad Rezwoan"}
          as="h1"
          className="text-display font-display mb-6"
          delay={0.05}
        />

        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-start">
          <FadeUp delay={0.15} className="max-w-2xl space-y-4">
            {s?.bio_long ? (
              <div
                className="text-body text-text-secondary leading-relaxed prose prose-invert prose-p:text-text-secondary max-w-none"
                dangerouslySetInnerHTML={{ __html: s.bio_long }}
              />
            ) : (
              <>
                <p className="text-body text-text-secondary leading-relaxed">
                  I&apos;m a full-stack developer and final-year CSE student at American International
                  University Bangladesh (AIUB). I build production web products — from idea to deployment
                  — using Next.js, Django, TypeScript, and PostgreSQL.
                </p>
                <p className="text-body text-text-secondary leading-relaxed">
                  When I&apos;m not building client projects on Fiverr or working on course projects, I&apos;m
                  self-hosting services on my Raspberry Pi 5, contributing to open-source, and learning
                  about system design and AI integration.
                </p>
                <p className="text-body text-text-secondary leading-relaxed">
                  I care deeply about performance, accessibility, and code maintainability. I believe
                  great software should be as clean under the hood as it is on the surface.
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <MagneticButton strength={0.3}>
                <Link href="/contact" className="btn-accent">
                  Work with me
                </Link>
              </MagneticButton>
              <a
                href={s?.resume_pdf_url || "/Rezwoan_CV.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                  <Download size={15} /> Download rÃ©sumÃ©
              </a>
            </div>
          </FadeUp>

          {/* Info card */}
          <FadeUp delay={0.25} className="w-full lg:w-72 shrink-0">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-display font-bold text-subheading">Quick info</h2>
              <dl className="space-y-3">
                {[
                  { label: "Based in", value: "Dhaka, Bangladesh" },
                  { label: "Studying", value: "CSE @ AIUB (2027)" },
                  { label: "Freelancing", value: "Fiverr · rezwoanfaisal" },
                  { label: "Languages", value: "Bengali, English" },
                  {
                    label: "Status",
                    value: s?.available_for_work ? "Open to work" : "Not available",
                    accent: s?.available_for_work,
                  },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between gap-4 text-small">
                    <dt className="text-text-muted shrink-0">{label}</dt>
                    <dd className={accent ? "text-success font-medium" : "text-text-primary text-right"}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="pt-3 border-t border-border space-y-1.5">
                {[
                  s?.github_url && { label: "GitHub", href: s.github_url },
                  s?.linkedin_url && { label: "LinkedIn", href: s.linkedin_url },
                  s?.fiverr_url && { label: "Fiverr", href: s.fiverr_url },
                ].filter(Boolean).map((link) => link && (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-small text-text-muted hover:text-accent transition-colors duration-micro group"
                  >
                    {link.label}
                    <ArrowUpRight size={13} className="transition-transform duration-micro group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      <SkillsSection skills={allSkills} />
      <ExperienceSection experiences={allExperiences} />
    </>
  );
}
