import { lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";

import { CONTENT } from "@/shared/content";
import { Reveal } from "@/shared/components/Reveal";
import { NAV_ANCHORS } from "@/shared/components/NavbarContext";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { BackgroundReveal } from "@/features/about/components/BackgroundReveal";
import { SmoothSection } from "@/features/about/components/SmoothSection";
import { MissionSection } from "@/features/about/components/MissionSection";
import { PoweredBySection } from "@/features/about/components/PoweredBySection";
import { CertificationsSection } from "@/features/about/components/CertificationsSection";
import { PrinciplesValuesShowcase } from "@/features/about/components/PrinciplesValuesShowcase";
import { TalentSection } from "@/features/about/components/TalentSection";
import { AcademySection } from "@/features/about/components/AcademySection";
import { pageHead } from "@/shared/seo";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { MONO, TYPE_SCALE } from "@/shared/theme/theme";

// ── Talent/culture narrative, relocated from the home page ──────────────────
// (PRD-home-client-focus §US-2: home became client-facing only, so the
// culture film, careers, testimonials, and blog moved here intact.)
//
// /about has no `SectionBeat`/ground-per-section stage system of its own —
// it uses `Section`/`Reveal`/`SmoothSection` instead. But `SectionBeat` looks
// its section up via `aboutSection()` against `ABOUT_SECTIONS` (throws on an
// unknown id) and declares a `ground` that only `GroundLayer` paints, and
// PRD-home-client-focus §US-2 AC-2 requires the culture film's pinned
// ScrollTrigger to "pin, play and release exactly as it did on the home
// page" — so this route now also mounts `<SmoothScroll />` + `<GroundLayer
// stops={ABOUT_GROUND_STOPS} />`, exactly like home does, rather than
// unwrapping the four sections out of the beat system. `<EyeFlow />` (home's
// chapter rail) is deliberately NOT added: it is hard-coded to a 10-chapter,
// two-act journey model (see EyeFlow.tsx's `measure()`/`ACT_GROUPS`) built
// for the whole home page, About's own sections do not participate in that
// journey, and no PRD-home-client-focus AC asks for a chapter rail on
// About — adding one would be new UI, not a like-for-like relocation.
import { SmoothScroll } from "@/shared/components/SmoothScroll";
import { GroundLayer } from "@/shared/components/ground/GroundLayer";
import { ABOUT_GROUND_STOPS } from "@/shared/components/ground/groundStops";
import { aboutSection } from "@/shared/sections";
import { SectionBeat } from "@/shared/components/stage/SectionBeat";
import { SeamEstablishingShot } from "@/features/home/components/establishing/SeamEstablishingShot";
import { DailyLifeSection } from "@/features/home/components/DailyLifeSection/DailyLifeSection";
import { CandidatesAndCareersSection } from "@/features/home/components/CandidatesAndCareersSection";
import { TestimonialsSection } from "@/features/home/components/TestimonialsSection";
import { BlogSection } from "@/features/home/components/BlogSection";

// CurtainTransition statically imports gsap + ScrollTrigger at module scope
// (see that file's own comment), so — same as routes/index.tsx — it is
// reached only through `lazy()`, keeping gsap out of this eager route chunk.
// It hands off into the deep-navy Blog beat, exactly as it did on home.
const CurtainTransition = lazy(() =>
  import("@/shared/components/CurtainTransition").then((m) => ({ default: m.CurtainTransition })),
);

// JourneyTimeline is 892 lines driving a 480vh horizontal scrub over 26 photos,
// and it sits fifth on the page — nobody sees it in the first viewport. Lazying
// it keeps that weight (and its 26 image URLs) out of the eager route chunk,
// which matters most on a client-side nav into /about from another page.
//
// Note this does NOT drop gsap from the eager chunk: `SmoothScroll` and
// `GroundLayer` both import it at module scope and both mount at the top of
// this route, so the gsap chunk stays a static edge either way. The win here is
// JourneyTimeline's own weight, not the shared library.
const JourneyTimeline = lazy(() =>
  import("@/features/about/components/JourneyTimeline").then((m) => ({
    default: m.JourneyTimeline,
  })),
);

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About · Phitopolis",
      "Seven years building a top-tier R&D firm in Manila for global markets — our story, mission and values, proven impact, certifications, and our offices.",
    ),
  component: AboutPage,
});

function AboutPage() {
  const heroAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_HERO, { dark: true });
  const valuesAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_VALUES, { dark: false });
  const timelineAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_TIMELINE, { dark: true });
  const certsAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_CERTIFICATIONS, { dark: false });
  const dailyLifeAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_DAILY_LIFE, { dark: true });
  const candidatesAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_CANDIDATES, { dark: false });
  const testimonialsAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_TESTIMONIALS, { dark: false });
  const blogAnchorRef = useNavbarAnchor(NAV_ANCHORS.ABOUT_BLOG_SECTION, { dark: true });


  return (
    <>
      <SmoothScroll />
      <GroundLayer stops={ABOUT_GROUND_STOPS} />
      <Box sx={{ pt: 0, pb: 0, position: "relative" }}>
      {/* ── Document-Flow Sentinel for Navbar Dark Mode ──
          Positioned absolute relative to page flow (not sticky container) so when the sheet
          scrolls up over the hero, the sentinel leaves the navbar strip and navbar reverts to light mode. */}
      <Box
        ref={heroAnchorRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: { xs: "35vh", md: "50vh" },
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Sticky Parallax Hero Section ── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          px: { xs: 3, sm: 6, md: 8, lg: 12 },
        }}
      >
        <BackgroundReveal />
        {/* Hero is now a single left-aligned text column over the full-bleed
            video — no right-hand card. The sticky Box's responsive `px`
            provides the left inset; `alignItems: center` keeps it vertically
            centered. */}
        <Box sx={{ position: "relative", zIndex: 2, width: "100%", maxWidth: { xs: "100%", md: 640 } }}>
            <Reveal>
              <Stack spacing={3} sx={{ textAlign: "left" }}>
                <Box sx={{ display: "inline-flex" }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: NOIR.gold,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      fontSize: TYPE_SCALE.body2,
                      fontFamily: MONO,
                      textTransform: "uppercase",
                    }}
                  >
                    {CONTENT.about.overline}
                  </Typography>
                </Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.3rem", sm: "3.1rem", md: "3.6rem" },
                    lineHeight: 1.15,
                    letterSpacing: "-0.025em",
                  }}
                >
                  <Box component="span" sx={{ color: NOIR.gold, display: "inline" }}>
                    {CONTENT.about.headingAccent}{" "}
                  </Box>
                  <Box component="span" sx={{ color: NOIR.white, display: "inline" }}>
                    {CONTENT.about.headingRest}
                  </Box>
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: { xs: "1.05rem", md: "1.2rem" },
                    lineHeight: 1.6,
                    fontWeight: 400,
                    maxWidth: 540,
                  }}
                >
                  {CONTENT.about.lead}
                </Typography>
              </Stack>
            </Reveal>
        </Box>
      </Box>

      {/* ── Parallax Overlay Sheet (Slides up and covers the Hero section) ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          bgcolor: "background.default",
          borderTopLeftRadius: { xs: 28, md: 48 },
          borderTopRightRadius: { xs: 28, md: 48 },
          boxShadow: "0 -16px 48px rgba(0, 0, 0, 0.22)",
          pt: 0,
          pb: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Block A — Mission·PoweredBy·Principles on ONE continuous mist
            ground. This wrapper is opaque mist so the parallax gaps between
            the sections (and the sheet's own top pad, moved here) read mist,
            not the near-white `background.default` sheet behind them — same
            occlusion pattern as the navy Boxes below. The sheet's rounded top
            edge is carried here too so it reads mist. (linen is reserved for
            the home page; non-home light grounds use frost/mist only.) */}
        <Box
          sx={{
            bgcolor: SOFT.mist,
            position: "relative",
            zIndex: 1,
            borderTopLeftRadius: { xs: 28, md: 48 },
            borderTopRightRadius: { xs: 28, md: 48 },
            pt: { xs: 8, md: 14 },
          }}
        >
          <Box sx={{ mb: { xs: 12, md: 16 } }}>
            <SmoothSection>
              <MissionSection />
            </SmoothSection>
          </Box>

          <Box sx={{ mb: { xs: 12, md: 20 } }}>
            <SmoothSection>
              <PoweredBySection />
            </SmoothSection>
          </Box>

          <Box sx={{ mb: { xs: 12, md: 20 } }} ref={valuesAnchorRef}>
            <PrinciplesValuesShowcase />
          </Box>
        </Box>

        {/* JourneyTimeline — navy signature. Its own opaque navy Box occludes
            the light sheet so its parallax gap reads navy (matches the
            `NOIR.navyField` it paints internally). */}
        <Box sx={{ bgcolor: NOIR.navyField, position: "relative", zIndex: 1 }}>
          <Box sx={{ mb: { xs: 12, md: 20 } }} ref={timelineAnchorRef}>
            <SmoothSection>
              <Suspense fallback={null}>
                <JourneyTimeline />
              </Suspense>
            </SmoothSection>
          </Box>
        </Box>

        {/* Block B — Talent·Certifications on ONE continuous frost ground. */}
        <Box sx={{ bgcolor: SOFT.frost, position: "relative", zIndex: 1 }}>
          <Box sx={{ mb: { xs: 12, md: 20 } }}>
            <SmoothSection>
              <TalentSection />
            </SmoothSection>
          </Box>

          <Box sx={{ mb: 0 }} ref={certsAnchorRef}>
            <SmoothSection>
              <CertificationsSection />
            </SmoothSection>
          </Box>
        </Box>

        {/* ── Talent/culture narrative (relocated from home) ──────────────
            Relative order preserved exactly as it was on the home page:
            Daily Life → Careers → Testimonials → Blog. */}

        {/* Behind The Code — the culture film. Major Establishing Shot (the
            Act I → Act II handover on home) is paired with DailyLifeSection
            via SectionBeat, which renders `bare` because `daily-life`
            declares `ownsPin: true` in ABOUT_SECTIONS (sections.ts). The pin
            is DailyLifeSection's own (`trigger: containerRef.current`, pinned
            for DAILY_LIFE_PIN_VH viewport-heights,
            refreshPriorityFor(sectionOrder("daily-life")) — see
            DailyLifeSection.tsx): the video starts inset on the left and
            scrubs out to a full-bleed frame, holds fullscreen for a scroll
            buffer, then releases. `bare` guarantees it is never a descendant
            of anything SectionBeat transforms, so that pin geometry is
            unaffected by the move. Order is /about's own first beat order
            (index 0 in ABOUT_SECTIONS), independent of home's numbering.

            Wrapped in its own opaque navy Box for the same reason the Blog
            + Academy zone below is: the "Parallax Overlay Sheet" this whole
            page lives inside paints `background.default` (light) at
            `zIndex: 2` for its entire height, in front of GroundLayer's
            scroll-driven canvas. `candidates`/`testimonials` never notice
            because their own declared ground is light too — `daily-life` is
            the one `deep` (navy) section in this run with nothing of its
            own to occlude that sheet, so its GroundLayer navy was rendering
            as the sheet's light `background.default` instead. Match
            `GROUNDS.deep.bg` (`NOIR.navyDeep`) explicitly, the same pattern
            the Blog/Academy Box below already uses. */}
        <Box ref={dailyLifeAnchorRef} sx={{ bgcolor: NOIR.navyDeep, width: "100%", position: "relative", zIndex: 1, mb: { xs: 12, md: 20 } }}>
          <SectionBeat
            section={aboutSection("daily-life")}
            establishing={<SeamEstablishingShot selfDriven={false} />}
          >
            <DailyLifeSection />
          </SectionBeat>
        </Box>

        {/* `CandidatesAndCareersSection`'s own SectionBeat renders
            `id="candidates"`, `aria-label="Talent and Technical Careers"`,
            and `data-act="people"` directly (from the `candidates`
            SectionDef) — the wrapper `<section id="careers-sequence">` that
            used to carry those attributes is gone. */}
        <Box sx={{ mb: { xs: 12, md: 20 } }} ref={candidatesAnchorRef}>
          <CandidatesAndCareersSection />
        </Box>

        {/* Same consolidation as above: `testimonials`'s SectionBeat now
            carries `aria-label="Hear From Our People"` and
            `data-act="people"` itself. */}
        <Box ref={testimonialsAnchorRef}>
          <TestimonialsSection />
        </Box>

        <Box ref={blogAnchorRef} sx={{ bgcolor: NOIR.navyField, width: "100%", position: "relative", zIndex: 1 }}>
          <Suspense fallback={null}>
            <CurtainTransition rows={12} />
          </Suspense>
          <BlogSection />
          <AcademySection />
        </Box>
      </Box>
    </Box>
    </>
  );
}
