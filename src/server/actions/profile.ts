'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { storage } from '@/lib/storage';
import { validateResumeUpload } from '@/lib/resume-file';
import { profileSchema } from '@/lib/validation/profile';
import { type ActionState, toFieldErrors } from '@/lib/action-state';

/** Saves the seeker's profile details. */
export async function saveProfile(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole('SEEKER');

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    headline: formData.get('headline'),
    location: formData.get('location'),
    bio: formData.get('bio'),
    experienceYears: formData.get('experienceYears'),
    skills: formData.get('skills'),
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const { name, phone, ...profile } = parsed.data;

  // Name and phone live on the user; the rest on the profile.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name, phone: phone ?? null },
    }),
    prisma.seekerProfile.upsert({
      where: { userId: user.id },
      update: profile,
      create: { ...profile, userId: user.id },
    }),
  ]);

  revalidatePath('/seeker/profile');
  revalidatePath('/seeker');
  return { ok: true };
}

/**
 * Replaces the seeker's resume.
 *
 * The file is validated by its actual contents before anything is written, and
 * the old file is deleted only after the new one is safely stored.
 */
export async function uploadResume(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole('SEEKER');

  const result = await validateResumeUpload(formData.get('resume'));
  if (!result.ok) {
    return { fieldErrors: { resume: result.error } };
  }

  const existing = await prisma.seekerProfile.findUnique({
    where: { userId: user.id },
    select: { resumeKey: true },
  });

  const key = await storage.put({ data: result.data, extension: result.extension });

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    update: {
      resumeKey: key,
      resumeFilename: result.filename,
      resumeSize: result.size,
      resumeUpdatedAt: new Date(),
    },
    create: {
      userId: user.id,
      resumeKey: key,
      resumeFilename: result.filename,
      resumeSize: result.size,
      resumeUpdatedAt: new Date(),
    },
  });

  // Deleting the old file goes last, and is best-effort. The upload has already
  // succeeded by this point, so a failure here must not surface as an error:
  // the worst case is one orphaned file, whereas throwing would tell the user
  // their upload failed when it did not.
  if (existing?.resumeKey) {
    try {
      await storage.remove(existing.resumeKey);
    } catch (error) {
      console.warn('[storage] could not remove the previous resume:', error);
    }
  }

  revalidatePath('/seeker/profile');
  return { ok: true };
}

/**
 * Removes the resume from the profile.
 *
 * The file itself stays on disk, because applications already sent reference it
 * by key and an employer mid-review should not suddenly lose the document.
 */
export async function deleteResume() {
  const user = await requireRole('SEEKER');

  await prisma.seekerProfile.updateMany({
    where: { userId: user.id },
    data: { resumeKey: null, resumeFilename: null, resumeSize: null, resumeUpdatedAt: null },
  });

  revalidatePath('/seeker/profile');
}
