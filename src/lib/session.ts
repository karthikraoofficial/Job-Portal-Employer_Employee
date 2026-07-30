import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from './auth';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * Server-side session access. This is the ONLY thing that should decide who the
 * current user is - never a value sent up from the browser.
 *
 * Note: `headers()` is async in Next.js 16.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** The signed-in user, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Use at the top of any page or Server Action that requires a login.
 * Redirects to /login instead of returning when there is no session.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Requires a login AND a specific role.
 *
 * proxy.ts already blocks the wrong role at the routing layer, but that is a
 * convenience, not a security boundary - a Server Action can be invoked
 * directly. Every protected action calls this again on the server.
 */
export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    // Send people to their own dashboard rather than showing a dead end.
    redirect(user.role === 'EMPLOYER' ? '/employer' : '/seeker');
  }

  return user;
}
