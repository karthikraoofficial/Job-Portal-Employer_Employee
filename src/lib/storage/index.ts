import 'server-only';

import { databaseStorageDriver } from './database';
import { localStorageDriver } from './local';

/**
 * The storage interface the rest of the app codes against.
 *
 * Nothing outside src/lib/storage/ should know where files actually live.
 * Moving to S3 or R2 later means writing one more driver and changing the
 * switch below - no page, action, or route handler changes.
 */
export interface StorageDriver {
  /** Writes a file and returns the key needed to read it back. */
  put(input: { data: Buffer; extension: string; prefix?: string }): Promise<string>;
  /** Reads a file. Returns null if the key does not exist. */
  get(key: string): Promise<Buffer | null>;
  /** Deletes a file. Succeeds silently if it was already gone. */
  remove(key: string): Promise<void>;
}

const DRIVERS: Record<string, StorageDriver> = {
  local: localStorageDriver,
  db: databaseStorageDriver,
};

const driverName = process.env.STORAGE_DRIVER ?? 'local';
const driver = DRIVERS[driverName];

if (!driver) {
  throw new Error(
    `Unknown STORAGE_DRIVER "${driverName}". Available: ${Object.keys(DRIVERS).join(', ')}`
  );
}

export const storage = driver;
