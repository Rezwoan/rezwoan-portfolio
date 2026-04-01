import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { getProject, getAllProjectSlugs, getSiteSettings } from "@/lib/api";
import { buildProjectMetadata, buildProjectSchema, jsonLd } from "@/lib/seo";
import FadeUp from "@/components/animations/FadeUp";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [project, settings] = await Promise.allSettled([
    getProject(params.slug),
    getSiteSettings(),
  ]);
  if (project.status !== "fulfilled") return { title: "Project not found" };
  if (settings.status !== "fulfilled") return { title: project.value.title };
  return buildProjectMetadata(project.value, settings.value);
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const [project, settings] = await Promise.allSettled([
    getProject(params.slug),
    getSiteSettings(),
  ]);

  if (project.status !== "fulfilled") notFound();
  const p = project.value;
  const s = settings.status === "fulfilled" ? settings.value : null;

  return (
    <>
      {s && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(buildProjectSchema(p, s)) }}
        />
      )}

      <article className="container-site section pt-8">
        {/* Back link */}
        <FadeUp>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-small text-text-muted hover:text-accent transition-colors duration-micro mb-8 group"
          >
            <ArrowLeft size={14} className="transition-transform duration-micro group-hover:-translate-x-1" />
            All projects
          </Link>
        </FadeUp>

        {/* Header */}
        <div className="max-w-3xl">
          <FadeUp delay={0.05}>
            <span className="tech-tag text-[10px] mb-4 inline-flex">{p.category}</span>
            <h1 className="text-display font-display mb-4">{p.title}</h1>
            <p className="text-subheading text-text-secondary leading-relaxed mb-6">
              {p.short_description}
            </p>
          </FadeUp>

          {/* Tech stack */}
          {p.tech_stack.length > 0 && (
            <FadeUp delay={0.1} className="flex flex-wrap gap-2 mb-6">
              {p.tech_stack.map((tag) => (
                <span
                  key={tag.name}
                  className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-mono font-medium bg-surface border border-border"
                  style={{ borderColor: `${tag.color}40`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </FadeUp>
          )}

          {/* Links */}
          <FadeUp delay={0.15} className="flex flex-wrap items-center gap-3 mb-10">
            {p.live_url && (
              <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="btn-accent">
                View live <ArrowUpRight size={15} />
              </a>
            )}
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <Github size={15} /> Source code
              </a>
            )}
          </FadeUp>
        </div>

        {/* Cover image */}
        {p.cover_image && (
          <FadeUp delay={0.2} className="mb-12 rounded-xl overflow-hidden border border-border">
            <Image
              src={p.cover_image.url}
              alt={p.cover_image.alt_text || p.title}
              width={p.cover_image.width}
              height={p.cover_image.height}
              className="w-full object-cover"
              priority
            />
          </FadeUp>
        )}

        {/* Body (StreamField rendered as HTML — enhanced in future phase) */}
        {p.body && Array.isArray(p.body) && p.body.length > 0 ? (
          <FadeUp delay={0.25} className="max-w-2xl">
            <div className="prose prose-invert prose-p:text-text-secondary prose-headings:font-display prose-a:text-accent max-w-none">
              {p.body.map((block: { type: string; value: unknown }, i: number) => {
                if (block.type === "text") {
                  return (
                    <div key={i} dangerouslySetInnerHTML={{ __html: block.value as string }} />
                  );
                }
                if (block.type === "code") {
                  const v = block.value as { language: string; code: string };
                  return (
                    <pre key={i} className="bg-surface border border-border rounded-lg p-4 overflow-x-auto">
                      <code className="text-small font-mono text-text-secondary">{v.code}</code>
                    </pre>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote key={i} className="border-l-2 border-accent pl-4 text-text-secondary italic my-6">
                      {block.value as string}
                    </blockquote>
                  );
                }
                return null;
              })}
            </div>
          </FadeUp>
        ) : (
          <FadeUp delay={0.25} className="max-w-2xl">
            <p className="text-text-muted text-small font-mono">
              // Case study content — add rich text via the Wagtail admin
            </p>
          </FadeUp>
        )}
      </article>
    </>
  );
}
