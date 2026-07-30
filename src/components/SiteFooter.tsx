import Link from 'next/link';

/** The sheet's foot: a closing title block, the way a drawing is signed off. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-2 border-ink bg-sheet">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
        <div>
          <p className="lettering text-ink-3">Sheet</p>
          <p className="data mt-1.5">Job Portal</p>
        </div>
        <div>
          <p className="lettering text-ink-3">Issued</p>
          <p className="data mt-1.5">{year}</p>
        </div>
        <div>
          <p className="lettering text-ink-3">Candidates</p>
          <p className="data mt-1.5">
            <Link href="/jobs" className="underline decoration-rule underline-offset-4 hover:decoration-markup">
              Browse the register
            </Link>
          </p>
        </div>
        <div>
          <p className="lettering text-ink-3">Employers</p>
          <p className="data mt-1.5">
            <Link
              href="/register"
              className="underline decoration-rule underline-offset-4 hover:decoration-markup"
            >
              Post a listing
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
