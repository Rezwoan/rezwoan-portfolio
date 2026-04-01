import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getBlogPosts } from "@/lib/api";
import FadeUp from "@/components/animations/FadeUp";
import TextReveal from "@/components/animations/TextReveal";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on web development, Django, Next.js, self-hosting, and building software products.",
};

export default async function BlogPage() {
  const data = await getBlogPosts().catch(() => ({ results: [], count: 0, next: null, previous: null }));
  const posts = data.results;

  return (
    <div className="container-site section pt-8">
      <FadeUp>
        <p className="section-label">Writing</p>
      </FadeUp>
      <TextReveal text="Thoughts & tutorials" as="h1" className="text-display font-display mb-4" delay={0.05} />
      <FadeUp delay={0.2}>
        <p className="text-body text-text-secondary max-w-xl mb-12">
          Notes on building things, learning in public, and shipping software that works.
        </p>
      </FadeUp>

      {posts.length === 0 ? (
        <FadeUp delay={0.2}>
          <div className="py-20 text-center text-text-muted">
            <p className="font-mono text-small mb-2">// No posts yet</p>
            <p className="text-xs">
              Create a Blog Index page and add Blog Posts via the Wagtail admin at{" "}
              <code>/cms/</code>
            </p>
          </div>
        </FadeUp>
      ) : (
        <div className="grid gap-5">
          {posts.map((post, i) => (
            <FadeUp key={post.id} delay={i * 0.06}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col md:flex-row gap-5 bg-surface border border-border rounded-xl p-5 hover:border-[#333] transition-colors duration-ui"
              >
                {/* Thumbnail */}
                {post.cover_image ? (
                  <div className="md:w-48 h-32 md:h-auto rounded-lg overflow-hidden bg-surface-raised shrink-0">
                    <Image
                      src={post.cover_image.url}
                      alt={post.cover_image.alt_text || post.title}
                      width={192}
                      height={128}
                      className="w-full h-full object-cover transition-transform duration-page group-hover:scale-[1.04]"
                    />
                  </div>
                ) : (
                  <div className="md:w-48 h-32 md:h-auto rounded-lg bg-surface-raised flex items-center justify-center text-2xl font-display font-bold text-border shrink-0">
                    {post.title.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <time className="text-xs text-text-muted font-mono" dateTime={post.published_date}>
                      {formatDate(post.published_date)}
                    </time>
                    <span className="text-border">·</span>
                    <span className="text-xs text-text-muted font-mono">{post.reading_time} min read</span>
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tech-tag text-[10px]">{tag}</span>
                    ))}
                  </div>
                  <h2 className="font-display font-bold text-subheading mb-2 group-hover:text-accent transition-colors duration-micro line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-small text-text-secondary leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-small text-text-muted group-hover:text-accent transition-colors duration-micro">
                    Read article <ArrowUpRight size={13} />
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
