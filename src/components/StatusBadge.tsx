import type { ApplicationStatus } from '@/generated/prisma/enums';
import { APPLICATION_STATUS_LABELS } from '@/lib/applications';
import { Stamp } from './ui';

const TONES: Record<ApplicationStatus, 'neutral' | 'current' | 'approved' | 'closed'> = {
  APPLIED: 'neutral',
  SHORTLISTED: 'current',
  INTERVIEW: 'current',
  OFFERED: 'current',
  HIRED: 'approved',
  REJECTED: 'closed',
  WITHDRAWN: 'closed',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Stamp tone={TONES[status]}>{APPLICATION_STATUS_LABELS[status]}</Stamp>;
}
