<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Checks before calling work done

- `npm test`: Vitest unit tests (`src/**/*.test.ts`)
- `npm run typecheck`
- `npm run lint`
- `npm run build`: must pass with `DATABASE_URL` unset; nothing may query the database at build time (see `docs/adr/0001-site-url-and-request-time-sitemap.md`)
