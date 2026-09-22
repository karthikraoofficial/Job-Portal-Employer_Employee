import 'server-only';

import { randomUUID } from 'node:crypto';

import { prisma } from '../db';
import type { StorageDriver } from './index';

/**
 * Keeps file contents in the stored_file table.
 *
 * For hosts with no persistent disk (Vercel, most serverless platforms). Files
 * stay exactly as private as with the local driver: there is no URL for them,
 * only the authorised route handlers that call `get`.
 *
 * Postgres is a reasonable home at demo scale - resumes are capped at 5 MB.
 * Past a few thousand of them, move to an object store (S3, R2) instead.
 */
export const databaseStorageDriver: StorageDriver = {
  async put({ data, extension, prefix = 'resumes' }) {
    const key = `${prefix}/${randomUUID()}${extension}`;

    await prisma.storedFile.create({
      data: { key, data: new Uint8Array(data), size: data.length },
    });

    return key;
  },

  async get(key) {
    const file = await prisma.storedFile.findUnique({
      where: { key },
      select: { data: true },
    });

    return file ? Buffer.from(file.data) : null;
  },

  async remove(key) {
    // deleteMany rather than delete, so a key that is already gone is not an error.
    await prisma.storedFile.deleteMany({ where: { key } });
  },
};
