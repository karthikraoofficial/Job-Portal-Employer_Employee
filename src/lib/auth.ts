import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { prisma } from './db';

/**
 * Better Auth configuration - the single source of truth for sessions.
 *
 * Everything auth-related goes through this: registration, login, session
 * lookup. Route handlers and Server Actions call `auth.api.*` rather than
 * touching the session tables directly.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Turned off so you can register and use an account immediately in local
    // development. Switch to `true` once real email sending is wired up.
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      // Which side of the marketplace this account is on. Chosen at
      // registration and used by proxy.ts to gate /seeker and /employer.
      role: {
        type: 'string',
        required: true,
        defaultValue: 'SEEKER',
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh the expiry once a day
    cookieCache: {
      // Caches the session in a signed cookie for a short window so that not
      // every page render costs a database query.
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // Protects the login and registration endpoints from brute-force attempts.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },

  // Must be last: lets Better Auth set cookies from within Server Actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
