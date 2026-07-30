'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { uniqueSlug } from '@/lib/slug';
import { jobSchema } from '@/lib/validation/job';
import { type ActionState, toFieldErrors } from '@/lib/action-state';

/**
 * Loads a job and proves the signed-in employer owns it.
 *
 * Every employer action goes through this. Without it, changing the id in the
 * URL would let one company edit another company's listings.
 */
async function requireOwnedJob(jobId: string) {
  const user = await requireRole('EMPLOYER');

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job || job.company.ownerId !== user.id) {
    // Same response whether it does not exist or belongs to someone else, so
    // this cannot be used to discover which job ids are real.
    throw new Error('Job not found.');
  }

  return { user, job };
}

/** Reads and validates the job form. Numbers arrive as strings from FormData. */
function parseJobForm(formData: FormData) {
  const toNumber = (value: FormDataEntryValue | null) => {
    const text = String(value ?? '').trim();
    if (text === '') return undefined;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return jobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    isRemote: formData.get('isRemote') === 'on',
    employmentType: formData.get('employmentType'),
    experienceLevel: formData.get('experienceLevel'),
    salaryMin: toNumber(formData.get('salaryMin')),
    salaryMax: toNumber(formData.get('salaryMax')),
    salaryCurrency: formData.get('salaryCurrency') || 'INR',
    salaryPeriod: formData.get('salaryPeriod') || 'YEAR',
  });
}

export async function createJob(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole('EMPLOYER');

  const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
  if (!company) {
    return { error: 'Add your company details before posting a job.' };
  }

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  // Publish immediately, or save as a draft to finish later.
  const publish = formData.get('publish') === 'true';

  const slug = await uniqueSlug(`${parsed.data.title}-at-${company.name}`, async (candidate) =>
    Boolean(await prisma.job.findUnique({ where: { slug: candidate } }))
  );

  const job = await prisma.job.create({
    data: {
      ...parsed.data,
      slug,
      companyId: company.id,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath('/employer/jobs');
  revalidatePath('/jobs');
  redirect(`/employer/jobs?created=${job.id}`);
}

export async function updateJob(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const jobId = String(formData.get('jobId') ?? '');
  const { job } = await requireOwnedJob(jobId);

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  await prisma.job.update({
    where: { id: job.id },
    data: parsed.data,
  });

  revalidatePath('/employer/jobs');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${job.slug}`);
  return { ok: true };
}

/** Publish, close, or reopen a listing. */
export async function setJobStatus(formData: FormData) {
  const jobId = String(formData.get('jobId') ?? '');
  const status = String(formData.get('status') ?? '');

  if (status !== 'DRAFT' && status !== 'PUBLISHED' && status !== 'CLOSED') {
    throw new Error('Invalid status.');
  }

  const { job } = await requireOwnedJob(jobId);

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status,
      // Stamp the publish date the first time it goes live, and keep it after.
      publishedAt: status === 'PUBLISHED' ? (job.publishedAt ?? new Date()) : job.publishedAt,
    },
  });

  revalidatePath('/employer/jobs');
  revalidatePath('/jobs');
  revalidatePath(`/jobs/${job.slug}`);
}

export async function deleteJob(formData: FormData) {
  const jobId = String(formData.get('jobId') ?? '');
  const { job } = await requireOwnedJob(jobId);

  await prisma.job.delete({ where: { id: job.id } });

  revalidatePath('/employer/jobs');
  revalidatePath('/jobs');
  redirect('/employer/jobs');
}
