import 'server-only';

import { prisma } from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';
import type { JobSearchParams } from '@/lib/validation/job';

export const PAGE_SIZE = 10;

export type JobSearchResult = Awaited<ReturnType<typeof searchJobs>>;

/**
 * Job search: keyword ranking + filters + pagination.
 *
 * Keyword matching uses PostgreSQL full-text search rather than a LIKE, so
 * "engineers" matches "engineer" and results come back ranked by relevance.
 *
 * Every value is passed as a bound parameter through Prisma.sql - never
 * interpolated into the string - so a search box cannot inject SQL.
 *
 * Scaling note: `to_tsvector` is computed per row at query time. That is fine
 * into the low tens of thousands of jobs. Beyond that, add a stored tsvector
 * column with a GIN index (needs a real migration - see the README).
 */
export async function searchJobs(params: JobSearchParams, viewerId?: string) {
  const conditions: Prisma.Sql[] = [
    // Only ever show live listings publicly. Drafts stay private to the employer.
    Prisma.sql`j.status = 'PUBLISHED'`,
    Prisma.sql`(j."expiresAt" IS NULL OR j."expiresAt" > NOW())`,
  ];

  const keywords = params.q?.trim();
  const hasKeywords = Boolean(keywords);

  // The document we search against: title, description, and company name.
  const document = Prisma.sql`
    to_tsvector('english',
      j.title || ' ' || j.description || ' ' || COALESCE(c.name, ''))
  `;
  const query = Prisma.sql`plainto_tsquery('english', ${keywords ?? ''})`;

  if (hasKeywords) {
    conditions.push(Prisma.sql`${document} @@ ${query}`);
  }

  if (params.location) {
    conditions.push(Prisma.sql`j.location ILIKE ${'%' + params.location + '%'}`);
  }
  if (params.type) {
    conditions.push(Prisma.sql`j."employmentType"::text = ${params.type}`);
  }
  if (params.level) {
    conditions.push(Prisma.sql`j."experienceLevel"::text = ${params.level}`);
  }
  if (params.remote === 'true') {
    conditions.push(Prisma.sql`j."isRemote" = true`);
  }
  if (params.minSalary !== undefined) {
    // Match on whichever salary bound the employer supplied.
    conditions.push(
      Prisma.sql`COALESCE(j."salaryMax", j."salaryMin") >= ${params.minSalary}`
    );
  }

  // Signed-in seekers never see jobs they dismissed or already applied to.
  if (viewerId) {
    conditions.push(Prisma.sql`
      NOT EXISTS (SELECT 1 FROM dismissed_job d
                  WHERE d."jobId" = j.id AND d."userId" = ${viewerId})
    `);
    conditions.push(Prisma.sql`
      NOT EXISTS (SELECT 1 FROM application a
                  WHERE a."jobId" = j.id AND a."seekerId" = ${viewerId})
    `);
  }

  const where = Prisma.join(conditions, ' AND ');

  // "Relevance" only means something when there are keywords to rank against.
  const orderBy =
    params.sort === 'relevance' && hasKeywords
      ? Prisma.sql`ts_rank(${document}, ${query}) DESC, j."publishedAt" DESC`
      : params.sort === 'salary'
        ? Prisma.sql`COALESCE(j."salaryMax", j."salaryMin", 0) DESC, j."publishedAt" DESC`
        : Prisma.sql`j."publishedAt" DESC NULLS LAST`;

  const offset = (params.page - 1) * PAGE_SIZE;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>`
      SELECT j.id
      FROM job j
      JOIN company c ON c.id = j."companyId"
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM job j
      JOIN company c ON c.id = j."companyId"
      WHERE ${where}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const ids = rows.map((row) => row.id);

  if (ids.length === 0) {
    return { jobs: [], total, page: params.page, pageCount: 0 };
  }

  // Fetch the full records through Prisma so we get typed results and the
  // company relation, then restore the ranking the SQL gave us.
  const jobs = await prisma.job.findMany({
    where: { id: { in: ids } },
    include: { company: { select: { name: true, slug: true, location: true } } },
  });

  const byId = new Map(jobs.map((job) => [job.id, job]));
  const ordered = ids.map((id) => byId.get(id)!).filter(Boolean);

  return {
    jobs: ordered,
    total,
    page: params.page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}
