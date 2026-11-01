import type { Metadata } from 'next';

// Private to signed-in users (or a sign-in form): keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
