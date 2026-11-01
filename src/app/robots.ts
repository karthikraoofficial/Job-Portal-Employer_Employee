import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/seo';

// Crawlers get the public register; dashboards, auth pages, apply forms and
// the API are private or useless in search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/seeker', '/employer', '/api/', '/login', '/register', '/jobs/*/apply'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
