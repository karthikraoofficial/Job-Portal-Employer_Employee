'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';
import { uniqueSlug } from '@/lib/slug';
import { companySchema } from '@/lib/validation/job';
import { type ActionState, toFieldErrors } from '@/lib/action-state';

/**
 * Creates or updates the signed-in employer's company.
 *
 * requireRole re-checks the session server-side. A Server Action is a public
 * HTTP endpoint - it can be invoked without ever loading the page.
 */
export async function saveCompany(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole('EMPLOYER');

  const parsed = companySchema.safeParse({
    name: formData.get('name'),
    website: formData.get('website'),
    location: formData.get('location'),
    description: formData.get('description'),
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const existing = await prisma.company.findUnique({ where: { ownerId: user.id } });

  if (existing) {
    await prisma.company.update({
      where: { id: existing.id },
      data: parsed.data,
    });
  } else {
    const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
      Boolean(await prisma.company.findUnique({ where: { slug: candidate } }))
    );
    await prisma.company.create({
      data: { ...parsed.data, slug, ownerId: user.id },
    });
  }

  revalidatePath('/employer');
  return { ok: true };
}
