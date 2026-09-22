/**
 * Public demo accounts, created by `npm run db:seed`.
 *
 * These credentials are deliberately not secret: the login page shows
 * one-click buttons for them when NEXT_PUBLIC_DEMO_MODE=true. Re-running the
 * seed resets both accounts, which undoes anything visitors changed.
 */
export const DEMO_PASSWORD = 'demo-password';

export const DEMO_ACCOUNTS = {
  employer: { email: 'employer@demo.seed', home: '/employer' },
  seeker: { email: 'seeker@demo.seed', home: '/seeker' },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
