/**
 * Turns text into a URL-safe slug: "Senior Backend Engineer" -> "senior-backend-engineer".
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD') // splits accented characters so the marks can be stripped
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Builds a slug that is unique in the database.
 *
 * `isTaken` is passed in rather than querying here, so this stays a pure
 * function that works for jobs, companies, or anything else.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || 'item';

  if (!(await isTaken(root))) return root;

  // Try a few numbered variants before falling back to a random suffix.
  for (let suffix = 2; suffix <= 20; suffix++) {
    const candidate = `${root}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${root}-${Math.random().toString(36).slice(2, 8)}`;
}
