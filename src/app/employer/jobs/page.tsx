import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { setJobStatus } from '@/server/actions/job';
import { employmentTypeLabel, formatRelative } from '@/lib/format';
import { Button, ButtonLink, EmptyState, Sheet, Stamp, TitleBlock } from '@/components/ui';

export const metadata = { title: 'Manage listings' };

const STATUS_TONE = {
  DRAFT: 'current',
  PUBLISHED: 'approved',
  CLOSED: 'closed',
} as const;

export default async function EmployerJobsPage() {
  const user = await requireRole('EMPLOYER');

  const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
  if (!company) redirect('/employer/company');

  // Scoped to this company only — never a site-wide query.
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  });

  const live = jobs.filter((job) => job.status === 'PUBLISHED').length;

  return (
    <>
      <TitleBlock
        cells={[
          { label: 'Sheet', value: 'Listings' },
          { label: 'Total', value: String(jobs.length).padStart(3, '0') },
          { label: 'Live', value: String(live).padStart(3, '0') },
          { label: 'Employer', value: company.name },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <ButtonLink href="/employer/jobs/new">Post a listing</ButtonLink>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No listings issued yet">
          <p>Your first listing takes about a minute.</p>
          <ButtonLink href="/employer/jobs/new" className="mt-5">
            Post a listing
          </ButtonLink>
        </EmptyState>
      ) : (
        <Sheet className="border-t-2 border-t-ink">
          <ul>
            {jobs.map((job, index) => (
              <li
                key={job.id}
                className={`${index > 0 ? 'border-t border-rule' : ''} ${
                  job.status === 'CLOSED' ? 'hatched' : ''
                }`}
              >
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span className="data text-ink-3">{String(index + 1).padStart(2, '0')}</span>
                    <h2 className="min-w-0 flex-1 font-semibold leading-snug">{job.title}</h2>
                    <Stamp tone={STATUS_TONE[job.status]}>{job.status}</Stamp>
                  </div>

                  <p className="data mt-1.5 pl-8 text-ink-3">
                    {employmentTypeLabel(job.employmentType)}
                    {job.location ? ` · ${job.location}` : ''}
                    {job.publishedAt ? ` · issued ${formatRelative(job.publishedAt)}` : ''}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                    <Link
                      href={`/employer/jobs/${job.id}/applicants`}
                      className="lettering border border-ink px-4 py-2 transition-colors duration-150 hover:bg-ink hover:text-sheet"
                    >
                      {job._count.applications} applicant
                      {job._count.applications === 1 ? '' : 's'}
                    </Link>

                    {job.status === 'PUBLISHED' && (
                      <ButtonLink href={`/jobs/${job.slug}`} variant="quiet">
                        View
                      </ButtonLink>
                    )}
                    <ButtonLink href={`/employer/jobs/${job.id}/edit`} variant="quiet">
                      Revise
                    </ButtonLink>

                    {/* Plain form posts, so status changes work without JavaScript. */}
                    {job.status !== 'PUBLISHED' ? (
                      <form action={setJobStatus}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="status" value="PUBLISHED" />
                        <Button type="submit">
                          {job.status === 'DRAFT' ? 'Publish' : 'Reopen'}
                        </Button>
                      </form>
                    ) : (
                      <form action={setJobStatus}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="status" value="CLOSED" />
                        <Button type="submit" variant="danger">
                          Close
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  );
}
