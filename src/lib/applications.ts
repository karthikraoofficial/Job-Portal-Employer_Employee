import type { ApplicationStatus } from '@/generated/prisma/enums';

// The hiring pipeline, in one place. Both the employer UI and the Server Action
// read from here, so the buttons on screen and the rules on the server can never
// drift apart.

/** The happy path, in order. Used to draw the progress timeline. */
export const PIPELINE: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interviewing',
  OFFERED: 'Offer made',
  HIRED: 'Hired',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

// Status colours are not defined here. A status maps to a Stamp *tone* in
// components/StatusBadge.tsx, and the tones live in the design system — so the
// palette has one home rather than two that can drift apart.

/** Statuses an employer is allowed to set. Only the employer can reject. */
export const EMPLOYER_STATUSES: ApplicationStatus[] = [
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
  'REJECTED',
];

/** Once an application reaches one of these, nobody can move it again. */
export const TERMINAL_STATUSES: ApplicationStatus[] = ['HIRED', 'REJECTED', 'WITHDRAWN'];

export const isTerminal = (status: ApplicationStatus) => TERMINAL_STATUSES.includes(status);

/**
 * Where an application sits on the timeline.
 * Returns -1 for statuses that are not part of the happy path.
 */
export const pipelineIndex = (status: ApplicationStatus) => PIPELINE.indexOf(status);
