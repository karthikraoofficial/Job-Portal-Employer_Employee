// Validation for uploaded resumes.
//
// A filename and a Content-Type are both supplied by the browser and both are
// trivial to lie about. The real check is the file's leading bytes ("magic
// numbers"), which describe what the file actually is.

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

/** What the file picker offers. Not a security control on its own. */
export const RESUME_ACCEPT = '.pdf,.doc,.docx';

type ResumeKind = { extension: string; label: string };

/**
 * Identifies a resume from its first bytes.
 * Returns null when the content is not a format we accept.
 */
function sniff(data: Buffer): ResumeKind | null {
  // PDF files begin with "%PDF-"
  if (data.subarray(0, 5).toString('latin1') === '%PDF-') {
    return { extension: '.pdf', label: 'PDF' };
  }

  // .docx is a ZIP archive: "PK\x03\x04"
  if (data.subarray(0, 4).toString('latin1') === 'PK\x03\x04') {
    return { extension: '.docx', label: 'Word document' };
  }

  // Legacy .doc is an OLE2 compound file: D0 CF 11 E0 A1 B1 1A E1
  const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (data.subarray(0, 8).equals(OLE2)) {
    return { extension: '.doc', label: 'Word document' };
  }

  return null;
}

export type ResumeValidation =
  | { ok: true; data: Buffer; extension: string; filename: string; size: number }
  | { ok: false; error: string };

/**
 * Checks an uploaded resume.
 *
 * Rejects anything that is not really a PDF or Word document, however it is
 * named - so `virus.exe` renamed to `cv.pdf` does not get through.
 */
export async function validateResumeUpload(file: unknown): Promise<ResumeValidation> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose a file to upload.' };
  }

  // Size is checked before reading, so an enormous file is never buffered.
  if (file.size > MAX_RESUME_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return { ok: false, error: `That file is ${mb} MB. The limit is 5 MB.` };
  }

  const data = Buffer.from(await file.arrayBuffer());
  const kind = sniff(data);

  if (!kind) {
    return {
      ok: false,
      error: 'That does not look like a PDF or Word document. Upload a .pdf, .doc or .docx file.',
    };
  }

  // Keep the original name for display, but strip any path the browser included
  // and cap the length. This value is only ever shown or sent as a download
  // filename - it never touches the filesystem.
  const rawName = file.name.split(/[\\/]/).pop() ?? 'resume';
  const filename = rawName.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || `resume${kind.extension}`;

  return { ok: true, data, extension: kind.extension, filename, size: file.size };
}

/** Formats a byte count for display: "482 KB", "2.1 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
