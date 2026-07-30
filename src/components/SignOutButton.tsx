'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signOut } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        router.push('/');
        // Re-renders Server Components so the header drops the signed-in state.
        router.refresh();
      }}
      className="lettering border border-white/30 px-3 py-2 text-sheet/80 transition-colors duration-150 hover:border-markup hover:text-markup disabled:opacity-50"
    >
      {busy ? 'Signing out' : 'Sign out'}
    </button>
  );
}
