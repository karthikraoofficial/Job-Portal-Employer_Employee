import Link from 'next/link';

import {
  employmentTypeLabel,
  experienceLevelLabel,
  formatRelative,
  formatSalary,
} from '@/lib/format';

type JobCardJob = {
  slug: string;
  title: string;
  location: string | null;
  isRemote: boolean;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  publishedAt: Date | null;
  company: { name: string };
};

/**
 * One entry in the register. Not a card in a grid — a ruled row on a sheet,
 * with its own miniature title block of specifications.
 */
export function JobCard({ job, index }: { job: JobCardJob; index?: number }) {
  const salary = formatSalary(job);

  const specs = [
    { label: 'Type', value: employmentTypeLabel(job.employmentType) },
    { label: 'Level', value: experienceLevelLabel(job.experienceLevel) },
    {
      label: 'Location',
      value: job.isRemote ? 'Remote' : (job.location ?? 'Not stated'),
    },
    { label: 'Salary', value: salary ?? 'Not stated' },
  ];

  return (
    <article className="group relative bg-sheet transition-colors duration-150 hover:bg-paper">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 pt-4 sm:px-5">
        {index !== undefined && (
          <span className="data text-ink-3">{String(index).padStart(2, '0')}</span>
        )}
        <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug">
          {/* The whole row is reachable through this one link. */}
          <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0 group-hover:text-markup-ink">
            {job.title}
          </Link>
        </h2>
        {job.publishedAt && (
          <span className="data text-ink-3">{formatRelative(job.publishedAt)}</span>
        )}
      </div>

      <p className="data px-4 pb-3 pt-1 font-semibold text-ink-2 sm:px-5">{job.company.name}</p>

      {/* Specifications, ruled like a title block rather than floating pills. */}
      <dl className="grid grid-cols-2 border-t border-rule-soft sm:grid-cols-4">
        {specs.map((spec, i) => (
          <div
            key={spec.label}
            className={`min-w-0 px-4 py-2.5 sm:px-5 ${i > 0 ? 'sm:border-l sm:border-rule-soft' : ''} ${
              i % 2 === 1 ? 'border-l border-rule-soft sm:border-l' : ''
            } ${i > 1 ? 'border-t border-rule-soft sm:border-t-0' : ''}`}
          >
            <dt className="lettering text-ink-3">{spec.label}</dt>
            <dd className="data mt-1 truncate">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
