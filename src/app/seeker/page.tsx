import Link from 'next/link';

import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/db';
import { isTerminal } from '@/lib/applications';
import { formatRelative } from '@/lib/format';
import { ButtonLink, EmptyState, Sheet, TitleBlock } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';

export const metadata = { title: 'Dashboard' };

export default async function SeekerDashboard() {
  // Re-checked server-side even though proxy.ts already gated the route.
  const user = await requireRole('SEEKER');

  const [recent, savedCount, total, profile] = await Promise.all([
    prisma.application.findMany({
      where: { seekerId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { job: { include: { company: { select: { name: true } } } } },
    }),
    prisma.savedJob.count({ where: { userId: user.id } }),
    prisma.application.count({ where: { seekerId: user.id } }),
    prisma.seekerProfile.findUnique({
      where: { userId: user.id },
      select: { resumeFilename: true },
    }),
  ]);

  const openCount = recent.filter((a) => !isTerminal(a.status)).length;

  return (
    <>
      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Holder', value: user.name },
          { label: 'Applications', value: String(total).padStart(3, '0') },
          { label: 'Open', value: String(openCount).padStart(3, '0') },
          { label: 'Saved', value: String(savedCount).padStart(3, '0') },
        ]}
      />

      {!profile?.resumeFilename && (
        <div className="border-x border-b border-markup bg-markup-wash px-4 py-3">
          <p className="data text-markup-ink">
            No resume on your profile. Applications you send will not have one attached.{' '}
            <Link href="/seeker/profile" className="font-semibold underline underline-offset-4">
              Upload one
            </Link>
          </p>
        </div>
      )}

      {total === 0 ? (
        <div className="mt-8">
          <EmptyState title="No applications on record yet">
            <p>
              Every role you apply to here keeps a dated revision history you can
              check at any time.
            </p>
            <ButtonLink href="/jobs" className="mt-5">
              Browse the register
            </ButtonLink>
          </EmptyState>
        </div>
      ) : (
        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
            <h2 className="lettering text-ink-3">Latest revisions</h2>
            <Link
              href="/seeker/applications"
              className="lettering text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
            >
              All {total}
            </Link>
          </div>

          <Sheet>
            <ul>
              {recent.map((application, index) => (
                <li key={application.id} className={index > 0 ? 'border-t border-rule-soft' : ''}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/jobs/${application.job.slug}`}
                        className="font-semibold hover:text-markup-ink"
                      >
                        {application.job.title}
                      </Link>
                      <p className="data mt-1 text-ink-3">
                        {application.job.company.name} · updated{' '}
                        {formatRelative(application.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Sheet>
        </section>
      )}
    </>
  );
}
