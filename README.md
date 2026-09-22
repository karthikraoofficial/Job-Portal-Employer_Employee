# Job Portal

A two-sided job portal: employers post roles and manage applicants, job seekers
search, apply, and track their applications.

**Status: Phases 1-4 of 5 complete and verified.** Accounts, job posting, search,
applying, the hiring pipeline, profiles and resume upload all work. Email
notifications are the only piece left — see [Roadmap](#roadmap).

---

## Run it

You need **Node.js 22+**. You do *not* need Docker.

```bash
npm install        # once
npm run db:start   # starts a local Postgres (background)
npm run db:push    # creates the tables
npm run db:seed    # sample companies, jobs, applicants and two demo logins
npm run dev        # http://localhost:3000
```

Open http://localhost:3000/jobs to browse and search listings. Register at
/register — choose "Find a job" or "Hire people" and you land on the matching
dashboard. As an employer, add your company details, then post a job.

Or skip registering and use a seeded demo account (password `demo-password`):

| Account | Email | What you'll see |
|---|---|---|
| Employer | `employer@demo.seed` | Bluebird Technologies, with applicants at several pipeline stages |
| Job seeker | `seeker@demo.seed` | A profile and three applications: one in interview, one pending, one rejected |

Set `NEXT_PUBLIC_DEMO_MODE="true"` to show one-click buttons for these on the
login page. Re-running `npm run db:seed` resets both accounts.

To stop the database later: `npm run db:stop`.

> **If the database won't connect**, its port may have changed. Run
> `npx prisma dev ls`, copy the `postgres://...` URL, and paste it into
> `DATABASE_URL` in `.env`.

---

## The stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | One app instead of three. Server-rendered pages so job listings are indexable by Google — that's how job boards get traffic. |
| Language | TypeScript | Catches broken data shapes across the client/server boundary before you run anything. |
| Database | PostgreSQL 17 | Full-text search for the job search feature. Verified working. |
| ORM | Prisma 7 | Typed queries generated from one schema file. |
| Auth | Better Auth 1.6 | Stable, unlike Auth.js v5 which is still beta. Sessions, password hashing, and rate limiting built in. |
| Styling | Tailwind CSS 4 | No separate stylesheet to keep in sync. |
| Validation | Zod 4 | One schema, enforced in the browser *and* on the server. |

---

## How it's laid out

```
src/
  app/
    (auth)/login, (auth)/register   sign in / sign up
    seeker/                         job seeker area
    employer/                       employer area
    api/auth/[...all]/              all auth endpoints
  components/                       shared UI
  lib/
    db.ts          the one Prisma client
    auth.ts        auth config - the source of truth for sessions
    auth-client.ts browser-side auth
    session.ts     getCurrentUser / requireUser / requireRole
    validation/    Zod schemas shared by forms and server code
    applications.ts  the hiring pipeline: stages, labels, terminal states
    jobs/search.ts   full-text search + filters, in parameterised SQL
    storage/         where uploaded files live: local disk, or Postgres (STORAGE_DRIVER=db)
    demo.ts          the public demo accounts
    resume-file.ts   upload validation by file contents
  server/actions/  every mutation; each re-checks auth and ownership
  proxy.ts         route protection
prisma/schema.prisma
uploads/           uploaded resumes - gitignored, never served directly
```

**Uploaded files are never public.** They are written to `uploads/`, outside
`public/`, and are only reachable through `/api/resume/me` or
`/api/applications/[id]/resume`, which check who is asking on every request.
Filenames on disk are random UUIDs, so nothing can be guessed.

**A note on optional form fields.** `formData.get(name)` returns `null` when a
field is absent, and Zod's `.optional()` accepts only `undefined` — so an absent
optional field fails validation and takes the whole submission with it. Use
`optionalFormText()` from `src/lib/validation/form.ts` for every optional field.
This broke the entire status pipeline once already.

**Two rules worth keeping.**

*Replaceable things sit behind an interface in `src/lib/`.* Storage and email
will each get an adapter, so swapping local disk for S3 means writing one file,
not editing pages.

*The server never trusts the browser.* `proxy.ts` redirects the wrong role away
from `/employer` and `/seeker`, but that's a convenience, not security — a
Server Action can be called directly. Every protected page and action calls
`requireRole()` again server-side.

---

## The data model

`prisma/schema.prisma` is the whole design. Beyond the obvious tables:

- **`ApplicationEvent`** is append-only — one row per status change, never
  edited or deleted. That history is what makes application tracking real rather
  than a single mutable field, and it powers both the seeker's timeline and the
  employer's audit trail.
- **`Application`** has a unique constraint on `(jobId, seekerId)`, so nobody
  can apply twice.
- **`Application`** also snapshots the resume at apply time, so editing your
  profile later doesn't rewrite history for an employer mid-review.
- **`DismissedJob`** is the grown-up version of the prototype's "Decline" —
  it hides a job from your results without recording an application.

Inspect real data with `npm run db:studio`.

---

## About migrations

`npm run db:push` syncs the schema. `npm run db:migrate` — which writes
versioned migration files — **does not work with the default local database**.

The local server (`npm run db:start`) is PGlite, Postgres compiled to
WebAssembly. It is genuinely Postgres, and full-text search and everything else
works, but it cannot create the scratch "shadow" database that Prisma migrations
need.

That is fine for development. Before deploying, switch to full Postgres:

```bash
docker compose up -d     # needs Docker Desktop
```

then set in `.env`:

```
DATABASE_URL="postgres://jobportal:jobportal@localhost:5432/jobportal"
SHADOW_DATABASE_URL="postgres://jobportal:jobportal@localhost:5432/jobportal_shadow"
```

and `npm run db:migrate` will work. `docker-compose.yml` also gives you Adminer
at http://localhost:8080 for browsing the database.

---

## Deploying to Vercel

The live demo runs on Vercel with a Neon Postgres database, both on free plans.

1. **Import the repo** at [vercel.com/new](https://vercel.com/new). Vercel detects
   Next.js; leave the build settings alone. The site won't work until the
   steps below are done.
2. **Add a database:** in the Vercel project, open *Storage* → *Create* → *Neon*
   and connect it to the project. Check that `DATABASE_URL` now appears under
   *Settings* → *Environment Variables*.
3. **Set environment variables** (*Settings* → *Environment Variables*):

   | Name | Value |
   |---|---|
   | `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `STORAGE_DRIVER` | `db` — Vercel has no persistent disk |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` for a public demo |

   Do **not** set `BETTER_AUTH_URL` unless it is exactly the site's address.
   A mismatch makes every sign-in fail with "Invalid origin"; left unset, it is
   taken from each request.
4. **Create the tables and demo data**, once, from your machine. Use the
   *unpooled* connection string (`DATABASE_URL_UNPOOLED`, shown in the Neon tab
   in Vercel): schema changes need a direct connection. PowerShell shown:

   ```powershell
   $env:DATABASE_URL = "<Neon connection string>"
   npm run db:push
   npm run db:seed
   Remove-Item Env:DATABASE_URL
   ```

5. **Redeploy** (*Deployments* → *⋯* → *Redeploy*). Every later push to `main`
   deploys automatically.

To undo whatever demo visitors have changed, run step 4 again.

---

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Start the site |
| `npm run db:start` / `db:stop` | Start / stop the local database |
| `npm run db:push` | Apply schema changes |
| `npm run db:seed` | Load 12 sample jobs (safe to re-run) |
| `npm run db:studio` | Visual database browser |
| `npm run typecheck` | TypeScript check - must pass before any phase is done |
| `npm run build` | Production build |

---

## Roadmap

- [x] **Phase 1 — Foundation.** Registration with role choice, login, sessions,
      role-gated dashboards, full database schema.
- [x] **Phase 2 — Jobs & search.** Employers create, edit, publish, close and
      reopen listings; public `/jobs` page with full-text search, filters,
      sorting and pagination; per-listing SEO metadata.
- [x] **Phase 3 — Applications & tracking.** Apply with a cover letter; employers
      move applicants through Shortlisted → Interviewing → Offer → Hired (or
      reject); seekers see a live timeline and can withdraw.
- [x] **Phase 4 — Profiles & resumes.** Seeker profiles with skills; resume
      upload validated by file contents; downloads behind an authorised route,
      readable only by the applicant and the hiring employer.
- [ ] **Phase 5 — Email & polish.** Console email adapter, templates, empty and
      error states, mobile layout.

### What has been tested

Verified by driving the running app over HTTP, not by reading the code.

**Phase 1 — accounts and roles**

- Both roles register, and `role`/`phone` persist correctly
- Signed out, `/seeker` and `/employer` redirect to `/login?next=...`
- A seeker opening `/employer` is redirected to `/seeker` — and the reverse
- Public pages stay public (an early bug where the route matcher swallowed every
  request, including the auth API, was caught here and fixed)
- Database round-trip: full object graph, enums, string arrays, the duplicate
  application guard, and Postgres full-text search

**Phase 2 — jobs and search**

- Every filter returns the right count: keyword, location, employment type,
  experience level, minimum salary, remote-only, and combinations
- Searching `engineers` finds jobs titled `engineer` — real full-text stemming,
  which a `LIKE` query could not do
- Pagination splits 12 jobs into 10 + 2 with no repeats across pages
- Sorting works: highest salary first, and relevance ranking puts the UI/UX
  Designer top for the query "design"
- **Employer A editing employer B's job returns 404 — in both directions**
- **Draft listings are invisible** to anonymous visitors, to other employers, and
  in public search — but the owner can preview their own
- **SQL injection through the search box does nothing.** `'; DROP TABLE job; --`
  and friends return normal results and the table survives — every value is a
  bound parameter
- Malformed URLs (`?page=abc`, `?type=NOPE`, `?sort=hack`) render results rather
  than erroring
- Per-listing SEO `<title>` and `<meta description>` render server-side

**Phase 3 — applications and the hiring pipeline**

Driven through the real Server Actions, by replaying each form the way a browser
with JavaScript disabled would submit it.

- Full loop: seeker applies → employer moves them Shortlisted → Interviewing →
  Offer → Hired, with **five audit events** written and the timeline rendering
  each one
- **Applying twice is impossible** — the second attempt redirects and no second
  row is created
- **Employer B cannot touch employer A's applicant** — rejected, and the status
  is unchanged afterwards
- **A seeker cannot use the employer's status action** — `requireRole` redirects
  before the action body runs
- **A seeker cannot withdraw someone else's application** — rejected
- **Hired / Rejected / Withdrawn are terminal.** Trying to move a hired
  application is refused, so the audit trail cannot be rewritten
- The Withdraw button disappears once an application is closed
- Employers see applicant contact details and cover letters for their own jobs
  only; the funnel counts per stage are correct

**Phase 4 — profiles and resumes**

- **A Windows executable renamed `cv.pdf` is rejected**, as is a plain text file
  with a `.pdf` name — validation reads the file's leading bytes, not its name or
  its Content-Type, both of which the browser supplies and anyone can fake
- Genuine PDF, `.doc` and `.docx` uploads are accepted
- Oversized files are rejected with a readable message and the stored resume is
  left untouched
- **Path traversal is blocked.** With `../../.env` and `/etc/passwd` planted
  directly into the database as a storage key, downloads were refused and **no
  secrets leaked**
- Download authorisation, checked against every caller: the applicant gets 200,
  the hiring employer gets 200, an **unrelated seeker gets 404** (not 403, so the
  endpoint cannot be used to discover which application ids exist), and an
  anonymous request gets 401
- Downloads send `Content-Disposition: attachment`, `Cache-Control: private,
  no-store` and `X-Content-Type-Options: nosniff`
- Stored filenames are random UUIDs, so a resume cannot be guessed from a name
- Replacing a resume deletes the old file
- Skills de-duplicate case-insensitively and drop blank entries

- `npm run typecheck` and `npm run build` both pass clean

---

## Known gaps

- **Email verification is off** so you can register and use an account straight
  away. Turn it on in `src/lib/auth.ts` once Phase 5 wires up email sending.
- **`BETTER_AUTH_SECRET` in `.env` is a placeholder.** Generate a real one
  (`openssl rand -base64 32`) before deploying anywhere.
- **No tests yet.** Verification so far has been manual, against the running app.
- **Job search recomputes the search index on every query.** `to_tsvector` runs
  per row rather than being stored. That is fine into the low tens of thousands
  of listings; past that, add a stored `tsvector` column with a GIN index — which
  needs a real migration, so do it after moving to Docker Postgres.
- **Job descriptions are plain text**, deliberately: they are rendered with
  `whitespace-pre-line` rather than as HTML, so an employer cannot inject markup
  into a listing. Rich text would need sanitising first.
- **Uploaded resumes are not virus-scanned.** Format is verified, but a genuine
  PDF can still carry a malicious payload. Before going public, run uploads
  through a scanner such as ClamAV.
- **Removing a resume leaves the file on disk** on purpose: applications already
  sent reference it, and an employer mid-review should not lose the document.
  A cleanup job for files no longer referenced anywhere would be worth adding.
- **Server Action bodies are capped at 8 MB** in `next.config.ts`. The framework
  default is 1 MB, which is below the 5 MB resume limit — leaving it would make
  any resume over 1 MB fail with a raw 500 instead of a readable message.
- `npm audit` reports vulnerabilities in ESLint and PostCSS dependencies. They
  are build-time only and do not affect the running site; fixing them means a
  breaking ESLint upgrade.
