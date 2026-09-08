# T-004 — Home navbar missing + About daily-life video autoplay-bleed audit
Status: done · Mode: solo · Opened: 2026-09-09
Branch: new-hero-and-video · File scope: src/shared/components/AppShell.tsx,
src/features/about/components/JourneyTimeline.tsx,
src/features/home/components/closing-scene/ClosingVideoSection.tsx
Merged: (uncommitted — app change left on disk per user request, not committed)

## Current                      [common — startup path, replaced each session]
Stage: done · Next: none
Blocking: none
Last check: navbar/footer/overlay confirmed rendering on `/` via live browser screenshot
(2026-09-09); About-page video load/play/pause behavior confirmed via a headless-Chrome CDP
scroll probe (2026-09-09) — see Build.

## Plan                         [claude]

### Goal
Albert reported the live site as "completely broken" in two specific ways: (1) the shared
navbar does not render on the home page, (2) the About page's daily-life culture-film video
plays immediately on page load instead of only within its own pinned section, bleeding audible/
visible playback into the "2023 onwards" timeline section above it.

### Done when
The home route renders the shared `AppBar`/`SiteFooter`/`FloatingIdOverlay`, and the About
page's daily-life video does not fetch or play until its own section is scrolled to.

### Acceptance checks
- Home page (`/`) shows the `AppBar` (logo + nav + Contact) and footer — checked directly
  (browser screenshot).
- `/about`, `/services`, etc. are unaffected by the navbar fix — checked directly (`pathname`
  guard removal only touches the `"/"` case; other routes' guard condition was already `true`).
- `yarn typecheck` clean after the AppShell edit — checked directly.
- About page: no `daily-life-reel.mp4` network request or `video.play()` at page load —
  checked directly (CDP probe, see Build).
- About page: scrolling down to `#daily-life-stage` loads the source and starts playback;
  scrolling back away pauses it — checked directly (CDP probe, see Build).

### Approach
Root-caused via two parallel Explore agents + direct file reads (not fixed blind):
1. **Navbar**: `src/shared/components/AppShell.tsx` had uncommitted `pathname !== "/"` guards
   around `<AppBar>`, `<SiteFooter>`, `<FloatingIdOverlay>`, and `<CommandPalette
   showShortcut={pathname !== "/"}>`. These were added during T-003 (`CinematicHome`'s own
   masthead made the shared chrome redundant on `/`). T-003 was reverted 2026-09-09 at Albert's
   explicit instruction (see `tasks/T-003-home-v3.md` Log, 2026-09-09 entry) — `/` now serves
   the branch's own `HomePage` + `SuperHeroSequence` again, which has no masthead of its own —
   but the AppShell guards were never reverted alongside it, leaving `/` with zero navbar, zero
   footer, no overlay. Fix: removed the four `pathname !== "/"` guards, restoring unconditional
   rendering on every route (matches every non-home route's existing, unaffected behavior).
2. **Video**: on committed `HEAD`, `DailyLifeSection.tsx` called `.play()` unconditionally on
   mount with a bare `autoPlay`, no gating — this is the reported bug, but it predates this
   session (already flagged and deliberately left alone during the T-003 revert per that task's
   Log). Direct read of the **current disk state** shows this was already fixed, uncommitted,
   on this branch: `useDailyLifeVideo.ts` (IntersectionObserver-gated, `rootMargin: 200px`,
   pauses on scroll-away/`visibilitychange`) is wired into a rewritten `DailyLifeSection.tsx`
   (`<source>` withheld until `shouldLoad`, `play()` only after). No code change made here —
   verified the existing fix actually works end-to-end instead of assuming the diff was correct.

### Open questions
None open.

## Build                        [claude]

### What was built
`src/shared/components/AppShell.tsx`:
- Line ~901: `{pathname !== "/" && <AppBar ...>}` → unconditional `<AppBar ...>`.
- Line ~1298: matching `</AppBar>}` → `</AppBar>`.
- Line ~1361: `{pathname !== "/" && <SiteFooter .../>}`→ unconditional `<SiteFooter .../>`.
- Line ~1365: `<CommandPalette showShortcut={pathname !== "/"} />` → `<CommandPalette
  showShortcut />`.
- Line ~1366: `{pathname !== "/" && <FloatingIdOverlay />}` → unconditional `<FloatingIdOverlay
  />`.

No change made to `useDailyLifeVideo.ts` / `DailyLifeSection.tsx` — verified already correct.

### Build checks
```
$ yarn typecheck
$ tsc -b
Done in 8.56s.
```
Live browser (dev server on :5173, already running):
- `/` — screenshot confirms `AppBar` (PHITOPOLIS logo, Home/About/Services/Careers/Blog,
  Contact) renders.
- `/about` — screenshot confirms navbar still renders; no console errors.

Headless-Chrome CDP probe against the dev server (`tests/preview-cdp.test.ts`'s pattern,
adapted to hit :5173 directly rather than a `dist/` build — throwaway script in scratchpad, not
committed):
```
INITIAL (top of page): {"pageYOffset":0,"videoHasSource":false,"videoPaused":true,"dailyLifeRequests":[]}
stage top offset: 13549.234375
AFTER SCROLLING NEAR SECTION: {"pageYOffset":13800,"stageRectTop":0.234375,"videoHasSource":true,"videoSrc":".../daily-life-reel.mp4","videoPaused":false}
AFTER SCROLLING AWAY: {"pageYOffset":0,"videoPaused":true}
```

### Deviations from the approach
None. The video half of the task turned out to need no code change — only verification that
disk state was already correct, since the Explore agent's report and `docs/handover-
2026-09-08-perf-and-content.md` both described a fix that needed confirming, not assuming.

## Proposed for shared files    [common — any role]
None proposed. (No new guardrail or decision beyond what's already recorded in T-003's Log.)

## Follow-up (2026-09-09, same day) — pin-under-fast-scroll bug + closing-video hardening
The user came back with a screenshot showing the daily-life video's full-bleed pinned state
visible at the same time as `JourneyTimeline`'s bottom year-nav — evidence the earlier fix
(page-load autoplay gating) did not cover everything. Re-investigated live rather than assuming
the earlier audit was complete:

- **Real bug found and fixed**: a CDP script driving real wheel events (not `window.scrollTo`,
  which Lenis ignores) reproduced a genuine `ScrollTrigger` pin failure — scrolling fast through
  `/about` shortly after navigation (~2.2s in, before all lazy chunks/images settle) made the
  daily-life pin engage once (via `anticipatePin`), release, and then **never re-engage** even
  once scroll passed its real trigger position — `position` stayed `relative` for the rest of the
  page. At a 6s pre-wait (everything settled) the same rapid scroll pinned correctly every time.
  Root cause: `JourneyTimeline.tsx` is lazy-loaded and 480vh tall — the single largest layout
  contributor on the route — and its `useEffect` never called `ScrollTrigger.refresh()` after
  mounting, unlike `SmoothScroll.tsx`'s two post-mount refreshes. If its chunk resolved after
  those, every later section's pin geometry stayed computed against the shorter pre-mount
  document. **Fix**: added one `requestAnimationFrame(() => ScrollTrigger.refresh())` in
  `JourneyTimeline.tsx`'s mount effect (`src/features/about/components/JourneyTimeline.tsx`,
  after `ctx` is built). Re-ran the identical rapid-scroll CDP script at the same 2.2s pre-wait
  that previously failed — pin now engages/releases correctly and consistently across repeated
  runs.
- **Closing CTA "room to building" video**: re-tested `ClosingVideoSection` (home page) with the
  same real-wheel-event approach, fine-grained through its own trigger range (21440-24140px).
  Scrubbing was actually smooth and correct in Chrome (0 → ~5s tracking scroll position, holding
  the final frame past 52% progress by design) — could not reproduce a genuine permanent stall
  here. However, per T-001's own Handoff, the stall-recovery watchdog (`recoverStalledSeek`) was
  only ever invoked from GSAP's `onUpdate`, i.e. only while still scrolling — if a real stall
  happens right as a user stops scrolling, nothing would ever call it again. Hardened this
  defensively: added an independent `setInterval(recoverStalledSeek, 200)` in
  `ClosingVideoSection.tsx`, decoupled from scroll activity, cleaned up on unmount/reduced-motion.
  `yarn typecheck`, `yarn lint` (0 errors), and both `tests/motion/daily-life-pinned-scroll.test.tsx`
  / `tests/motion/closing-video-section.test.tsx` (29/29) still green.
- **Still open**: the user is testing in real Safari; both repros above used Chrome (real
  browser tool + headless CDP). T-001's Handoff already flagged a Safari 18+ pass as needed and
  never done — that gap is unchanged by this follow-up. If the closing-video stall is Safari-
  specific (plausible — Safari is known to be stricter about `preload`/seek buffering than
  Chrome), the interval hardening above is a real improvement but not proven against the actual
  failure mode. Recommend a manual Safari pass per T-001's original Handoff instructions.

## Log                          [common — append-only, every entry signed]
- 2026-09-09 claude: Investigated both reported bugs via 2 parallel Explore agents. Found the
  navbar bug is an uncommitted leftover from T-003's `CinematicHome` masthead work, not reverted
  alongside T-003 itself (see `tasks/T-003-home-v3.md` Log 2026-09-09 entry — confirms `/` was
  restored to plain `HomePage` with no masthead of its own). Found the video bug already has an
  uncommitted fix on disk (`useDailyLifeVideo.ts` + rewritten `DailyLifeSection.tsx`) that
  `docs/handover-2026-09-08-perf-and-content.md` documents as fixing exactly this symptom.
- 2026-09-09 claude/build: Removed the four `pathname !== "/"` guards in `AppShell.tsx`.
  `yarn typecheck` clean. Verified live: navbar renders on `/`, other routes unaffected. Verified
  the video fix via a headless-Chrome CDP scroll probe against the dev server: no fetch/play at
  load, loads and plays only once `#daily-life-stage` is scrolled to, pauses when scrolled away.
  Did not commit — left for Albert to review/commit per his own workflow.

## Handoff                      [common — replaced by whoever ran last]
Status: done · Could not do: a full Safari/mobile-viewport pass (only checked desktop Chrome-
based rendering, both the app's own Browser pane and standalone headless-Chrome CDP); the linked
test suite in `tests/preview-cdp.test.ts` runs against a `dist/` build and wasn't run here
(probed the dev server directly instead, faster feedback for this audit) · Needs: nothing
blocking — Albert may want to `git diff` the AppShell/JourneyTimeline/ClosingVideoSection changes
and commit them alongside whatever else lands on this branch. A real Safari pass on the closing-
video stall (per T-001's own flagged, still-open need) would upgrade the interval-watchdog
hardening from "defensively correct" to "confirmed fixes the actual reported symptom."
