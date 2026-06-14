import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/lib/api';
import { ProjectCard } from '@/components/ui/project-card';
import { SectionHeader } from '@/components/ui/section-header';
import { StaggerChildren, StaggerItem } from '@/components/animations';

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="section">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Selected work" title="Projects I'm proud of" />
          <Link href="/projects" className="hidden shrink-0 items-center gap-1 text-sm text-accent md:inline-flex">
            All projects <ArrowRight size={14} />
          </Link>
        </div>
        <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
