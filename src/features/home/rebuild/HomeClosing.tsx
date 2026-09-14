import { homeInset } from "./homeLayout";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "@/shared/motion";
import { SCROLL_SPEED } from "@/shared/motion/scrollSpeed";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { sectionOrder } from "@/shared/sections";
import { getLenis } from "@/shared/components/smoothScrollControls";
import { CONTENT } from "@/shared/content";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { CLOSING_MEDIA, HOME_PHASES, closingProgress } from "./homeFlow";
import { HomeFrame, HomeHeading, HomeLabel, HomeAction } from "./HomeFrame";
import { createVideoScrubber } from "./videoScrub";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export function HomeClosing() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  useGSAP(() => {
    const root = ref.current;
    const video = videoRef.current;
    if (!root || !video || reduced) return;
    const media = gsap.matchMedia();
    media.add({ desktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, context => {
      if (!context.conditions?.motion) return;
      const desktop = Boolean(context.conditions.desktop);
      const seeker = createVideoScrubber(video, () => setFailed(true));
      const state = { progress: 0 };
      const timeline = gsap.timeline({ scrollTrigger: {
        id: "home:closing", trigger: root, start: desktop ? "top top" : "top bottom",
        end: desktop ? () => `+=${window.innerHeight * HOME_PHASES.closing.screens}` : "bottom top",
        pin: desktop, scrub: SCROLL_SPEED,
        refreshPriority: refreshPriorityFor(sectionOrder("closing")),
      }});
      timeline.fromTo(state, { progress: 0 }, { progress: 1, duration: 1, ease: "none", immediateRender: false,
        onUpdate: () => seeker.seek(closingProgress(state.progress).video),
      }, 0);
      if (desktop) {
        timeline.fromTo(root.querySelector(".home-closing-picture"), { x: 0, xPercent: 0 }, { x: 0, xPercent: -22.5, duration: 1, ease: p => closingProgress(p).cta, immediateRender: false }, 0);
        timeline.fromTo(root.querySelector(".home-closing-cta"), { x: 0, xPercent: 100 }, { x: 0, xPercent: 0, duration: 1, ease: p => closingProgress(p).cta, immediateRender: false }, 0);
      }
      timeline.progress(1).progress(timeline.scrollTrigger?.progress ?? 0);
      const onFocus = () => {
        // Keyboard users get the reachable CTA without a focus target offscreen.
        if (desktop && timeline.scrollTrigger) {
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(timeline.scrollTrigger.end, { immediate: true });
          else timeline.scrollTrigger.scroll(timeline.scrollTrigger.end);
        }
      };
      const cta = root.querySelector(".home-closing-cta");
      cta?.addEventListener("focusin", onFocus);
      return () => { seeker.dispose(); cta?.removeEventListener("focusin", onFocus); };
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [reduced], revertOnUpdate: true });
  return <HomeFrame id="closing"><Box ref={ref} sx={{ position: "relative", overflow: "hidden", bgcolor: NOIR.navyInk, '@media (min-width: 768px) and (prefers-reduced-motion: no-preference)': { height: "100svh" } }}>
    <Box className="home-closing-picture" sx={{ position: "relative", height: "65svh", "@media (min-width: 768px)": { height: "100svh" }, width: "100%" }}>
      <Box component="img" src={CLOSING_MEDIA.poster} alt="Phitopolis engineering and delivery film" sx={{ width: "100%", height: "100%", objectFit: "cover" }}/>
      {!reduced && <Box component="video" ref={videoRef} src={CLOSING_MEDIA.video} muted playsInline preload="metadata" aria-hidden="true" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", visibility: failed ? "hidden" : "visible" }}/>}
    </Box>
    <Box className="home-closing-cta" sx={{ ...homeInset, bgcolor: SOFT.frost, color: NOIR.navyInk, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, '@media (min-width: 768px) and (prefers-reduced-motion: no-preference)': { position: "absolute", top: 0, right: 0, width: "45%", height: "100%", boxSizing: "border-box" } }}>
      <HomeLabel>What comes next / Let's build it</HomeLabel><HomeHeading>{CONTENT.closing.statement}</HomeHeading><Typography component="p" variant="subtitle1">{CONTENT.closing.subline}</Typography><HomeAction />
    </Box>
  </Box></HomeFrame>;
}
