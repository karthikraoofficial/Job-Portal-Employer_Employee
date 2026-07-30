import { z } from 'zod';

/**
 * An optional text field coming from a FormData.
 *
 * `formData.get(name)` returns `null` when the field is absent from the form
 * entirely, and `''` when it is present but blank. Plain `.optional()` accepts
 * neither — it only allows `undefined` — so an absent optional field fails
 * validation and takes the whole submission down with it.
 *
 * Use this for every optional form field. It accepts null, undefined and '',
 * and normalises all three to undefined.
 */
export const optionalFormText = (max: number, message?: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      const text = (value ?? '').toString().trim();
      return text === '' ? undefined : text;
    })
    .refine((value) => value === undefined || value.length <= max, {
      message: message ?? `Keep this under ${max} characters.`,
    });
