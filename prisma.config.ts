import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],

    // `prisma migrate` needs a scratch database to check migrations against.
    // The local server started by `npm run db:start` provides one, but does not
    // advertise it through DATABASE_URL, so we point at it explicitly.
    // Falls back to undefined (Prisma's default behaviour) when unset, which is
    // what you want against a hosted database.
    shadowDatabaseUrl: process.env['SHADOW_DATABASE_URL'] || undefined,
  },
});
