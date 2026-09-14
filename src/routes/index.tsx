import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/shared/seo";
import { EyeFlow } from "@/shared/components/EyeFlow";
import { SmoothScroll } from "@/shared/components/SmoothScroll";
import { refreshScrollTriggers } from "@/shared/motion/scrollTriggerBridge";
import { HomeResearchHero, HomeIntroduction, HomeMission } from "@/features/home/rebuild/HomeOpening";
import { HomePillars, HomeResearchTimeline } from "@/features/home/rebuild/HomeHorizontal";
import { HomeBuilt, HomeGlobalReach, HomeAcademy } from "@/features/home/rebuild/HomeEvidence";
import { HomeScrollCut } from "@/features/home/rebuild/HomeScrollCut";
import { HomeClosing } from "@/features/home/rebuild/HomeClosing";

// No gsap/lenis imports at route-module scope: this file stays in the eager
// bundle even with autoCodeSplitting, so anything imported here ships to every
// visitor. Scroll wiring lives in <SmoothScroll /> and inside the section
// components, which ride the lazy home chunk.

export const Route = createFileRoute("/")(
  {
  head: () =>
    pageHead(
      "Phitopolis — FinTech Engineering & Quantitative R&D",
      "A financial-sciences and engineering powerhouse turning global markets into deployable technology.",
    ),
  component: HomePage,
});

// Debounce for the home-page ResizeObserver refresh below. Long enough that a
// burst of layout changes (e.g. several lazy images settling in quick
// succession) collapses into one ScrollTrigger.refresh() instead of many.
const HOME_RESIZE_REFRESH_DEBOUNCE_MS = 150;

function HomePage() {
  const homeMainRef = useRef<HTMLElement>(null);

  // General staleness fix for issues 1+2 (mistimed establishing shots, hero/
  // mission overlap): any height change on the home page during this visit —
  // Image dimensions or lazy content settling — recomputes
  // every ScrollTrigger's start/end. Scoped to the home route only (this
  // effect never runs on other routes, since this component only mounts here)
  // and goes through the gsap-free bridge module rather than importing
  // ScrollTrigger directly, since this route file stays in the eager bundle.
  useEffect(() => {
    const el = homeMainRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        refreshScrollTriggers();
      }, HOME_RESIZE_REFRESH_DEBOUNCE_MS);
    });
    observer.observe(el);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <SmoothScroll />
      <EyeFlow />
      <Box component="div" id="home-main" ref={homeMainRef} sx={{ position: "relative", overflowX: "clip" }}>
        <HomeResearchHero />
        <HomeIntroduction />
        <HomeMission />
        <HomePillars />
        <HomeBuilt />
        <HomeScrollCut id="home-cut-research" destination="deep" />
        <HomeResearchTimeline />
        <HomeGlobalReach />
        <HomeAcademy />
        <HomeScrollCut id="home-cut-closing" destination="base" />
        <HomeClosing />
      </Box>
    </>
  );
}
