'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/lib/validation/job';

/**
 * The search set as a drawing's specification panel: labelled cells on ruled
 * divisions rather than floating pills.
 *
 * All state lives in the URL, so a filtered search is shareable, bookmarkable,
 * survives a refresh, and works with the back button.
 */
export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }

    // Any filter change starts again from page one.
    next.delete('page');
    router.push(`/jobs?${next.toString()}`);
  }

  const value = (key: string) => searchParams.get(key) ?? '';
  const activeCount = Array.from(searchParams.keys()).filter((key) => key !== 'page').length;

  return (
    <form
      className="mb-8 border border-ink bg-sheet"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        apply({
          q: String(formData.get('q') ?? ''),
          location: String(formData.get('location') ?? ''),
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b border-rule px-4 py-3 sm:border-b-0 sm:border-r">
            <label htmlFor="q" className="lettering block text-ink-3">
              Keywords
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={value('q')}
              placeholder="Job title, skill, or company"
              className="mt-1.5 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-ink-2/60 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
            />
          </div>
          <div className="border-b border-rule px-4 py-3 sm:border-b-0 sm:border-r">
            <label htmlFor="location" className="lettering block text-ink-3">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={value('location')}
              placeholder="Any"
              className="mt-1.5 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-ink-2/60 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
            />
          </div>
        </div>

        <button
          type="submit"
          className="lettering bg-markup px-6 py-4 text-ink transition-colors duration-150 hover:bg-markup-ink hover:text-sheet"
        >
          Search
        </button>
      </div>

      {/* Specification row. Scrolls horizontally on a phone rather than wrapping
          into an unreadable stack. */}
      <div className="flex items-stretch overflow-x-auto border-t border-ink">
        <Cell label="Type" value={value('type')} onChange={(v) => apply({ type: v })} placeholder="Any"
          options={EMPLOYMENT_TYPES.map((v) => ({ value: v, label: EMPLOYMENT_TYPE_LABELS[v] }))} />
        <Cell label="Level" value={value('level')} onChange={(v) => apply({ level: v })} placeholder="Any"
          options={EXPERIENCE_LEVELS.map((v) => ({ value: v, label: EXPERIENCE_LEVEL_LABELS[v] }))} />
        <Cell label="Salary from" value={value('minSalary')} onChange={(v) => apply({ minSalary: v })} placeholder="Any"
          options={[
            { value: '300000', label: '₹3L' },
            { value: '600000', label: '₹6L' },
            { value: '1000000', label: '₹10L' },
            { value: '2000000', label: '₹20L' },
          ]} />
        <Cell label="Order" value={value('sort')} onChange={(v) => apply({ sort: v })} placeholder="Newest"
          options={[
            { value: 'relevance', label: 'Relevance' },
            { value: 'salary', label: 'Salary' },
          ]} />

        <label className="flex shrink-0 cursor-pointer items-center gap-2 border-l border-rule px-4 py-3">
          <input
            type="checkbox"
            checked={value('remote') === 'true'}
            onChange={(event) => apply({ remote: event.target.checked ? 'true' : '' })}
            className="size-4 accent-[#ea580c]"
          />
          <span className="lettering text-ink-3">Remote only</span>
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push('/jobs')}
            className="lettering ml-auto shrink-0 border-l border-rule px-4 py-3 text-markup-ink transition-colors duration-150 hover:bg-markup-wash"
          >
            Clear {activeCount}
          </button>
        )}
      </div>
    </form>
  );
}

function Cell({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const id = `filter-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="shrink-0 border-r border-rule px-4 py-3">
      <label htmlFor={id} className="lettering block text-ink-3">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 -ml-1 cursor-pointer bg-transparent px-1 text-[0.875rem] focus:outline-2 focus:outline-offset-2 focus:outline-ink ${
          value ? 'font-semibold text-markup-ink' : 'text-ink-2'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
