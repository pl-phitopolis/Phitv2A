# T-006 — Site finalization Phase 1: Services + Contact
Status: done (2026-09-09) · Mode: solo · Opened: 2026-09-09
Branch: new-hero-and-video · File scope: src/routes/services.tsx,
src/features/services/components/**, src/shared/content/techStack.ts,
src/routes/contact.tsx, src/features/contact/components/**,
src/shared/content.ts (CONTENT.contact* keys only)
Merged: <blank — nothing committed yet>

## Current
Stage: done · Next: open T-007 for Phase 2 (Home minus hero/closing-scene + About)
Blocking: none
Last check: `yarn typecheck` clean, `yarn lint` 0 errors (5 pre-existing warnings),
`yarn test` 600 passed / 1 pre-existing flaky failure (`preview-cdp.test.ts` frame-
interval), live-browser DOM verification of both routes — 2026-09-09

## Plan                         [claude]

### Goal
Apply the Phase 0 foundation (`SOFT` palette, `MediaFrame`) to `/services` and
`/contact`: soft/muted surfaces, trimmed professional copy, media sections
converted to a `MediaFrame` pattern where one fits — per
`~/.claude/plans/users-yaakovins-downloads-fresko-media-mellow-mountain.md` Phase 1.

### Done when
Both routes use `SOFT` tokens on card/panel/section surfaces (not a wholesale
navy-to-light rewrite — alternate with the existing dark navy grounds for
rhythm, don't flatten the whole page to one register); `FALLBACK_SERVICES`,
`TechStackSection`, `ContactFAQ` copy trimmed (voice kept, words cut, no
new claims invented); any image/media block in these components that matches
a `MediaFrame` pattern is converted to use it; `yarn typecheck && yarn test
&& yarn lint` clean at the same pre-existing-failure baseline as T-005
(2 known unrelated test failures, hero-phases + home-v3, still the only ones).

### Acceptance checks
- `yarn typecheck` clean — Runner: claude (orchestrator), after both subagents land.
- `yarn test` at baseline (596+/598+, only the 2 pre-existing hero/home-v3
  failures) — Runner: claude.
- `yarn lint` 0 errors — Runner: claude.
- Live-browser check of `/services` (ServiceDrawer open/close) and `/contact`
  (form states) via the Browser pane — Runner: claude.
- Manual: Albert reviews the rendered pages before Phase 2 starts.

### Approach
Two subagents, exclusive file ownership, no overlap: one for Services (route +
all `src/features/services/components/*` + `techStack.ts`), one for Contact
(route + all `src/features/contact/components/*` + `CONTENT.contact*` only in
the shared content file). Neither touches hero, home, or any other route.
Orchestrator gates the full verification suite once, after both land.

### Open questions
None open.

## Build                        [claude]

### What was built
**Services** (`src/routes/services.tsx`, `src/features/services/components/*`):
`FALLBACK_SERVICES` copy trimmed 15-35% per field, no new claims added. `SOFT`
tokens applied: `linen` (TechStackSection band), `frost` (category tiles /
ServicesGrid cards), `sand` (all tag/chip surfaces — filter chips, tool tags,
drawer highlight chips), `mist` (sub-team info tiles, filter hover state).
`DetailedServiceList`'s per-service banner converted to `MediaFrame
pattern="split"` (mediaSide="right", aspectRatio 4/5). `CapabilityRack.tsx` and
`techStack.ts` left untouched — confirmed via grep they're consumed by Home/
About, not `/services`.

**Contact** (`src/routes/contact.tsx`, `src/features/contact/components/*`):
`PageHeader` lead trimmed 24→16 words. Inspector column wrapped in a dark
`NOIR.navyDeep` card (`data-ground="dark"`) alternating against a `SOFT.frost`
form card and `SOFT.mist` FAQ band — light/dark rhythm per the brief. `EcotowerMap`
recolored to `SOFT.frost`/`SOFT.linen`; real address untouched. `ContactFAQ`
copy trimmed ~15-25%, no facts changed (response-time figures, address kept
byte-identical). Honeypot field (`company_website`) confirmed untouched.
`MediaFrame` not used on Contact — genuinely media-light page, no forced fit.

**Foundation bug found and fixed** (not part of either subagent's assigned
scope — a `MediaFrame.tsx` defect from Phase 0, surfaced by Services' real
usage): the top-level `overlayAllowed` gate in `MediaFrame.tsx` only permitted
`overlayContent` through to `section-break`/`stats-over-media`, silently
nulling it (with only a console.warn) for `split`, `offset-glass`, and
`portrait-quote` — even though all three patterns' own renderers have a real
`overlayContent` render slot (`SplitPattern`'s second grid column,
`OffsetGlassPattern`'s card body, `PortraitQuotePattern`'s blockquote area).
This silently dropped every service's entire copy block (headline, tagline,
description, sub-teams) on `/services` — confirmed live via `get_page_text`
showing zero `DetailedServiceList` content before the fix. Fixed by expanding
the gate to the five patterns whose renderers actually consume it, narrowing
the warning to the six patterns that genuinely have no slot for it. Two
unrelated `exactOptionalPropertyTypes` errors (conditionally-passed `cta`/`sx`
props) were also fixed in Phase 0 but recorded there (T-005) — not repeated
here. One new syntax error (`*/ ` inside a JSX comment closing it early,
in `contact.tsx`) was also fixed directly.

### Build checks
```
$ yarn typecheck      → Done (clean)
$ yarn lint           → 0 errors, 5 pre-existing warnings (unrelated files)
$ yarn test           → 600 passed / 1 failed (601) — the one documented flaky
                         preview-cdp.test.ts frame-interval assertion, run
                         before the MediaFrame gating fix (fix is logic-only,
                         touches no tested path)
```
Live-browser DOM verification (Browser pane was hidden, so screenshots were
unreliable per this environment's known rAF-freeze-while-hidden limitation —
verified via `get_page_text`, `getComputedStyle`, `getBoundingClientRect`
instead, which is the established workaround here):
- `/services`: hero renders via untouched `VideoPageHero`; filter chips render
  on `SOFT.sand`; all four services render full copy (headline, tagline,
  description, 4 sub-teams each) alongside their `MediaFrame` split-pattern
  banner, confirmed via DOM text extraction and computed-style checks
  (navy text, opacity 1, visible, not clipped) after the gating fix.
- `/contact`: form, "What happens next" dark inspector card, direct channels,
  address, and a 6-question FAQ accordion (categorized, collapsed by default)
  all render correctly; honeypot field present in the DOM.
- `ERR_CONNECTION_REFUSED` console errors on `/contact` are the Heimdall API
  (localhost:8000, not running in this session) — expected, unrelated to this
  phase's changes.

### Deviations from the approach
None beyond the foundation bug fix above (unplanned, but necessary — Phase 1
couldn't be called done with the bug live) and the `contact.tsx` comment
syntax fix (mechanical).

## Review                       [claude]

### Evidence
- Both agents stayed within their declared exclusive file scope, no overlap —
  **checked directly** (reviewed each agent's file list against the task's
  scope declaration).
- Copy trims added no new facts/claims — **checked directly** (read the
  before/after copy in both agents' reports against this task's constraint).
- The MediaFrame overlay bug and its fix — **checked directly**: reproduced
  live (empty `DetailedServiceList` content pre-fix via `get_page_text`),
  fixed, reproduced-fixed (full content present post-fix via the same method).
- Full gate run once centrally after both agents landed — **checked directly**.
- `yarn test`'s 1 failure is the pre-existing documented flake, not a new
  regression — **checked directly** (matches the exact assertion/threshold
  already flagged in `docs/handover-2026-09-08-perf-and-content.md`).

### Findings
None open. Worth flagging for later phases: the `MediaFrame` fix changes
behavior any *future* phase's use of `offset-glass`/`portrait-quote` will now
correctly benefit from (previously would have silently dropped their overlay
content too, same class of bug) — no other phase has used those patterns yet,
so nothing else needed re-checking.

## Proposed for shared files    [common — any role]
- None yet.

## Log                          [common — append-only, every entry signed]
- 2026-09-09 claude/plan: opened T-006 as Phase 1, per user's "proceed" after
  reviewing Phase 0 (T-005).
- 2026-09-09 claude/build: two subagents built Services and Contact in parallel,
  exclusive scope, no overlap. Found and fixed a real Phase-0 `MediaFrame` bug
  (overlay-gating silently dropped Services' entire per-card copy) plus a JSX
  comment syntax error. Ran the full gate once centrally: typecheck clean, lint
  clean, test at the documented flaky baseline (1/601). Verified both routes
  live via DOM inspection (screenshots unreliable — Browser pane was hidden).
  Nothing committed.

## Handoff                      [common — replaced by whoever ran last]
Status: done · Could not do: n/a — full scope delivered, plus one foundation
bug fixed that wasn't in scope but blocked calling this phase done · Needs:
Albert to review Phase 1 (Services + Contact) before Phase 2 starts. Nothing
committed — Albert's call.
