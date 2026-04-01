import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProjectCard from "@/components/ui/ProjectCard";
import FadeUp from "@/components/animations/FadeUp";
import type { Project } from "@/lib/api";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  return (
    <section className="section" id="work" aria-labelledby="projects-heading">
      <div className="container-site">
        <FadeUp>
          <p className="section-label">Selected work</p>
          <div className="flex items-end justify-between mb-10">
            <h2 id="projects-heading" className="text-display font-display">
              Things I&apos;ve built
            </h2>
            <Link
              href="/projects"
              className="hidden md:flex items-center gap-1.5 text-small text-text-muted hover:text-accent transition-colors duration-micro group"
            >
              All projects
              <ArrowRight size={14} className="transition-transform duration-micro group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              featured={i === 0}
            />
          ))}
        </div>

        <FadeUp delay={0.2} className="mt-8 flex justify-center md:hidden">
          <Link href="/projects" className="btn-ghost">
            All projects <ArrowRight size={16} />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
