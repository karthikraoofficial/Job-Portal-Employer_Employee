# Job Portal

A job board where employers post listings and job seekers apply and track each application as a dated record.

## Language

### People

**Seeker**:
A user with the SEEKER role, looking for work and applying to listings.
_Avoid_: candidate, applicant (except when seen from a listing's side)

**Employer**:
A user with the EMPLOYER role who owns one company and posts its listings.
_Avoid_: recruiter, hirer

### Hiring

**Listing**:
One job opening posted by an employer (the `Job` model). It is a draft, published or closed.
_Avoid_: post, ad, vacancy

**Published listing**:
A listing visible to the public and to search engines; drafts and closed listings are private to their employer.

**Register**:
The public page at `/jobs` that lists every published, unexpired listing.
_Avoid_: job feed, board page

**Application**:
A seeker's submission to one listing, which moves through stages from Applied to Hired, or ends Rejected or Withdrawn.

### Search engines

**Site URL**:
The site's public origin used in canonical URLs, the sitemap and link previews, resolved as described in ADR 0001.

**JobPosting data**:
The schema.org `JobPosting` JSON-LD on each published listing's page; what Google reads to show the listing in its job search.
_Avoid_: rich snippet, job schema
