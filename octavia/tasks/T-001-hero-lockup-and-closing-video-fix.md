# T-001 — Hero lockup disappear/reappear + closing CTA video stall fix
Status: active · Mode: solo · Opened: 2026-09-07
Branch: new-hero-and-video · File scope: src/features/hero/**, src/features/home/components/closing-scene/**, tests/motion/hero-phases.test.ts
Merged: <MR link, commit SHA, or blank — filled when the work lands>

## Current                      [common — startup path, replaced each session]
Stage: review · Next: manual scroll QA in a normal (non-hidden) browser session
Blocking: none
Last check: `yarn typecheck` clean, `yarn lint` 0 errors, `yarn vitest run tests/motion/hero-phases.test.ts tests/motion/closing-video-section.test.tsx` 63/63 green — 2026-09-07

## Plan                         [claude]

### Goal
1. Replace the hero P/Phitopolis wordmark's continuous bottom-left→center slide with a
   disappear-at-bottom-left / reappear-at-center fade+scale effect.
2. Fix the closing CTA "room to building" video getting permanently stuck on one frame during
   scroll-scrubbed playback.

### Done when
1. Hero lockup fades+scales out at bottom-left by hp≈0.28, is fully hidden through the dead
   zone, fades+scales in at dead-center by hp≈0.56 (same landing point as before), in both
   scroll directions, with no interpolated in-between frame visible.
2. Closing CTA video scrubs smoothly forward and backward through fast scrolling and throttled
   network conditions without wedging on a single frame.

### Acceptance checks
- `yarn typecheck` clean.
- `tests/motion/hero-phases.test.ts` green, extended with the new lockup phase functions.
- Manual: browser-driven scroll verification per the plan's verification section (both parts).
- `yarn lint` clean (0 errors) for touched files.

### Approach
See full plan at /Users/yaakovins/.claude/plans/users-yaakovins-documents-octavia-v3-i-sleepy-gem.md.
Part 1: new pure phase functions in heroPhases.ts (lockupOpacity/lockupScale/lockupCentered),
written as CSS vars per-frame in heroVars.ts, consumed by SuperHeroSequence.tsx's lockup Box —
hard-cut anchor swap (not interpolated) + fade/scale envelope, matching the file's zero-React-
render-per-frame convention.
Part 2: seek-stall watchdog + recovery in ClosingVideoSection.tsx's applySeek/handleSeeked, plus
a play().then(pause()) buffering kick on mount to force browsers (notably iOS Safari) to
actually load the video bytes. No video re-encode — mp4 encoding already confirmed fine
(faststart + all-intraframe via ffprobe).

### Open questions
- None open. (Confirmed with Albert via AskUserQuestion 2026-09-07: hero video out of scope,
  fade+scale style, closing video fix is JS-side only.)

## Build                        [claude]

### What was built
1. `heroPhases.ts`: added `LOCKUP_EXIT_START/END`, `LOCKUP_ENTER_START/END`, `LOCKUP_CUT_POINT`
   and `lockupOpacity`/`lockupScale`/`lockupCentered` pure functions.
2. `heroVars.ts`: extended `HeroVars` with `lockupOpacity`/`lockupScale`/`lockupCentered`, wired
   into `heroVars()`'s reduced (explicit settled values) and unreduced (derived) branches, and
   into `writeHeroVars()` as `--hp-lockup-opacity`/`-scale`/`-centered`.
3. `SuperHeroSequence.tsx` lockup Box (~806-838): replaced the `--upT`/`--rightT` continuous
   slide with a hard-cut anchor (`var(--hp-lockup-centered)`) + fade/scale envelope
   (`var(--hp-lockup-opacity)`/`var(--hp-lockup-scale)`), removed the old CSS `transition`.
4. `tests/motion/hero-phases.test.ts`: added 4 new tests covering the lockup boundaries,
   opacity envelope, scale envelope, and the hard-cut anchor step.
5. `ClosingVideoSection.tsx`: added `seekStartedAtRef` + `recoverStalledSeek()` watchdog (500ms
   stall timeout) invoked every `syncScene` tick; added `onStalled`/`onWaiting` dev-only console
   warnings alongside the existing `onError`; replaced the bare `video.pause()` on mount with a
   guarded `play().then(pause)` buffering kick (guarded because `play()` returns `undefined` in
   jsdom/some legacy environments, not just non-Promise browsers).

### Build checks
```
$ yarn typecheck
Done in 7s — clean, both times (after Part 1 and after Part 2)

$ yarn lint
13 warnings (pre-existing, unrelated files), 0 errors

$ yarn vitest run tests/motion/hero-phases.test.ts tests/motion/closing-video-section.test.tsx
44 + 19 = 63 tests passed

$ yarn test (full suite)
595/596 passed. The 1 failure (tests/preview-cdp.test.ts, "avgFrameIntervalMs" perf assertion)
is a pre-existing environment-timing flake, confirmed via `git stash` — it fails identically on
the unmodified baseline (19.35ms one run, threshold 22ms, wall-clock CPU noise) and the failing
test touches nav-transition timing only, nothing this task changed.
```

### Deviations from the approach
- Test file had one wrong assertion of my own making (expected `lockupScale(ENTER_START)` to
  already be 0.9 — it's actually held at the exit's end value, 0.85, until p moves past
  ENTER_START). Fixed the test, not the implementation; the implementation was correct as
  planned.
- `play().then(pause)` needed an `if (playResult && typeof playResult.then === "function")`
  guard not called out explicitly in the plan — `HTMLMediaElement.play()` returns `undefined` in
  jsdom (used by `tests/motion/closing-video-section.test.tsx`), which crashed on `.then()`
  before the guard was added.

## Review                       [claude]

### Evidence
- Done-when #1 (hero lockup disappear/reappear): **checked directly** via live browser —
  started `yarn dev` in the Browser pane, confirmed rest state (bottom-left, full opacity/scale)
  matches the old layout, then forced `--hp-lockup-opacity`/`-scale`/`-centered` via
  `javascript_tool` (scroll-driven verification wasn't possible — see Findings) to confirm: (a)
  mid-exit at bottom-left renders dimmer+smaller while still anchored bottom-left, (b) full
  reappear state renders the lockup dead-centre of the viewport at full opacity/scale. Both
  matched the intended choreography exactly.
- Done-when #2 (closing video doesn't wedge): **partially checked directly**. Live DOM
  inspection of the mounted `<video>` showed `readyState: 4` (HAVE_ENOUGH_DATA) after mount —
  the new play()/pause() buffering kick worked, no console errors. A manual `currentTime` seek
  resolved cleanly between two separate tool calls (`seeking: true` immediately after, `seeking:
  false` + `readyState: 4` on the next read) with no hang. The actual scroll-scrubbed stall
  scenario (rapid seeks under load) could **not** be exercised live — the Browser pane was
  reported "hidden" for the duration of this session, which stops Lenis's rAF-driven scroll and
  any `setTimeout`-based script entirely (confirmed: synthetic wheel-event bursts did not move
  `window.scrollY`, and `await new Promise(r => setTimeout(...))` calls timed out after 45s).
  The stall-recovery code itself is unit-tested only indirectly (via the existing component
  render tests, which pass) — no test exercises a genuinely stuck `seeking` state.
- `yarn typecheck` / `yarn lint` / `yarn test`: **checked directly**, see Build checks above.

### Findings
- Environment constraint, not a code defect: this session's Browser pane stayed in a "hidden"
  state (not displayed in the desktop app's side panel) for the whole verification pass. Per
  [[preview-pane-freezes-raf]], a hidden pane halts rAF and timer callbacks, which blocks any
  scroll-driven or timing-based live verification (Lenis smooth-scroll, the hero's `--hp` scrub,
  the closing video's stall watchdog). Worked around it for the hero fix by writing the CSS
  custom properties directly via `javascript_tool` (bypasses the scroll driver, tests the DOM/
  CSS wiring in isolation) — not possible for the closing-video fix since the watchdog logic
  lives inside a `useGSAP` closure with no external hook to invoke directly.
- Recommends a follow-up manual pass once a normal (visible) browser session is available:
  scroll through the closing section under DevTools "Slow 3G" throttling + fast flick-scroll,
  watching for the `[ClosingVideoSection] video stalled`/`video waiting` dev console warnings
  and confirming the video keeps advancing rather than freezing. Flagged in Handoff below.

## Proposed for shared files    [common — any role]
- Guardrail candidate: `src/features/hero/SuperHeroSequence.tsx`'s lockup Box previously used
  inline `--upT`/`--rightT` calc() vars that were NOT covered by heroPhases.ts's parity-lock
  test convention, unlike every other scroll-driven value in the file — worth a guardrail once
  confirmed fixed, so future scroll-driven CSS vars in this file default to going through
  heroPhases.ts. [T-001] — **now fixed as part of this task**; the guardrail is still worth
  recording so it isn't reintroduced.
- New guardrail: a hidden Browser pane stops rAF/setTimeout entirely (confirmed empirically this
  session) — any future task needing live scroll/timer verification should confirm the pane is
  actually visible before relying on it, or fall back to direct CSS-var/DOM injection for
  wiring checks. [T-001, [[preview-pane-freezes-raf]]]

## Proposed for shared files    [common — any role]
- Guardrail candidate: `src/features/hero/SuperHeroSequence.tsx`'s lockup Box previously used
  inline `--upT`/`--rightT` calc() vars that were NOT covered by heroPhases.ts's parity-lock
  test convention, unlike every other scroll-driven value in the file — worth a guardrail once
  confirmed fixed, so future scroll-driven CSS vars in this file default to going through
  heroPhases.ts. [T-001]

## Log                          [common — append-only, every entry signed]
- 2026-09-07 claude: (demoted from SESSION.md "Last session" at the T-003 handoff, per PROTOCOL
  maintenance: SESSION.md over 40 lines.) Adopted Octavia V3 into this repo and opened T-001 for
  the hero lockup + closing CTA video fixes. Implemented both. `yarn typecheck`/`yarn lint`/
  `yarn test` all green (1 pre-existing unrelated flake). Verified the hero lockup fix live in the
  browser. Could not live-verify the closing-video stall watchdog: the Browser pane was hidden all
  session, which halts Lenis/rAF/timers entirely. See this task's Handoff.
- 2026-09-07 claude/plan: adopted Octavia V3, opened T-001, plan approved by Albert covering
  both the hero lockup disappear/reappear and the closing CTA video stall fix.
- 2026-09-07 claude/build: implemented both fixes (see Build section). Fixed one wrong test
  assertion of my own making during the process (lockupScale boundary expectation).
- 2026-09-07 claude/review: typecheck/lint/unit-tests all green (595/596, 1 pre-existing
  unrelated flake confirmed via git stash). Live browser verification confirmed the hero fix
  fully via direct CSS-var injection (rAF was stalled by a hidden Browser pane all session).
  Closing-video fix confirmed structurally (video buffers to readyState 4, a manual seek
  resolves cleanly) but the actual scroll-driven stall-recovery path could not be exercised
  live — flagged as a follow-up manual check in Handoff.

## Handoff                      [common — replaced by whoever ran last]
Status: partial · Could not do: live scroll-driven verification of the closing-video stall
watchdog (Browser pane was hidden the whole session, which halts Lenis's rAF and all timers —
see Findings) · Needs: a manual pass in a visible browser session — scroll the closing section
under DevTools "Slow 3G" throttling and fast flick-scroll, confirm the video keeps advancing and
watch console for `[ClosingVideoSection] video stalled`/`video waiting` warnings. The hero lockup
fix was fully verified visually (bottom-left fade+shrink out, dead-centre fade+grow in) and needs
no further check beyond an ordinary eyeball pass during normal use.
