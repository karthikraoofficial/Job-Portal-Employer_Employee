import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { updateJob } from '@/server/actions/job';
import { formatDate } from '@/lib/format';
import { JobForm } from '@/components/JobForm';
import { TitleBlock } from '@/components/ui';

export const metadata = { title: 'Revise listing' };

// `params` is a Promise in Next.js 16.
export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('EMPLOYER');
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, include: { company: true } });

  // Ownership check: another company's listing is a 404 here, not a 403, so
  // this page cannot be used to confirm that an id exists.
  if (!job || job.company.ownerId !== user.id) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/employer/jobs"
        className="lettering mb-4 inline-block text-ink-3 transition-colors duration-150 hover:text-markup-ink"
      >
        ← Back to listings
      </Link>

      <TitleBlock
        cells={[
          { label: 'Sheet', value: job.title },
          { label: 'Status', value: job.status },
          { label: 'Issued', value: job.publishedAt ? formatDate(job.publishedAt) : 'Unissued' },
          { label: 'Ref', value: job.slug.slice(0, 14).toUpperCase() },
        ]}
        className="mb-8"
      />

      <JobForm
        action={updateJob}
        submitLabel="Save revision"
        defaults={{
          jobId: job.id,
          title: job.title,
          description: job.description,
          location: job.location ?? '',
          isRemote: job.isRemote,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryMin: job.salaryMin?.toString() ?? '',
          salaryMax: job.salaryMax?.toString() ?? '',
          salaryPeriod: job.salaryPeriod,
        }}
      />
    </div>
  );
}
