import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { resumeResponse } from '@/lib/resume-response';

/**
 * Downloads the resume attached to one application.
 *
 * Allowed for exactly two people: the seeker who applied, and the employer who
 * owns the job. Everyone else gets a 404 - not a 403 - so this endpoint cannot
 * be used to find out which application ids exist.
 *
 * The resume served is the snapshot taken when they applied, not whatever is on
 * the profile now, so an employer reviews the document that was actually sent.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response('Sign in to download this resume.', { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      resumeKey: true,
      resumeFilename: true,
      seekerId: true,
      job: { select: { company: { select: { ownerId: true } } } },
    },
  });

  if (!application) {
    return new Response('Not found.', { status: 404 });
  }

  const isApplicant = application.seekerId === user.id;
  const isHiringEmployer = application.job.company.ownerId === user.id;

  if (!isApplicant && !isHiringEmployer) {
    return new Response('Not found.', { status: 404 });
  }

  if (!application.resumeKey) {
    return new Response('This application has no resume attached.', { status: 404 });
  }

  return resumeResponse(application.resumeKey, application.resumeFilename);
}
