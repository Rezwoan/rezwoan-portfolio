import { MetadataRoute } from 'next';
import { getAllProjectSlugs, getAllBlogSlugs } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rezwoan.me';

  try {
    const [projectSlugs, blogSlugs] = await Promise.all([
      getAllProjectSlugs(),
      getAllBlogSlugs(),
    ]).catch(() => [[], []]); // Fallback in case the API is down initially during build

    const projects: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const blogs: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const routes: MetadataRoute.Sitemap = ['', '/about', '/projects', '/blog', '/contact'].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.9,
    }));

    return [...routes, ...projects, ...blogs];
  } catch (error) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ];
  }
}
