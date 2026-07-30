import 'server-only';

import { storage } from './storage';

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Streams a stored resume back to an authorised caller.
 *
 * Callers MUST check authorisation before calling this - it does no checking of
 * its own.
 */
export async function resumeResponse(key: string, filename: string | null) {
  const data = await storage.get(key);

  if (!data) {
    return new Response('Resume not found.', { status: 404 });
  }

  const extension = key.slice(key.lastIndexOf('.')).toLowerCase();
  const name = filename ?? `resume${extension}`;

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': CONTENT_TYPES[extension] ?? 'application/octet-stream',
      // `attachment` makes the browser download rather than render the file,
      // which stops a crafted document from executing in our origin.
      'Content-Disposition': `attachment; filename="${name.replace(/"/g, '')}"`,
      'Content-Length': String(data.length),
      // These files are private - no shared cache should ever keep a copy.
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
