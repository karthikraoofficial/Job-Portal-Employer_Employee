'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation cells in the master title block. The active cell is marked in the
 * markup colour with a 2px underline — the drawing's current sheet.
 */
export type NavLink = { href: string; label: string };

export function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-stretch">
      {links.map((link) => {
        const active = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`lettering flex items-center border-r border-white/20 px-4 py-4 transition-colors duration-150 sm:px-5 ${
              active
                ? 'border-b-2 border-b-markup bg-white/5 text-markup'
                : 'text-sheet/70 hover:bg-white/5 hover:text-sheet'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
