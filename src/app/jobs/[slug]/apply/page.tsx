import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { employmentTypeLabel, formatSalary } from '@/lib/format';
import { TitleBlock } from '@/components/ui';
import { ApplyForm } from './ApplyForm';

export const metadata = { title: 'Apply' };

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();

  // Employers land here only by typing the URL — send them somewhere useful.
  if (user.role !== 'SEEKER') redirect('/jobs');

  const job = await prisma.job.findUnique({
    where: { slug },
    include: { company: { select: { name: true } } },
  });

  if (!job || job.status !== 'PUBLISHED') notFound();

  // Already applied? Don't show a form that can only fail.
  const existing = await prisma.application.findUnique({
    where: { jobId_seekerId: { jobId: job.id, seekerId: user.id } },
  });
  if (existing) redirect('/seeker/applications');

  const profile = await prisma.seekerProfile.findUnique({
    where: { userId: user.id },
    select: { resumeFilename: true },
  });

  const salary = formatSalary(job);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/jobs/${job.slug}`}
        className="lettering mb-4 inline-block text-ink-3 transition-colors duration-150 hover:text-markup-ink"
      >
        ← Back to the listing
      </Link>

      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Form', value: 'Application' },
          { label: 'Role', value: job.title },
          { label: 'Employer', value: job.company.name },
        ]}
      />

      <div className="border-x border-rule bg-paper px-4 py-3">
        <p className="data text-ink-3">
          {employmentTypeLabel(job.employmentType)}
          {job.isRemote ? ' · Remote' : job.location ? ` · ${job.location}` : ''}
          {salary ? ` · ${salary}` : ''}
        </p>
      </div>

      <ApplyForm jobId={job.id} resumeFilename={profile?.resumeFilename ?? null} />
    </div>
  );
}
