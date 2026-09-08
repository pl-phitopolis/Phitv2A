/**
 * Home V3 motion constants — the single source of truth for the "act"
 * choreography that drives the redesigned home page's internal transitions.
 *
 * This module is deliberately dependency-free (no gsap, no react) so it is
 * safe to import from a plain Vitest module or from either runtime path that
 * consumes it:
 *
 *   - The View Transitions path reads these numbers only by convention — CSS
 *     cannot `import` a TS module, so `viewTransitionsHomeV3.css` duplicates
 *     every duration and easing curve defined here by hand.
 *   - The GSAP fallback path (for browsers without
 *     `document.startViewTransition`) imports this module directly and uses
 *     the same numbers to build an equivalent timeline.
 *
 * Because the CSS file cannot read this file, the two are only linked by
 * discipline: `tests/motion/home-v3-timing-parity.test.ts` parses both and
 * fails the build the moment a duration or easing curve changes in one file
 * and not the other. If you touch a value here, touch its twin in
 * `viewTransitionsHomeV3.css` in the same change, and let that test tell you
 * if you missed one.
 */
import { EASE_IN_EXPO_CSS, EASE_OUT_EXPO_CSS } from "@/shared/motion/easing";

/** The four narrative acts of the V3 home page. */
export type HomeAct = "opening" | "proof" | "method" | "ask";

/**
 * The four view-transition "shots" — the values written to
 * `document.documentElement.dataset.hv3Shot` immediately before a
 * `document.startViewTransition()` call (or before the GSAP fallback
 * timeline starts) so the corresponding `:root[data-hv3-shot="..."]` block in
 * `viewTransitionsHomeV3.css` is the only one active for that transition.
 */
export type Hv3Shot = "proof" | "process" | "verdict" | "ask";

/**
 * The gate for whether V3's act transitions run at all.
 *
 * Deliberately identical to the breakpoint `src/features/home/cinematic/
 * CinematicHome.tsx` already uses (see its `matchMedia` call around line 230)
 * so V3 introduces no new gating convention — one query string, one mental
 * model for "is this visitor in a state where scroll-driven/transition-driven
 * motion is appropriate", reused rather than reinvented.
 */
export const HV3_MOTION_QUERY =
  "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

/**
 * ScrollTrigger start position for an act **boundary** — the point at which
 * one act's shot fires and the next act's content takes over.
 *
 * Deliberately later (closer to the reader) than `BEAT_START` ("top 75%" in
 * `beatThresholds.ts`). `BEAT_START` governs ordinary content reveals, which
 * are allowed to begin while the trigger is still peripheral — the reader's
 * eye hasn't reached it yet, so an early start just means the reveal is
 * finished by the time they look. A boundary is not that: it is a discrete,
 * one-time event (a shot change, a scroll lock engaging) that the reader
 * needs to actually be looking at when it happens, or it reads as the page
 * doing something unprompted. "top 60%" holds it back until the trigger is
 * much closer to screen center, where it's reasonable to assume the reader's
 * attention already is.
 */
export const HV3_BOUNDARY_START = "top 60%";

/**
 * Hard ceiling, in milliseconds, on how long an act boundary is allowed to
 * hold Lenis's scroll lock while it waits for a transition promise
 * (`ViewTransition.finished` or the GSAP fallback timeline's completion) to
 * settle.
 *
 * This is an escape valve, not a target duration — every real shot finishes
 * well under this. It exists for the cases a promise-based wait cannot
 * protect against on its own: a backgrounded tab throttles rAF and timers,
 * so a transition's `finished` promise may not resolve for seconds; a
 * browser bug or an unexpected DOM mutation mid-transition could reject or
 * simply never settle. Either way, without a timeout the scroll lock the
 * boundary took out would stay engaged indefinitely and the page would look
 * frozen. 900ms is comfortably above the slowest defined shot (`verdict` at
 * 650ms) with margin for a slow device, and short enough that even the
 * worst case reads as "a brief stall," not "broken."
 */
/**
 * How long the gate waits before it will listen for a user escape.
 *
 * The escape hatch cannot arm synchronously. A boundary's `onEnter` fires
 * *during* a wheel-driven scroll, so the inertia of the very gesture that
 * crossed the threshold is still delivering `wheel` events for a few hundred
 * milliseconds afterwards. An escape armed at t=0 therefore cancels the
 * transition it was meant to rescue, on essentially every scroll-driven entry,
 * and the page reads as "the transitions do not work".
 *
 * 180ms is long enough to outlast a trackpad fling's tail and short enough that
 * a reader who genuinely wants out is not held: worst case they push twice.
 * The timeout valve (below) is a separate, unconditional safety net and is
 * armed immediately.
 */
export const HV3_ESCAPE_ARM_MS = 180;

export const HV3_GATE_TIMEOUT_MS = 900;

/** Shot durations, in milliseconds. Mirrored by hand in the `animation-
 *  duration` of each shot's `::view-transition-group()` rule in
 *  `viewTransitionsHomeV3.css` — see the file-level docblock above for how
 *  that mirroring is enforced. */
export const HV3_SHOT_DURATIONS: Record<Hv3Shot, number> = {
  proof: 520,
  process: 480,
  verdict: 650,
  ask: 340,
};

/**
 * Shot easing curves, as the `cubic-bezier()` strings CSS needs for
 * `animation-timing-function`.
 *
 * These are NOT new curves. `EASE_OUT_EXPO_CSS` and `EASE_IN_EXPO_CSS` are the
 * site's existing shared easings (`@/shared/motion/easing`), reused verbatim so
 * V3's transitions sit in the same motion language as every reveal, drawer and
 * route curtain on the site. Importing them rather than retyping the tuples is
 * also what keeps this file clear of the `no-restricted-syntax` raw-bezier rule
 * in `eslint.config.js`, so V3 needed no lint exemption.
 *
 * `old` and `new` are independent because `verdict` and `ask` intentionally pair
 * an accelerating exit with a decelerating entrance (push, then settle), while
 * `proof` and `process` use one symmetrical curve for both halves.
 *
 * `process` deliberately shares `proof`'s curve rather than carrying a bespoke
 * one. Its distinctness comes from its mechanic (the `clip-path` wipe up from
 * the bottom, plus the outgoing root scaling down), not from a different
 * bezier, and adding a sixth site-wide easing to differentiate one transition
 * is not a trade worth making.
 */
export const HV3_SHOT_EASINGS: Record<Hv3Shot, { old: string; new: string }> = {
  proof: { old: EASE_OUT_EXPO_CSS, new: EASE_OUT_EXPO_CSS },
  process: { old: EASE_OUT_EXPO_CSS, new: EASE_OUT_EXPO_CSS },
  verdict: { old: EASE_IN_EXPO_CSS, new: EASE_OUT_EXPO_CSS },
  ask: { old: EASE_IN_EXPO_CSS, new: EASE_OUT_EXPO_CSS },
};

/**
 * `view-transition-name` values used by V3's shared elements.
 *
 * The platform invariant that matters here: **at most one element may carry
 * a given `view-transition-name` at any instant.** If two elements share a
 * name when `startViewTransition()` captures the DOM, the browser does not
 * error or warn — it silently skips the transition entirely and falls back
 * to a plain swap. Every place that assigns one of these names to an element
 * must therefore also be the place that clears it from whatever element held
 * it during the previous act (typically by removing the CSS custom property
 * or class that applies it), or a later shot will inexplicably stop
 * animating with no console signal to explain why.
 */
export const HV3_VT_NAMES = {
  lede: "hv3-lede",
  seed: "hv3-seed",
  bloom: "hv3-bloom",
  askPill: "hv3-ask-pill",
} as const;

/**
 * VT-5 — the closing CTA's shared-element morph into `/contact`'s submit
 * button (`ActAsk.tsx`'s onClick, `ContactForm.tsx`'s `data-hv3-vt="ask-pill"`
 * button). Unlike VT-1..4 this is a ROUTE transition: home unmounts as
 * `/contact` mounts, riding `useTransitionCurtain().navigateWithCurtain()`'s
 * existing view-transition plumbing rather than a second one. It therefore
 * has no place in the `Hv3Shot` union above — nothing here is read by
 * `useActTransition.ts`/`fireAct`, which only ever drives in-page act
 * boundaries. It reuses the same `data-hv3-shot` attribute *name* as those
 * four purely as a matter of one CSS convention for "which shot is live" —
 * safe because an act boundary and this route boundary can never be in
 * flight at once (the finale settles well before the reader can reach the
 * CTA that fires this one).
 */
export const HV3_ASK_PILL_SHOT = "ask-pill";

/**
 * How long `data-hv3-shot="ask-pill"` is left on `<html>` before being
 * cleared defensively.
 *
 * `navigateWithCurtain` does not hand its `ViewTransition` back to the
 * caller, so — unlike `useActTransition`, which clears its own attribute the
 * instant its `finished` promise settles — there is no precise hook to clear
 * this one on settle. 1200ms comfortably outlives everything that can be
 * running under it (the 0.55s route substrate in `viewTransitions.css` plus
 * this shot's own 0.42s group), and clearing a little late costs nothing: the
 * attribute only toggles a CSS selector, so an extra few hundred milliseconds
 * of it being present has no visible effect once the transition itself is
 * over.
 */
/**
 * VT-5's duration, mirrored in `viewTransitionsHomeV3.css`.
 *
 * It sits outside `HV3_SHOT_DURATIONS` because that map is typed by `Hv3Shot`,
 * the four ACT shots the scroll gate fires, and VT-5 is a route transition
 * armed on click. It still needs the same drift protection as the others, so
 * `home-v3-timing-parity.test.ts` checks it explicitly rather than by
 * iterating that map. Without this constant the shot's timing lived only in
 * CSS and nothing would have noticed the two drifting apart.
 */
export const HV3_ASK_PILL_DURATION_MS = 420;

export const HV3_ASK_PILL_CLEAR_MS = 1200;

/**
 * GSAP ease for the no-View-Transitions-API crossfade fallback (older
 * WebKit/Firefox at time of writing).
 *
 * GSAP has no raw `cubic-bezier(...)` string support in its ease registry —
 * it needs a named ease or a `CustomEase` string. Rather than pull in the
 * `CustomEase` plugin for a fallback path that already degrades the visual
 * fidelity of the transition, `power2.out` is used as the closest built-in
 * match to the primary curve used above, `EASE_OUT_EXPO_CSS`
 * (a fast start easing into a soft landing). It is an approximation, not a
 * numeric match — acceptable here because this path only runs for visitors
 * who never see the View Transitions version to compare it against.
 */
export const HV3_FALLBACK_EASE = "power2.out";
