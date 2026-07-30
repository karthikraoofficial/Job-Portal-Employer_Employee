'use client';

import { useActionState } from 'react';

import { uploadResume, deleteResume } from '@/server/actions/profile';
import type { ActionState } from '@/lib/action-state';
import { RESUME_ACCEPT, formatFileSize } from '@/lib/resume-file';
import { Alert, Button, Sheet } from '@/components/ui';

const INITIAL: ActionState = {};

export function ResumeCard({
  filename,
  size,
  updatedAt,
}: {
  filename: string | null;
  size: number | null;
  updatedAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(uploadResume, INITIAL);

  return (
    <Sheet className="border-t-2 border-t-ink">
      <div className="border-b border-rule px-5 py-4">
        <h2 className="lettering text-ink-3">Attachment</h2>
        <p className="data mt-1.5 text-ink-2">
          Sent with every application. PDF or Word, up to 5 MB.
        </p>
      </div>

      {/* The attachment stated as title-block cells rather than a card. */}
      {filename ? (
        <dl className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
          <div className="border-r border-rule px-4 py-3 max-sm:col-span-2 max-sm:border-b">
            <dt className="lettering text-ink-3">File</dt>
            <dd className="data mt-1.5 truncate font-semibold">{filename}</dd>
          </div>
          <div className="border-r border-rule px-4 py-3">
            <dt className="lettering text-ink-3">Size</dt>
            <dd className="data mt-1.5">{size ? formatFileSize(size) : '—'}</dd>
          </div>
          <div className="px-4 py-3 max-sm:border-l max-sm:border-rule">
            <dt className="lettering text-ink-3">Uploaded</dt>
            <dd className="data mt-1.5">
              {updatedAt
                ? new Date(updatedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="border-b border-markup bg-markup-wash px-5 py-4">
          <p className="data text-markup-ink">
            Nothing attached. Applications you send will not carry a resume.
          </p>
        </div>
      )}

      <div className="px-5 py-5 sm:px-6">
        {filename && (
          <div className="mb-5 flex flex-wrap gap-2">
            {/* Downloads go through an authorised route, never a public URL. */}
            <a
              href="/api/resume/me"
              className="lettering inline-flex items-center border border-ink px-5 py-2.5 transition-colors duration-150 hover:bg-ink hover:text-sheet"
            >
              Download
            </a>
            <form action={deleteResume}>
              <Button type="submit" variant="danger">
                Remove
              </Button>
            </form>
          </div>
        )}

        <form action={formAction}>
          <label htmlFor="resume" className="lettering mb-2 block text-ink-3">
            {filename ? 'Replace attachment' : 'Upload attachment'}
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            accept={RESUME_ACCEPT}
            required
            className="block w-full border border-rule bg-sheet text-[0.875rem] text-ink-2 file:mr-4 file:border-0 file:border-r file:border-rule file:bg-paper file:px-4 file:py-2.5 file:text-[0.6875rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-ink hover:file:bg-markup-wash"
          />
          {state.fieldErrors?.resume && (
            <p className="data mt-2 font-semibold text-markup-ink">{state.fieldErrors.resume}</p>
          )}

          {state.error && (
            <div className="mt-4">
              <Alert>{state.error}</Alert>
            </div>
          )}
          {state.ok && (
            <div className="mt-4">
              <Alert tone="ok">Attachment uploaded.</Alert>
            </div>
          )}

          <div className="mt-4">
            <Button type="submit" variant="secondary" disabled={pending}>
              {pending ? 'Uploading' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
