import type { MetadataRoute } from 'next';

// Everything search engines and link previews read about the site lives here,
// so the page files only say which page they are, not how SEO works.

export const SITE_NAME = "Karthik Rao's Job Portal";

export const SITE_DESCRIPTION =
  'Find jobs in India and remote roles, apply in minutes and track every application as a dated record. Employers post listings and manage applicants in one place.';

export const SITE_KEYWORDS = [
  'job portal',
  'job board',
  'jobs in India',
  'remote jobs',
  'find jobs',
  'apply for jobs',
  'job search',
  'track job applications',
  'job application tracker',
  'hiring',
  'recruitment',
  'post a job',
  'employer job posting',
  'applicant tracking',
  'full-time jobs',
  'internships',
];

/**
 * The site's public origin, with no trailing slash. NEXT_PUBLIC_SITE_URL wins;
 * on Vercel the production domain is used, so preview deploys still point
 * canonical URLs at production; locally it is localhost.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}

type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';

// schema.org names differ from ours for two of the five types.
const SCHEMA_EMPLOYMENT_TYPE: Record<EmploymentType, string> = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACTOR',
  INTERNSHIP: 'INTERN',
  TEMPORARY: 'TEMPORARY',
};

export type JobPostingInput = {
  title: string;
  slug: string;
  description: string;
  location: string | null;
  isRemote: boolean;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  publishedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  company: { name: string; website: string | null };
};

/**
 * schema.org JobPosting for a published listing. This is what Google reads
 * to show a listing in its job search results. The site serves India, so
 * on-site roles are placed in India and remote roles are open to applicants
 * there.
 */
export function jobPostingJsonLd(job: JobPostingInput, base: string): Record<string, unknown> {
  const { salaryMin, salaryMax } = job;
  const salaryValue =
    salaryMin !== null && salaryMax !== null
      ? { minValue: salaryMin, maxValue: salaryMax }
      : salaryMin !== null || salaryMax !== null
        ? { value: (salaryMin ?? salaryMax)! }
        : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: (job.publishedAt ?? job.createdAt).toISOString(),
    ...(job.expiresAt && { validThrough: job.expiresAt.toISOString() }),
    employmentType: SCHEMA_EMPLOYMENT_TYPE[job.employmentType],
    url: `${base}/jobs/${job.slug}`,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      ...(job.company.website && { sameAs: job.company.website }),
    },
    ...(job.isRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: 'India' },
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              ...(job.location && { addressLocality: job.location }),
              addressCountry: 'IN',
            },
          },
        }),
    ...(salaryValue && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          ...salaryValue,
          unitText: job.salaryPeriod === 'MONTH' ? 'MONTH' : 'YEAR',
        },
      },
    }),
  };
}

/** Sitemap rows: the home page, the register, then every published listing. */
export function sitemapEntries(
  jobs: { slug: string; updatedAt: Date }[],
  base: string
): MetadataRoute.Sitemap {
  const newest = jobs.reduce<Date | undefined>(
    (latest, job) => (!latest || job.updatedAt > latest ? job.updatedAt : latest),
    undefined
  );

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/jobs`, lastModified: newest, changeFrequency: 'hourly', priority: 0.9 },
    ...jobs.map((job) => ({
      url: `${base}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
