import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowUpRight } from 'lucide-react';
import { getBlogList } from '@/lib/api';
import { FadeUp, StaggerChildren, StaggerItem } from '@/components/animations';
import { pageMetadata } from '@/lib/seo';
import { formatDate, mediaUrl } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Blog',
  description: 'Articles on web development, Next.js, NestJS, self-hosting and building products — by Rezwoan.',
  path: '/blog',
});

export default async function BlogPage() {
  const { items } = await getBlogList();

  return (
    <div className="container-page section">
      <FadeUp>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
          <span className="h-px w-6 bg-accent" /> Writing
        </p>
        <h1 className="text-display font-bold">Blog</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Notes on building, shipping and self-hosting modern web apps.
        </p>
      </FadeUp>

      {items.length ? (
        <StaggerChildren className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <StaggerItem key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="card group flex h-full flex-col overflow-hidden hover:border-accent/40"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-bg-raised">
                  {post.coverImageUrl ? (
                    <Image src={mediaUrl(post.coverImageUrl)} alt={post.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readingTime} min</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold transition-colors group-hover:text-accent">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-secondary">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">Read <ArrowUpRight size={14} /></span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <p className="mt-12 text-text-muted">No posts yet — articles are on the way.</p>
      )}
    </div>
  );
}
