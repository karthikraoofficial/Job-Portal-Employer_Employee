import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import {
  employmentTypeLabel,
  experienceLevelLabel,
  formatDate,
  formatRelative,
  formatSalary,
} from '@/lib/format';
import { ButtonLink, Sheet, Stamp, TitleBlock } from '@/components/ui';

type Props = { params: Promise<{ slug: string }> };

async function getJob(slug: string) {
  return prisma.job.findUnique({ where: { slug }, include: { company: true } });
}

// Real per-listing titles and descriptions: this is what makes a job board
// findable on Google, and the reason these pages are server-rendered.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job || job.status !== 'PUBLISHED') return { title: 'Listing not found' };

  return {
    title: `${job.title} at ${job.company.name}`,
    description: job.description.slice(0, 155),
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const [job, user] = await Promise.all([getJob(slug), getCurrentUser()]);

  if (!job) notFound();

  // Drafts and closed roles stay private — except to the employer who owns
  // them, so they can proof their own sheet before issuing it.
  const isOwner = user?.id === job.company.ownerId;
  if (job.status !== 'PUBLISHED' && !isOwner) notFound();

  const salary = formatSalary(job);
  const alreadyApplied = user
    ? Boolean(
        await prisma.application.findUnique({
          where: { jobId_seekerId: { jobId: job.id, seekerId: user.id } },
        })
      )
    : false;

  return (
    <>
      <Link
        href="/jobs"
        className="lettering mb-4 inline-block text-ink-3 transition-colors duration-150 hover:text-markup-ink"
      >
        ← Back to the register
      </Link>

      <TitleBlock
        tone="dark"
        cells={[
          { label: 'Ref', value: job.slug.slice(0, 18).toUpperCase() },
          { label: 'Issued', value: job.publishedAt ? formatDate(job.publishedAt) : 'Unissued' },
          { label: 'Type', value: employmentTypeLabel(job.employmentType) },
          { label: 'Level', value: experienceLevelLabel(job.experienceLevel) },
        ]}
      />

      <div className="grid gap-0 border-x border-b-2 border-ink lg:grid-cols-[1fr_20rem]">
        {/* The drawing itself */}
        <div className="min-w-0 bg-sheet px-5 py-8 sm:px-8">
          {job.status !== 'PUBLISHED' && (
            <p className="data mb-5 border border-markup bg-markup-wash px-3 py-2.5 font-semibold text-markup-ink">
              This listing is {job.status.toLowerCase()} — only you can see it.
            </p>
          )}

          <h1 className="heading text-[clamp(1.75rem,4vw,2.5rem)]">{job.title}</h1>
          <p className="data mt-2 font-semibold text-ink-2">{job.company.name}</p>

          <dl className="mt-6 grid grid-cols-2 border-y border-rule sm:grid-cols-3">
            <Spec label="Location" value={job.isRemote ? 'Remote' : (job.location ?? 'Not stated')} />
            <Spec label="Salary" value={salary ?? 'Not stated'} border />
            <Spec
              label="Posted"
              value={job.publishedAt ? formatRelative(job.publishedAt) : '—'}
              className="max-sm:border-t max-sm:border-rule"
            />
          </dl>

          <div className="prose-sheet mt-8 text-ink-2">{job.description}</div>
        </div>

        {/* The action block, kept beside the drawing */}
        <aside className="border-t border-ink bg-paper px-5 py-8 sm:px-6 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-6">
            {alreadyApplied ? (
              <>
                <Stamp tone="approved">Applied</Stamp>
                <p className="data mt-3 text-ink-2">
                  Your application is on record. Every stage the employer moves you
                  through appears in its revision history.
                </p>
                <ButtonLink href="/seeker/applications" variant="secondary" className="mt-5 w-full">
                  View history
                </ButtonLink>
              </>
            ) : isOwner ? (
              <>
                <Stamp>Your listing</Stamp>
                <p className="data mt-3 text-ink-2">
                  You issued this sheet. Applicants appear on its own page.
                </p>
                <div className="mt-5 grid gap-2">
                  <ButtonLink href={`/employer/jobs/${job.id}/applicants`}>Applicants</ButtonLink>
                  <ButtonLink href={`/employer/jobs/${job.id}/edit`} variant="secondary">
                    Edit sheet
                  </ButtonLink>
                </div>
              </>
            ) : (
              <>
                <p className="lettering text-ink-3">Apply</p>
                <p className="data mt-2 text-ink-2">
                  {user
                    ? 'A cover letter and your stored resume. About a minute.'
                    : 'Sign in to apply. Registration takes four fields.'}
                </p>
                <ButtonLink
                  href={user ? `/jobs/${job.slug}/apply` : `/login?next=/jobs/${job.slug}`}
                  className="mt-5 w-full"
                >
                  {user ? 'Apply now' : 'Sign in to apply'}
                </ButtonLink>
              </>
            )}

            {job.company.description && (
              <div className="mt-8 border-t border-rule pt-5">
                <p className="lettering text-ink-3">About {job.company.name}</p>
                <p className="data mt-2 text-ink-2">{job.company.description}</p>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="data mt-3 inline-block font-semibold text-markup-ink underline decoration-rule underline-offset-4 hover:decoration-markup"
                  >
                    Company website ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function Spec({
  label,
  value,
  border,
  className = '',
}: {
  label: string;
  value: string;
  border?: boolean;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 first:pl-0 ${border ? 'border-l border-rule' : ''} ${className}`}>
      <dt className="lettering text-ink-3">{label}</dt>
      <dd className="data mt-1.5 font-semibold">{value}</dd>
    </div>
  );
}
