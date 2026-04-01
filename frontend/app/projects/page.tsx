import type { Metadata } from "next";
import { getProjects, getSiteSettings } from "@/lib/api";
import ProjectCard from "@/components/ui/ProjectCard";
import FadeUp from "@/components/animations/FadeUp";
import TextReveal from "@/components/animations/TextReveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of web apps, tools, and open-source projects I've built.",
};

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "web", label: "Web Apps" },
  { value: "tool", label: "Tools" },
  { value: "open-source", label: "Open Source" },
];

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.allSettled([
    getProjects(),
    getSiteSettings(),
  ]);

  const allProjects = projects.status === "fulfilled" ? projects.value : [];

  return (
    <div className="container-site section pt-8">
      <FadeUp>
        <p className="section-label">Portfolio</p>
      </FadeUp>
      <TextReveal text="Things I've built" as="h1" className="text-display font-display mb-4" delay={0.05} />
      <FadeUp delay={0.2}>
        <p className="text-body text-text-secondary max-w-xl mb-12">
          {allProjects.length} projects spanning web apps, automation tools, SaaS products, and open-source work.
        </p>
      </FadeUp>

      {allProjects.length === 0 ? (
        <FadeUp delay={0.2}>
          <div className="py-20 text-center text-text-muted">
            <p className="font-mono text-small mb-2">// No projects yet</p>
            <p className="text-xs">Add projects via the Wagtail admin at <code>/cms/</code></p>
          </div>
        </FadeUp>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
