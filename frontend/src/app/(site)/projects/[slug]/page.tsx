import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Github, Star } from 'lucide-react';
import { getProject, getProjects } from '@/lib/api';
import { Markdown } from '@/components/ui/markdown';
import { FadeUp } from '@/components/animations';
import { pageMetadata, buildOgUrl, SITE_URL } from '@/lib/seo';
import { mediaUrl } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const p = await getProject(params.slug);
    return pageMetadata({
      title: p.seoTitle || p.title,
      description: p.seoDescription || p.shortDescription,
      path: `/projects/${p.slug}`,
      ogImage: p.seoOgImageUrl ? mediaUrl(p.seoOgImageUrl) : p.coverImageUrl ? mediaUrl(p.coverImageUrl) : buildOgUrl(p.title, 'project', p.shortDescription),
      ogType: 'article',
    });
  } catch {
    return pageMetadata({ title: 'Project', description: 'Project case study.' });
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  let project;
  try {
    project = await getProject(params.slug);
  } catch {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription,
    url: `${SITE_URL}/projects/${project.slug}`,
    author: { '@type': 'Person', name: 'Din Muhammad Rezwoan', url: SITE_URL },
    dateCreated: project.createdAt,
  };

  return (
    <article className="container-page section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FadeUp>
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={14} /> All projects
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="chip capitalize">{project.category}</span>
          {project.repoStars ? (
            <span className="chip"><Star size={12} className="text-accent" /> {project.repoStars} stars</span>
          ) : null}
          {project.repoLanguage && <span className="chip">{project.repoLanguage}</span>}
        </div>

        <h1 className="mt-4 max-w-3xl text-display font-bold">{project.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-text-secondary">{project.shortDescription}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Live site <ArrowUpRight size={16} />
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              <Github size={16} /> Source
            </a>
          )}
        </div>
      </FadeUp>

      {project.coverImageUrl && (
        <FadeUp className="mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
            <Image src={mediaUrl(project.coverImageUrl)} alt={project.title} fill className="object-cover" sizes="100vw" priority />
          </div>
        </FadeUp>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_260px]">
        <FadeUp>
          {project.body ? <Markdown content={project.body} /> : <p className="text-text-secondary">{project.shortDescription}</p>}
        </FadeUp>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Tech stack</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags?.map((t) => (
                <span key={t.name} className="rounded-sm px-2 py-0.5 text-xs" style={{ color: t.color, backgroundColor: `${t.color}1A` }}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
