import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/lib/auth';

// Every auth endpoint (sign-up, sign-in, sign-out, session) is served from
// /api/auth/* by this one catch-all handler.
export const { GET, POST } = toNextJsHandler(auth);
