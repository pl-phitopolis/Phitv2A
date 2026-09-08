/**
 * Wires the Home V3 act-boundary ScrollTriggers.
 *
 * House style copied from `CinematicHome.tsx`: `useGSAP` scoped to the page
 * root, a single `gsap.matchMedia()` gating everything on `HV3_MOTION_QUERY`
 * (same breakpoint + `prefers-reduced-motion` query the cinematic build
 * already uses — one mental model, not a second one invented for V3). Below
 * 900px or under reduced motion, the matched block never runs: no
 * ScrollTrigger is created, no `view-transition-name` is ever assigned, and
 * every act renders its final lit state because the act-panel markup itself
 * (owned by another agent) is not gated on JS running at all.
 */
import type { RefObject } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { useActTransition, type AskStage } from "./useActTransition";
import { HV3_BOUNDARY_START, HV3_MOTION_QUERY, type HomeAct, type Hv3Shot } from "./homeV3Motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useHomeV3Motion(scopeRef: RefObject<HTMLElement | null>): void {
  // `fireAct` is stable — `useActTransition` builds it with `useCallback` and
  // an empty dependency array — so it is safe to close over directly inside
  // `useGSAP`'s effect without re-running that effect on every render.
  const { fireAct } = useActTransition();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(HV3_MOTION_QUERY, () => {
        document.documentElement.dataset.hv3Motion = "on";

        const scopeEl = scopeRef.current;
        if (scopeEl) {
          const boundaries = scopeEl.querySelectorAll<HTMLElement>("[data-hv3-boundary]");
          boundaries.forEach((el, index) => {
            const from = el.dataset.hv3From as HomeAct | undefined;
            const to = el.dataset.hv3To as HomeAct | undefined;
            const shot = el.dataset.hv3Shot as Hv3Shot | undefined;
            const stageTo = el.dataset.hv3StageTo as AskStage | undefined;
            const stageBack = el.dataset.hv3StageBack as AskStage | undefined;
            if (!from || !to || !shot) return;

            // Deliberately NOT scrubbed, NOT pinned. `startViewTransition()`
            // snapshots the page synchronously; firing it while a scrub or a
            // pin is mid-motion snapshots a half-animated frame and the
            // transition plays from a ghost. A boundary is a discrete, one-
            // time event — the reader crosses it once per direction — so a
            // plain `onEnter`/`onLeaveBack` pair is the entire mechanism it
            // needs; scrub/pin exist for progress-linked narratives, which
            // this is not (see beatThresholds.ts's SCRUB POLICY for the same
            // rule applied to ordinary reveals).
            ScrollTrigger.create({
              trigger: el,
              start: HV3_BOUNDARY_START,
              // A boundary may also carry an Act IV stage, which is how the
              // finale (VT-4) fires: it is the one transition where `from` and
              // `to` are the same act, so without a stage the DOM write would
              // be a no-op and nothing would morph.
              // The finale never reverses and never repeats.
              //
              // Every other boundary is symmetric: scroll down and the act
              // advances, scroll back up and it returns. The finale cannot be,
              // because it is the one transition whose own effect moves the
              // trigger underneath it. Flipping the closing statement out and
              // the CTA in changes Act IV's layout, the release path refreshes
              // ScrollTrigger against that new layout, and the boundary is
              // then judged to have been left, firing `onLeaveBack`, which
              // changes the layout back. Measured in Chrome: 42 `ask` shots
              // oscillating between the two stages on one scroll to the
              // bottom. `once` breaks the cycle at the source, and it is also
              // the right behaviour on its own terms: an arrival should happen
              // once, not re-run every time the reader scrolls back up to
              // re-read the closing line.
              once: shot === "ask",
              onEnter: () => { fireAct(to, from, shot, stageTo); },
              ...(shot === "ask"
                ? {}
                : { onLeaveBack: () => { fireAct(from, to, shot, stageBack); } }),
              refreshPriority: refreshPriorityFor(index),
            });
          });
        }

        return () => {
          delete document.documentElement.dataset.hv3Motion;
        };
      });

      return () => mm.revert();
    },
    { scope: scopeRef },
  );
}
