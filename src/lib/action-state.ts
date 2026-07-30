// Shared types and helpers for Server Actions.
//
// These deliberately live OUTSIDE any file marked 'use server': such a file may
// only export async functions, so a synchronous helper like toFieldErrors
// cannot sit alongside the actions themselves.

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Turns Zod issues into one message per field for a form to display. */
export function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
