import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { resumeResponse } from '@/lib/resume-response';

/** A seeker downloads their own resume. */
export async function GET() {
  const user = await getCurrentUser();

  // A route handler is not covered by proxy.ts, so it checks for itself.
  if (!user) {
    return new Response('Sign in to download your resume.', { status: 401 });
  }

  const profile = await prisma.seekerProfile.findUnique({
    where: { userId: user.id },
    select: { resumeKey: true, resumeFilename: true },
  });

  if (!profile?.resumeKey) {
    return new Response('You have not uploaded a resume.', { status: 404 });
  }

  return resumeResponse(profile.resumeKey, profile.resumeFilename);
}
