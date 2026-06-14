import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rezwoan.me';
const NAME = 'Din Muhammad Rezwoan';
const SUFFIX = ' — Rezwoan';

export function buildOgUrl(title: string, type: 'home' | 'project' | 'blog' | 'default' = 'default', subtitle = '') {
  const params = new URLSearchParams({ title, type });
  if (subtitle) params.set('subtitle', subtitle);
  return `${SITE_URL}/og?${params.toString()}`;
}

interface PageMetaArgs {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

export function pageMetadata({ title, description, path = '', ogImage, ogType = 'website' }: PageMetaArgs): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(NAME) || title.endsWith('Rezwoan') ? title : `${title}${SUFFIX}`;
  const image = ogImage || buildOgUrl(title, 'default');
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: NAME,
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@XRezwoan',
      images: [image],
    },
  };
}

export function personJsonLd(s: {
  fullName: string;
  roleLine: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s.fullName,
    url: SITE_URL,
    jobTitle: s.roleLine,
    knowsAbout: ['Next.js', 'NestJS', 'React', 'TypeScript', 'Prisma', 'Node.js', 'Python'],
    sameAs: [s.githubUrl, s.linkedinUrl, s.twitterUrl].filter(Boolean),
  };
}
