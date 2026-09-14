import { homeInset } from "./homeLayout";
import { useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CONTENT } from "@/shared/content";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { MONO, TYPE_SCALE } from "@/shared/theme/theme";
import { GROUNDS, type GroundName } from "@/shared/theme/grounds";
import { homeSection } from "@/shared/sections";
import { HomeFrame, HomeLabel, HomeHeading, HomeAction } from "./HomeFrame";
import { HOME_PHASES, phaseProgress, stripProgress } from "./homeFlow";
import { useHomeScrub } from "./useHomeScrub";

// The four disciplines, in the order they should read top to bottom. No
// photography here on purpose — HomePillars (just below) already owns the
// "card with a photo" treatment for its 3 higher-level strengths; repeating
// that format for a 4th, more granular list read as the same section twice.
// This one reads instead as a terminal readout: numeral, name, one line.
const STRIPS = [
  { label: "Software Engineering", line: "Production systems, built and shipped end-to-end." },
  { label: "Data Science", line: "Statistical models that inform real decisions." },
  { label: "Quantitative Research", line: "Markets studied with the same rigor as the code." },
  { label: "DevOps", line: "Infrastructure that scales without drama." },
];
// One row per ground tier, cycling if a strip is ever added — gives each row
// a distinct, already-defined surface instead of a flat repeated color.
const STRIP_GROUNDS: GroundName[] = ["base", "deep", "field", "floor"];
function introduction(tl: gsap.core.Timeline, root: HTMLElement) {
  const { stripsStart, stripsEnd, finisherStart } = HOME_PHASES.introduction;
  const stripSpan = (stripsEnd - stripsStart) / STRIPS.length;
  // Every layer is sampled from zero. Delaying a fromTo would restore its
  // final-lit DOM state before its slot when the reader reverses.
  tl.fromTo(root.querySelector(".home-keep-scrolling"), { autoAlpha: 1 }, {
    autoAlpha: 0, duration: 1, ease: p => phaseProgress(p, stripsStart, stripsStart + stripSpan), immediateRender: false,
  }, 0);
  root.querySelectorAll(".home-strip").forEach((strip, i) => {
    tl.fromTo(strip, { y: 0, yPercent: 110 }, {
      y: 0, yPercent: 0, duration: 1, ease: p => stripProgress(p, i), immediateRender: false,
    }, 0);
  });
  tl.fromTo(root.querySelector(".home-years"), { autoAlpha: 0, y: 48 }, {
    autoAlpha: 1, y: 0, duration: 1, ease: p => phaseProgress(p, finisherStart, 1), immediateRender: false,
  }, 0);
}
function mission(tl: gsap.core.Timeline, root: HTMLElement) {
  const { slideEnd, openEnd } = HOME_PHASES.mission;
  tl.fromTo(root.querySelector(".home-mission-panel"), { x: 0, xPercent: 100 }, {
    x: 0, xPercent: 0, duration: 1, ease: p => phaseProgress(p, 0, slideEnd), immediateRender: false,
  }, 0);
  tl.fromTo(root.querySelector(".home-mission-copy"), { y: 48, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 1, ease: p => phaseProgress(p, slideEnd, openEnd), immediateRender: false,
  }, 0);
}
export function HomeResearchHero() {
  const ground = GROUNDS[homeSection("hero-sequence").ground ?? "base"];
  return <HomeFrame id="hero-sequence"><Box sx={{ ...homeInset, minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center", pt: { xs: 16, md: 20 } }}>
    <HomeLabel>Phitopolis / Quantitative R&D · SaaS · FinTech</HomeLabel>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.45fr 1fr" }, gap: { xs: 5, md: 8 }, alignItems: "center" }}>
      <Box>
        <Typography variant="h1" sx={{ textWrap: "balance", maxWidth: "13ch", mb: 4 }}>The quantitative R&D partner for <Box component="span" sx={{ color: NOIR.gold }}>global markets.</Box></Typography>
        <Typography component="p" variant="subtitle1" sx={{ maxWidth: "43ch", mb: 4 }}>{CONTENT.hero.salesPitch.heroLine.subheading}</Typography>
        <HomeAction />
      </Box>
      <Box component="figure" sx={{ m: 0, color: SOFT.frost }}>
        <svg viewBox="0 0 480 430" role="img" aria-labelledby="research-diagram-title" style={{ display: "block", width: "100%" }}>
          <title id="research-diagram-title">Research becomes engineering, then production</title>
          <g fill="none" stroke="currentColor" opacity="0.3">
            <path d="M30 100H430M30 205H430M30 310H430" />
            <path d="M100 35V385M240 35V385M380 35V385" />
          </g>
          <g fill="none" stroke={NOIR.gold} strokeWidth="2">
            <path d="M40 80L120 130L210 95L285 195L370 160L430 270" />
            <path d="M40 150L120 190L210 180L285 230L370 255L430 270" />
            <path d="M40 230L120 235L210 290L285 255L370 305L430 270" />
          </g>
          <g fill={NOIR.navyInk} stroke={NOIR.gold} strokeWidth="2"><circle cx="120" cy="190" r="12"/><circle cx="285" cy="230" r="12"/><circle cx="430" cy="270" r="12"/></g>
          <g fill="currentColor" fontFamily={MONO} fontSize="12"><text x="30" y="405">01 / RESEARCH</text><text x="190" y="405">02 / ENGINEER</text><text x="345" y="405">03 / OPERATE</text></g>
        </svg>
        <Typography component="figcaption" variant="caption" sx={{ mt: 2, maxWidth: "40ch" }}>From complex questions to systems your team can run.</Typography>
      </Box>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, borderTop: 1, borderColor: ground.rule, mt: { xs: 6, md: 10 }, pt: 3 }}>
      <Typography variant="overline">Est. 2019 / Manila</Typography><Typography variant="overline">Research → Engineering → Operations</Typography>
    </Box>
  </Box></HomeFrame>;
}
export function HomeIntroduction() {
  const ref = useRef<HTMLDivElement>(null);
  useHomeScrub(ref, "home-introduction", HOME_PHASES.introduction.screens, introduction);
  return <HomeFrame id="home-introduction"><Box ref={ref} sx={{ height: "100svh", position: "relative", overflow: "hidden", bgcolor: NOIR.duskNavy, '@media (prefers-reduced-motion: reduce)': { height: "auto", minHeight: "70svh" } }}>
    <Typography className="home-keep-scrolling" variant="overline" sx={{ position: "absolute", top: "45%", width: "100%", textAlign: "center", zIndex: 2, "@media (prefers-reduced-motion: reduce)": { display: "none" } }}>{`01 / ${String(STRIPS.length).padStart(2, "0")}`}</Typography>
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", '@media (prefers-reduced-motion: reduce)': { height: "auto" } }}>
      {STRIPS.map((strip, i) => {
        const g = GROUNDS[STRIP_GROUNDS[i % STRIP_GROUNDS.length] ?? "base"];
        return <Box className="home-strip" key={strip.label} sx={{
          position: "relative", flex: 1, minHeight: 0, overflow: "hidden",
          bgcolor: g.bg, color: g.fg, display: "flex", alignItems: "center",
          gap: { xs: 2.5, md: 6 }, px: { xs: 3, md: 8 },
          borderTop: i > 0 ? `1px solid ${g.rule}` : "none",
        }}>
          <Typography component="span" sx={{ fontFamily: MONO, fontSize: { xs: TYPE_SCALE.h3, md: TYPE_SCALE.h2 }, color: NOIR.gold, lineHeight: 1, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="p" sx={{ mb: 0.5 }}>{strip.label}</Typography>
            <Typography variant="body2" sx={{ color: g.muted, maxWidth: "48ch" }}>{strip.line}</Typography>
          </Box>
        </Box>;
      })}
    </Box>
    <Box className="home-years" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, ...homeInset, bgcolor: NOIR.navyInk, '@media (prefers-reduced-motion: reduce)': { position: "relative" } }}><HomeHeading>R&D since <Box component="span" sx={{ color: NOIR.gold }}>2019.</Box></HomeHeading></Box>
  </Box></HomeFrame>;
}
export function HomeMission() {
  const ref = useRef<HTMLDivElement>(null);
  useHomeScrub(ref, "hero-mission", HOME_PHASES.mission.screens, mission);
  return <HomeFrame id="hero-mission"><Box ref={ref} sx={{ minHeight: "100svh", overflow: "hidden", bgcolor: NOIR.navyInk }}>
    <Box className="home-mission-panel" sx={{ minHeight: "100svh", bgcolor: SOFT.frost, color: NOIR.navyInk, backdropFilter: "blur(20px)", display: "flex", alignItems: "center", ...homeInset }}>
      <Box className="home-mission-copy"><HomeLabel>01 / At the core</HomeLabel><HomeHeading>{CONTENT.ledes.mission.gunshot}</HomeHeading>
        <Typography component="p" variant="subtitle1" sx={{ maxWidth: "54ch", my: 4 }}>{CONTENT.ledes.mission.tracer}</Typography>
        <HomeAction />
      </Box>
    </Box>
  </Box></HomeFrame>;
}
