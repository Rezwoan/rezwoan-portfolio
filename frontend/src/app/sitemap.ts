import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getProjects, getBlogList } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/projects', '/about', '/blog', '/contact'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  let dynamic: MetadataRoute.Sitemap = [];
  try {
    const [projects, blog] = await Promise.all([getProjects(), getBlogList()]);
    dynamic = [
      ...projects.map((p) => ({
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...blog.items.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt || p.createdAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // build-time with no API — static routes still ship
  }

  return [...staticRoutes, ...dynamic];
}
