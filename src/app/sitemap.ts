import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/db';
import { siteUrl, sitemapEntries } from '@/lib/seo';

// Rendered per request rather than at build time: the build must not need a
// database (see docs/adr/0001), and new listings appear at once.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.job.findMany({
    // Same rule as the register: expired listings are no longer open.
    where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  });

  return sitemapEntries(jobs, siteUrl());
}
