import Link from 'next/link';

import { getCurrentUser } from '@/lib/session';
import { SignOutButton } from './SignOutButton';
import { HeaderNav } from './HeaderNav';
import { MobileMenu } from './MobileMenu';

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
        { href: '/jobs', label: 'Openings' },
      ]
    : user?.role === 'SEEKER'
      ? [
          { href: '/jobs', label: 'Openings' },
          { href: '/seeker/applications', label: 'Applications' },
          { href: '/seeker/profile', label: 'Profile' },
        ]
      : [{ href: '/jobs', label: 'Openings' }];

  return (
    <header className="on-ink relative border-b-2 border-ink bg-ink text-sheet">
      <div className="mx-auto flex max-w-[1200px] items-stretch px-4 sm:px-6">
        <Link
          href="/"
          className="flex flex-col justify-center py-3 pr-5 transition-colors duration-150 hover:text-markup md:border-r md:border-white/20"
        >
          <span className="lettering text-markup">Job Portal</span>
          <span className="data mt-1 font-semibold">Openings on record</span>
        </Link>

        {/* Phones: everything below lives behind one MENU key. */}
        <MobileMenu links={links}>
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="lettering block text-markup">Signed in</span>
                <span className="data mt-1 block truncate">{user.name}</span>
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="lettering flex min-h-11 items-center justify-center border border-white/40 transition-colors duration-150 hover:border-markup hover:text-markup"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="lettering flex min-h-11 items-center justify-center border border-markup bg-markup text-ink transition-colors duration-150 hover:border-sheet hover:bg-sheet"
              >
                Register
              </Link>
            </div>
          )}
        </MobileMenu>

        <div className="hidden md:flex">
          <HeaderNav links={links} />
        </div>

        <div className="ml-auto hidden items-center gap-3 border-l border-white/20 py-3 pl-5 md:flex">
          {user ? (
            <>
              <span className="hidden lg:block">
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
