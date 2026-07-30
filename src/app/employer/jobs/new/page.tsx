import { redirect } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { createJob } from '@/server/actions/job';
import { JobForm } from '@/components/JobForm';
import { TitleBlock } from '@/components/ui';

export const metadata = { title: 'Post a listing' };

export default async function NewJobPage() {
  const user = await requireRole('EMPLOYER');

  // A listing needs a company to belong to.
  const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
  if (!company) redirect('/employer/company');

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
          { label: 'Sheet', value: 'New listing' },
          { label: 'Employer', value: company.name },
          { label: 'Status', value: 'Unissued' },
        ]}
        className="mb-8"
      />

      <JobForm
        action={createJob}
        submitLabel="Post listing"
        showPublishToggle
        defaults={{
          title: '',
          description: '',
          location: company.location ?? '',
          isRemote: false,
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID',
          salaryMin: '',
          salaryMax: '',
          salaryPeriod: 'YEAR',
        }}
      />
    </div>
  );
}
