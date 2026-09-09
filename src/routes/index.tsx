import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { createFileRoute } from "@tanstack/react-router";

import { pageHead } from "@/shared/seo";
import { EyeFlow } from "@/shared/components/EyeFlow";
import { SmoothScroll } from "@/shared/components/SmoothScroll";
import { refreshScrollTriggers } from "@/shared/motion/scrollTriggerBridge";
import { SuperHeroSequence } from "@/features/hero/SuperHeroSequence";
import {
  HomeThesis,
  HomeDisciplines,
  HomeApplications,
  HomeGrowth,
  HomeReach,
} from "@/features/home/making-tomorrow/HomeEditorial";
import { HomeFilmScene } from "@/features/home/making-tomorrow/HomeFilmScene";

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
  // HeroImageWall mounting mid-scroll, lazy content settling — recomputes
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
        {/* 01. Hero Sequence */}
        <Box
          component="section"
          id="hero-sequence"
          aria-label="Hero Sequence"
          data-act="services"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <SuperHeroSequence />
        </Box>

        {/* 02. Thesis. The hero releases into this section in ordinary document
         * flow; its pin spacer reserves the hero's scroll distance. */}
        <Box
          data-act="services"
          sx={{
            position: "relative",
            bgcolor: "background.default",
            borderTopLeftRadius: { xs: 28, md: 48 },
            borderTopRightRadius: { xs: 28, md: 48 },
          }}
        >
          <HomeThesis />
        </Box>

        {/* 03. Three disciplines — unpinned, vertical alternating photo/text
         * composition (media pattern 02). Renders its own id="hero-pillars"
         * and registers its own navbar anchor; no SectionBeat wrapper. */}
        <HomeDisciplines />

        {/* 04. Proof film — the pinned cinematic passage over the
         * SERVICES_LOOP footage, the "proof" climax between the disciplines
         * and the applications beat. Self-contained: owns its own
         * ScrollTrigger pin and navbar anchor. */}
        <HomeFilmScene scene="proof" />

        {/* 05. Three applications — the architectural use-cases, unpinned,
         * alternating image+caption blocks per CONTENT.useCases. Renders its
         * own id="use-cases" and navbar anchor. */}
        <HomeApplications />

        {/* 06. Growth — unpinned three-stop timeline replacing the old
         * pinned ProcessScrubStage. Renders its own id="process" and navbar
         * anchor. */}
        <HomeGrowth />

        {/* 07. Global footprint — closes the SERVICES narrative. Renders its
         * own id="reach" and navbar anchor. */}
        <HomeReach />

        {/* 08. Closing — the "possibility" climax: full-bleed cinematic film
         * over the CTA footage, replacing ClosingVideoSection. Self-
         * contained: owns its own ScrollTrigger pin and navbar anchor. */}
        <HomeFilmScene scene="closing" />
      </Box>
    </>
  );
}
