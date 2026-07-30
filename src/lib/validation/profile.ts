import { z } from 'zod';

import { optionalFormText } from './form';

export const MAX_SKILLS = 20;

/**
 * Skills arrive as one comma-separated string from the form.
 * Split, trim, drop blanks, de-duplicate case-insensitively, and cap the count.
 */
export const skillsFromText = (value: unknown): string[] => {
  const text = (value ?? '').toString();
  const seen = new Set<string>();
  const skills: string[] = [];

  for (const raw of text.split(',')) {
    const skill = raw.trim().slice(0, 40);
    if (!skill) continue;

    const key = skill.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    skills.push(skill);
    if (skills.length >= MAX_SKILLS) break;
  }

  return skills;
};

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  phone: optionalFormText(20),
  headline: optionalFormText(120, 'Keep your headline under 120 characters.'),
  location: optionalFormText(100),
  bio: optionalFormText(2000, 'Keep your summary under 2000 characters.'),
  experienceYears: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      const text = (value ?? '').toString().trim();
      if (text === '') return undefined;
      const parsed = Number(text);
      return Number.isFinite(parsed) ? Math.trunc(parsed) : NaN;
    })
    .refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0 && value <= 60), {
      message: 'Enter a number of years between 0 and 60.',
    }),
  skills: z.unknown().transform(skillsFromText),
});

export type ProfileInput = z.infer<typeof profileSchema>;
