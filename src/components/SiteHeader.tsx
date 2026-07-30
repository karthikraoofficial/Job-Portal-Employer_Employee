import Link from 'next/link';

import { getCurrentUser } from '@/lib/session';
import { SignOutButton } from './SignOutButton';
import { HeaderNav } from './HeaderNav';

/**
 * The master title block. Black ground, orange keys, hairline cell divisions —
 * the same device every sheet in the product opens with.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  const links = user?.role === 'EMPLOYER'
    ? [
        { href: '/employer', label: 'Dashboard' },
        { href: '/employer/jobs', label: 'Listings' },
        { href: '/jobs', label: 'Register' },
      ]
    : user?.role === 'SEEKER'
      ? [
          { href: '/jobs', label: 'Register' },
          { href: '/seeker/applications', label: 'Applications' },
          { href: '/seeker/profile', label: 'Profile' },
        ]
      : [{ href: '/jobs', label: 'Register' }];

  return (
    <header className="on-ink border-b-2 border-ink bg-ink text-sheet">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-stretch px-4 sm:px-6">
        <Link
          href="/"
          className="flex flex-col justify-center border-r border-white/20 py-3 pr-5 transition-colors duration-150 hover:text-markup"
        >
          <span className="lettering text-markup">Job Portal</span>
          <span className="data mt-1 font-semibold">Openings on record</span>
        </Link>

        <HeaderNav links={links} />

        <div className="ml-auto flex items-center gap-3 border-l border-white/20 py-3 pl-5">
          {user ? (
            <>
              <span className="hidden sm:block">
                <span className="lettering block text-markup">Signed in</span>
                <span className="data mt-1 block truncate">{user.name}</span>
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="lettering px-2 py-2 transition-colors duration-150 hover:text-markup"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="lettering border border-markup bg-markup px-4 py-2.5 text-ink transition-colors duration-150 hover:bg-sheet hover:border-sheet"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
