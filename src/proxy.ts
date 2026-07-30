import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// In Next.js 16 this file is `proxy.ts`, not `middleware.ts`, and the exported
// function must be named `proxy`. It runs on the Node.js runtime.
//
// IMPORTANT: this is a redirect convenience, NOT a security boundary. It only
// checks that a session cookie exists - it does not validate it against the
// database. Real authorisation happens in every page and Server Action through
// requireUser() / requireRole() in src/lib/session.ts.

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const { pathname, search } = request.nextUrl;
    const loginUrl = new URL('/login', request.url);
    // Remember where they were heading so login can send them back.
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// These patterns MUST be plain string literals. Next.js reads them at build
// time and cannot evaluate variables or template strings - using those makes
// the matcher silently match every route, including /api/auth.
export const config = {
  matcher: ['/seeker/:path*', '/employer/:path*'],
};
