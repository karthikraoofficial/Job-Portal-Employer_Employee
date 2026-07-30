import { z } from 'zod';

import { optionalFormText } from './form';

export const applySchema = z.object({
  jobId: z.string().min(1),
  coverLetter: optionalFormText(5000, 'Keep your cover letter under 5000 characters.'),
});

export const statusChangeSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(['SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']),
  note: optionalFormText(500, 'Keep the note under 500 characters.'),
});

export type ApplyInput = z.infer<typeof applySchema>;
