'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { applyToJob } from '@/server/actions/application';
import type { ActionState } from '@/lib/action-state';
import { Alert, Button, TextArea } from '@/components/ui';

const INITIAL: ActionState = {};

export function ApplyForm({
  jobId,
  resumeFilename,
}: {
  jobId: string;
  resumeFilename: string | null;
}) {
  const [state, formAction, pending] = useActionState(applyToJob, INITIAL);

  return (
    <div className="border-x border-b-2 border-ink bg-sheet px-5 py-8 sm:px-8">
      <form action={formAction}>
        <input type="hidden" name="jobId" value={jobId} />

        <TextArea
          label="Cover letter (optional)"
          name="coverLetter"
          rows={10}
          maxLength={5000}
          placeholder="Why you're a good fit for this role, and anything the listing made you want to say."
          error={state.fieldErrors?.coverLetter}
        />

        {/* The attachment, stated as a title-block cell rather than prose. */}
        <div
          className={`mb-6 border px-4 py-3 ${
            resumeFilename ? 'border-rule bg-paper' : 'border-markup bg-markup-wash'
          }`}
        >
          <p className={`lettering ${resumeFilename ? 'text-ink-3' : 'text-markup-ink'}`}>
            Attachment
          </p>
          {resumeFilename ? (
            <p className="data mt-1.5 font-semibold">{resumeFilename}</p>
          ) : (
            <p className="data mt-1.5 text-markup-ink">
              No resume on your profile — this application will be sent without one.{' '}
              <Link href="/seeker/profile" className="font-semibold underline underline-offset-4">
                Upload one first
              </Link>
            </p>
          )}
        </div>

        {state.error && <Alert>{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Sending' : 'Submit application'}
        </Button>
      </form>
    </div>
  );
}
