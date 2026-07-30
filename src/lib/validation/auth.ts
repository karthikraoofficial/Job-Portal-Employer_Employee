import { z } from 'zod';

// These schemas are imported by both the browser form and the server code, so
// the rules are written once and enforced in both places.

export const phoneSchema = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length >= 10, {
    message: 'Enter a phone number with at least 10 digits.',
  })
  .refine((value) => value.replace(/\D/g, '').length <= 15, {
    message: 'That phone number looks too long.',
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  phone: phoneSchema,
  password: z
    .string()
    .min(8, 'Use at least 8 characters.')
    .max(128, 'That password is too long.'),
  role: z.enum(['SEEKER', 'EMPLOYER'], {
    message: 'Choose whether you are hiring or looking for work.',
  }),
});

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Enter your password.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
