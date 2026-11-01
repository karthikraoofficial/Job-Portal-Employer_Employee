# Site URL falls back to the Vercel production domain; the sitemap is built per request

Canonical URLs, the sitemap and link previews need the site's absolute address. We resolve it as `NEXT_PUBLIC_SITE_URL`, then `https://$VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`, so the live demo works with no extra config and preview deploys still point search engines at production, never at a throwaway preview URL. The sitemap queries the database, so it is marked `force-dynamic` and rendered on each request rather than at build time: builds must keep working without `DATABASE_URL` (commit f529726), and new listings show up in the sitemap immediately.

## Consequences

- Moving to a custom domain needs `NEXT_PUBLIC_SITE_URL` set, or canonicals keep pointing at `*.vercel.app`.
- `robots.txt` is static and bakes in the site URL at build time; changing the domain needs a redeploy.
