import { homeInset } from "./homeLayout";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CONTENT } from "@/shared/content";
import { ReachMap } from "@/shared/components/ReachMap";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { MONO, TRACKING, TYPE_SCALE } from "@/shared/theme/theme";
import { SCROLL_SPEED } from "@/shared/motion/scrollSpeed";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { sectionOrder } from "@/shared/sections";
import { HomeFrame, HomeHeading, HomeLabel, HomeAction } from "./HomeFrame";
import { HOME_MOTION_QUERY, phaseProgress } from "./homeFlow";
const TOOLING = [
  ["Languages & frameworks", "C++20 / Rust / TypeScript / React / Python / Go"],
  ["Data pipelines & ML", "PyTorch / PostgreSQL / ClickHouse / Kafka / Redis"],
  ["Cloud & infrastructure", "AWS / GCP / Kubernetes / Docker / Terraform"],
  ["Reliability & operations", "Prometheus / Grafana / OpenTelemetry / ArgoCD"],
];
export function HomeBuilt() {
  return <HomeFrame id="use-cases"><Box sx={{ ...homeInset, bgcolor: SOFT.frost, color: NOIR.navyInk }}>
    <Box data-home-reveal><HomeLabel>In production / Built & supported</HomeLabel><HomeHeading>The engineering behind the work.</HomeHeading></Box>
    <Box sx={{ mt: 8 }}>{CONTENT.useCases.map((item, i) => <Box key={item.id} data-home-reveal sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.2fr" }, gap: 4, py: 5, borderTop: 1, borderColor: NOIR.navyField }}>
      <Box><Typography sx={{ fontFamily: MONO, fontSize: TYPE_SCALE.micro, letterSpacing: TRACKING.meta, mb: 2 }}>{String(i + 1).padStart(2, "0")}</Typography><Typography variant="h3" component="h3" sx={{ mb: 2 }}>{item.title}</Typography><Typography variant="body1">{item.line}</Typography><Box component="ul" sx={{ pl: 2, mt: 3 }}>{item.specs.map(spec => <li key={spec.name}><Typography variant="body2">{spec.name}</Typography></li>)}</Box></Box>
      <Box component="img" src={item.image} alt={item.imageAlt} loading="lazy" sx={{ width: "100%", height: { xs: "35svh", md: "45svh" }, objectFit: "cover" }}/>
    </Box>)}</Box>
    <Box data-home-reveal sx={{ mt: 8 }}><HomeLabel>The Engineering Matrix</HomeLabel>{TOOLING.map(([title, tools]) => <Box key={title} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 2, py: 3, borderTop: 1, borderColor: NOIR.navyField }}><Typography variant="h4" component="h3">{title}</Typography><Typography variant="body1">{tools}</Typography></Box>)}</Box>
  </Box></HomeFrame>;
}
export function HomeGlobalReach() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(HOME_MOTION_QUERY, () => {
      const tl = gsap.timeline({ scrollTrigger: { id: "home:reach", trigger: root, start: "top 70%", end: "bottom 60%", scrub: SCROLL_SPEED, refreshPriority: refreshPriorityFor(sectionOrder("reach")) } });
      const arcs = root.querySelectorAll("[data-home-map-arc]");
      const extent = 1 + Math.max(0, arcs.length - 1) * 0.2;
      arcs.forEach((arc, i) => tl.fromTo(arc, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, duration: 1,
        ease: p => phaseProgress(p, i * 0.2 / extent, (1 + i * 0.2) / extent), immediateRender: false,
      }, 0));
      tl.progress(1).progress(tl.scrollTrigger?.progress ?? 0);
    });
    return () => media.revert();
  }, { scope: ref });
  return <HomeFrame id="reach"><Box sx={{ ...homeInset, bgcolor: SOFT.frost, color: NOIR.navyInk }}>
    <Box data-home-reveal><HomeLabel>One Manila headquarters / Global relationships</HomeLabel><HomeHeading>{CONTENT.ledes.reach.gunshot}</HomeHeading><Typography component="p" variant="subtitle1" sx={{ maxWidth: "53ch", my: 4 }}>Clients in the United States and United Kingdom. Investor backing across the United States, Europe, and Hong Kong.</Typography></Box>
    <Box ref={ref}><ReachMap motionMode="scroll" /></Box>
  </Box></HomeFrame>;
}
export function HomeAcademy() {
  return <HomeFrame id="home-academy"><Box sx={{ ...homeInset, bgcolor: NOIR.navyDeep, color: SOFT.frost }}>
    <Box data-home-reveal><HomeLabel>Phitopolis Academy / Grow with the work</HomeLabel><HomeHeading>Your next chapter starts with real work.</HomeHeading></Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 6, my: 8 }}>
      <Box data-home-reveal><Box component="img" src="/images/grads/FocusedProgramming.webp" alt="Engineering graduates working together" loading="lazy" sx={{ width: "100%", height: "35svh", objectFit: "cover", mb: 4 }}/><Typography variant="h2" component="h3">Graduate Program</Typography><Typography variant="h3" component="p" sx={{ color: NOIR.gold, my: 3 }}>5 cohorts since 2023</Typography><Typography>A structured 12-month R&D fellowship: live financial systems, quant pipelines, and distributed infrastructure, alongside senior engineers.</Typography></Box>
      <Box data-home-reveal><Box component="img" src="/images/grads/Coordination.webp" alt="Colleagues coordinating engineering work" loading="lazy" sx={{ width: "100%", height: "35svh", objectFit: "cover", mb: 4 }}/><Typography variant="h2" component="h3">Internship Program</Typography><Typography variant="h3" component="p" sx={{ color: NOIR.gold, my: 3 }}>30+ interns placed</Typography><Typography>Paid, immersive internships for top undergraduates. Ship real features, get daily code reviews, and work alongside senior engineers.</Typography></Box>
    </Box>
    <Box data-home-reveal sx={{ borderTop: 1, borderColor: NOIR.navyField, pt: 4 }}><Typography component="p" variant="subtitle1" sx={{ mb: 3 }}>Recruited from leading programs in the Philippines and Asia.</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>{CONTENT.talent.schools.map(school => <Typography variant="caption" key={school.name}>{school.name}</Typography>)}</Box><HomeAction careers /></Box>
  </Box></HomeFrame>;
}
