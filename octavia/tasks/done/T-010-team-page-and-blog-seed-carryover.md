# T-010 — Team page + blog seed carryover from legacy site
Status: done (2026-09-15) · Mode: solo · Opened: 2026-09-15
Branch: feat/team-page-and-blog-seed-content · File scope: src/routes/team.tsx,
src/features/team/**, src/shared/content.ts (CONTENT.team, CONTENT.blog only),
src/features/blog/fallback.ts, src/shared/components/megaNavItems.ts,
src/shared/components/navbarAnchors.ts, src/shared/components/media/MediaFrame.tsx
(text-color fix only)
Merged: <blank — nothing pushed/merged yet>

## Current
Stage: done · Next: open a follow-up task if/when Services or About gets a scope
owner for the two backlog items (AI Day proof-point metrics, partner-school/cert
list) — see the rebuild carryover proposal.
Blocking: none
Last check: `npx tsc -b` clean, `npx eslint .` 0 errors (4 pre-existing warnings,
none in touched files), `npx vitest run` 625 passed / 7 skipped (baseline),
`npx vite build` clean with correct chunk isolation, live-browser screenshot of
`/team` via Playwright — 2026-09-15

## Plan

### Goal
Port the two "ready now" items from the legacy-site carryover proposal into
Phitv2A without touching the in-flight home rebuild (T-009): a `/team`
leadership-bios route (no equivalent existed), and two real blog posts added
to the fallback teaser set.

### Done when
`/team` renders Mark Walbaum and Ben Cilia's bios (carried verbatim from the
legacy site's `app/team/page.tsx` / `constants.tsx`) using existing design-system
components only (`MediaFrame` portrait-quote, `Section`/`PageHeader`/`Reveal`),
reachable from the mega-nav drawer; `CONTENT.blog` gains the legacy site's two
real posts (6th-anniversary party, Christmas CSR gift-giving) appended after the
existing nine, with matching `FALLBACK_DATES`/`FALLBACK_BLOG_IMAGES` entries;
`npx tsc -b && npx eslint . && npx vitest run` all clean.

### Acceptance checks
- `npx tsc -b` clean — Runner: solo session.
- `npx eslint .` 0 errors — Runner: solo session.
- `npx vitest run` at or above the pre-existing baseline (625+/632, 7 known
  skips) — Runner: solo session.
- `npx vite build` succeeds; bundle-assertion suite (chunk isolation) passes —
  Runner: solo session.
- Live-browser check of `/team` (both bios, photos, CTA band) — Runner: solo
  session, via Playwright screenshot (no project browser-driving skill existed
  yet; recommend `/run-skill-generator` if this becomes a recurring need).

### Approach
Reused existing design-system primitives rather than porting the legacy page's
Tailwind/framer-motion implementation: `MediaFrame`'s `portrait-quote` pattern
(circular portrait + blockquote + attribution) already matches a bio card
exactly, so `TeamMemberCard` is a thin wrapper adding only the expertise-chip
row `MediaFrame` has no slot for. Blog carryover is additive-only: two more
entries in `CONTENT.blog` plus matching `FALLBACK_DATES`/`FALLBACK_BLOG_IMAGES`
array entries, ordered so the newest-first convention still holds (both
legacy dates predate all nine existing ones). Added `NAV_ANCHORS.TEAM_PAGE`
(single-anchor page, same rationale as `CONTACT_PAGE`/`SERVICES_PAGE`) and a
`/team` entry in `MEGA_NAV_ITEMS` under the "people" group.

### Open questions
None open. The proposal's two "backlog" items (AI Day proof-point metrics on
Services, partner-school/cert list on About) are intentionally out of scope —
they need a scope owner for those pages, not a rebuild-week decision.

## Build

### What was built
- `src/routes/team.tsx`, `src/features/team/components/TeamMemberCard.tsx`,
  `src/features/team/index.ts` — new route.
- `src/shared/content.ts` — added `CONTENT.team` (overline/title/lead/members)
  and appended two entries to `CONTENT.blog`.
- `src/features/blog/fallback.ts` — appended two entries each to
  `FALLBACK_DATES` and `FALLBACK_BLOG_IMAGES`, index-matched to the two new
  `CONTENT.blog` entries.
- `src/shared/components/navbarAnchors.ts`, `megaNavItems.ts` — new anchor +
  nav item.

### Build checks
```
$ npx tsc -b               # clean
$ npx eslint .             # 0 errors, 4 pre-existing warnings (unrelated files)
$ npx vite build            # clean, MediaFrame in its own lazy chunk
$ npx vitest run tests/bundle-assertion.test.ts   # 5 passed
$ npx vitest run            # 625 passed, 7 skipped
```
Live-browser (Playwright, headless Chromium): navigated to `/team`, pressed
Escape to skip the intro preloader (per its own "ESC TO SKIP" affordance),
confirmed both bios, photos, and the careers CTA band render; no console
errors traceable to this change (only pre-existing CORS errors from the
Heimdall API not running locally, same as any other route in this environment).

### Deviations from the approach
Found and fixed a pre-existing, unrelated bug while exercising `MediaFrame`'s
`portrait-quote` pattern for the first time on a real light-ground page: four
call sites in `MediaFrame.tsx` (`grid-3up` caption, `sticky-pinned` step body,
`portrait-quote` attribution, `inline-editorial` caption) used `SOFT.mist`
(`#E9ECF3`, a near-white *ground* token) as **text color**, making captions
and the attribution line ~invisible against `SOFT`'s own light grounds.
Confirmed via grep that every other `SOFT.mist` usage in the codebase is a
`bgcolor`, and `palette.ts`'s own doc comment says text on `SOFT` grounds
should be `NOIR.navyField` "or a navy-based secondary at alpha" — changed all
four to `color: "text.secondary"` (MUI theme token, resolves to
`rgba(10, 42, 102, 0.82)`), matching that documented contract. Small, safe,
narrowly-scoped fix; flagged here rather than silently bundled in case the
low-contrast look was somehow intentional elsewhere.

## Log
- 2026-09-15 solo/plan+build: implemented `/team` route + blog seed content per
  the rebuild carryover proposal's "port" items; found and fixed the
  `MediaFrame` `SOFT.mist`-as-text-color bug while verifying `/team` visually.
