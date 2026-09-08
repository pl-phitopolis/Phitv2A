import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

import { CONTENT } from "@/shared/content";
import { SectionBeat } from "@/shared/components/stage/SectionBeat";
import { homeSection, sectionOrder } from "@/shared/sections";
import { GROUNDS } from "@/shared/theme/grounds";
import { NOIR } from "@/shared/theme/palette";
import { MONO, DISPLAY_FONT } from "@/shared/theme/theme";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { EYEFLOW_RAIL_GUTTER } from "@/shared/components/EyeFlow";
import { NAV_ANCHORS } from "@/shared/components/NavbarContext";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

const GROUND = GROUNDS[homeSection("hero-pillars").ground ?? "deep"];

interface Pillar {
  id: string;
  name: string;
  detail: string;
  image: string;
  alt: string;
}

// Bottom-weighted so copy sitting in the lower-left third stays legible over
// any background frame — the light end is at the top, dark pools at the
// bottom where the title/detail block lives.
const SCRIM = `linear-gradient(to top, rgba(${NOIR.navyInkRgb}, 0.98) 0%, rgba(${NOIR.navyInkRgb}, 0.82) 30%, rgba(${NOIR.navyInkRgb}, 0.4) 60%, rgba(${NOIR.navyInkRgb}, 0.1) 100%)`;

export function OperatingPillars() {
  const { pillars } = CONTENT.hero.salesPitch as { pillars: readonly Pillar[] };
  // The pinned viewport is full-bleed photography under a navy scrim (ground
  // `deep`), so the navbar must switch to its dark chrome for the whole beat.
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.HOME_PILLARS, { dark: true });
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const railProgressRef = useRef<SVGLineElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      if (!wrapRef.current || !trackRef.current) return;

      const track = trackRef.current;
      const wrap = wrapRef.current;

      const distance = track.scrollWidth - window.innerWidth;
      if (distance <= 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance + window.innerHeight * 0.4}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          refreshPriority: refreshPriorityFor(sectionOrder("hero-pillars")),
          onUpdate: (self) => {
            // Settle-biased: swap the background once the NEXT block has
            // centred, not the instant the previous one starts leaving.
            const idx = gsap.utils.clamp(
              0,
              pillars.length - 1,
              Math.round(self.progress * (pillars.length - 1)),
            );
            setActiveIndex(idx);
          },
        },
      });

      tl.to(track, { x: -distance, ease: "none" }, 0);
      // Background drifts opposite the copy, at a fraction of the distance —
      // a slow parallax layer, not a synced one.
      if (bgRef.current) {
        tl.to(bgRef.current, { x: distance * 0.08, ease: "none" }, 0);
      }
      if (railProgressRef.current) {
        tl.fromTo(
          railProgressRef.current,
          { drawSVG: "0%" },
          { drawSVG: "100%", ease: "none" },
          0,
        );
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: wrapRef, dependencies: [pillars.length] },
  );

  return (
    <SectionBeat
      section={homeSection("hero-pillars")}
      sx={{ minHeight: "auto", p: 0 }}
    >
      <Box
        ref={wrapRef}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "auto", md: "100dvh" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          py: { xs: 8, md: 3 },
          bgcolor: GROUND.bg,
        }}
      >
        {/* Navbar dark-chrome anchor. Same idiom as ProcessSection: a zero-cost
            absolute overlay rather than the pinned wrap itself, so the observer
            reads the beat's real extent. */}
        <Box
          ref={anchorRef}
          aria-hidden
          sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
        {/* Full-screen background photography — one <img> per pillar, crossfaded
            via React state off the timeline's onUpdate. Desktop-only; mobile
            renders each image inline per copy block instead (see below). */}
        <Box
          ref={bgRef}
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            inset: "-6%",
            zIndex: 0,
          }}
        >
          {pillars.map((pillar, i) => (
            <PillarBackgroundFrame
              key={pillar.id}
              pillar={pillar}
              isActive={i === activeIndex}
            />
          ))}
          <Box
            aria-hidden
            sx={{ position: "absolute", inset: 0, background: SCRIM }}
          />
        </Box>

        {/* Sticky Editorial Header */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "1400px",
            mx: "auto",
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            pr: { lg: `calc(80px + ${EYEFLOW_RAIL_GUTTER}px)` },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            borderBottom: `1px solid ${GROUND.rule}`,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: GROUND.fg,
                fontWeight: 700,
              }}
            >
              02 / OPERATING PILLARS
            </Typography>
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: NOIR.gold,
              }}
            />
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.68rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: GROUND.muted,
                display: { xs: "none", sm: "block" },
              }}
            >
              CORE DISCIPLINES
            </Typography>
          </Box>

          {/* Active Pillar Counter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: GROUND.fg,
                letterSpacing: "0.1em",
              }}
            >
              {`0${activeIndex + 1}`}
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.75rem",
                color: GROUND.muted,
              }}
            >
              / {`0${pillars.length}`}
            </Typography>
          </Box>
        </Box>

        {/* Horizontal Copy Track — bare title/detail blocks, no card box. The
            photography lives in the background layer above; this track only
            carries the travelling text, sitting in the lower-left third. */}
        <Box
          ref={trackRef}
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: { xs: "flex-start", md: "flex-end" },
            px: { xs: 3, md: 0 },
            py: { xs: 4, md: 2 },
            // No horizontal padding on desktop: each slot is exactly 100vw and
            // carries its own gutter, so the track measures N * 100vw and
            // `distance` lands each pillar dead-centre in the pinned viewport.
            width: { xs: "100%", md: "max-content" },
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 0 },
            willChange: { md: "transform" },
          }}
        >
          {pillars.map((pillar, idx) => (
            <PillarCopyBlock
              key={pillar.id}
              pillar={pillar}
              index={idx}
              isActive={idx === activeIndex}
            />
          ))}
        </Box>

        {/* Node Rail — the pillars strung as "development nodes" on a
            horizontal line, tracking the same timeline as the copy/background. */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            left: 0,
            right: 0,
            top: "72%",
            zIndex: 3,
            px: { md: 8, lg: 10 },
            pr: { lg: `calc(80px + ${EYEFLOW_RAIL_GUTTER}px)` },
            pointerEvents: "none",
          }}
        >
          <svg
            width="100%"
            height="28"
            viewBox="0 0 1000 28"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            {/* Base hairline */}
            <line
              x1="0"
              y1="14"
              x2="1000"
              y2="14"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
            />
            {/* Gold progress line, drawn via DrawSVG in lockstep with the track */}
            <line
              ref={railProgressRef}
              x1="0"
              y1="14"
              x2="1000"
              y2="14"
              stroke={NOIR.gold}
              strokeWidth="1.5"
            />
            {pillars.map((pillar, i) => {
              const cx =
                pillars.length > 1 ? (i / (pillars.length - 1)) * 1000 : 500;
              const filled = i <= activeIndex;
              return (
                <g
                  key={pillar.id}
                  transform={`translate(${cx}, 14) scale(${filled ? 1.35 : 1})`}
                  style={{
                    transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <circle
                    r="5"
                    fill={filled ? NOIR.gold : "transparent"}
                    stroke={filled ? "none" : "rgba(255,255,255,0.35)"}
                    strokeWidth={filled ? 0 : 1.5}
                    style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
                  />
                  <text
                    x="0"
                    y="-14"
                    textAnchor="middle"
                    fontFamily={MONO}
                    fontSize="9"
                    letterSpacing="0.1em"
                    fill={filled ? NOIR.gold : "rgba(255,255,255,0.35)"}
                  >
                    {`0${i + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>

        {/* Bottom Status / Navigation Rail */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "1400px",
            mx: "auto",
            px: { xs: 3, sm: 6, md: 8, lg: 10 },
            pr: { lg: `calc(80px + ${EYEFLOW_RAIL_GUTTER}px)` },
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
            borderTop: `1px solid ${GROUND.rule}`,
            zIndex: 10,
          }}
        >
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: GROUND.muted,
            }}
          >
            SCROLL TO EXPLORE DISCIPLINES
          </Typography>

          {/* Progress Dot Indicators */}
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {pillars.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === activeIndex ? 24 : 6,
                  height: 6,
                  borderRadius: "3px",
                  bgcolor:
                    i === activeIndex ? NOIR.gold : "rgba(255, 255, 255, 0.18)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </SectionBeat>
  );
}

/**
 * One full-bleed background frame. `opacity` is CSS-transition-driven off
 * React state (not GSAP) — the DOM default is `i === 0` at `opacity: 1`, so a
 * trigger that never fires still degrades to a lit, readable frame.
 */
function PillarBackgroundFrame({
  pillar,
  isActive,
}: {
  pillar: Pillar;
  isActive: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !pillar.image || imageFailed;

  return (
    <>
      {!showPlaceholder ? (
        <Box
          component="img"
          src={pillar.image}
          alt={pillar.alt}
          width={1536}
          height={864}
          loading={isActive ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isActive ? "high" : "low"}
          onError={() => setImageFailed(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isActive ? 1 : 0,
            transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "opacity",
          }}
        />
      ) : (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            opacity: isActive ? 1 : 0,
            transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "opacity",
            background: `repeating-linear-gradient(-45deg, rgba(${NOIR.goldRgb}, 0.04) 0px, rgba(${NOIR.goldRgb}, 0.04) 2px, transparent 2px, transparent 16px), ${NOIR.navyDeep}`,
          }}
        />
      )}
    </>
  );
}

/**
 * One bare copy block: gold chip, title, detail. No card, no border, no
 * per-block image on desktop — the photography lives in the shared
 * background layer. Below `md` (no pin, track stacks vertically) each block
 * carries its own inline image so mobile still shows the photography.
 */
function PillarCopyBlock({
  pillar,
  index,
  isActive,
}: {
  pillar: Pillar;
  index: number;
  isActive: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !pillar.image || imageFailed;

  return (
    <Box
      sx={{
        position: "relative",
        // The SLOT is a full viewport wide. `maxWidth` must NOT live here — it
        // would win over `width` and collapse the slot, packing every pillar
        // into one screen and desyncing the background swap from the copy.
        // The 52ch measure is applied to the inner text column instead.
        width: { xs: "100%", md: "100vw" },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: { md: "flex-end" },
        gap: 1.5,
        px: { xs: 0, md: 8, lg: 10 },
        pr: { lg: `calc(80px + ${EYEFLOW_RAIL_GUTTER}px)` },
        opacity: isActive ? 1 : 0.25,
        transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxWidth: { xs: "100%", md: "52ch" },
        }}
      >
        {/* Mobile-only inline image — desktop shows photography via the shared
          full-screen background layer instead. */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "relative",
            width: "100%",
            height: "260px",
            borderRadius: "1.25rem",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {!showPlaceholder ? (
            <Box
              component="img"
              src={pillar.image}
              alt={pillar.alt}
              width={1536}
              height={864}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={() => setImageFailed(true)}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background: `repeating-linear-gradient(-45deg, rgba(${NOIR.goldRgb}, 0.04) 0px, rgba(${NOIR.goldRgb}, 0.04) 2px, transparent 2px, transparent 16px), ${NOIR.navyDeep}`,
              }}
            />
          )}
          <Box
            aria-hidden
            sx={{ position: "absolute", inset: 0, background: SCRIM }}
          />
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 1,
            px: 1.75,
            py: 0.5,
            borderRadius: "9999px",
            border: "1px solid rgba(255, 199, 44, 0.3)",
            bgcolor: "rgba(6, 24, 59, 0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: "0.68rem",
              color: NOIR.gold,
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            PILLAR // 0{index + 1}
          </Typography>
        </Box>

        <Typography
          component="h3"
          sx={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: { xs: "1.75rem", sm: "2.1rem", md: "2.4rem" },
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
          }}
        >
          {pillar.name}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "0.95rem", md: "1.1rem" },
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.78)",
            letterSpacing: "-0.01em",
          }}
        >
          {pillar.detail}
        </Typography>
      </Box>
    </Box>
  );
}
