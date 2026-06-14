import type { Metadata } from 'next';
import { getProjects } from '@/lib/api';
import { ProjectCard } from '@/components/ui/project-card';
import { FadeUp, StaggerChildren, StaggerItem } from '@/components/animations';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Work',
  description:
    'Selected projects by Din Muhammad Rezwoan — web apps, tools and SaaS MVPs built with Next.js, NestJS and TypeScript.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container-page section">
      <FadeUp>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
          <span className="h-px w-6 bg-accent" /> Portfolio
        </p>
        <h1 className="text-display font-bold">Things I&apos;ve built</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          A selection of projects — each one a real problem solved. Click any for the full case study.
        </p>
      </FadeUp>

      {projects.length ? (
        <StaggerChildren className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <p className="mt-12 text-text-muted">No projects published yet — check back soon.</p>
      )}
    </div>
  );
}
