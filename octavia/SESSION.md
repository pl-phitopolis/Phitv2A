# Session state
Updated: 2026-09-13 (T-009) · by: astra
Observed — branch: main (Fresko) / main (Heimdall CMS). NOTE: the
`new-hero-and-video` branch was merged to `main` (see `git log`: merges
`afd2016`, `4a75dfe`, plus `e4b36fd` the home redesign). Prior SESSION headers
said `new-hero-and-video`; that is stale — Fresko is on `main`.
Declared — Regime: solo · Next free ID: T-010

## Next action
T-009 build in progress (Astra, 2026-09-13), implementing Albert's fully scroll-driven
revision. Foundation extraction/tests first, then numbered N.5/N.6 units. See task
Current and dated Approach amendment. No in-page native transitions or scroll holds.
Preserve prior dirty work and About scope. Acceptance gates remain not checked.

---

T-006 done (2026-09-09): Phase 1 of the site-wide finalization pass — `/services`
and `/contact`, `SOFT` tokens applied with light/dark rhythm, copy trimmed (no new
claims), `DetailedServiceList` converted to `MediaFrame pattern="split"`. Found and
fixed a real Phase-0 `MediaFrame` bug along the way: `overlayContent` was silently
dropped for `split`/`offset-glass`/`portrait-quote` even though those patterns'
renderers have a real slot for it — this had deleted every service's entire copy
block on `/services` (headline/tagline/description/sub-teams), reproduced and
fixed live. Also fixed a `*/`-inside-JSX-comment syntax error in `contact.tsx`.
T-006 done (2026-09-09): Phase 1 of the site-wide finalization pass — `/services`
and `/contact`, `SOFT` tokens applied with light/dark rhythm, copy trimmed (no new
claims), `DetailedServiceList` converted to `MediaFrame pattern="split"`. Found and
fixed a real Phase-0 `MediaFrame` bug along the way: `overlayContent` was silently
dropped for `split`/`offset-glass`/`portrait-quote` even though those patterns'
renderers have a real slot for it — this had deleted every service's entire copy
block on `/services` (headline/tagline/description/sub-teams), reproduced and
fixed live. Also fixed a `*/`-inside-JSX-comment syntax error in `contact.tsx`.
Gate: typecheck clean, lint clean, test at the documented flaky baseline (1/601,
`preview-cdp.test.ts`). Verified both routes live via DOM inspection (screenshots
unreliable — Browser pane was hidden, known rAF-freeze limitation). Nothing
committed. **Next**: open T-007 for Phase 2 (Home minus hero/closing-scene +
About) once Albert has reviewed Phase 1.

T-005 done (2026-09-09): Phase 0 of a multi-phase site-wide finalization pass (every
route except the hero, approved by Albert in chat; plan at `~/.claude/plans/users-
yaakovins-downloads-fresko-media-mellow-mountain.md`). Added a `SOFT` palette object
(`palette.ts`, additive, contrast-tested) and a full 11-pattern `MediaFrame` component
family (`src/shared/components/media/`), built by two parallel subagents with exclusive
file ownership. Gate run once centrally: typecheck clean, lint clean, test 596/598
(2 pre-existing failures, both outside scope: hero + dormant Home-V3). Nothing committed.

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
T-008: home hero "development powerhouse" layout pass (build + review done
2026-09-10, gate green, was awaiting Albert's visual sign-off). **Superseded by
T-009 (2026-09-13, Albert's call in chat)** — the new hero is designed fresh,
RnD/SaaS/FinTech-themed; `HeroReel.tsx` is discarded outright, not adapted.
Full rev history (rev 1-3, taste pass, layout-collision fixes) preserved in
tasks/T-008-hero-powerhouse-layout.md — nothing deleted, nothing committed.

T-007 (home-page half only): Phase 2 finalization pass on `making-tomorrow/**`
(SOFT tokens + copy trims, build + review done 2026-09-10, gate green). **The
home-page half is superseded by T-009 (2026-09-13, Albert's call)** since that
whole surface is being replaced; the token/copy work itself was never
committed so nothing is lost. **T-007's `/about` half is unaffected and still
stands**, still awaiting Albert's manual visual review — see
tasks/T-007-finalization-phase2-home-about.md.

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
| T-009 Home page rebuild (remove gunshot hero, rebuild scroll flow) | solo | build in progress 2026-09-13 · foundation first | astra | main | see tasks/T-009-home-rebuild.md File scope header |
| T-007 Site finalization Phase 2 — About only (home half superseded by T-009) | solo | review done 2026-09-10 · gate green · awaiting Albert's manual visual review of `/about` | albert | main | src/routes/about.tsx, src/features/about/components/**, CONTENT.* (relevant keys) |
| T-003 Home page V3 — marketing reimagining with same-document View Transitions | solo | reverted 2026-09-09 at user instruction; `/` restored to the branch's own uncommitted hero-video HomePage; V3 code untouched on disk for later | — | new-hero-and-video | see tasks/T-003-home-v3.md header |
| T-001 hero lockup disappear/reappear + closing CTA video stall fix | solo | review · code complete, hero fix verified live, closing-video fix needs a manual scroll QA pass | — | new-hero-and-video | src/features/hero/**, src/features/home/components/closing-scene/**, tests/motion/hero-phases.test.ts |
| T-002 WS4 pagination (Heimdall backend + Fresko careers migration) | solo | review · code complete and verified green (Heimdall 272/0, Fresko 601/1 pre-existing), manual QA + one UX call outstanding | — | new-hero-and-video (Fresko) / main (Heimdall CMS) | see tasks/T-002-ws4-pagination.md header |

## Open questions
T-001: None open — scope confirmed with Albert: hero background video out of scope, fade+scale
disappear/reappear (not clip-path wipe), closing video fix is JS-side only (no re-encode).
T-002: None open — user resolved two scope forks in chat (innovation-hub list page deferred;
JobDetailsDrawer migrates to the API). See tasks/T-002-ws4-pagination.md Log.

## Last session
- 2026-09-13 astra/build: Implementing the revised fully scroll-driven T-009 plan,
  explicitly requested by Albert. Previous next action is preserved in the task Log.
- 2026-09-13: T-009 opened (plan mode). Explored the current hero/home
  architecture, reusable components for Albert's new 11-step home flow, and
  read the Octavia protocol + prior Astra-authored docs for handover-format
  precedent. Asked Albert 4 clarifying questions in chat (HeroReel disposition,
  a missing mission-core reference screenshot, how this relates to T-007/T-008,
  which of the 3 existing view-transition mechanisms to standardize on) —
  answers recorded in T-009's Approach. Wrote
  `docs/home-rebuild-2026-09/handover.md` (full spec, reuse-target table, N.5/
  N.6 delegation breakdown per flow step) and `tasks/T-009-home-rebuild.md`.
  Marked T-008 and T-007's home-page half superseded (see Superseded, above);
  T-007's `/about` half is untouched and still awaiting Albert's review. No
  application code touched; nothing committed; next runner is Astra.
- 2026-09-10 (later): T-008 hero layout pass + rev 2. Plan-mode research
  (Vercel, Cerebrium, Lusion, Unseen, Ramotion, Uncommon), Albert's calls in
  chat. Revs 1-2: reel plate → right-40% video panel. Rev 3 (taste pass, /taste
  binding standard): footage swapped off the flagged person → World Plaza
  lobby; editorial eyebrow re-added; headline/lead/index/proof all reworked to
  match the `.editorial-*` language and clear contrast; video → inset framed
  plate. Gate green (611/612 preview-cdp flake, motion 445, a11y-contrast
  green). Verified live 1440 + 375 + 320. Nothing committed. Mobile
  one-shot-on-load still flagged (pre-existing, out of scope).
- 2026-09-10: T-007 (Phase 2 finalization pass — home + `/about`). Resumed the
  rate-limit-blocked task; found the plan stale (`e4b36fd` had redesigned `/`
  and relocated the culture narrative onto `/about`), got Albert's scope calls
  in chat, revised the 3-agent split, ran it to completion. Applied the agents'
  proposed `CONTENT.*` copy trims serially. SOFT tokens + copy trims only, no
  motion-logic touched, no MediaFrame conversions. Gate green (typecheck/lint
  clean, test 600/601 = baseline), both routes verified live via DOM. Nothing
  committed. Open: Albert's manual visual review. Flagged 5 `e4b36fd`-orphaned
  components (`RawStage`, `ClosingShelf`, `process/processPhases`,
  `{Pillars,Process}EstablishingShot`) for a later cleanup task. See
  tasks/T-007-*.md.
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
