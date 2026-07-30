import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/db';
import { formatRelative } from '@/lib/format';
import { ButtonLink, EmptyState, Sheet, TitleBlock } from '@/components/ui';
import Link from 'next/link';

export const metadata = { title: 'Employer dashboard' };

export default async function EmployerDashboard() {
  const user = await requireRole('EMPLOYER');

  const company = await prisma.company.findUnique({
    where: { ownerId: user.id },
    include: { _count: { select: { jobs: true } } },
  });

  // A new employer has no company yet, and jobs cannot exist without one.
  if (!company) {
    return (
      <div className="max-w-2xl">
        <TitleBlock
          cells={[
            { label: 'Sheet', value: 'Company' },
            { label: 'Status', value: 'Not issued' },
          ]}
          className="mb-8"
        />
        <EmptyState title="Set up your company first">
          <p>Candidates see these details on every listing you publish.</p>
          <ButtonLink href="/employer/company" className="mt-5">
            Add company details
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const [publishedCount, applicationCount, recent] = await Promise.all([
    prisma.job.count({ where: { companyId: company.id, status: 'PUBLISHED' } }),
    // Scoped to this company's jobs only — never a site-wide count.
    prisma.application.count({ where: { job: { companyId: company.id } } }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        seeker: { select: { name: true } },
        job: { select: { id: true, title: true } },
      },
    }),
  ]);

  return (
    <>
      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Employer', value: company.name },
          { label: 'Listings', value: String(company._count.jobs).padStart(3, '0') },
          { label: 'Live', value: String(publishedCount).padStart(3, '0') },
          { label: 'Applicants', value: String(applicationCount).padStart(3, '0') },
        ]}
      />

      <div className="flex flex-wrap gap-3 border-x border-b-2 border-ink bg-sheet px-5 py-5">
        <ButtonLink href="/employer/jobs/new">Post a listing</ButtonLink>
        <ButtonLink href="/employer/jobs" variant="secondary">
          Manage listings
        </ButtonLink>
        <ButtonLink href="/employer/company" variant="quiet">
          Company details
        </ButtonLink>
      </div>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="lettering mb-3 border-b-2 border-ink pb-2 text-ink-3">
            Latest applicant activity
          </h2>
          <Sheet>
            <ul>
              {recent.map((application, index) => (
                <li key={application.id} className={index > 0 ? 'border-t border-rule-soft' : ''}>
                  <Link
                    href={`/employer/jobs/${application.job.id}/applicants`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3.5 transition-colors duration-150 hover:bg-paper"
                  >
                    <span className="font-semibold">{application.seeker.name}</span>
                    <span className="data min-w-0 flex-1 truncate text-ink-3">
                      {application.job.title}
                    </span>
                    <span className="data text-ink-3">
                      {formatRelative(application.updatedAt)}
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
