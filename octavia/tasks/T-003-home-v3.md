# T-003 — Home page V3 — marketing reimagining with same-document View Transitions
Status: active · Mode: solo · Opened: 2026-09-08
Branch: new-hero-and-video · File scope: `src/features/home/v3/**`, `src/routes/index.tsx`, `src/shared/theme/viewTransitionsHomeV3.css`, `tests/motion/home-v3-*.test.ts`, `tests/e2e/home-v3.cjs`, `tests/home-route.test.tsx`, `tests/home-reduced-motion.test.tsx`, `tests/footer.test.tsx`, `tests/warmup-manifest.test.ts`
Merged: 

## Current                      [common — startup path, replaced each session]
Stage: reverted · Next: none, at user instruction — the direction is on hold
Blocking: none
Status: **T-003 reverted 2026-09-09 at the user's explicit request.** `/` now serves the branch's
own pre-existing, uncommitted hero-video home page (`HomePage`/`SuperHeroSequence`, last committed
at HEAD, restored against current on-disk files), not `CinematicHome` and not V3. See the Log for
the two-step revert and the 3 pre-existing test failures this surfaced, unrelated to T-003. All of
V3's code remains on disk under `src/features/home/v3/`, untouched, for later.

## Plan                         [claude]

### Goal
Replace the home route with a marketing-first V3 that carries four transitions (three shared-element act morphs at act boundaries, one mechanically distinct finale dolly), demotes the four AI-generated images in `public/images/cinematic/` to atmospheric backgrounds, re-authors the copy in a marketing register, and migrates Astra's invented `--ch-*` tokens back to brand `NOIR` tokens.

### Done when
Loading `/` in Chromium at 1440px scrolls through four acts, firing three distinct shared-element View Transitions at the act boundaries and a dolly push-in at the closing act, with `yarn typecheck`, `yarn test`, `yarn lint` all green, and no descriptive `alt` text remaining on any `public/images/cinematic/*` instance.

### Acceptance checks
1. `yarn typecheck` clean. **Runner: any.**
2. `yarn lint` — 0 errors (warnings tolerated). **Runner: any.**
3. `yarn test` — no NEW failures against a measured pre-change baseline of **1 failed / 597 passed (55 files)**. The one failure is `tests/careers-index.test.tsx`, a Motion `DocumentProjectionNode` teardown error (`ReferenceError: document is not defined`) thrown after the test environment tears down. It is pre-existing and unrelated to T-003; it is recorded here so nobody later reads a 1-failure run as a T-003 regression, and so nobody claims "all green" for a suite that was never green. **Runner: any.** *(baseline checked directly, 2026-09-08 claude)*
4. `yarn build` then `tests/bundle-assertion.test.ts` — `dist/index.html` eagerly references no gsap, lenis, SmoothScroll or ScrollTrigger. **Runner: any.**
5. `tests/copy-buzzwords.test.ts` green with the re-authored copy in place. **Runner: any.**
6. `tests/a11y-contrast.test.ts` green with any new navy/gold/frost pairs added and measured. **Runner: any.**
7. `tests/accent-role.test.ts` green — confirms the off-brand `#ffcf62` gold is gone. **Runner: any.**
8. New `tests/motion/home-v3-vt-names.test.ts`, `home-v3-vt-timeout.test.ts`, `home-v3-escape.test.ts`, `home-v3-reduced-motion.test.ts`, `home-v3-timing-parity.test.ts` all green. **Runner: any.**
9. `tests/e2e/ladder-probe.js` extended — no act-boundary trigger's resolved `start` falls inside any `pin: true` trigger's `[start, end]` range at any viewport in the ladder. **Runner: needs a real browser; a hidden Browser pane freezes rAF and halts Lenis, so this runs over CDP or in a visible browser.**
10. Live motion QA in Chromium and Safari 18+, plus a forced-fallback run with `document.startViewTransition` stubbed undefined, each also under `prefers-reduced-motion: reduce`. **Runner: needs a person or a non-hidden browser session.**
11. Design-bar checkpoint recorded for each of the four acts and each of the five transitions, per the per-section format in `docs/design-bar.md`. **Runner: any.**

### Approach
Four acts (Opening / Proof, being capabilities plus applications / Method, being delivery plus company / Ask) on grounds base→deep→field→floor from `grounds.ts`; three non-scrubbed boundary ScrollTriggers each firing a real `document.startViewTransition()` behind a brief scroll gate (Lenis stopped so nothing is animating when the snapshot is taken); a fourth root-only dolly for the finale; a fifth shared-element morph on CTA click into `/contact`. New code isolated under `src/features/home/v3/`; `cinematic/` stays on disk for rollback.

### Open questions
None open — the owner resolved every fork in chat on 2026-09-08: real View Transitions API (not GSAP-only), scroll gate approved with a mandatory user escape hatch, finale is both an arrival dolly and a click morph, images demoted rather than deleted or regenerated, V3 at `/`, copy re-authored but the story kept.

## Build                        [claude, 2026-09-08]

### What was built
`src/features/home/v3/`, wired at `/` via a one-line change to `src/routes/index.tsx`.
`src/features/home/cinematic/` is untouched on disk for rollback.

- `homeV3Motion.ts` — durations, easings, gate constants, act/shot types. Easing curves are
  imported from `@/shared/motion/easing` (`EASE_OUT_EXPO_CSS`, `EASE_IN_EXPO_CSS`) rather than
  written as raw beziers, so no lint exemption was needed.
- `viewTransitionsHomeV3.css` — the four `:root[data-hv3-shot]` blocks, kept separate from
  `viewTransitions.css` (which is route/cross-document scope) with a cross-reference comment added
  there.
- `useActTransition.ts` — the gate: re-entrancy lock, Lenis suspend/resume, sequential
  `view-transition-name` handoff, focus routing, two-rAF deferred `refreshScrollTriggers()`,
  GSAP crossfade fallback, and both escapes.
- `useHomeV3Motion.ts` — one `gsap.matchMedia(HV3_MOTION_QUERY)` gate creating one non-scrubbed,
  non-pinned `ScrollTrigger` per boundary.
- Four act components, `ActBoundary`, `homeV3.css`, and the re-authored `content.ts`.
- VT-5, the closing CTA's shared-element morph into `/contact`: armed by the page-level
  `onClickCapture` in `HomeV3.tsx`, routed through the existing `navigateWithCurtain`, with the
  name applied only by a CSS rule keyed on `data-hv3-shot="ask-pill"`. The contact-side target is
  the form's submit button, so the morph reads as "the button you pressed became the thing you
  press next".

### Build checks
| Check | Result | How |
|---|---|---|
| `yarn typecheck` | clean | checked directly |
| `yarn lint` | 0 errors, 14 warnings = baseline | checked directly |
| `yarn test` | 621 passed, 1 failed | checked directly. The failure is `preview-cdp.test.ts`'s frame-delta threshold, which is **pre-existing**: it fails identically with the old `CinematicHome` route (24.81ms) and in isolation (24.66ms) against a 22ms cap. See Deviations. |
| `yarn build` | clean | checked directly |
| Real-browser behaviour | **5 shots, 5 completed, 0 skipped, 0 page errors** (`proof`, `process`, `verdict`, `ask`, `ask-pill`) | checked directly via `tests/e2e/home-v3-verify.cjs` against real Chrome over CDP |
| Reduced motion | 0 shots, 0 names assigned, `data-hv3-motion` unset, all four acts present, CTA still navigates | checked directly, same script with `--reduced` |
| Imagery demotion | 0 images with a non-empty accessible name | checked directly in-browser |

### Deviations from the approach
1. **`ladder-probe.js` was not extended.** The planned check was "no boundary trigger's start falls
   inside a pin's range". V3 creates **no pinned or scrubbed trigger at all**, so there is no range
   to overlap and the check cannot fail. The stronger invariant is asserted instead by
   `tests/motion/home-v3-no-pinned-boundaries.test.ts`, which fails if `pin:` or `scrub:` ever
   appears in the feature. Recorded rather than silently dropped.
2. **`preview-cdp.test.ts`'s timing failure is pre-existing, and the existing note about it is
   wrong.** `docs/cinematic-home/README.md` says the threshold was only exceeded under concurrency
   and that an isolated recheck passed at 19.44ms. On this machine it fails in isolation too
   (24.66ms). It is not caused by T-003 (verified by reverting the route and re-running), but the
   "passes in isolation" framing should not be relied on.
3. **The finale is one-shot and has no reverse.** Every other boundary is symmetric. The finale
   cannot be: see the Log entry for the measured feedback loop.
4. **Act panels are never dimmed.** An intermediate implementation put non-current acts at
   `opacity: 0.35; pointer-events: none`. Removed; see the Log.

## Review                       [whoever reviews]

### Evidence
<!-- To be filled in by the reviewer -->

### Findings
<!-- To be filled in by the reviewer -->

## Log                          [common — append-only, every entry signed]
- 2026-09-08 claude/plan: Opened T-003. Reviewed Astra's CinematicHome (uncommitted) and the AmssaiV2 reference. Verified same-document View Transitions are Baseline since 2025-10-14 via the modern-web-guidance same-document-transitions guide. Found and corrected an invented-data violation in the drafted copy: a proposed "reply within one business day" line contradicts the site's own "1 to 2 business days" (ContactFAQ.tsx:35, ContactForm.tsx:128). Verified "Founded in Manila in 2019" is real (content.ts:536). Plan approved by the user.


2026-09-08 claude/build: Built V3 and verified it in real Chrome over CDP
(`tests/e2e/home-v3-verify.cjs`, new). Three defects were found by that measurement, none of which
typecheck, lint or the unit suite could have caught. Recorded in full because each would have
shipped as "the transitions do not work" with a clean console:

  1. **The escape hatch armed synchronously.** A boundary's `onEnter` fires *during* a wheel-driven
     scroll, so the inertia of the gesture that crossed the threshold kept arriving and cancelled
     the transition it was meant to rescue. Every scroll-driven entry, every time. Fixed with
     `HV3_ESCAPE_ARM_MS` (180ms) plus `ESCAPE_INTENT_EVENTS` (3): a first Chrome run with a
     single-event escape skipped 42 of 45 transitions.
  2. **The finale oscillated 42 times per page visit.** The `ask` flip changes Act IV's layout,
     which moves the boundary marker its own trigger is attached to; the release path refreshes
     ScrollTrigger against the new layout, which fires `onLeaveBack`, which changes the layout
     back. Fixed twice over: `once: true` with no reverse for the `ask` shot, and the two stages
     stacked in one grid cell (`visibility` rather than `display`) so the flip cannot change
     layout at all.
  3. **Both halves of every shared element were named at once.** A `view-transition-name` may be
     borne by at most one rendered element per snapshot; two and the browser silently performs the
     DOM update with no transition and no error. Because V3 is one continuous document, both halves
     are always rendered. Fixed by moving the name: it sits on the outgoing element for the old
     snapshot and is handed to the incoming one inside the update callback.

  Final measured state at 1440x900: exactly 4 shots (`proof`, `process`, `verdict`, `ask`), all 4
  completed, 0 skipped, 0 page errors, correct name handoff on all three shared-element morphs.
  Under `--force-prefers-reduced-motion`: 0 shots, 0 names, `data-hv3-motion` unset, all four acts
  present and readable.

2026-09-08 claude/build: Corrected two things that were reported to me rather than checked.
  A subagent added `src/features/home/v3/homeV3Motion.ts` to the `no-restricted-syntax: off` list
  in `eslint.config.js` so it could hold raw `cubic-bezier()` strings. Reverted: `easing.ts`
  already exports those exact curves (`EASE_OUT_EXPO_CSS`, `EASE_IN_EXPO_CSS`), so the module
  imports them and the lint rule stays intact. The invented sixth curve for the `process` shot was
  dropped with it. Separately, my own first lint baseline of "22 warnings" was contaminated by a
  subagent's in-flight file; the true baseline is 0 errors / 14 warnings.

2026-09-08 claude/build: A regression guard I wrote for defect (1) initially passed against the
  bug as well as the fix, because it dispatched its wheel events synchronously and so beat the
  listener registration under both versions. Rewritten to model real inertia arriving over 150ms.
  Every new guard in this task has since been mutation-tested: the fix is reverted, the test is
  confirmed to fail, and the fix restored. A guard that has not been seen to fail is not evidence.


2026-09-08 claude/build: VT-5 did not fire, and the cause was an event-ordering trap worth
recording. `HomeV3.tsx`'s root container carries an `onClickCapture` that routes every in-page link
through `navigateWithCurtain` and calls `preventDefault()`. Because it is capture phase it runs
before the clicked `<Link>`'s own handler and before any `onClick` on the CTA, so the CTA's handler
always saw `event.defaultPrevented === true` and returned before setting the shot attribute. The
click navigated correctly and the attribute was never set once, so the shared element was never
named and only the default root transition ran. Armed in the capture handler instead, which is the
one handler guaranteed to run; the CTA's dead `onClick` was removed rather than left in place.

  Diagnosing this also cost two false leads worth naming. First, `el.scrollIntoView()` was used to
  bring the CTA into view before clicking; Lenis ignores programmatic scroll, sprang the page back,
  and the click landed on the masthead Contact link instead, which also calls `navigateWithCurtain`
  and so produced a convincing "navigation worked but no shot" reading that had nothing to do with
  the real bug. Second, a MutationObserver added to diagnose it was installed at document-start,
  before `<html>` exists, so `observe(null)` threw and silently killed the rest of the probe,
  reporting an empty attribute log while the app was demonstrably setting the attribute. Both are
  in the harness comments now. Verification tooling gets the same scepticism as product code.

2026-09-08 claude/build: `HV3_ASK_PILL_DURATION_MS` added and `home-v3-timing-parity.test.ts`
extended to cover it. VT-5's 420ms lived only in CSS because the parity test iterates
`HV3_SHOT_DURATIONS`, which is keyed by the four act shots; the route shot was therefore exempt
from the one guard that exists to stop TS and CSS timings drifting.


2026-09-08 claude/build: Watch run against this repo (checks invoked directly via
`watch/checks.js`'s `runAll` from the Octavia V3 checkout rather than by starting the server, which
is a long-running process). Result: c2, c3, c4, c6 **clear**; c1 "Records that disagree"
**ambiguous**; c5 "Waiting on you" **found**.

  Neither non-clear result is a Contradiction, so per PROTOCOL the handoff is not blocked, and
  neither is caused by T-003. c5 is firing exactly as designed: it lists the `## Proposed for
  shared files` blocks in T-000, T-001, T-002 and T-003 that are waiting on Albert, plus
  SESSION.md's Open questions. c1 is ambiguous for all three live tasks including T-001 and T-002,
  which predate this work, so it reflects how the checker reads the `Stage:` lines rather than a
  disagreement introduced here. T-003's `Stage:` line was reformatted to match T-001/T-002's
  `Stage: <stage> · Next: <...>` shape anyway, on the chance it helped; it did not change the
  result, and that is recorded rather than quietly dropped.

2026-09-08 claude/build: **Documentation not committed.** PROTOCOL step 10 asks the handoff to
commit the documentation by named path. It was deliberately not done: the standing instruction in
this session is to commit only when asked, and this working tree carries a large volume of
unrelated uncommitted work (Astra's `CinematicHome`, the videos, the careers changes), so a commit
here is a judgement call that belongs to Albert. The exact command is in the Handoff. **Runner:
Albert.**

2026-09-08 claude/build: Fixed four defects a browser screenshot pass found in the built V3 page,
all in `src/features/home/v3/homeV3.css` plus `acts/ActAsk.tsx`:

  1. **Gold focus ring around every act heading.** `[data-hv3-heading]` (tabindex="-1", focused
     programmatically by `focusIncomingHeading()`) was matching the `.hv3`-scoped
     `:is(a, button, [tabindex]):focus-visible` rule, painting a ring no key press produced.
     Excluding it with `:not([data-hv3-heading])` was not sufficient on its own, and it is worth
     recording why: `src/shared/theme/components.ts`'s `MuiCssBaseline` install a completely
     separate SITEWIDE `*:focus-visible` rule (outline + halo box-shadow), which still matched the
     heading regardless of anything scoped under `.hv3`. That file is shared, intentional and out
     of scope, so the fix wins on specificity instead: `.hv3 [data-hv3-heading]:focus-visible`
     (0,3,0) beats `*:focus-visible` (0,1,0) and resets outline and box-shadow to none. Verified in
     a real Chromium tab: a scripted `.focus()` on the heading now shows no ring or halo, and a real
     keyboard Tab onto the CTA link still shows the gold ring, so ordinary keyboard users are
     unaffected.
  2. **The CTA could be invisible.** `ActAsk`'s two `data-hv3-ask-stage` blocks were toggled with
     `visibility: hidden`/`visible` gated on the finale trigger, so a reader who landed mid-page or
     scrolled past a missed trigger saw the closing headline with no "Start a conversation" button
     anywhere. Rebuilt so both stages render unconditionally and stay visible always: removed the
     `visibility` toggle and the `.hv3-ask-stages` grid-stacking (no longer needed once nothing is
     hidden), stacked the two stages in normal document flow, and gave the `ask` shot a
     treatment-only flip instead — the statement dims/lifts slightly (opacity 1 -> 0.78, never
     invisible), the CTA gets a small settle-in lift, a new `.hv3-ask-rule` gold rule sweeps in
     (`scaleX`/opacity only), and the scrim eases back a touch for "the field gains presence".
     Transform/opacity only, nothing changes any box's size, so the section's height is identical
     across the flip and the boundary-marker re-fire bug (see the 2026-09-08 build entry above)
     cannot come back through this path. Verified in a `yarn build` + `vitest preview` tab: the CTA
     link, its href, the statement, and the new rule are all `display`/`visibility: visible`,
     `opacity: 1` in the DOM with no scroll or trigger involved at all. No test asserted the CTA was
     ever hidden, so nothing needed updating there.
  3. **Hard vertical seam in the Opening scrim.** The 3-stop `linear-gradient` (0.94 @ 0%, 0.78 @
     40%, 0.4 @ 75%) had a >2.5x change in per-percent slope right at the 40% stop, which painted as
     a visible kink under `multiply` at roughly the reported 43% of viewport width. Replaced with a
     2-stop gradient (0.92 -> 0.35) with no interior stop, so there is nothing left to kink at.
  4. **Masthead bled scrolling content.** `rgba(var(--hv3-navy-ink-rgb), 0.92)` let copy scrolling
     underneath show through and get clipped mid-sentence at the masthead's lower edge. Checked
     `glass.css` for the house translucent-nav pattern first (`--nav-fill`/`--nav-blur`) and decided
     against pulling it in: it is keyed to the site's `--g-*`/`--text-*` token system, not the
     self-contained `--hv3-*` set this file uses, and bridging or duplicating it is more surface
     than the bug needs. Went with the simpler of the two options the ticket allowed: alpha 1 on the
     existing token. No new colour, no `backdrop-filter`, same height and layout.

  `yarn typecheck` clean, `yarn lint` 0 errors / 14 warnings (unchanged baseline), and
  `yarn vitest run tests/home-route.test.tsx tests/home-reduced-motion.test.tsx tests/footer.test.tsx
  tests/motion/home-v3-timing-parity.test.ts` 16/16 passed. Not done: the Safari 18+ pass and the
  forced-fallback run from the Handoff below remain outstanding, unrelated to this fix pass.


2026-09-08 claude/build: **Looked at the page for the first time.** Everything until now had been
verified by measurement (transitions fire, names hand off, reduced motion produces none) and none
of it required the page to look right. Captured it in real Chrome with a new harness,
`tests/e2e/home-v3-shots.cjs`, and it was visibly broken in ways no test asserted:

  1. A gold focus ring was painted around every act heading, because the gate calls `.focus()` on
     `[tabindex="-1"]` headings and the stylesheet outlined any `[tabindex]`. Fixed by excluding
     `[data-hv3-heading]`; note the fix also had to beat a SITEWIDE `*:focus-visible` in
     `src/shared/theme/components.ts`, which is why the override is specificity-based.
  2. **The finale hid the CTA.** The primary conversion action on a marketing page was invisible
     until a scroll trigger fired. Rebuilt so nothing is ever hidden: the statement dims and lifts
     while the CTA settles and a gold rule sweeps, all transform/opacity and layout-neutral.
  3. Four boundary markers were 50vh of empty navy each, roughly 200vh of nothing. That was the
     monotony, and it was structural rather than a styling problem.
  4. A hard vertical seam at 43% of the hero, from a scrim gradient with a hard colour stop.
  5. Copy sliced mid-sentence under a translucent masthead. Masthead is opaque now.
  6. The company film showed black bars top and bottom. They are baked into the source frame, so
     `object-fit: cover` could not remove them; scaled past them instead.

  Recorded because the lesson generalises: a suite can be green, a mechanism can be measured
  working, and the page can still be unusable. Nothing in this task checked what it looked like
  until it was checked directly.

2026-09-08 claude/build: Added the visual layer the page was missing.

  - **`SignalField`** (`visuals/SignalField.tsx`), the signature. Scattered pale ticks of market
    noise converging on one gold line, drawn on a 2D canvas, one instance in each of the four
    boundary markers at increasing `stage` so the motif resolves further at every crossing. It
    occupies the dead space rather than adding any, which matters because those markers' heights
    are ScrollTrigger crossing points. No gsap, no ScrollTrigger, no Lenis: its own
    `IntersectionObserver` plus a rAF loop that only runs while visible, DPR capped at 2, and a
    single static resolved frame under `prefers-reduced-motion`. Chosen over WebGL/R3F to avoid a
    new dependency and a warm-up cost on the critical scroll path.
  - **Parallax** (`visuals/parallax.css`) as CSS scroll-driven animation (`animation-timeline:
    view()`), feature-detected, `translateY` only. Deliberately not a GSAP `scrub`: a scrub caught
    mid-transform inside a `startViewTransition()` snapshot is the ghosting failure this whole
    design exists to avoid, and `home-v3-no-pinned-boundaries.test.ts` forbids `scrub:` here.
  - **One light band** (`visuals/invertedBand.css`) on the delivery beat, the flattest part of the
    page. Not a new palette: `grounds.ts` still defines `void` in full with its own foreground and
    measured muted/rule values for navy-on-light, and `docs/design-bar.md` describes the system as
    "light and navy grounds". Two iterations were needed after looking: the first was an inset card
    rather than full bleed, and its edge gradients sat on top of real content and hid the section
    kicker. Now full bleed with a gold hairline at each edge.

  Re-verified after all of it: 5 shots, one each, all completing, 0 errors; reduced motion still 0
  shots and 0 names; suite 621 passed / 1 failed (the same pre-existing CDP threshold).


2026-09-09 claude/build: **T-003 reverted, per explicit user instruction.** The user reported the
page "completely broken" and asked to revert. Two rounds of clarification were needed:

  1. First revert: `src/routes/index.tsx` pointed back at `CinematicHome` (the state it was in
     before this task began, and still on disk untouched — see the file plan's original rollback
     rationale, which paid off exactly as intended).
  2. The user then clarified they meant something earlier: the page with a hero background video
     playing by default, before Astra's `CinematicHome` rewrite. That state was never committed
     either, but the components for it are still on disk, uncommitted, on this same branch
     (`SuperHeroSequence.tsx` with `useBackgroundVideo`/`HERO_LOOP`, `ClosingLattice`/
     `ClosingVideoSection` under `closing-scene/`) — this is the branch's own in-progress
     hero-and-video work, predating both Astra's page and T-003, referenced throughout this branch's
     other Octavia tasks (T-001). Restored `routes/index.tsx` to its last GIT-COMMITTED form
     (`HomePage` + `SuperHeroSequence`); every file it imports resolved cleanly against CURRENT
     disk state with no path fixes needed (`ClosingVideoSection.tsx` is a one-line re-export shim
     pointing at the real, current `closing-scene/` implementation). Verified with real screenshots,
     not assumed: the hero video plays, the use-cases narrative and its 3D illustrations render.

  `tests/home-route.test.tsx`, `tests/home-reduced-motion.test.tsx`, `tests/footer.test.tsx` were
  rewritten by a T-003 subagent to match V3's markup/copy and would now be permanently red against
  the restored page for the wrong reason (asserting content that no longer exists on this route).
  No snapshot of their pre-V3, branch-current state was ever saved, so they were restored to their
  last GIT-COMMITTED form instead, which is the best available honest baseline. Against that
  baseline: 7 of 10 pass. **3 fail, and they are pre-existing drift between HEAD and this branch's
  own uncommitted hero-video work — not caused by T-003, and not fixed here**, the same way the
  about-page issue reported alongside this revert was found to predate this session and was left
  alone rather than touched without context:
    - `footer.test.tsx`: "home route loads footer with pathways, talent programs..."
    - `home-reduced-motion.test.tsx`: "hero scene is one decorative canvas, not a DOM particle
      field" (stale: the hero now has a real video element, which the committed test predates)
    - `home-reduced-motion.test.tsx`: "use-case narrative renders every block and its background
      image" (stale image/alt assertion)

  Full suite after revert: **622 passed, 4 failed** (those 3, plus the already-documented
  pre-existing CDP timing threshold). `yarn typecheck` clean, `yarn lint` 0 errors / 14 warnings.

  V3's code is untouched on disk under `src/features/home/v3/` and the new tests under
  `tests/motion/home-v3-*` and `tests/e2e/home-v3-*`, for whenever this direction is picked back up.
  Nothing was deleted.

## Handoff                      [common — replaced by whoever ran last]
Status: partial. Build complete and verified in Chromium; four screenshot-found defects (focus
ring, hidden CTA, opening-scrim seam, masthead bleed) fixed and verified this session; review not
started.

Could not do:
- **Safari 18+ pass.** Not available to this session. Same-document View Transitions shipped in
  Safari 18, so the primary path should work, but it is unverified and `mix-blend-mode` on
  `::view-transition-group()` is exactly the kind of thing WebKit differs on. **Runner: a person.**
- **Forced-fallback run.** Stub `document.startViewTransition = undefined` and confirm the GSAP
  crossfade path and that all four acts still commit. Chromium always has the API, so this needs a
  deliberate stub. `tests/e2e/home-v3-verify.cjs` is the place to add it. **Runner: any, with a
  browser.**
- **Full dynamic a11y sweep.** Contrast, one-h1, focus outlines, reduced motion and the absence of
  descriptive image alt are all verified. A keyboard traversal of the act boundaries with the gate
  active is not. **Runner: any, with a browser.**

What is needed: a review pass against the acceptance checks, a design call flagged below, and a
decision on committing. The documentation commit PROTOCOL step 10 asks for was not run, because
the standing instruction here is to commit only when asked and this tree holds a lot of unrelated
uncommitted work. When you want it:

```
git add octavia/tasks/T-003-home-v3.md
git commit -m "octavia: T-003 build handoff" -- \
    octavia/tasks/T-003-home-v3.md octavia/SESSION.md octavia/TASKS.md \
    octavia/tasks/T-001-hero-lockup-and-closing-video-fix.md \
    octavia/tasks/T-002-ws4-pagination.md
```

The two sibling task files are in that list because SESSION.md's over-40-line excess was demoted
into their Logs at this handoff. Never `git add octavia/ && git commit`: this tree has staged and
unstaged application changes that would be swept into a commit labelled as documentation.

**Design question for Albert, not a defect.** The act gate holds scroll for roughly 500-750ms at
three points, with an escape that needs three wheel/touch inputs after a 180ms arm. Those numbers
were tuned against a measurement, not a preference: a one-event escape skipped 42 of 45
transitions, and no arm delay at all cancelled every transition instantly. Three events is
deliberately closer to "the transitions play" than to "the reader is never held", and a reader who
scrolls hard and continuously will still feel three brief holds on the way down the page. If that
trade is wrong, `HV3_ESCAPE_ARM_MS` and `ESCAPE_INTENT_EVENTS` in `homeV3Motion.ts` are the two
dials, and lowering `ESCAPE_INTENT_EVENTS` to 1 restores the original behaviour.

Also worth a decision: VT-4 and VT-5 fire within a few seconds of each other at the bottom of the
page. They are deliberately different mechanisms (root dolly vs shared-element morph) so the pair
does not read as one gesture twice, but whether two dramatic beats that close together is better
than one is a taste call that wants eyes on it. Dropping VT-5 is a clean removal: delete its CSS
block and the capture-handler arm, and the CTA degrades to the site's existing route transition.

## Proposed for shared files    [common — any role]
Two guardrail candidates, both earned this session, neither written to `GUARDRAILS.md` (that needs
Albert's approval):

- `[claude, earned]` Never fire `document.startViewTransition()` while a ScrollTrigger scrub or pin
  is active: the snapshot freezes the moving frame and ghosts it. *(AmssaiV2 hit this and abandoned
  real View Transitions at all three of its scroll boundaries because of it, see
  `components/sections/home/HomeMotion.tsx:376`. V3 only gets to use the real API because its
  boundaries are discrete and unpinned.)*
- `[claude, earned]` A `view-transition-name` may be borne by at most one rendered element per
  snapshot. Two, and the browser silently performs the DOM update with no transition, no warning
  and no error. Move the name between snapshots rather than assigning it to both halves.
  *(Shipped broken in this task's first implementation and was invisible to typecheck, lint and the
  unit suite; only a browser measurement found it.)*
- `[claude, earned]` Verification tooling gets the same scepticism as product code. A regression
  guard that has not been observed to fail is not evidence. Two separate false readings this
  session: a guard that passed against the bug it was written for, and a diagnostic probe that
  silently killed itself and reported an empty log.
