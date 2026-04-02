import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, getAllBlogSlugs, getSiteSettings } from "@/lib/api";
import { buildBlogMetadata, buildBlogSchema, jsonLd } from "@/lib/seo";
import FadeUp from "@/components/animations/FadeUp";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.allSettled([
    getBlogPost(slug),
    getSiteSettings(),
  ]);
  if (post.status !== "fulfilled") return { title: "Post not found" };
  if (settings.status !== "fulfilled") return { title: post.value.title };
  return buildBlogMetadata(post.value, settings.value);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.allSettled([
    getBlogPost(slug),
    getSiteSettings(),
  ]);

  if (post.status !== "fulfilled") notFound();
  const p = post.value;
  const s = settings.status === "fulfilled" ? settings.value : null;

  return (
    <>
      {s && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(buildBlogSchema(p, s)) }}
        />
      )}

      <article className="container-site section pt-8">
        <FadeUp>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-small text-text-muted hover:text-accent transition-colors duration-micro mb-8 group"
          >
            <ArrowLeft size={14} className="transition-transform duration-micro group-hover:-translate-x-1" />
            All posts
          </Link>
        </FadeUp>

        <div className="max-w-2xl">
          {/* Meta */}
          <FadeUp delay={0.05} className="flex flex-wrap items-center gap-3 mb-4">
            <time className="text-xs text-text-muted font-mono" dateTime={p.published_date}>
              {formatDate(p.published_date)}
            </time>
            <span className="text-border">·</span>
            <span className="text-xs text-text-muted font-mono">{p.reading_time} min read</span>
            {p.tags.map((tag) => (
              <span key={tag} className="tech-tag text-[10px]">{tag}</span>
            ))}
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-display font-display mb-5 leading-tight">{p.title}</h1>
          </FadeUp>

          {p.excerpt && (
            <FadeUp delay={0.15}>
              <p className="text-subheading text-text-secondary leading-relaxed mb-8 border-l-2 border-accent pl-4">
                {p.excerpt}
              </p>
            </FadeUp>
          )}
        </div>

        {/* Cover image */}
        {p.cover_image && (
          <FadeUp delay={0.2} className="mb-10 rounded-xl overflow-hidden border border-border max-w-3xl">
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

        {/* Body */}
        <FadeUp delay={0.25} className="max-w-2xl">
          {p.body && Array.isArray(p.body) && p.body.length > 0 ? (
            <div className="space-y-6">
              {(p.body as { type: string; value: unknown }[]).map((block, i) => {
                if (block.type === "text") {
                  return (
                    <div
                      key={i}
                      className="prose prose-invert prose-p:text-text-secondary prose-p:leading-relaxed prose-headings:font-display prose-headings:text-text-primary prose-a:text-accent prose-a:underline prose-a:underline-offset-2 prose-strong:text-text-primary prose-code:text-accent prose-code:font-mono max-w-none"
                      dangerouslySetInnerHTML={{ __html: block.value as string }}
                    />
                  );
                }
                if (block.type === "code") {
                  const v = block.value as { language: string; code: string };
                  return (
                    <div key={i}>
                      {v.language && (
                        <div className="flex items-center gap-2 bg-surface-raised px-4 py-2 rounded-t-lg border border-border border-b-0">
                          <span className="text-xs font-mono text-text-muted">{v.language}</span>
                        </div>
                      )}
                      <pre className={`bg-surface border border-border ${v.language ? "rounded-b-lg rounded-t-none" : "rounded-lg"} p-4 overflow-x-auto`}>
                        <code className="text-small font-mono text-text-secondary">{v.code}</code>
                      </pre>
                    </div>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote key={i} className="border-l-2 border-accent pl-5 py-1">
                      <p className="text-subheading text-text-secondary italic">{block.value as string}</p>
                    </blockquote>
                  );
                }
                if (block.type === "callout") {
                  const v = block.value as { type: string; text: string };
                  const colors: Record<string, string> = {
                    info: "border-info/30 bg-info/5 text-info",
                    warning: "border-warning/30 bg-warning/5 text-warning",
                    tip: "border-accent/30 bg-accent/5 text-accent",
                  };
                  return (
                    <div key={i} className={`border rounded-lg p-4 ${colors[v.type] ?? colors.info}`}>
                      <span className="text-xs font-mono font-bold uppercase tracking-wide mb-2 block">
                        {v.type}
                      </span>
                      <div dangerouslySetInnerHTML={{ __html: v.text }} />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p className="text-text-muted text-small font-mono">
              // Post content — add body via the Wagtail admin StreamField editor
            </p>
          )}

          {/* Author footer */}
          <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-muted border border-accent/20 flex items-center justify-center text-sm font-bold text-accent">
              {s?.short_name?.slice(0, 1) ?? "R"}
            </div>
            <div>
              <div className="text-small font-medium">{s?.full_name ?? "Rezwoan"}</div>
              <div className="text-xs text-text-muted">Full Stack Developer · AIUB</div>
            </div>
          </div>
        </FadeUp>
      </article>
    </>
  );
}
