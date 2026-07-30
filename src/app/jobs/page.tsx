import { Suspense } from 'react';
import Link from 'next/link';

import { getCurrentUser } from '@/lib/session';
import { searchJobs, PAGE_SIZE } from '@/lib/jobs/search';
import { jobSearchSchema } from '@/lib/validation/job';
import { JobCard } from '@/components/JobCard';
import { JobFilters } from '@/components/JobFilters';
import { EmptyState, Sheet, TitleBlock } from '@/components/ui';

export const metadata = {
  title: 'Register of openings',
  description: 'Open roles from companies hiring now.',
};

// `searchParams` is a Promise in Next.js 16.
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  // .catch() on each field means a malformed URL still renders results.
  const params = jobSearchSchema.parse(raw);

  const user = await getCurrentUser();
  // Seekers get jobs they dismissed or already applied to filtered out.
  const viewerId = user?.role === 'SEEKER' ? user.id : undefined;

  const { jobs, total, page, pageCount } = await searchJobs(params, viewerId);
  const firstIndex = (page - 1) * PAGE_SIZE + 1;

  return (
    <>
      <TitleBlock
        cells={[
          { label: 'Sheet', value: 'Register of openings' },
          { label: 'Entries', value: String(total).padStart(3, '0') },
          {
            label: 'Showing',
            value: total > 0 ? `${firstIndex}–${firstIndex + jobs.length - 1}` : '—',
          },
          { label: 'Sheet no.', value: pageCount > 0 ? `${page} of ${pageCount}` : '—' },
        ]}
        className="mb-8"
      />

      <Suspense fallback={null}>
        <JobFilters />
      </Suspense>

      {jobs.length === 0 ? (
        <EmptyState title="Nothing on the register matches">
          Try fewer specifications, or{' '}
          <Link
            href="/jobs"
            className="font-semibold text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
          >
            clear the search
          </Link>
          .
        </EmptyState>
      ) : (
        <>
          <Sheet className="border-t-2 border-t-ink">
            <ul>
              {jobs.map((job, index) => (
                <li key={job.id} className={index > 0 ? 'border-t border-rule' : ''}>
                  <JobCard job={job} index={firstIndex + index} />
                </li>
              ))}
            </ul>
          </Sheet>

          <Pagination page={page} pageCount={pageCount} params={raw} />
        </>
      )}
    </>
  );
}

function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | string[] | undefined>;
}) {
  if (pageCount <= 1) return null;

  // Keeps every active filter when moving between sheets.
  const linkTo = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && key !== 'page') next.set(key, value);
    }
    next.set('page', String(target));
    return `/jobs?${next.toString()}`;
  };

  const step =
    'lettering border border-ink px-5 py-3 transition-colors duration-150 hover:bg-ink hover:text-sheet';

  return (
    <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? (
        <Link href={linkTo(page - 1)} className={step}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <span className="lettering text-ink-3">
        Sheet {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={linkTo(page + 1)} className={step}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
