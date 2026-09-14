/**
 * Single source of truth for how much scroll the pinned hero occupies.
 *
 * WHY THIS MODULE EXISTS
 * ----------------------
 * Three unrelated files independently encoded the hero's height, and they
 * disagreed:
 *
 *   - `SuperHeroSequence.tsx`  `HERO_PIN_DISTANCE` (derived here)   (the real pin)
 *   - `EyeFlow.tsx`            `const heroHeight = 9 * winH`    (twice, by hand)
 *   - `AppShell.tsx`           `scrollY < innerHeight * 19`     (STALE)
 *
 * The `19` was correct only while the pin was `+=1900%`. When the pin was
 * shortened to `+=800%` the other two were not updated, so the navbar stayed in
 * `minimal` mode for nineteen viewport heights on a page that is ~26 tall —
 * roughly 73% of the document — and the scrolled glass treatment was almost
 * never seen. That is the same class of hand-maintained duplication the section
 * `order` refactor removed (PRD-home-client-focus US-5 AC-1): a fact written
 * down in more than one place will eventually be true in only one of them.
 *
 * This module is deliberately **gsap-free** so `AppShell` — which ships in the
 * eager bundle and must never pull gsap in — can import it. Same reasoning as
 * `scrollTriggerBridge.ts`.
 */

/**
 * Viewport-heights of *pinned* scroll: the distance the reader travels while the
 * hero is held in place. Feeds ScrollTrigger's `end` as a percentage string.
 *
 * The phase boundaries in `heroPhases.ts` are fractions of the pin's 0..1
 * progress, so changing this number re-times how much wheel travel each phase
 * costs but moves no boundary — see the note on `HERO_PIN_DISTANCE`'s original
 * declaration.
 *
 * Was `8`. Shortened to `4` when the canvas "3D city" first stretch (progress
 * 0..0.60) was replaced by an autoplaying background video loop — there is no
 * longer a flatten/move/reveal choreography that needs viewports of travel to
 * read, only a video that crossfades to the bottom-left P + wordmark before the
 * gunshot at 0.60.
 *
 * Raised `4` -> `6` to give the 0.50-0.60 dwell (heroPhases.ts's Phase 4,
 * previously an empty CSS progress hairline) real scroll-time for two new
 * sub-movements — an office-window flythrough scrub (`approachProgress`),
 * then a short message beat (`messageProgress`) — before the gunshot. At 4
 * screens that 10%-wide window was only 0.4 viewport-heights of travel,
 * too little for either sub-movement to read; at 6 it's 0.6. Went to 6
 * rather than back to the original 8 to keep the increase proportional
 * everywhere else in the pin (a 50% stretch, not a 100% one) so the
 * gunshot -> drift-wall -> smoking -> border sequence (0.60..1.0) doesn't
 * start to feel sluggish — it now gets ~2.4 of the 6 screens instead of
 * ~1.6 of 4, the same 40% share of the timeline as before.
 */
export const HERO_PIN_SCREENS = 6;

/**
 * Total viewport-heights the hero occupies: the pinned range plus the hero's own
 * natural height. The thesis follows after the pin spacer in ordinary document
 * flow; there is no negative-margin overlap window.
 */
export const HERO_TOTAL_SCREENS = HERO_PIN_SCREENS + 1;

/** ScrollTrigger `end` value for the hero pin, e.g. `"+=800%"`. */
export const HERO_PIN_DISTANCE = `+=${String(HERO_PIN_SCREENS * 100)}%`;

/**
 * Total hero height in pixels for a given viewport height.
 *
 * Callers that need a scroll offset (chapter targets, navbar mode thresholds)
 * should derive it from this rather than multiplying by a literal.
 */
export function heroTotalHeight(viewportHeight: number): number {
  return HERO_TOTAL_SCREENS * viewportHeight;
}
