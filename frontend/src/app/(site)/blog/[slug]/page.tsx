import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { getBlogPost, getBlogList } from '@/lib/api';
import { Markdown } from '@/components/ui/markdown';
import { FadeUp } from '@/components/animations';
import { pageMetadata, buildOgUrl, SITE_URL } from '@/lib/seo';
import { formatDate, mediaUrl } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { items } = await getBlogList();
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const p = await getBlogPost(params.slug);
    return pageMetadata({
      title: p.seoTitle || p.title,
      description: p.seoDescription || p.excerpt,
      path: `/blog/${p.slug}`,
      ogImage: p.coverImageUrl ? mediaUrl(p.coverImageUrl) : buildOgUrl(p.title, 'blog', p.excerpt),
      ogType: 'article',
    });
  } catch {
    return pageMetadata({ title: 'Article', description: 'Blog post.' });
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getBlogPost(params.slug);
  } catch {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: 'Din Muhammad Rezwoan', url: SITE_URL },
    image: post.coverImageUrl ? mediaUrl(post.coverImageUrl) : buildOgUrl(post.title, 'blog'),
  };

  return (
    <article className="container-page section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
            <ArrowLeft size={14} /> All posts
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs text-text-muted">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readingTime} min read</span>
          </div>
          <h1 className="mt-3 text-display font-bold">{post.title}</h1>
          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
            </div>
          )}
        </FadeUp>

        {post.coverImageUrl && (
          <FadeUp className="mt-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
              <Image src={mediaUrl(post.coverImageUrl)} alt={post.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
            </div>
          </FadeUp>
        )}

        <FadeUp className="mt-10">
          <Markdown content={post.body} />
        </FadeUp>
      </div>
    </article>
  );
}
