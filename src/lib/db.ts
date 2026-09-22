import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 talks to the database through a driver adapter rather than a bundled
// query engine, so the pg adapter is wired up explicitly here.
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env, then run `npm run db:start`.'
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// Next.js hot-reloads modules in development, which would otherwise build a new
// client (and a new pool of database connections) on every save until the
// database refuses new connections. Caching on globalThis keeps exactly one.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  return (globalForPrisma.prisma ??= createPrismaClient());
}

// The client is created on first use, not when this module is imported.
// `next build` imports every route to collect its configuration, and a hosted
// build step may not have DATABASE_URL - so a missing URL should fail the first
// query, not the whole build.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
