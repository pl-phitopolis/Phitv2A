# T-002 — WS4 pagination (backend-first: Heimdall career fields/rate-limit/innovation admin/job-postings pagination, then Fresko careers migration)
Status: active · Mode: solo · Opened: 2026-09-08
Branch: new-hero-and-video (Fresko) / main (Heimdall CMS) · File scope: "Heimdall CMS"/app/features/contact/**, app/features/innovation/**, app/features/careers/**, app/db/seed.py, app/main.py, alembic/versions/**; Phitv2A/src/features/careers/**, src/shared/api/keys.ts, src/shared/components/JobDetailsDrawer.tsx, src/routes/careers.*, tests/careers-*
Merged: —

## Current                      [common — startup path, replaced each session]
Stage: review · Next: a human decision on the category-tabs-vs-pagination UX tradeoff (see
Build > Deviations); a human/admin needs to populate real job postings in Heimdall (see
Blocking below — this is the biggest remaining gap); JobDetailsDrawer's live open-from-home-page
click-through still needs a person or a non-hidden browser session to verify, since this
session's Browser pane is hidden and cannot drive Lenis-smoothed scroll (see Handoff); hand
`content.ts`'s `careersData.ts` import off to whoever owns that file so the last static-data
file can be deleted.
Blocking: none for backend/frontend code correctness — but **Heimdall's `job_postings` table is
empty in the dev DB** (confirmed via `sqlite3` and `curl`). Neither `/careers` nor
`JobDetailsDrawer` will show any real content until an admin creates postings via the now-working
admin CRUD (B3/B4). This is a content/ops gap, not a code defect — the old static
`CAREER_POSITIONS` always showed *something* regardless of DB state; the migrated page now
correctly shows an honest empty state instead. Flagging prominently since it changes what a
person sees if they load the site right now. Separately: `src/shared/careersData.ts` cannot be
deleted from this task's file scope — `src/shared/content.ts:15,25` (outside scope, owned by an
earlier in-flight session) still imports it for `OPEN_ROLES_COUNT`.
Last check (checked directly, this session): Heimdall `uv run pytest` 272 passed/0 failed;
Fresko `yarn typecheck` clean (only unrelated in-progress-file errors from a concurrent
`astra-landing` session, not this task's); `yarn lint` 0 errors; `yarn test --run` 601 passed/1
failed (the same pre-existing `preview-cdp.test.ts` frame-interval flake from
`docs/handover-2026-09-08-perf-and-content.md`, unrelated); careers-specific suite
(`careers-index`, `careers-detail`, `careers-detail-adversarial`) 27/27 passed. **Live browser
verification this session** (temp QA rows inserted into the dev DB via `sqlite3`, then deleted
afterward — not left behind): `/careers` renders real seeded postings with 0 console errors;
`/careers/{slug}` detail page renders all fields correctly from the API; submitted a real
application through the page and confirmed via direct DB read that `job_slug`/`job_title`
persisted correctly on the `contact_messages` row. `JobDetailsDrawer`'s wiring was verified by
code review only (correct: takes `jobSlug`, queries `careersPostQuery`, `CandidatesAndCareersSection`
maps title→slug correctly) — its live click-through was **not** checked; the home page's
`CandidatesAndCareersSection` never mounted content in this session because it sits below a
Lenis-smoothed scroll position this session's hidden Browser pane cannot reach (Lenis's own
`raf` loop is frozen while the pane is hidden — confirmed `window.__lenis.scrollTo()` is a no-op
here; native `window.scrollTo` is also intercepted by Lenis and did nothing). This matches a
known, previously-documented limitation of this environment, not a new one.

## Plan                         [claude]

### Goal
Ship pagination end-to-end for careers (backend job-postings pagination + frontend migration off
static data) and the backend pieces the handover doc named as gating it: career-application
fields on contact_messages, a rate limit on the contact POST, innovation admin CRUD, and seed
data for page-content/home/hero + company-profile. Innovation-hub's frontend list page is
explicitly deferred (separate task) — Coming Soon placeholder stays.

### Done when
- `/careers` and `/careers/$jobId` render from `GET /api/v1/job-postings` (paginated), not
  `CAREER_POSITIONS`; `JobDetailsDrawer` renders from the same API, not `JOB_DETAILS`.
- `contact_messages` has job_slug/job_title/portfolio_url columns via a real Alembic migration;
  a career application submitted through `/careers/$jobId` persists them.
- `POST /contact-messages` returns 429 on a 6th request within the window.
- Innovation posts are creatable/updatable/deletable via a new admin router; drafts are absent
  from the public list.
- `page-content/home/hero` and `company-profile` rows exist after a fresh seed run.
- Fresko `yarn typecheck && yarn lint && yarn test --run` — no new failures vs. the 600/1
  baseline recorded in `docs/handover-2026-09-08-perf-and-content.md`.

### Acceptance checks
- Heimdall test suite green including new tests for: career-app fields persist, rate limit 429
  on 6th request, innovation admin CRUD + draft exclusion, job-postings pagination past offset 50.
  Runner: build session (Heimdall CMS repo, `uv run pytest`).
- Fresko `yarn typecheck && yarn lint && yarn test --run` green, same baseline or better.
  Runner: build session.
- Manual: preview-server click-through of `/careers` pagination + folder-tab UX and
  `/careers/$jobId` application submit — **done this session, checked directly** (seeded temp
  QA rows via sqlite3, verified via browser + confirmed persisted DB row, cleaned up after).
  `JobDetailsDrawer` opens correct job by slug — **not checked**: this session's Browser pane is
  hidden, which freezes Lenis's raf loop and blocks all scroll (native and Lenis-driven) needed
  to reach `CandidatesAndCareersSection` on the home page. Needs a person, or a non-hidden
  browser session, or a screencast-verify pass via the reusable CDP harness.

### Approach
Backend-first (Heimdall), in order: B1 contact fields+migration → B2 rate limit → B3 innovation
admin CRUD → B4 paginate job-postings → B5 seed hero/company-profile → regenerate Fresko
schema.d.ts via `yarn typegen`. Then Fresko: C1 features/careers/api.ts → C2 migrate
careers.index.tsx + careers.$jobId.tsx → C3 migrate JobDetailsDrawer, delete careersData.ts +
jobDetails.ts → C4 blog regression check. Full detail + exact file:line references in
`~/.claude/plans/continuing-fresko-dev-work-cosmic-stearns.md`.

### Open questions
- None open. User already resolved two scope forks in chat: innovation-hub list page deferred
  to a separate task; JobDetailsDrawer migrates to the API rather than staying static.

## Build                        [claude]

### What was built
**Heimdall CMS** (built by a delegated build subagent, verified directly by this session):
- B1: `job_slug`/`job_title`/`portfolio_url` nullable columns on `contact_messages`
  (`app/features/contact/models.py:15-17`), threaded through `schemas.py`/`repository.py`/
  `service.py`; migration `alembic/versions/12c976c4d363_add_career_application_fields_to_.py`
  (down_revision `7c2ea91b4f30`), applied and verified via `PRAGMA table_info`.
- B2: `@limiter.limit("5/minute")` on `POST /contact-messages` (`app/features/contact/router.py`),
  mirroring `auth/router.py:51`.
- B3: `innovation` admin CRUD — service constructor now takes `session`/`audit`, commit+audit
  added to create/update/delete; new `admin_router` (prefix
  `/heimdall/admin/innovation-posts`, `AdminAuthDep`) with list/get/create/update/delete;
  registered in `app/api.py`.
- B4: `JobPostingPage` envelope added to `careers/schemas.py`; `list_page()` added to
  `careers/repository.py`/`service.py` (existing `list_ordered()` left untouched, confirmed no
  other callers); both public and admin `GET` on `careers/router.py` now take `PaginationDep`
  and return `JobPostingPage`.
- B5: `seed_page_content_if_empty()` added to `app/db/seed.py` (generic placeholder copy, no
  invented metrics/clients/locations), called from `app/main.py` lifespan.
- New tests: `tests/test_contact.py`, `tests/test_innovation_admin.py`,
  `tests/test_careers_pagination.py`, `tests/test_seed_page_content.py`; `tests/test_content_modules.py`
  updated for the new `job-postings` envelope shape.

**Fresko** (built by a delegated build subagent, verified directly by this session):
- C1: new `src/features/careers/api.ts` (careersKeys, `careersPostsQuery`/`careersPostQuery`),
  `keyRoots.careers` added to `src/shared/api/keys.ts`.
- C2: `src/routes/careers.index.tsx` and `careers.$jobId.tsx` migrated off `CAREER_POSITIONS` to
  the live API with pagination; `careers.$jobId.tsx`'s application-submit payload extended with
  `job_slug`/`job_title`/`website_hp`. Tests updated with new MSW fixtures in `tests/msw/handlers.ts`.
- C3: `JobDetailsDrawer.tsx` migrated to take a slug and fetch via `careersPostQuery`;
  `CandidatesAndCareersSection.tsx` updated to pass a slug (added a local
  `CAREER_TITLE_TO_SLUG` map since its data source, `content.ts`'s `CONTENT.careers`, has no
  slug field and is outside this task's file scope). `src/shared/components/jobDetails.ts`
  deleted (zero remaining references, confirmed by grep).
- Post-typegen regression fixes (this session, not the build subagent — surfaced by
  `yarn typecheck` after `yarn typegen`, outside the subagents' declared scope but necessary
  for a green build): added `status: "published"` to `src/features/blog/fallback.ts`'s
  fallback items and to `tests/blog-article.test.tsx`'s fixture (blog's generated type gained a
  required `status` field); added `website_hp: ""` to `ContactForm.tsx`'s submit call (contact's
  generated type gained a required second honeypot field, already accepted-but-unused by the
  backend per §A).

### Build checks
- Heimdall: `uv run pytest -q` → **272 passed, 0 failed** (baseline before this task: 249 passed).
  Checked directly by this session, not just reported.
- Fresko: `yarn typecheck` → clean of this task's changes (one remaining error is in
  `src/features/astra-landing/AstraLandingPage.tsx`, a concurrent session's own in-progress
  file, unrelated — confirmed by re-running after a pause showed it change shape, i.e. someone
  is actively editing it right now). `yarn lint` → 0 errors, 17 pre-existing warnings none of
  which are in this task's files. `yarn test --run` → **601 passed, 1 failed** (the same
  pre-existing `tests/preview-cdp.test.ts` frame-interval flake named in the handover doc,
  24.43ms vs threshold 22 — not touched, not raised). Careers-specific suite run in isolation:
  27/27 passed. All checked directly by this session.

### Deviations from the approach
- **job-postings pagination breaks the "all four categories visible at once" folder-tab UX** —
  flagged by the build subagent, confirmed real: the backend only supports `category` +
  pagination (no combined "all categories, paginated within each" query). The build kept the
  four category chips as URL-param navigation (paginating within a selected category, or an
  unfiltered "All" list), which necessarily changes the page from "browse everything at once" to
  "pick a lens, then page through it." This is a real UX change a human should look at, not a
  bug — needs a manual look before calling C2 fully done.
- **`src/shared/careersData.ts` was NOT deleted** as the plan assumed it could be once
  `JobDetailsDrawer`/`careers.*` migrated — `src/shared/content.ts:15,25` still imports
  `CAREER_POSITIONS` for `OPEN_ROLES_COUNT`, and `content.ts` is outside this task's file scope
  (owned by an earlier in-flight, not-mine session per the handover doc). Left in place;
  `jobDetails.ts` (which had no such cross-scope consumer) was deleted as planned.
- Two files needed post-typegen fixes outside the original file-scope list (`blog/fallback.ts`,
  `tests/blog-article.test.tsx`, `ContactForm.tsx`) — done directly by this session rather than
  re-delegating, since they were one-line-each mechanical fixes for fields the schema regen
  (this task's own `yarn typegen` run) newly required, not unrelated work.

## Review                       [claude]

### Evidence
- Done-when: `/careers`/`/careers/$jobId` render from the live paginated API, not
  `CAREER_POSITIONS` — **checked directly** (grep confirms no remaining `CAREER_POSITIONS`
  import in either route file; careers test suite passes against MSW-mocked API responses).
- `JobDetailsDrawer` renders from the API, not `JOB_DETAILS` — **checked directly** (file
  deleted, zero remaining references).
- contact_messages migration + field persistence — **checked directly** (migration applied,
  columns confirmed via `PRAGMA table_info`; `tests/test_contact.py` passes).
- Rate limit 429 on 6th request — **reported by the build subagent**, re-run as part of the
  272-passing full suite this session (not re-isolated individually) — tag: **reported by
  build, corroborated by a full green re-run**, not independently re-executed in isolation.
- Innovation admin CRUD + draft exclusion — same tag as above: reported by build, corroborated
  by full green re-run, not re-isolated.
- Pagination past offset 50 — same tag: reported by build, corroborated by full green re-run.
- `yarn typecheck && yarn lint && yarn test --run` no new failures vs. baseline — **checked
  directly**, this session, after fixing three post-typegen regressions (see Build > Deviations).
- Manual preview-server click-through (careers pagination/folder-tabs, application submit,
  JobDetailsDrawer opens correct job) — **not checked**. Runner: a person. This is the task's
  only remaining open acceptance check.

### Findings
- The category-tabs-vs-pagination UX change (Build > Deviations) needs a human look — not a
  defect, a product decision that fell out of a backend constraint (job-postings only filters by
  one category at a time). Flagging rather than picking silently.
- `src/shared/careersData.ts` still has one external consumer (`content.ts`'s `OPEN_ROLES_COUNT`)
  outside this task's scope — whoever owns `content.ts` next should replace it with a literal
  count and delete the file. Not blocking any of this task's Done-when criteria (nothing in
  this task depends on `careersData.ts` being gone, only on `/careers` and `JobDetailsDrawer` no
  longer reading from it, which is true).
- Pre-existing bug, not fixed here (deliberately, per plan §A): `contact_messages`' two honeypot
  fields (`company_website`, `website_hp`) are accepted by the schema but never checked by
  router/service. Both forms now send `website_hp: ""` to satisfy the type, which doesn't change
  this — the honeypot was already non-functional before this task and remains so.

## Proposed for shared files    [common — any role]
- Guardrail candidate: a schema/type regeneration (`yarn typegen`) can surface new required
  fields on generated types that break typecheck in files far outside the task that triggered
  it (this task's regen broke `blog/fallback.ts`, a blog test fixture, and `ContactForm.tsx` —
  none touched by either build subagent's declared scope). Worth a standing note that running
  `yarn typegen` obligates a full `yarn typecheck` sweep before calling any task done, not just
  a check of the files the task explicitly touched. [claude, this task] — not yet proposed to
  Albert in chat, holding here per protocol until approved.

## Log                          [common — append-only, every entry signed]
- 2026-09-08 claude: (demoted from SESSION.md "Next action" at the T-003 handoff, per PROTOCOL
  maintenance.) Outstanding for this task, verbatim as it stood:
  T-002: biggest open item is that Heimdall's `job_postings` table is empty in the dev DB — an
  admin needs to create real postings via the now-working admin CRUD before `/careers` or the home
  page have anything to show. `JobDetailsDrawer`'s live click-through and a UX call on
  career-tabs-vs-pagination (see its Build > Deviations) still need a person or non-hidden browser
  session — this session verified `/careers` + application-submit live but couldn't reach
  `JobDetailsDrawer` (Lenis scroll frozen while this pane is hidden). Also: whoever next owns
  `src/shared/content.ts` should drop its `careersData.ts` import so that file can finally be
  deleted. Separately, T-001's closing-video stall watchdog still needs its own manual browser QA
  — untouched this session, not mine to clear.
- 2026-09-08 claude: (demoted from SESSION.md "Last session" at the T-003 handoff, per PROTOCOL
  maintenance.) Opened T-002 for WS4 (pagination). Explored Heimdall + Fresko live and corrected
  the handover doc's WS4 framing in several places: blog pagination already works; job-postings has
  no pagination envelope yet; innovation's create/update/delete already exist unwired; no seed
  script exists for page-content/home/hero or company-profile. Plan approved by the user.
- 2026-09-08 claude/plan: read handover-2026-09-08-perf-and-content.md + the review plan at
  `~/.claude/plans/review-this-plan-for-jiggly-floyd.md`. Explored Heimdall + Fresko live via two
  Explore agents; found the handover's WS4 framing partly stale: blog pagination UI already
  works (regression-check only, not new build), job-postings has no Page envelope today (new
  backend work the handover didn't call out), innovation's create/update/delete already exist
  in repository/service (just unwired to a router — less work than implied), no seed script
  exists for page-content/home/hero or company-profile (upsert-only today). Asked the user two
  scope questions in chat: (1) build innovation-hub's real list page now, or defer — user said
  defer to a separate task; (2) migrate JobDetailsDrawer (home-page teaser, title-keyed
  JOB_DETAILS) onto the new API alongside /careers, or leave it static — user said migrate both.
  Plan approved by the user via ExitPlanMode.
- 2026-09-08 claude/build: delegated Heimdall B1-B5 to a build subagent; verified directly
  afterward (`git status --short` matched its report exactly, `uv run pytest -q` → 272/0,
  spot-read the new migration file and router diffs). Ran `uv run uvicorn` + `yarn typegen` from
  Fresko to regenerate `schema.d.ts` against the updated API — confirmed `JobPostingPage`/
  `Summary`/`Out` present. Delegated Fresko C1-C4 to a second build subagent; verified directly
  afterward (`git status --short` matched, confirmed `src/features/astra-landing/` and
  `docs/astra-landing/` are untouched — that's a concurrent session's work, not this task's,
  per the user's heads-up in chat that another assistant would be working in parallel). Found
  `yarn typecheck` broken by three post-typegen regressions outside both subagents' declared
  scope (blog fallback fixture + test fixture missing new required `status`, `ContactForm.tsx`
  missing new required `website_hp`) — fixed directly (one line each), confirmed
  `typecheck`/`lint`/full test suite green against baseline afterward. Wrote Build/Review
  sections above.
- 2026-09-08 claude/review: ran Heimdall (`uv run uvicorn`, port 8000) and confirmed the dev
  DB's `job_postings` table is **empty** (`curl .../job-postings` → `{"items":[],"total":0,...}`)
  — the migration is correct but there's currently no real career content to show. Inserted 4
  temporary QA rows via `sqlite3` (3 arbitrary + 1 matching `CandidatesAndCareersSection`'s
  hardcoded slug `quant-researcher`) purely to verify the live page, then navigated the Browser
  pane to `/careers`: all 3 postings rendered correctly, 0 console errors. Opened
  `/careers/quant-researcher-qa`: full detail rendered from the API. Filled and submitted the
  application form (had to dispatch the submit via `btn.click()` in `javascript_tool` — the
  computer tool's coordinate-based click landed but produced no request, likely because the
  page never receives a real paint pass while the pane is hidden, so the reported click
  coordinate doesn't correspond to anything real; a direct DOM `.click()` bypasses that) —
  confirmed via direct sqlite read that the new `contact_messages` row persisted
  `job_slug="quant-researcher-qa"` and `job_title="Quantitative Researcher"` correctly. Attempted
  to reach `JobDetailsDrawer` on the home page: `CandidatesAndCareersSection` never mounted
  (`document.body.innerText.length` stayed at 3365 chars the whole time) because it's below a
  scroll position this session can't reach — `window.scrollTo`, `element.scrollIntoView`, and
  `window.__lenis.scrollTo({immediate:true})` were all tried and all no-ops, confirming Lenis's
  internal `raf` loop (which actually applies the scroll) is frozen while the Browser pane is
  hidden. Verified the drawer's and `CandidatesAndCareersSection`'s wiring by reading both files
  directly instead — code is correct (slug-based query, honest title→slug map with a documented
  "not owned by this fix" caveat for whoever retitles `CONTENT.careers` next). Deleted all 4 QA
  rows and the 1 QA contact-message row afterward via `sqlite3`; confirmed `job_postings` and
  the extra `contact_messages` row are gone (`select count(*)` back to pre-QA state). Stopped
  the uvicorn process. Updated Current/Acceptance checks/Log/Handoff above with what was and
  wasn't actually checked. Checked Octavia Watch (`~/.octavia-projects` lists only "Octavia V3"
  and "AmssaiV2" — this repo isn't registered) — **Watch not run**, per protocol this is not
  evidence the repo is clean, just that the tool isn't wired up for this project.

## Handoff                      [common — replaced by whoever ran last]
Status: partial · Could not do: `JobDetailsDrawer`'s live open-from-home-page click-through —
this session's Browser pane is hidden, which freezes Lenis's scroll loop and makes the section
it lives in unreachable; the code was verified by reading it, not by driving it. Also could not
populate real career content — Heimdall's `job_postings` table is empty in the dev DB, so
anyone opening `/careers` or the home page right now will see an honest empty state / no
postings to click into, not a broken page. Also flagging, not blocking: the
category-tabs-vs-pagination UX tradeoff in careers.index.tsx wants a human look, and
`src/shared/careersData.ts` still has one out-of-scope consumer (`content.ts:15,25`) so it
couldn't be deleted. · Needs: (1) an admin to create real job postings via the now-working
admin CRUD (`/heimdall/admin/job-postings`) so the migrated pages have something to show — this
is the biggest real gap, bigger than the QA items below it; (2) a person, or a non-hidden
browser session, or the reusable CDP harness to actually click open `JobDetailsDrawer` from the
home page and confirm it; (3) a human call on the careers UX tradeoff; (4) whoever next owns
`content.ts` should drop the `OPEN_ROLES_COUNT` dependency on `careersData.ts` so it can finally
be deleted. Housekeeping items from the handover doc's §4 (Dockerfile tsc, package-lock, nginx
drift, deploy targets) are still next after this, per the user's original ordering — not
started. Nothing has been committed in either repo — both working trees are left as-is for the
user to review before deciding what to commit.
