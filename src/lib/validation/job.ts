import { z } from 'zod';

import { optionalFormText } from './form';

// Shared by the employer forms and the Server Actions that save them.

export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'TEMPORARY',
] as const;

export const EXPERIENCE_LEVELS = ['INTERN', 'ENTRY', 'MID', 'SENIOR', 'LEAD'] as const;

/** Human-readable labels, so the UI never shows FULL_TIME to a candidate. */
export const EMPLOYMENT_TYPE_LABELS: Record<(typeof EMPLOYMENT_TYPES)[number], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
};

export const EXPERIENCE_LEVEL_LABELS: Record<(typeof EXPERIENCE_LEVELS)[number], string> = {
  INTERN: 'Intern',
  ENTRY: 'Entry level',
  MID: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead / Principal',
};

// Optional fields use the shared helper so an absent field cannot fail validation.
const optionalText = (max: number) => optionalFormText(max);

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Enter your company name.').max(100),
  website: optionalFormText(200).refine(
    (value) => !value || /^https?:\/\/.+\..+/.test(value),
    { message: 'Enter a full URL, starting with http:// or https://' }
  ),
  location: optionalText(100),
  description: optionalText(2000),
});

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, 'Enter a job title.').max(120),
    description: z
      .string()
      .trim()
      .min(30, 'Describe the role in at least 30 characters.')
      .max(10000),
    location: optionalText(100),
    isRemote: z.boolean().default(false),
    employmentType: z.enum(EMPLOYMENT_TYPES, { message: 'Choose an employment type.' }),
    experienceLevel: z.enum(EXPERIENCE_LEVELS, { message: 'Choose an experience level.' }),
    salaryMin: z.number().int().min(0).max(100_000_000).optional(),
    salaryMax: z.number().int().min(0).max(100_000_000).optional(),
    salaryCurrency: z.string().trim().length(3).default('INR'),
    salaryPeriod: z.enum(['YEAR', 'MONTH']).default('YEAR'),
  })
  // Checked here rather than in the action, so the form and the server agree.
  .refine((data) => !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin, {
    message: 'The maximum salary must be greater than the minimum.',
    path: ['salaryMax'],
  });

export type CompanyInput = z.infer<typeof companySchema>;
export type JobInput = z.infer<typeof jobSchema>;

/**
 * Parses the /jobs query string. Everything is optional and anything invalid is
 * dropped rather than rejected - a bad URL should still show results, not an error.
 */
export const jobSearchSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  location: z.string().trim().max(100).optional().catch(undefined),
  type: z.enum(EMPLOYMENT_TYPES).optional().catch(undefined),
  level: z.enum(EXPERIENCE_LEVELS).optional().catch(undefined),
  remote: z.enum(['true', 'false']).optional().catch(undefined),
  minSalary: z.coerce.number().int().min(0).optional().catch(undefined),
  sort: z.enum(['relevance', 'recent', 'salary']).default('recent').catch('recent'),
  page: z.coerce.number().int().min(1).max(500).default(1).catch(1),
});

export type JobSearchParams = z.infer<typeof jobSearchSchema>;
