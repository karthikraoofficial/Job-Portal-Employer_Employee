'use client';

import { useActionState } from 'react';

import { saveCompany } from '@/server/actions/company';
import type { ActionState } from '@/lib/action-state';
import { Alert, Button, Field, Sheet, TextArea } from '@/components/ui';

const INITIAL: ActionState = {};

export function CompanyForm({
  defaults,
}: {
  defaults: { name: string; website: string; location: string; description: string };
}) {
  // useActionState wires the form straight to the Server Action and gives us
  // the pending flag without any fetch code.
  const [state, formAction, pending] = useActionState(saveCompany, INITIAL);

  return (
    <Sheet className="border-t-2 border-t-ink">
      <div className="border-b border-rule px-5 py-4">
        <h2 className="lettering text-ink-3">Company particulars</h2>
        <p className="data mt-1.5 text-ink-2">Shown on every listing you publish.</p>
      </div>

      <form action={formAction} className="px-5 py-6 sm:px-6">
        <Field
          label="Company name"
          name="name"
          type="text"
          defaultValue={defaults.name}
          placeholder="Bluebird Technologies"
          error={state.fieldErrors?.name}
        />
        <div className="grid gap-x-5 sm:grid-cols-2">
          <Field
            label="Website"
            name="website"
            type="url"
            defaultValue={defaults.website}
            placeholder="https://example.com"
            hint="Optional."
            error={state.fieldErrors?.website}
          />
          <Field
            label="Location"
            name="location"
            type="text"
            defaultValue={defaults.location}
            placeholder="Bengaluru, India"
            hint="Optional."
            error={state.fieldErrors?.location}
          />
        </div>

        <TextArea
          label="About the company"
          name="description"
          rows={5}
          defaultValue={defaults.description}
          placeholder="What your company does, and what it's like to work there."
          error={state.fieldErrors?.description}
        />

        {state.error && <Alert>{state.error}</Alert>}
        {state.ok && <Alert tone="ok">Company details saved.</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Saving' : 'Save details'}
        </Button>
      </form>
    </Sheet>
  );
}
