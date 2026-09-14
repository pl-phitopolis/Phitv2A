# T-005 — Site finalization Phase 0: soft palette + MediaFrame foundation
Status: done (2026-09-09) · Mode: solo · Opened: 2026-09-09
Branch: new-hero-and-video · File scope: src/shared/theme/palette.ts,
src/shared/components/media/** (new), tests/a11y-contrast.test.ts
Merged: <blank — nothing committed yet>

## Current
Stage: done · Next: open T-006 for Phase 1 (Services + Contact)
Blocking: none
Last check: `yarn typecheck` clean, `yarn lint` clean (0 errors), `yarn test` 596 passed /
2 pre-existing failures (both outside this task's scope — see Build checks) — 2026-09-09

## Plan                         [claude]

### Goal
Lay the shared foundation (a soft/muted palette + a reusable media-layout component)
that every subsequent finalization phase (Services/Contact, Home-minus-hero+About,
Careers, Blog, Innovation Hub, Terms/Privacy) will consume, per
`~/.claude/plans/users-yaakovins-downloads-fresko-media-mellow-mountain.md`.

### Done when
`SOFT` palette object exists in `palette.ts`, contrast-tested, wired into
`theme.custom`; `MediaFrame` component family exists at
`src/shared/components/media/` implementing at least patterns `split`, `grid-3up`,
`gallery` from `/Users/yaakovins/Downloads/Fresko Media Layouts.html` (patterns
02-04), with the remaining patterns (05-12) stubbed to throw a clear dev-time error
if invoked before built; `yarn typecheck && yarn test && yarn lint` clean; no route
files touched.

### Acceptance checks
- `yarn typecheck` clean — Runner: claude (orchestrator), between waves.
- `yarn test` green, including new contrast-test entries for any `SOFT` token used
  as text — Runner: claude (orchestrator).
- `yarn lint` clean (warnings tolerated per repo baseline) — Runner: claude.
- `MediaFrame` renders patterns 02/03/04 with correct ratio/scrim/caption behavior —
  Runner: claude, via a quick usage smoke-check (not a full page yet — that's Phase 1).
- Manual: none required for this phase (no user-visible route changed).

### Approach
Additive-only edit to `palette.ts` (new `SOFT` object, sibling to NOIR/DAWN/SKY/
TWILIGHT, TWILIGHT explicitly NOT touched — it's hero-playground-scoped per its own
docblock, confirmed via grep: zero non-hero consumers). New `src/shared/components/
media/` directory: `MediaFrame.tsx`, `mediaFrameTypes.ts`, `index.ts`. Pattern 01
(full-bleed hero w/ scrim) is not rebuilt — `VideoPageHero.tsx` already covers it.
Delegated to one subagent per concern (palette vs component) with exclusive file
ownership; orchestrator gates `yarn typecheck/test/lint` after both land, not mid-wave.

Revised 2026-09-09: confirmed there is no `theme.custom` MUI augmentation
mechanism in this repo (`theme.ts`/`muiAugmentation.d.ts` checked directly — Paper
variants and a `micro` Typography variant only). `NOIR`/`DAWN`/`SKY`/`TWILIGHT` are
consumed as plain imported objects in component `sx` props, not through MUI theme
plumbing. `SOFT` follows the same convention: a plain exported const, imported
directly. File scope narrowed accordingly (theme.ts/muiAugmentation.d.ts dropped).

### Open questions
None open.

## Build                        [claude]

### What was built
- `SOFT` palette object added to `src/shared/theme/palette.ts` (frost/mist/linen/sand/
  sage/blush), additive-only, sibling to NOIR/DAWN/SKY/TWILIGHT, docblocked in the
  file's existing style. `TWILIGHT`/`NOIR`/`DAWN`/`SKY`/`CHAPTER_ACCENTS`/
  `TECH_CAT_ACCENTS`/`palette` byte-identical apart from the insertion point.
- Contrast tests added to `tests/a11y-contrast.test.ts` (new `describe` block, reuses
  existing `contrast()`/`luminance()` helpers) — every `SOFT` token measured as a
  ground under `NOIR.navyField` text: frost 12.64:1, mist 11.56:1, linen 11.93:1,
  sand 10.37:1, sage 10.45:1, blush 10.06:1. All clear AA (4.5:1) with wide margin;
  no sub-AA trade-off needed.
- `MediaFrame` component family at `src/shared/components/media/` (`MediaFrame.tsx`,
  `mediaFrameTypes.ts`, `index.ts`) implementing all 11 non-hero patterns (02-12)
  from the reference doc; pattern 01 stays `VideoPageHero.tsx` (reused, not
  duplicated). Composes `ImagePlaceholder` for src-less items. Dev-time `console.warn`
  for: missing caption (03/10), missing attribution (08), `overlayContent` on a
  pattern that doesn't allow it (only 05/09 do). `goldRule`/`cta` are single
  instance-level slots via a shared `Accents` sub-component. No ad-hoc hex — all
  colors via `SOFT`/`NOIR` imports.
- Two `exactOptionalPropertyTypes` strict-mode errors found at the typecheck gate
  (conditionally-passed `cta` prop on `Accents`, conditionally-passed `sx` prop on
  `ImagePlaceholder`) — fixed directly by the orchestrator (2-line conditional-spread
  fix each, `{...(x ? { x } : {})}`), not delegated back to a subagent since it was
  a mechanical, well-understood correction matching a pattern already common in
  this strict-TS codebase.

### Build checks
```
$ yarn typecheck
Done in 7.08s.   (clean — no hero-playground errors surfaced either; that
                   checkpoint-doc warning from 2026-08-10 appears stale/resolved,
                   not this task's concern either way since hero is off-limits)

$ yarn test
Test Files  2 failed | 55 passed (57)
     Tests  2 failed | 596 passed (598)
```
The 2 failures are **pre-existing and out of this task's scope**:
- `tests/motion/hero-phases.test.ts` — asserts hero pin-viewport count, imports
  `@/features/hero/heroPhases`. Hero is off-limits (T-001's active scope); this
  task touched nothing under `src/features/hero/**`.
- `tests/motion/home-v3-vt-names.test.tsx` — throws from `src/features/home/v3/
  useActTransition.ts` (`requestAnimationFrame is not defined` in the test env).
  This is the dormant T-003 Home-V3 code, explicitly "untouched on disk for later"
  per SESSION.md — this task did not touch `src/features/home/v3/**`.
Both pre-date this task; confirmed by inspection that neither failing test's
source path was edited here.
```
$ yarn lint
✖ 5 problems (0 errors, 5 warnings)
```
All 5 warnings are pre-existing, in files this task did not touch
(`ClosingShelf.tsx`, `AppShell.tsx`, `FloatingIdOverlay.tsx`).

### Deviations from the approach
None from the palette/component design itself. Scope was narrowed once (see the
Plan's "Revised 2026-09-09" note): no `theme.ts`/`muiAugmentation.d.ts` edit, since
no such wiring mechanism exists in this repo — `SOFT` is a plain import like its
siblings, matching established convention rather than the plan's original
(mistaken) assumption of a `theme.custom` mechanism.

## Review                       [claude]

### Evidence
- `SOFT` added additive-only, existing exports unchanged — **checked directly**
  (read the diff-equivalent file content before and after).
- Contrast ratios ≥ AA for all six tokens — **checked directly** (`yarn vitest run
  tests/a11y-contrast.test.ts` → 33/33 passed, then re-confirmed in the full
  `yarn test` run).
- `MediaFrame` covers all 11 assigned patterns with no stubs — **checked directly**
  (read the component file in full after the fix).
- Full gate (`typecheck`/`test`/`lint`) run once, centrally, after both subagents
  landed — **checked directly**, not taken as reported from either subagent (each
  was explicitly told not to run the full gate to avoid a race).
- The 2 test failures are pre-existing and outside this task's file scope —
  **checked directly** (grepped each failing test's imports against this task's
  touched-files list; neither overlaps).

### Findings
None open for this task. Noted for future phases, not acted on here: the hero-
playground `tsc` failure flagged in `docs/hero-upgrade/checkpoint-1.md`
(2026-08-10) did not reproduce — either resolved since or excluded from this
tsconfig's project references. Worth a one-line mention to Albert since it
contradicts a still-open doc, but not this task's territory to chase further.

## Proposed for shared files    [common — any role]
- None yet.

## Log                          [common — append-only, every entry signed]
- 2026-09-09 claude/plan: opened T-005 as Phase 0 of the site-wide finalization
  effort approved by the user in chat (plan file: users-yaakovins-downloads-fresko-
  media-mellow-mountain.md). Confirmed TWILIGHT is hero-playground-only (grep:
  only `src/features/hero/playground/{constants,dayCycle}.ts` import it) — a new
  `SOFT` object is added instead of repurposing it.
- 2026-09-09 claude/build: two subagents built `SOFT` (+ contrast tests) and
  `MediaFrame` in parallel with exclusive file ownership. Fixed 2 exactOptional
  PropertyTypes errors directly (mechanical, low-risk). Ran the full gate once,
  centrally: typecheck clean, lint clean, test 596 passed/2 pre-existing failures
  (hero + dormant Home-V3, both outside scope). Nothing committed.

## Handoff                      [common — replaced by whoever ran last]
Status: done · Could not do: n/a — full scope delivered · Needs: Albert to review
Phase 0 (palette + MediaFrame) before Phase 1 (Services + Contact) starts, per the
user's phased/consult-each-phase instruction. Nothing committed — Albert's call
whether/when to commit.
