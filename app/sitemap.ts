import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * The eight public routes. /admin and /api are excluded here and disallowed
 * in robots.txt.
 *
 * `lastModified` is the build time: every page is database-backed, so there
 * is no single content date to point at, and a redeploy is the closest honest
 * signal that something changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/doctors', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/tests', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
