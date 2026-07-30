'use client';

import { useActionState } from 'react';

import type { ActionState } from '@/lib/action-state';
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/lib/validation/job';
import { Alert, Button, Field, Select, Sheet, TextArea } from '@/components/ui';

export type JobFormDefaults = {
  jobId?: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  employmentType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: string;
};

const INITIAL: ActionState = {};

/**
 * Used for both issuing and revising a listing — the only difference is which
 * action it posts to and whether a hidden jobId is present.
 */
export function JobForm({
  action,
  defaults,
  submitLabel,
  showPublishToggle = false,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: JobFormDefaults;
  submitLabel: string;
  showPublishToggle?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const errors = state.fieldErrors ?? {};

  return (
    <Sheet className="border-t-2 border-t-ink">
      <form action={formAction}>
        {defaults.jobId && <input type="hidden" name="jobId" value={defaults.jobId} />}

        <section className="border-b border-ink-3 px-5 py-6 sm:px-6">
          <h2 className="lettering mb-5 text-ink-3">The role</h2>
          <Field
            label="Job title"
            name="title"
            type="text"
            defaultValue={defaults.title}
            placeholder="Senior Backend Engineer"
            error={errors.title}
          />
          <TextArea
            label="Description"
            name="description"
            rows={12}
            defaultValue={defaults.description}
            placeholder="What the role involves, what you're looking for, and how the team works."
            error={errors.description}
          />
        </section>

        <section className="border-b border-ink-3 px-5 py-6 sm:px-6">
          <h2 className="lettering mb-5 text-ink-3">Specifications</h2>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Field
              label="Location"
              name="location"
              type="text"
              defaultValue={defaults.location}
              placeholder="Bengaluru, India"
              error={errors.location}
            />
            <div className="mb-5 flex items-center">
              <label className="flex cursor-pointer items-center gap-3 border border-rule px-4 py-2.5 transition-colors duration-150 hover:border-ink-3">
                <input
                  type="checkbox"
                  name="isRemote"
                  defaultChecked={defaults.isRemote}
                  className="size-4 accent-[#ea580c]"
                />
                <span className="lettering text-ink-2">Can be done remotely</span>
              </label>
            </div>

            <Select
              label="Employment type"
              name="employmentType"
              defaultValue={defaults.employmentType}
              options={EMPLOYMENT_TYPES.map((value) => ({
                value,
                label: EMPLOYMENT_TYPE_LABELS[value],
              }))}
              error={errors.employmentType}
            />
            <Select
              label="Experience level"
              name="experienceLevel"
              defaultValue={defaults.experienceLevel}
              options={EXPERIENCE_LEVELS.map((value) => ({
                value,
                label: EXPERIENCE_LEVEL_LABELS[value],
              }))}
              error={errors.experienceLevel}
            />
          </div>
        </section>

        <section className="border-b border-ink-3 px-5 py-6 sm:px-6">
          <h2 className="lettering mb-5 text-ink-3">Salary</h2>
          <div className="grid gap-x-5 sm:grid-cols-3">
            <Field
              label="From"
              name="salaryMin"
              type="number"
              min={0}
              defaultValue={defaults.salaryMin}
              placeholder="800000"
              hint="Optional."
              error={errors.salaryMin}
            />
            <Field
              label="To"
              name="salaryMax"
              type="number"
              min={0}
              defaultValue={defaults.salaryMax}
              placeholder="1200000"
              hint="Optional."
              error={errors.salaryMax}
            />
            <Select
              label="Period"
              name="salaryPeriod"
              defaultValue={defaults.salaryPeriod}
              options={[
                { value: 'YEAR', label: 'Per year' },
                { value: 'MONTH', label: 'Per month' },
              ]}
              error={errors.salaryPeriod}
            />
          </div>
        </section>

        <div className="px-5 py-6 sm:px-6">
          {state.error && <Alert>{state.error}</Alert>}
          {state.ok && <Alert tone="ok">Listing saved.</Alert>}

          <div className="flex flex-wrap gap-3">
            {showPublishToggle ? (
              <>
                <Button type="submit" name="publish" value="true" disabled={pending}>
                  {pending ? 'Saving' : 'Publish now'}
                </Button>
                <Button
                  type="submit"
                  name="publish"
                  value="false"
                  variant="secondary"
                  disabled={pending}
                >
                  Save as draft
                </Button>
              </>
            ) : (
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving' : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Sheet>
  );
}
