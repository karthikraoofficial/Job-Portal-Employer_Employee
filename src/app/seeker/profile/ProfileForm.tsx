'use client';

import { useActionState } from 'react';

import { saveProfile } from '@/server/actions/profile';
import type { ActionState } from '@/lib/action-state';
import { MAX_SKILLS } from '@/lib/validation/profile';
import { Alert, Button, Field, Sheet, TextArea } from '@/components/ui';

const INITIAL: ActionState = {};

export function ProfileForm({
  defaults,
}: {
  defaults: {
    name: string;
    phone: string;
    headline: string;
    location: string;
    bio: string;
    experienceYears: string;
    skills: string;
  };
}) {
  const [state, formAction, pending] = useActionState(saveProfile, INITIAL);
  const errors = state.fieldErrors ?? {};

  return (
    <Sheet className="border-t-2 border-t-ink">
      <div className="border-b border-rule px-5 py-4">
        <h2 className="lettering text-ink-3">Particulars</h2>
        <p className="data mt-1.5 text-ink-2">Employers see these when you apply.</p>
      </div>

      <form action={formAction} className="px-5 py-6 sm:px-6">
        <div className="grid gap-x-5 sm:grid-cols-2">
          <Field label="Name" name="name" type="text" defaultValue={defaults.name} error={errors.name} />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            error={errors.phone}
          />
        </div>

        <Field
          label="Headline"
          name="headline"
          type="text"
          defaultValue={defaults.headline}
          placeholder="Backend engineer with 5 years in fintech"
          hint="One line, shown under your name on an application."
          error={errors.headline}
        />

        <div className="grid gap-x-5 sm:grid-cols-2">
          <Field
            label="Location"
            name="location"
            type="text"
            defaultValue={defaults.location}
            placeholder="Bengaluru, India"
            error={errors.location}
          />
          <Field
            label="Years of experience"
            name="experienceYears"
            type="number"
            min={0}
            max={60}
            defaultValue={defaults.experienceYears}
            error={errors.experienceYears}
          />
        </div>

        <Field
          label="Skills"
          name="skills"
          type="text"
          defaultValue={defaults.skills}
          placeholder="TypeScript, PostgreSQL, Docker"
          hint={`Separate with commas. Up to ${MAX_SKILLS}.`}
          error={errors.skills}
        />

        <TextArea
          label="About you"
          name="bio"
          rows={6}
          defaultValue={defaults.bio}
          placeholder="What you work on, and what you're looking for next."
          error={errors.bio}
        />

        {state.error && <Alert>{state.error}</Alert>}
        {state.ok && <Alert tone="ok">Profile saved.</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Saving' : 'Save particulars'}
        </Button>
      </form>
    </Sheet>
  );
}
