import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SCROLL_SPEED } from "@/shared/motion/scrollSpeed";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { sectionOrder } from "@/shared/sections";
import { HOME_MOTION_QUERY } from "./homeFlow";
import type { HomeFlowId } from "./homeFlow";

gsap.registerPlugin(ScrollTrigger, useGSAP);
type BuildTimeline = (timeline: gsap.core.Timeline, root: HTMLElement) => void;
/** One timeline owns every animated layer inside a pinned narrative beat. */
export function useHomeScrub(ref: RefObject<HTMLDivElement | null>, id: HomeFlowId, screens: number, build: BuildTimeline, pin = true) {
  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(HOME_MOTION_QUERY, () => {
      const timeline = gsap.timeline({ scrollTrigger: {
        id: `home:${id}`, trigger: root, start: "top top",
        end: () => `+=${window.innerHeight * screens}`, pin,
        scrub: SCROLL_SPEED,
        // Layer coordinates are percentages; only trigger geometry needs refresh.
        refreshPriority: refreshPriorityFor(sectionOrder(id)),
      }});
      build(timeline, root);
      timeline.progress(1).progress(timeline.scrollTrigger?.progress ?? 0);
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [id, screens, build, pin], revertOnUpdate: true });
}
