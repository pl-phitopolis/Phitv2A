/**
 * Fires a Home V3 "act" transition — the shared-element / crossfade shot that
 * plays when the reader crosses an act boundary (`useHomeV3Motion`'s
 * ScrollTriggers call `fireAct` from their `onEnter`/`onLeaveBack`).
 *
 * Pure logic, no JSX: this hook returns one callback and owns nothing that
 * renders. The DOM writes it performs (`dataset.hv3Act`, `dataset.hv3Shot`,
 * `style.viewTransitionName`) are read by CSS
 * (`viewTransitionsHomeV3.css`) and by the act-panel components another
 * agent owns — this file only ever writes those attributes, never reads back
 * layout from them.
 *
 * `stopLenis`/`startLenis` are imported **statically**, unlike
 * `TransitionCurtain.tsx`'s dynamic `import("@/shared/components/
 * smoothScrollControls")`. That dynamic import exists there because
 * TransitionCurtain is mounted eagerly by `AppShell` on every route, and a
 * static gsap/Lenis-adjacent import would drag Lenis into the entry chunk.
 * This module has no such constraint: it is only ever imported by
 * `HomeV3.tsx`, which already rides the lazy home chunk (exactly like
 * `CinematicHome.tsx` statically imports `gsap` today), so there is nothing
 * eager here to protect.
 */
import { useCallback, useEffect, useRef } from "react";

/** The two halves of Act IV. VT-4 ("ask") is the flip between them. */
export type AskStage = "statement" | "cta";
import { gsap } from "gsap";

import { startLenis, stopLenis } from "@/shared/components/smoothScrollControls";
import { refreshScrollTriggers } from "@/shared/motion/scrollTriggerBridge";
import {
  HV3_FALLBACK_EASE,
  HV3_ESCAPE_ARM_MS,
  HV3_GATE_TIMEOUT_MS,
  HV3_SHOT_DURATIONS,
  HV3_VT_NAMES,
  type HomeAct,
  type Hv3Shot,
} from "./homeV3Motion";

/**
 * Shot → shared-element base name. Only shots that actually carry a shared
 * element appear here. `ask` is intentionally absent: per spec it is
 * root-only (the finale stage flip lives on `data-hv3-ask-stage`, not on a
 * `data-hv3-vt` pair), so it must assign no `view-transition-name` at all.
 */
const SHOT_ELEMENT_NAME: Partial<Record<Hv3Shot, "lede" | "seed" | "bloom">> = {
  proof: "lede",
  process: "seed",
  verdict: "bloom",
};

/**
 * Attribute selector for any element still carrying a `view-transition-name`
 * from a previous shot. Platform rule (see `HV3_VT_NAMES`'s docblock in
 * `homeV3Motion.ts`): at most one live element may hold a given name, or the
 * browser silently skips the transition. Clearing unconditionally, before
 * assigning the next pair, is what keeps that invariant true across repeated
 * forward/backward crossings.
 */
const ASSIGNED_VT_NAME_SELECTOR = '[style*="view-transition-name"]';

function clearAssignedVtNames(): void {
  document.querySelectorAll<HTMLElement>(ASSIGNED_VT_NAME_SELECTOR).forEach((el) => {
    el.style.viewTransitionName = "";
  });
}

/**
 * Plain DOM attribute write — never a React remount. Both the outgoing and
 * incoming act panels stay mounted throughout (another agent's CSS keys
 * visibility off `data-hv3-act`/`data-hv3-act-panel`), which is what makes it
 * safe to call this synchronously inside a `startViewTransition` callback:
 * the browser needs both the "before" and "after" states to be real,
 * paintable DOM, and a remount could not guarantee that within one
 * synchronous callback.
 */
function applyAct(to: HomeAct, stage?: AskStage): void {
  const scopeEl = document.querySelector<HTMLElement>(".hv3");
  if (scopeEl) scopeEl.dataset.hv3Act = to;
  document.documentElement.dataset.hv3Act = to;

  // The finale is the one transition that does not move between acts. VT-4
  // fires *inside* Act IV, flipping the closing statement out and the CTA in,
  // which is why it needs a second piece of state: `to` is "ask" on both sides
  // of it and would otherwise be a no-op write. Everything else leaves the
  // stage untouched by passing no argument.
  if (stage) {
    if (scopeEl) scopeEl.dataset.hv3AskStage = stage;
    document.documentElement.dataset.hv3AskStage = stage;
  }
}

function focusIncomingHeading(to: HomeAct): void {
  const heading = document.querySelector<HTMLElement>(
    `[data-hv3-act-panel="${to}"] [data-hv3-heading]`,
  );
  heading?.focus();
}

/**
 * GSAP fallback for browsers without `document.startViewTransition` (older
 * WebKit/Firefox at time of writing). An honest crossfade — the outgoing
 * panel fades out while the incoming panel fades in, using the same
 * durations/easings the CSS `::view-transition-group()` rules use for the
 * primary path — not a hand-rolled recreation of the shared-element FLIP
 * animation, which is exactly the fidelity gap this path is allowed to have.
 */
function runFallbackCrossfade(
  from: HomeAct,
  to: HomeAct,
  shot: Hv3Shot,
  onComplete: () => void,
): gsap.core.Timeline {
  const duration = HV3_SHOT_DURATIONS[shot] / 1000;
  const ease = HV3_FALLBACK_EASE;
  const outgoing = document.querySelector<HTMLElement>(`[data-hv3-act-panel="${from}"]`);
  const incoming = document.querySelector<HTMLElement>(`[data-hv3-act-panel="${to}"]`);

  const tl = gsap.timeline({ onComplete });
  if (outgoing) {
    tl.to(outgoing, { opacity: 0, duration, ease }, 0);
  }
  if (incoming) {
    tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration, ease }, 0);
  }
  if (!outgoing && !incoming) {
    // Nothing to animate (markup not mounted, or a shot with no panel pair
    // in this act) — still resolve so the lock releases.
    tl.eventCallback("onComplete", onComplete);
    tl.progress(1);
  }
  return tl;
}

/** Passive-safe escape listeners: the reader is never held against their will. */
type EscapeKind = "wheel" | "touchstart" | "keydown";
const ESCAPE_KINDS: readonly EscapeKind[] = ["wheel", "touchstart", "keydown"];

/**
 * How many wheel/touch inputs after arming count as "let me out". One is not
 * enough: ordinary continuous scrolling delivers that incidentally, and a run
 * in real Chrome showed a single-event escape cancelling 42 of 45 transitions,
 * which would have meant the reader almost never saw the feature at all.
 * `Escape` bypasses this and takes effect on the first press.
 */
export const ESCAPE_INTENT_EVENTS = 3;

export function useActTransition(): {
  fireAct: (to: HomeAct, from: HomeAct, shot: Hv3Shot, stage?: AskStage) => void;
} {
  /** Re-entrancy lock — same shape as `TransitionCurtain`'s `navigatingRef`. */
  const lockRef = useRef(false);
  /** Force-release hook for unmount; set while a transition is in flight. */
  const releaseRef = useRef<(() => void) | null>(null);

  const fireAct = useCallback((to: HomeAct, from: HomeAct, shot: Hv3Shot, stage?: AskStage) => {
    /**
     * Already there? Do nothing.
     *
     * Without this the finale loops forever, and it is worth spelling out why
     * because the mechanism is not obvious: the `ask` flip hides one stage and
     * shows the other, which changes layout, which moves the boundary marker
     * the trigger is attached to. The release path then calls
     * `refreshScrollTriggers()`, ScrollTrigger re-measures against the new
     * layout, decides the boundary has been entered, and fires `onEnter`
     * again. Transition -> refresh -> re-enter -> transition, several times a
     * second, forever. Measured in Chrome before this guard: 60+ `ask` shots
     * from a single scroll to the bottom of the page.
     *
     * A state check is the right fix rather than a one-shot flag, because it
     * also covers the ordinary boundaries (a refresh that re-fires `onEnter`
     * for an act the reader is already in) and still allows the genuine
     * reverse transition on `onLeaveBack`, where the target state really does
     * differ from the current one.
     */
    const root = document.documentElement;
    if (root.dataset.hv3Act === to && (!stage || root.dataset.hv3AskStage === stage)) {
      return;
    }
    if (lockRef.current) return;
    lockRef.current = true;

    stopLenis();
    clearAssignedVtNames();

    /**
     * The name moves; it is never held by two elements at once.
     *
     * A `view-transition-name` may be borne by at most ONE rendered element in
     * each snapshot. If two carry it, the browser does not warn or throw, it
     * silently performs the DOM update with no transition at all — so the bug
     * presents as "the morphs just don't happen" with a clean console.
     *
     * Both halves of every shared element are rendered simultaneously here
     * (this is one continuous scrolling document, and the acts are neither
     * unmounted nor `display: none`), so assigning the name to both up front
     * is exactly that silent-skip condition. Instead the name sits on the
     * OUTGOING element while the old snapshot is taken, and is moved to the
     * INCOMING element inside the update callback, before the new snapshot.
     * One element per snapshot, which is what the platform asks for, and it is
     * the "dynamic" assignment pattern the same-document-transitions guidance
     * documents for exactly this shape of problem.
     */
    const elementName = SHOT_ELEMENT_NAME[shot];
    const vtName = elementName ? HV3_VT_NAMES[elementName] : null;
    const fromEl = elementName
      ? document.querySelector<HTMLElement>(`[data-hv3-vt="${elementName}-from"]`)
      : null;
    const toEl = elementName
      ? document.querySelector<HTMLElement>(`[data-hv3-vt="${elementName}-to"]`)
      : null;

    if (vtName && fromEl) fromEl.style.viewTransitionName = vtName;

    document.documentElement.dataset.hv3Shot = shot;

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;

      // Hand the name over inside the callback: clear the outgoing element
      // first, so there is never an instant where both hold it.
      if (vtName) {
        if (fromEl) fromEl.style.viewTransitionName = "";
        if (toEl) toEl.style.viewTransitionName = vtName;
      }

      applyAct(to, stage);
    };

    let released = false;
    let fallbackTimeline: gsap.core.Timeline | null = null;
    let vt: ViewTransition | null = null;

    const removeEscapeListeners = () => {
      window.clearTimeout(armId);
      for (const kind of ESCAPE_KINDS) {
        window.removeEventListener(kind, onEscape);
      }
    };

    const release = () => {
      if (released) return;
      released = true;

      window.clearTimeout(timeoutId);
      removeEscapeListeners();
      fallbackTimeline?.kill();

      startLenis();
      delete document.documentElement.dataset.hv3Shot;
      clearAssignedVtNames();
      focusIncomingHeading(to);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          refreshScrollTriggers();
        });
      });

      lockRef.current = false;
      releaseRef.current = null;
    };

    /**
     * A gesture, not a stray event.
     *
     * Arming on a delay stops the entering fling's inertia from cancelling the
     * transition, but it is not sufficient on its own: a reader scrolling at a
     * steady pace still has wheel events arriving after the arm window, and
     * measurement in Chrome showed that cancelling every gate. The transitions
     * then almost never play, which defeats the point of building them.
     *
     * So a wheel or touch escape needs `ESCAPE_INTENT_EVENTS` inputs after
     * arming, which reads as "the reader is actively pushing on". `Escape` is
     * unambiguous by nature and takes effect on the first press.
     */
    let intent = 0;
    function onEscape(event: Event) {
      if (event.type === "keydown") {
        if ((event as KeyboardEvent).key !== "Escape") return;
      } else {
        intent += 1;
        if (intent < ESCAPE_INTENT_EVENTS) return;
      }
      vt?.skipTransition?.();
      commit();
      release();
    }

    // Armed on a delay, not synchronously. See HV3_ESCAPE_ARM_MS: the wheel
    // inertia of the gesture that crossed the boundary is still arriving, and
    // an escape listening at t=0 would cancel the transition it exists to
    // rescue on every single scroll-driven entry.
    const armId = window.setTimeout(() => {
      for (const kind of ESCAPE_KINDS) {
        window.addEventListener(kind, onEscape, { passive: true });
      }
    }, HV3_ESCAPE_ARM_MS);

    const timeoutId = window.setTimeout(() => {
      vt?.skipTransition?.();
      commit();
      release();
    }, HV3_GATE_TIMEOUT_MS);

    releaseRef.current = release;

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => ViewTransition;
    };

    if (typeof doc.startViewTransition === "function") {
      vt = doc.startViewTransition(commit);
      vt.ready?.catch(() => {});
      vt.updateCallbackDone?.catch(() => {});
      vt.finished
        ?.catch(() => {})
        .finally(() => release());
    } else {
      commit();
      fallbackTimeline = runFallbackCrossfade(from, to, shot, release);
    }
  }, []);

  // Unmount safety net: if a transition is mid-flight when this hook's owner
  // unmounts, force the release path so Lenis is never left stopped and no
  // stray timer/listener outlives the component.
  useEffect(() => {
    return () => {
      releaseRef.current?.();
    };
  }, []);

  return { fireAct };
}
