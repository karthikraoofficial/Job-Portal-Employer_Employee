import Link from 'next/link';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { withdrawApplication } from '@/server/actions/application';
import { employmentTypeLabel, formatDate, formatSalary } from '@/lib/format';
import { isTerminal } from '@/lib/applications';
import { Alert, Button, ButtonLink, EmptyState, Sheet, TitleBlock } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationTimeline } from '@/components/ApplicationTimeline';

export const metadata = { title: 'My applications' };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole('SEEKER');
  const { applied } = await searchParams;

  const applications = await prisma.application.findMany({
    where: { seekerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      job: { include: { company: { select: { name: true } } } },
      events: { orderBy: { createdAt: 'desc' } },
    },
  });

  const open = applications.filter((application) => !isTerminal(application.status));

  return (
    <>
      <TitleBlock
        cells={[
          { label: 'Sheet', value: 'Applications' },
          { label: 'Total', value: String(applications.length).padStart(3, '0') },
          { label: 'Open', value: String(open.length).padStart(3, '0') },
          { label: 'Holder', value: user.name },
        ]}
        className="mb-8"
      />

      {applied && <Alert tone="ok">Application submitted. Its revision history starts below.</Alert>}

      {applications.length === 0 ? (
        <EmptyState title="No applications on record">
          <p>Browse the register and apply to the roles that fit.</p>
          <ButtonLink href="/jobs" className="mt-5">
            Browse the register
          </ButtonLink>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {applications.map((application, index) => {
            const salary = formatSalary(application.job);

            return (
              <Sheet key={application.id} className="border-t-2 border-t-ink">
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold leading-snug">
                        <Link
                          href={`/jobs/${application.job.slug}`}
                          className="hover:text-markup-ink"
                        >
                          {application.job.title}
                        </Link>
                      </h2>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="data mt-1.5 font-semibold text-ink-2">
                      {application.job.company.name}
                    </p>
                    <p className="data mt-1 text-ink-3">
                      {employmentTypeLabel(application.job.employmentType)}
                      {application.job.isRemote
                        ? ' · Remote'
                        : application.job.location
                          ? ` · ${application.job.location}`
                          : ''}
                      {salary ? ` · ${salary}` : ''}
                      {` · applied ${formatDate(application.createdAt)}`}
                    </p>
                  </div>

                  {!isTerminal(application.status) && (
                    <form action={withdrawApplication}>
                      <input type="hidden" name="applicationId" value={application.id} />
                      <Button type="submit" variant="quiet">
                        Withdraw
                      </Button>
                    </form>
                  )}
                </div>

                <div className="border-t border-rule px-5 py-5">
                  <ApplicationTimeline
                    status={application.status}
                    events={application.events}
                    animate={index === 0}
                  />
                </div>
              </Sheet>
            );
          })}
        </div>
      )}
    </>
  );
}
