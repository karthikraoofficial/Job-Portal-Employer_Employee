'use client';

import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

import type { auth } from './auth';

/**
 * Browser-side auth. Use these in Client Components only.
 *
 * Server Components and Server Actions must use the helpers in `@/lib/session`
 * instead - never trust anything the browser reports about who it is.
 *
 * `inferAdditionalFields` is type-only: it teaches the client about the extra
 * `role` and `phone` fields declared on the server in `auth.ts`, so passing them
 * to signUp is type-checked. The `import type` above is erased at build time, so
 * no server code reaches the browser bundle.
 */
export const authClient = createAuthClient({
  // Unset means "same origin as the page", so any dev port works.
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
