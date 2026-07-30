import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from './validation/job';

/**
 * "₹8,00,000 - ₹12,00,000 / year", or null when no salary was given.
 * Uses Indian digit grouping for INR, which is what most listings here use.
 */
export function formatSalary(job: {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
}): string | null {
  if (job.salaryMin === null && job.salaryMax === null) return null;

  const locale = job.salaryCurrency === 'INR' ? 'en-IN' : 'en-US';
  const format = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: job.salaryCurrency,
      maximumFractionDigits: 0,
    }).format(value);

  const period = job.salaryPeriod === 'MONTH' ? 'month' : 'year';

  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${format(job.salaryMin)} - ${format(job.salaryMax)} / ${period}`;
  }
  if (job.salaryMin !== null) return `From ${format(job.salaryMin)} / ${period}`;
  return `Up to ${format(job.salaryMax!)} / ${period}`;
}

export function formatDate(value: Date | string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "3 days ago" - friendlier than a date on a list of fresh listings. */
export function formatRelative(value: Date | string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(date);
}

export const employmentTypeLabel = (value: string) =>
  EMPLOYMENT_TYPE_LABELS[value as keyof typeof EMPLOYMENT_TYPE_LABELS] ?? value;

export const experienceLevelLabel = (value: string) =>
  EXPERIENCE_LEVEL_LABELS[value as keyof typeof EXPERIENCE_LEVEL_LABELS] ?? value;
