'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { requireRole, requireUser } from '@/lib/session';
import { applySchema, statusChangeSchema } from '@/lib/validation/application';
import { isTerminal } from '@/lib/applications';
import { type ActionState, toFieldErrors } from '@/lib/action-state';

/**
 * A seeker applies to a job.
 *
 * The application and its first history event are written in one transaction:
 * an application with no history would break the timeline, so either both rows
 * land or neither does.
 */
export async function applyToJob(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole('SEEKER');

  const parsed = applySchema.safeParse({
    jobId: formData.get('jobId'),
    coverLetter: formData.get('coverLetter'),
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const job = await prisma.job.findUnique({
    where: { id: parsed.data.jobId },
    select: { id: true, slug: true, status: true, expiresAt: true },
  });

  // You can only apply to a live listing - not a draft, not a closed one.
  if (!job || job.status !== 'PUBLISHED') {
    return { error: 'This job is no longer accepting applications.' };
  }
  if (job.expiresAt && job.expiresAt < new Date()) {
    return { error: 'This listing has expired.' };
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_seekerId: { jobId: job.id, seekerId: user.id } },
  });
  if (existing) {
    return { error: 'You have already applied to this job.' };
  }

  // Snapshot the resume as it is right now, so later profile edits don't
  // rewrite what the employer is reviewing.
  const profile = await prisma.seekerProfile.findUnique({
    where: { userId: user.id },
    select: { resumeKey: true, resumeFilename: true },
  });

  await prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: {
        jobId: job.id,
        seekerId: user.id,
        status: 'APPLIED',
        coverLetter: parsed.data.coverLetter,
        resumeKey: profile?.resumeKey ?? null,
        resumeFilename: profile?.resumeFilename ?? null,
      },
    });

    await tx.applicationEvent.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: 'APPLIED',
        actorId: user.id,
      },
    });
  });

  revalidatePath('/seeker');
  revalidatePath('/seeker/applications');
  revalidatePath('/jobs');
  redirect('/seeker/applications?applied=1');
}

/**
 * An employer moves an applicant along the pipeline.
 *
 * Ownership is proven through the job's company before anything is written -
 * a Server Action is a public endpoint, so the applicationId alone is not trusted.
 */
export async function setApplicationStatus(formData: FormData) {
  const user = await requireRole('EMPLOYER');

  const parsed = statusChangeSchema.safeParse({
    applicationId: formData.get('applicationId'),
    status: formData.get('status'),
    note: formData.get('note'),
  });

  if (!parsed.success) {
    throw new Error('Invalid status change.');
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { job: { include: { company: true } } },
  });

  if (!application || application.job.company.ownerId !== user.id) {
    throw new Error('Application not found.');
  }

  // A hired, rejected or withdrawn application is finished. Reopening it would
  // make the audit trail meaningless.
  if (isTerminal(application.status)) {
    throw new Error('This application is already closed.');
  }

  if (application.status === parsed.data.status) {
    return; // Nothing changed - don't write a misleading history row.
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: { status: parsed.data.status },
    });

    await tx.applicationEvent.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: parsed.data.status,
        note: parsed.data.note,
        actorId: user.id,
      },
    });
  });

  revalidatePath(`/employer/jobs/${application.jobId}/applicants`);
  revalidatePath('/seeker/applications');
}

/** A seeker withdraws their own application. */
export async function withdrawApplication(formData: FormData) {
  const user = await requireRole('SEEKER');
  const applicationId = String(formData.get('applicationId') ?? '');

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  // Only your own application, and only one that is still open.
  if (!application || application.seekerId !== user.id) {
    throw new Error('Application not found.');
  }
  if (isTerminal(application.status)) {
    throw new Error('This application is already closed.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: { status: 'WITHDRAWN' },
    });

    await tx.applicationEvent.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: 'WITHDRAWN',
        actorId: user.id,
      },
    });
  });

  revalidatePath('/seeker/applications');
  revalidatePath(`/employer/jobs/${application.jobId}/applicants`);
}

/** Bookmark a job, or remove the bookmark if it is already saved. */
export async function toggleSavedJob(formData: FormData) {
  const user = await requireRole('SEEKER');
  const jobId = String(formData.get('jobId') ?? '');

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedJob.create({ data: { userId: user.id, jobId } });
  }

  revalidatePath('/seeker');
  revalidatePath('/seeker/saved');
}

/** Hide a job from this seeker's search results. */
export async function dismissJob(formData: FormData) {
  const user = await requireRole('SEEKER');
  const jobId = String(formData.get('jobId') ?? '');

  await prisma.dismissedJob.upsert({
    where: { userId_jobId: { userId: user.id, jobId } },
    update: {},
    create: { userId: user.id, jobId },
  });

  revalidatePath('/jobs');
}

/** Undo a dismissal, so the job comes back into search results. */
export async function undismissJob(formData: FormData) {
  const user = await requireUser();
  const jobId = String(formData.get('jobId') ?? '');

  await prisma.dismissedJob.deleteMany({ where: { userId: user.id, jobId } });
  revalidatePath('/jobs');
}
