import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

// The drawing-office kit. Square, ruled, unshadowed. Depth is line weight.
// See DESIGN.md for the system these implement.

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 lettering px-5 py-3.5 border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45';

const BUTTON_VARIANTS = {
  // Black on orange: 5.8:1. White on orange would be 3.6:1 and fail.
  primary: 'bg-markup border-markup text-ink hover:bg-markup-ink hover:border-markup-ink hover:text-sheet',
  secondary: 'bg-sheet border-ink text-ink hover:bg-paper',
  quiet: 'bg-transparent border-rule text-ink-2 hover:border-ink hover:text-ink',
  // No separate red in the system; the markup colour carries destructive too.
  danger: 'bg-sheet border-markup-ink text-markup-ink hover:bg-markup-wash',
} as const;

type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant }) {
  return <button {...props} className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`} />;
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link {...props} className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`} />;
}

const ZONES_X = ['1', '2', '3', '4', '5', '6'];
const ZONES_Y = ['A', 'B', 'C', 'D'];

/**
 * THE DRAWING FRAME.
 *
 * A technical drawing is identifiable across a room by its inset frame and the
 * zone references running its edges — the coordinates you quote when pointing
 * at part of a sheet. Every route sits inside one.
 *
 * The frame is decoration only in the sense that a drawing's frame is: it is
 * the single device that makes the whole product read as one drawing set
 * rather than as a series of white panels.
 *
 * Below 640px it collapses to left and right hairlines, because zone markers
 * on a phone would eat the reading width for nothing.
 */
export function DrawingFrame({ children }: { children: ReactNode }) {
  const marker = 'lettering flex items-center justify-center text-ink-3/70 select-none';

  return (
    <div className="border-x-0 border-ink sm:border-2">
      {/* Top zone rule */}
      <div aria-hidden="true" className="hidden border-b border-rule sm:grid sm:grid-cols-6">
        {ZONES_X.map((zone, index) => (
          <span key={zone} className={`${marker} h-5 ${index > 0 ? 'border-l border-rule' : ''}`}>
            {zone}
          </span>
        ))}
      </div>

      <div className="flex items-stretch">
        <div
          aria-hidden="true"
          className="hidden w-5 shrink-0 flex-col border-r border-rule sm:flex"
        >
          {ZONES_Y.map((zone, index) => (
            <span
              key={zone}
              className={`${marker} flex-1 ${index > 0 ? 'border-t border-rule' : ''}`}
            >
              {zone}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 px-4 py-8 sm:px-7 sm:py-10">{children}</div>

        <div
          aria-hidden="true"
          className="hidden w-5 shrink-0 flex-col border-l border-rule sm:flex"
        >
          {ZONES_Y.map((zone, index) => (
            <span
              key={zone}
              className={`${marker} flex-1 ${index > 0 ? 'border-t border-rule' : ''}`}
            >
              {zone}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom zone rule, with the drawing-office note a real sheet carries */}
      <div aria-hidden="true" className="hidden border-t border-rule sm:grid sm:grid-cols-6">
        {ZONES_X.map((zone, index) => (
          <span key={zone} className={`${marker} h-5 ${index > 0 ? 'border-l border-rule' : ''}`}>
            {zone}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * A sheet: white stock on the film ground, hairline ruled, square, no shadow.
 * Nested sheets are forbidden — divide inside one with a hairline rule.
 */
export function Sheet({
  children,
  className = '',
  bordered = true,
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div className={`bg-sheet ${bordered ? 'border border-rule' : ''} ${className}`}>{children}</div>
  );
}

/**
 * The title block — the system's signature device.
 *
 * A ruled strip of labelled cells. Every significant surface opens with one,
 * which is what makes the world recognisable with all content removed.
 */
export function TitleBlock({
  cells,
  tone = 'light',
  className = '',
}: {
  cells: { label: string; value: ReactNode }[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';

  return (
    <dl
      className={`grid grid-cols-2 sm:flex sm:flex-wrap ${
        dark ? 'on-ink bg-ink text-sheet' : 'bg-sheet border border-ink'
      } ${className}`}
    >
      {cells.map((cell, index) => (
        <div
          key={cell.label}
          className={`min-w-0 flex-1 px-4 py-3 ${
            dark
              ? index > 0
                ? 'border-l border-white/20'
                : ''
              : index > 0
                ? 'border-l border-rule'
                : ''
          } ${index === 1 ? '' : 'max-sm:border-l-0'} ${
            index > 1 ? 'max-sm:border-t' : ''
          } ${dark ? 'max-sm:border-white/20' : 'max-sm:border-rule'}`}
        >
          <dt className={`lettering ${dark ? 'text-markup' : 'text-ink-3'}`}>{cell.label}</dt>
          <dd className={`data mt-1.5 truncate ${dark ? 'text-sheet' : 'text-ink'}`}>
            {cell.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Page title set as a drawing subject, under an optional title block. */
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
      <div className="min-w-0">
        <h1 className="heading">{title}</h1>
        {subtitle && <p className="data mt-2 text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * A form field. The label is a title-block key: tracked caps above a squared
 * input that sits on a ruled base.
 */
export function Field({
  label,
  name,
  error,
  hint,
  className = '',
  ...props
}: ComponentProps<'input'> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <div className={`mb-5 ${className}`}>
      <label htmlFor={name} className="lettering mb-2 block text-ink-3">
        {label}
      </label>
      <input
        {...props}
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border bg-sheet px-3 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors duration-150 placeholder:text-ink-2/60 focus:border-ink ${
          error ? 'border-markup-ink' : 'border-rule hover:border-ink-3'
        }`}
      />
      {hint && !error && <p className="data mt-1.5 text-ink-3">{hint}</p>}
      {error && (
        <p id={errorId} className="data mt-1.5 font-semibold text-markup-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/** A textarea in the same drafting vocabulary. */
export function TextArea({
  label,
  name,
  error,
  hint,
  ...props
}: ComponentProps<'textarea'> & { label: string; name: string; error?: string; hint?: string }) {
  const errorId = `${name}-error`;

  return (
    <div className="mb-5">
      <label htmlFor={name} className="lettering mb-2 block text-ink-3">
        {label}
      </label>
      <textarea
        {...props}
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border bg-sheet px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-ink-2/60 focus:border-ink ${
          error ? 'border-markup-ink' : 'border-rule hover:border-ink-3'
        }`}
      />
      {hint && !error && <p className="data mt-1.5 text-ink-3">{hint}</p>}
      {error && (
        <p id={errorId} className="data mt-1.5 font-semibold text-markup-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/** A select in the same vocabulary. */
export function Select({
  label,
  name,
  error,
  options,
  ...props
}: ComponentProps<'select'> & {
  label: string;
  name: string;
  error?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-5">
      <label htmlFor={name} className="lettering mb-2 block text-ink-3">
        {label}
      </label>
      <select
        {...props}
        id={name}
        name={name}
        className={`w-full border bg-sheet px-3 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors duration-150 focus:border-ink ${
          error ? 'border-markup-ink' : 'border-rule hover:border-ink-3'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="data mt-1.5 font-semibold text-markup-ink">{error}</p>}
    </div>
  );
}

/** A correction note. Marked in the markup colour, like a redline. */
export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'note' | 'ok' }) {
  const tones = {
    error: 'border-markup-ink bg-markup-wash text-markup-ink',
    note: 'border-rule bg-paper text-ink-2',
    ok: 'border-approved bg-approved-wash text-approved',
  };

  // A uniform hairline, not a thick coloured left edge. The 2px markup edge is
  // reserved for a revision table's current row, where it is the revision mark
  // itself rather than decoration.
  return (
    <p className={`data mb-5 border px-3 py-2.5 font-medium ${tones[tone]}`}>{children}</p>
  );
}

/** A stamp: status marked on the sheet. */
export function Stamp({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'current' | 'approved' | 'closed';
}) {
  const tones = {
    neutral: 'border-rule bg-paper text-ink-2',
    current: 'border-markup bg-markup-wash text-markup-ink',
    approved: 'border-approved bg-approved-wash text-approved',
    closed: 'border-rule bg-paper text-ink-2 hatched',
  };

  return (
    <span className={`lettering inline-block rounded-chip border px-2 py-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** An empty sheet — a drawing with nothing issued on it yet. */
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <Sheet className="px-6 py-14 text-center">
      <p className="heading text-ink">{title}</p>
      <div className="data mx-auto mt-3 max-w-md text-ink-3">{children}</div>
    </Sheet>
  );
}
