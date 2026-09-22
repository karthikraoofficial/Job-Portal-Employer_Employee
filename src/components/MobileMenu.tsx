'use client';

import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isActiveLink, type NavLink } from './HeaderNav';

/**
 * The header's navigation below the `md` breakpoint: one MENU key that opens
 * the page links and the account actions as a full-width drop-down sheet.
 *
 * `children` is the account section (sign in / register, or sign out), rendered
 * by the server so this component never needs to know who is signed in.
 */
export function MobileMenu({ links, children }: { links: NavLink[]; children: ReactNode }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating anywhere closes
  // it without an effect that resets state on every route change.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedOn(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <div className="ml-auto flex items-center border-l border-white/20 pl-4 md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenedOn(open ? null : pathname)}
        className={`lettering min-h-11 border px-4 transition-colors duration-150 ${
          open
            ? 'border-markup bg-markup text-ink'
            : 'border-white/40 text-sheet hover:border-markup hover:text-markup'
        }`}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      {open && (
        <div
          id="mobile-menu"
          // A tap on any link closes the menu, including a link to the page
          // you are already on, which would not change the pathname.
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setOpenedOn(null);
          }}
          className="absolute inset-x-0 top-full z-50 border-b-2 border-ink bg-ink px-4"
        >
          <nav className="flex flex-col border-t border-white/20">
            {links.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`lettering flex min-h-12 items-center border-b border-white/20 border-l-2 pl-3 transition-colors duration-150 ${
                    active
                      ? 'border-l-markup text-markup'
                      : 'border-l-transparent text-sheet/80 hover:text-sheet'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="py-4">{children}</div>
        </div>
      )}
    </div>
  );
}
