import { afterEach, describe, expect, it, vi } from 'vitest';

import { jobPostingJsonLd, sitemapEntries, siteUrl } from './seo';

const baseJob = {
  title: 'Backend Engineer',
  slug: 'backend-engineer-acme',
  description: 'Build and run the payments API.',
  location: 'Bengaluru',
  isRemote: false,
  employmentType: 'FULL_TIME' as const,
  salaryMin: 1200000,
  salaryMax: 1800000,
  salaryCurrency: 'INR',
  salaryPeriod: 'YEAR',
  publishedAt: new Date('2026-10-01T09:00:00.000Z'),
  createdAt: new Date('2026-09-30T09:00:00.000Z'),
  expiresAt: new Date('2026-12-31T00:00:00.000Z'),
  company: { name: 'Acme', website: 'https://acme.example' },
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('siteUrl', () => {
  it('uses NEXT_PUBLIC_SITE_URL first, without a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://jobs.example.com/');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'job-portal.vercel.app');
    expect(siteUrl()).toBe('https://jobs.example.com');
  });

  it('falls back to the Vercel production domain over https', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'job-portal.vercel.app');
    expect(siteUrl()).toBe('https://job-portal.vercel.app');
  });

  it('falls back to localhost when nothing is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(siteUrl()).toBe('http://localhost:3000');
  });
});

describe('jobPostingJsonLd', () => {
  it('describes an on-site listing with a salary range', () => {
    expect(jobPostingJsonLd(baseJob, 'https://jobs.example.com')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: 'Backend Engineer',
      description: 'Build and run the payments API.',
      datePosted: '2026-10-01T09:00:00.000Z',
      validThrough: '2026-12-31T00:00:00.000Z',
      employmentType: 'FULL_TIME',
      url: 'https://jobs.example.com/jobs/backend-engineer-acme',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Acme',
        sameAs: 'https://acme.example',
      },
      jobLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: { '@type': 'QuantitativeValue', minValue: 1200000, maxValue: 1800000, unitText: 'YEAR' },
      },
    });
  });

  it('marks a remote listing as telecommute and leaves out a missing salary', () => {
    const result = jobPostingJsonLd(
      {
        ...baseJob,
        isRemote: true,
        location: null,
        employmentType: 'CONTRACT',
        salaryMin: null,
        salaryMax: null,
        expiresAt: null,
        company: { name: 'Acme', website: null },
      },
      'https://jobs.example.com'
    );

    expect(result.jobLocationType).toBe('TELECOMMUTE');
    expect(result.applicantLocationRequirements).toEqual({ '@type': 'Country', name: 'India' });
    expect(result.employmentType).toBe('CONTRACTOR');
    expect(result).not.toHaveProperty('jobLocation');
    expect(result).not.toHaveProperty('baseSalary');
    expect(result).not.toHaveProperty('validThrough');
    expect(result.hiringOrganization).toEqual({ '@type': 'Organization', name: 'Acme' });
  });

  it('maps internship and temporary roles to schema.org employment types', () => {
    const type = (employmentType: 'INTERNSHIP' | 'TEMPORARY' | 'PART_TIME') =>
      jobPostingJsonLd({ ...baseJob, employmentType }, 'https://x.test').employmentType;
    expect(type('INTERNSHIP')).toBe('INTERN');
    expect(type('TEMPORARY')).toBe('TEMPORARY');
    expect(type('PART_TIME')).toBe('PART_TIME');
  });

  it('gives a single figure when only a minimum salary is stated', () => {
    const result = jobPostingJsonLd(
      { ...baseJob, salaryMax: null, salaryPeriod: 'MONTH' },
      'https://x.test'
    );
    expect(result.baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: { '@type': 'QuantitativeValue', value: 1200000, unitText: 'MONTH' },
    });
  });
});

describe('sitemapEntries', () => {
  it('lists the home page, the register and each published listing', () => {
    const updated = new Date('2026-10-20T00:00:00.000Z');
    const entries = sitemapEntries([{ slug: 'backend-engineer-acme', updatedAt: updated }], 'https://x.test');

    expect(entries.map((e) => e.url)).toEqual([
      'https://x.test',
      'https://x.test/jobs',
      'https://x.test/jobs/backend-engineer-acme',
    ]);
    expect(entries[2].lastModified).toBe(updated);
    // The register is as fresh as its newest listing.
    expect(entries[1].lastModified).toBe(updated);
  });

  it('still lists the fixed pages when there are no listings', () => {
    expect(sitemapEntries([], 'https://x.test').map((e) => e.url)).toEqual([
      'https://x.test',
      'https://x.test/jobs',
    ]);
  });
});
