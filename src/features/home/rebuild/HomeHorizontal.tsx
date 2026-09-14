import { homeInset } from "./homeLayout";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CONTENT } from "@/shared/content";
import { NOIR } from "@/shared/theme/palette";
import { SCROLL_SPEED } from "@/shared/motion/scrollSpeed";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { sectionOrder } from "@/shared/sections";
import { HomeFrame, HomeLabel, HomeHeading } from "./HomeFrame";
import { HOME_DESKTOP_QUERY } from "./homeFlow";
import type { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
function HorizontalStory({ id, children }: { id: "hero-pillars" | "process"; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const root = ref.current;
    const track = root?.querySelector<HTMLElement>(".home-horizontal-track");
    if (!root || !track) return;
    const media = gsap.matchMedia();
    media.add(HOME_DESKTOP_QUERY, () => {
      const distance = () => Math.max(0, track.scrollWidth - root.clientWidth);
      gsap.fromTo(track, { x: 0 }, { x: () => -distance(), ease: "none", immediateRender: false,
        scrollTrigger: { id: `home:${id}`, trigger: root, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: SCROLL_SPEED, invalidateOnRefresh: true, refreshPriority: refreshPriorityFor(sectionOrder(id)) },
      });
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [id], revertOnUpdate: true });
  return <HomeFrame id={id}><Box ref={ref} sx={{ overflow: "hidden", width: "100%" }}>
    <Box className="home-horizontal-track" sx={{ display: "flex", flexDirection: "column", [`@media ${HOME_DESKTOP_QUERY}`]: { flexDirection: "row" }, '& > article': { flexShrink: 0, width: "100%", minHeight: "100svh" } }}>{children}</Box>
  </Box></HomeFrame>;
}
export function HomePillars() {
  return <HorizontalStory id="hero-pillars">{CONTENT.hero.salesPitch.pillars.map((pillar, i) => <Box component="article" key={pillar.id} sx={{ ...homeInset, display: "grid", gridTemplateColumns: "1fr", "@media (min-width: 768px)": { gridTemplateColumns: "1fr 1.1fr" }, gap: 5, alignItems: "center", bgcolor: NOIR.navyDeep }}>
    <Box><HomeLabel>0{i + 1} / Three equal strengths</HomeLabel><HomeHeading>{pillar.name}</HomeHeading><Typography component="p" variant="subtitle1" sx={{ mt: 4, maxWidth: "35ch" }}>{pillar.detail}</Typography></Box>
    <Box component="img" src={pillar.image} alt={pillar.alt} loading="lazy" width={900} height={1000} sx={{ width: "100%", height: "48svh", "@media (min-width: 768px)": { height: "65svh" }, objectFit: "cover" }}/>
  </Box>)}</HorizontalStory>;
}
export function HomeResearchTimeline() {
  return <HorizontalStory id="process">{CONTENT.process.phases.map((phase, i) => {
    const [year, name] = phase.name.split(": ");
    return <Box component="article" key={phase.id} sx={{ ...homeInset, display: "flex", flexDirection: "column", justifyContent: "center", bgcolor: i === 1 ? NOIR.navyField : NOIR.navyDeep }}>
      <HomeLabel>Research, built over time / 0{i + 1}</HomeLabel>
      <Typography component="p" sx={{ typography: "h1", color: NOIR.gold, mb: 6 }}>{year}</Typography>
      <HomeHeading>{name}</HomeHeading><Typography component="p" variant="subtitle1" sx={{ maxWidth: "53ch", mt: 4 }}>{phase.caption}</Typography>
      <Box aria-hidden="true" sx={{ height: 2, bgcolor: NOIR.gold, width: `${(i + 1) / 3 * 100}%`, mt: 7 }}/>
    </Box>;
  })}</HorizontalStory>;
}
