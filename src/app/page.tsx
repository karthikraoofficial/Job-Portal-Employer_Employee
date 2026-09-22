import Link from 'next/link';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatRelative } from '@/lib/format';
import { ButtonLink, Sheet, TitleBlock } from '@/components/ui';

export default async function HomePage() {
  const user = await getCurrentUser();

  const [openJobs, companies, latest] = await Promise.all([
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.company.count(),
    prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { company: { select: { name: true } } },
    }),
  ]);

  const issued = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      {/* The thesis, stated as a drawing sheet's title block. */}
      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Ref', value: 'JP-REG-01' },
          { label: 'Issued', value: issued },
          { label: 'Openings', value: String(openJobs).padStart(3, '0') },
          { label: 'Employers', value: String(companies).padStart(3, '0') },
        ]}
      />

      <section className="border-x border-b-2 border-ink bg-sheet px-5 py-12 sm:px-10 sm:py-16">
        <h1 className="display max-w-[18ch]">
          Welcome to
          {/* markup as text is permitted at display scale only — 3.6:1 clears
              the 3:1 large-text threshold but would fail at body size. */}
          <span className="text-markup"> Karthik Rao&rsquo;s Job Portal</span>
        </h1>

        <p className="prose-sheet mt-6 text-ink-2">
          Simplifying your application process. Browse, apply, and track your progress with ease.
        </p>

        {/* The search, set as a labelled form entry on a 2px rule — a job board
            should let someone start searching from the first viewport. */}
        <form action="/jobs" method="get" className="mt-10 max-w-xl">
          <label htmlFor="q" className="lettering mb-2 block text-ink-3">
            Search the register
          </label>
          <div className="flex border-b-2 border-ink">
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Job title, skill, or company"
              className="min-w-0 flex-1 bg-transparent py-3 text-[1.0625rem] outline-none placeholder:text-ink-2/60 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
            />
            <button
              type="submit"
              className="lettering shrink-0 bg-markup px-6 text-ink transition-colors duration-150 hover:bg-markup-ink hover:text-sheet"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/jobs" variant="secondary">
            Browse all {openJobs}
          </ButtonLink>
          {!user && (
            <ButtonLink href="/register" variant="quiet">
              Post a listing
            </ButtonLink>
          )}
          {user?.role === 'EMPLOYER' && (
            <ButtonLink href="/employer/jobs/new" variant="quiet">
              Post a listing
            </ButtonLink>
          )}
        </div>
      </section>

      {/* Prove it: the actual revision table a candidate would see. */}
      <section className="mt-14">
        <h2 className="lettering mb-3 text-ink-3">What you see after applying</h2>
        <Sheet className="border-t-2 border-t-ink">
          <table className="w-full">
            <caption className="sr-only">
              An example of the revision history kept for every application
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="lettering px-4 py-3 text-left text-ink-3">
                  Rev
                </th>
                <th scope="col" className="lettering px-4 py-3 text-left text-ink-3">
                  Date
                </th>
                <th scope="col" className="lettering px-4 py-3 text-left text-ink-3">
                  Stage
                </th>
                <th scope="col" className="lettering hidden px-4 py-3 text-left text-ink-3 sm:table-cell">
                  By
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_REVISIONS.map((row, index) => {
                const current = index === EXAMPLE_REVISIONS.length - 1;
                return (
                  <tr
                    key={row.rev}
                    className={`border-b border-rule-soft last:border-b-0 ${
                      current ? 'border-l-2 border-l-markup bg-markup-wash' : ''
                    }`}
                  >
                    <td className="py-3 pl-3 pr-4">
                      <span
                        className={`rev-triangle ${
                          current ? 'bg-markup text-ink' : 'bg-ink-3/25 text-ink'
                        }`}
                      >
                        {row.rev}
                      </span>
                    </td>
                    <td className="data px-4 py-3">{row.date}</td>
                    <td className="data px-4 py-3 font-semibold">
                      <span className={current ? 'text-markup-ink' : ''}>{row.stage}</span>
                    </td>
                    <td className="data hidden px-4 py-3 text-ink-3 sm:table-cell">{row.by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Sheet>
        <p className="data mt-3 text-ink-3">
          Example history. Every application on this board keeps one.
        </p>
      </section>

      {/* The register itself, as evidence there is something to browse. */}
      {latest.length > 0 && (
        <section className="mt-14">
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="lettering text-ink-3">Latest on the register</h2>
            <Link
              href="/jobs"
              className="lettering text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
            >
              All {openJobs}
            </Link>
          </div>

          <Sheet className="border-t-2 border-t-ink">
            <ul>
              {latest.map((job, index) => (
                <li key={job.id} className={index > 0 ? 'border-t border-rule-soft' : ''}>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-4 transition-colors duration-150 hover:bg-paper"
                  >
                    <span className="data text-ink-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold group-hover:text-markup-ink">
                      {job.title}
                    </span>
                    <span className="data text-ink-3">{job.company.name}</span>
                    <span className="data text-ink-3">
                      {job.publishedAt ? formatRelative(job.publishedAt) : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Sheet>
        </section>
      )}
    </>
  );
}

// Illustrative only — labelled as an example in the UI above, never presented
// as a real candidate's history.
const EXAMPLE_REVISIONS = [
  { rev: 'A', date: '02 Jul 2026', stage: 'Applied', by: 'You' },
  { rev: 'B', date: '05 Jul 2026', stage: 'Shortlisted', by: 'Employer' },
  { rev: 'C', date: '11 Jul 2026', stage: 'Interviewing', by: 'Employer' },
];
