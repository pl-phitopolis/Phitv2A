# Session state
Updated: 2026-09-09 · by: claude
Observed — branch: new-hero-and-video (Fresko) / main (Heimdall CMS)
Declared — Regime: solo · Next free ID: T-005

## Next action
T-004 done (2026-09-09), including a same-day follow-up: fixed the home navbar (leftover
`pathname !== "/"` guard from T-003), a real `ScrollTrigger` pin-under-fast-scroll bug on
`/about` (lazy-loaded `JourneyTimeline` never refreshed ScrollTrigger after mounting, so a fast
scroll shortly after page load could permanently fail to pin `DailyLifeSection`), and hardened
the closing-CTA video's stall recovery (`ClosingVideoSection`) to run independent of scroll
ticks. All verified live via real-wheel-event CDP scripts, not assumed. See
tasks/done/T-004-*.md. **Still open**: a real Safari pass on the closing-video stall — only
Chrome was available here, and T-001 already flagged Safari as unverified. Nothing committed —
Albert's call. 3 pre-existing test failures from the T-003 revert remain flagged, not fixed.

Superseded:
T-003: code complete and verified in Chromium (5 view transitions fire, one each, all completing;
reduced motion produces none). Two things need a person: a **Safari 18+** pass, and a
**forced-fallback** run with `document.startViewTransition` stubbed undefined. Also awaiting a
taste call from Albert on two dials recorded in T-003's Handoff: the act gate holds scroll ~500-750ms
at three points, and VT-4/VT-5 fire within seconds of each other at the page bottom. Neither is a
defect; both are trades that want eyes. `tests/e2e/home-v3-verify.cjs` is the harness for all of it.

T-002: outstanding items now live in that task's Log and Handoff (empty `job_postings` in the dev
DB, `JobDetailsDrawer` click-through, and the career-tabs-vs-pagination UX call).

## Active
| Task | Mode | Stage / status | Who is up | Branch | File scope |
|---|---|---|---|---|---|
| T-003 Home page V3 — marketing reimagining with same-document View Transitions | solo | reverted 2026-09-09 at user instruction; `/` restored to the branch's own uncommitted hero-video HomePage; V3 code untouched on disk for later | — | new-hero-and-video | see tasks/T-003-home-v3.md header |
| T-001 hero lockup disappear/reappear + closing CTA video stall fix | solo | review · code complete, hero fix verified live, closing-video fix needs a manual scroll QA pass | — | new-hero-and-video | src/features/hero/**, src/features/home/components/closing-scene/**, tests/motion/hero-phases.test.ts |
| T-002 WS4 pagination (Heimdall backend + Fresko careers migration) | solo | review · code complete and verified green (Heimdall 272/0, Fresko 601/1 pre-existing), manual QA + one UX call outstanding | — | new-hero-and-video (Fresko) / main (Heimdall CMS) | see tasks/T-002-ws4-pagination.md header |

## Open questions
T-001: None open — scope confirmed with Albert: hero background video out of scope, fade+scale
disappear/reappear (not clip-path wipe), closing video fix is JS-side only (no re-encode).
T-002: None open — user resolved two scope forks in chat (innovation-hub list page deferred;
JobDetailsDrawer migrates to the API). See tasks/T-002-ws4-pagination.md Log.

## Last session
- 2026-09-09: T-004 (mini audit). Two user-reported bugs, both root-caused before touching code:
  navbar missing on `/` (leftover uncommitted guard from T-003, fixed — 3-line revert in
  `AppShell.tsx`) and about-page video autoplay-bleed (already fixed uncommitted, verified live
  via a headless-Chrome CDP scroll probe rather than assumed). `yarn typecheck` clean; no
  commit made. See tasks/done/T-004-*.md.
- Earlier bullets (T-003 build, T-001/T-002/WS1-WS3) demoted into their own task Logs at a prior
  handoff (PROTOCOL maintenance). Nothing deleted; see `tasks/T-001-*.md`, `tasks/T-002-*.md`,
  `tasks/T-003-home-v3.md` Logs, and `docs/handover-2026-09-08-perf-and-content.md`.

## Reading this cold?
GUARDRAILS.md, then PROTOCOL.md "Start here". Those plus your task file are all you need.
PROJECT.md is what the project is — read it when conventions matter.
