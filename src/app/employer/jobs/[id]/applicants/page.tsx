import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { setApplicationStatus } from '@/server/actions/application';
import { formatDate, formatRelative } from '@/lib/format';
import { APPLICATION_STATUS_LABELS, EMPLOYER_STATUSES, PIPELINE, isTerminal } from '@/lib/applications';
import { Button, EmptyState, Sheet, TitleBlock } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';

export const metadata = { title: 'Applicants' };

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('EMPLOYER');
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, include: { company: true } });

  // Ownership check. Another company's listing is a 404 here, not a 403.
  if (!job || job.company.ownerId !== user.id) notFound();

  const applications = await prisma.application.findMany({
    where: { jobId: job.id },
    orderBy: { createdAt: 'desc' },
    include: {
      seeker: {
        select: {
          name: true,
          email: true,
          phone: true,
          seekerProfile: {
            select: { headline: true, location: true, experienceYears: true, skills: true },
          },
        },
      },
      events: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const counts = new Map<string, number>();
  for (const application of applications) {
    counts.set(application.status, (counts.get(application.status) ?? 0) + 1);
  }

  return (
    <>
      <Link
        href="/employer/jobs"
        className="lettering mb-4 inline-block text-ink-3 transition-colors duration-150 hover:text-markup-ink"
      >
        ← Back to listings
      </Link>

      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Listing', value: job.title },
          { label: 'Status', value: job.status },
          { label: 'Applicants', value: String(applications.length).padStart(3, '0') },
        ]}
      />

      {/* The funnel, ruled as a specification row rather than stat cards. */}
      {applications.length > 0 && (
        <dl className="grid grid-cols-2 border-x border-b-2 border-ink bg-sheet sm:grid-cols-5">
          {PIPELINE.map((stage, index) => (
            <div
              key={stage}
              className={`px-4 py-3 ${index > 0 ? 'sm:border-l sm:border-rule' : ''} ${
                index % 2 === 1 ? 'border-l border-rule sm:border-l' : ''
              } ${index > 1 ? 'border-t border-rule sm:border-t-0' : ''}`}
            >
              <dt className="lettering text-ink-3">{APPLICATION_STATUS_LABELS[stage]}</dt>
              <dd className="mt-1.5 text-xl font-semibold">
                {String(counts.get(stage) ?? 0).padStart(2, '0')}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8">
        {applications.length === 0 ? (
          <EmptyState title="No applications yet">
            {job.status === 'PUBLISHED'
              ? 'This listing is live — applicants will appear here as they apply.'
              : 'This listing is not published, so nobody can apply to it yet.'}
          </EmptyState>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => {
              const closed = isTerminal(application.status);
              const profile = application.seeker.seekerProfile;

              return (
                <Sheet key={application.id} className="border-t-2 border-t-ink">
                  <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold">{application.seeker.name}</h2>
                        <StatusBadge status={application.status} />
                      </div>
                      {profile?.headline && (
                        <p className="data mt-1.5 text-ink-2">{profile.headline}</p>
                      )}
                      <p className="data mt-1 text-ink-3">
                        Applied {formatDate(application.createdAt)}
                        {application.events[0] &&
                          application.events[0].toStatus !== 'APPLIED' &&
                          ` · updated ${formatRelative(application.events[0].createdAt)}`}
                      </p>
                    </div>
                  </div>

                  {/* Contact and particulars as title-block cells. */}
                  <dl className="grid grid-cols-1 border-y border-rule sm:grid-cols-3">
                    <div className="border-rule px-4 py-3 sm:border-r">
                      <dt className="lettering text-ink-3">Email</dt>
                      <dd className="data mt-1.5 truncate">
                        <a
                          href={`mailto:${application.seeker.email}`}
                          className="font-semibold text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
                        >
                          {application.seeker.email}
                        </a>
                      </dd>
                    </div>
                    <div className="border-t border-rule px-4 py-3 sm:border-r sm:border-t-0">
                      <dt className="lettering text-ink-3">Phone</dt>
                      <dd className="data mt-1.5">{application.seeker.phone ?? 'Not given'}</dd>
                    </div>
                    <div className="border-t border-rule px-4 py-3 sm:border-t-0">
                      <dt className="lettering text-ink-3">Experience</dt>
                      <dd className="data mt-1.5">
                        {profile?.experienceYears != null
                          ? `${profile.experienceYears} year${profile.experienceYears === 1 ? '' : 's'}`
                          : 'Not stated'}
                      </dd>
                    </div>
                  </dl>

                  <div className="px-5 py-5">
                    {profile?.skills && profile.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="lettering mb-2 text-ink-3">Skills</p>
                        <p className="data text-ink-2">{profile.skills.join(' · ')}</p>
                      </div>
                    )}

                    {application.resumeFilename ? (
                      <a
                        href={`/api/applications/${application.id}/resume`}
                        className="lettering inline-flex items-center gap-3 border border-ink px-4 py-2.5 transition-colors duration-150 hover:bg-ink hover:text-sheet"
                      >
                        Download resume
                        <span className="font-normal normal-case tracking-normal opacity-70">
                          {application.resumeFilename}
                        </span>
                      </a>
                    ) : (
                      <p className="data text-ink-3">No resume attached to this application.</p>
                    )}

                    {application.coverLetter && (
                      <details className="mt-4 border border-rule">
                        <summary className="lettering cursor-pointer px-4 py-3 text-ink-2 transition-colors duration-150 hover:bg-paper">
                          Cover letter
                        </summary>
                        <p className="prose-sheet border-t border-rule px-4 py-4 text-ink-2">
                          {application.coverLetter}
                        </p>
                      </details>
                    )}
                  </div>

                  {closed ? (
                    <p className="data border-t border-rule bg-paper px-5 py-3 text-ink-3">
                      This application is closed and can no longer be changed.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 border-t border-rule bg-paper px-5 py-4">
                      {EMPLOYER_STATUSES.filter((status) => status !== application.status).map(
                        (status) => (
                          // A plain form per action, so the pipeline works
                          // without JavaScript.
                          <form key={status} action={setApplicationStatus}>
                            <input type="hidden" name="applicationId" value={application.id} />
                            <input type="hidden" name="status" value={status} />
                            <Button
                              type="submit"
                              variant={status === 'REJECTED' ? 'danger' : 'secondary'}
                            >
                              {status === 'REJECTED'
                                ? 'Reject'
                                : APPLICATION_STATUS_LABELS[status]}
                            </Button>
                          </form>
                        )
                      )}
                    </div>
                  )}
                </Sheet>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
