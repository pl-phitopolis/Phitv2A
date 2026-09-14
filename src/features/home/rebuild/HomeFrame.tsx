import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "@tanstack/react-router";
import { SectionBeat } from "@/shared/components/stage/SectionBeat";
import { NAV_ANCHORS } from "@/shared/components/navbarAnchors";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { homeSection } from "@/shared/sections";
import { GROUNDS } from "@/shared/theme/grounds";
import { NOIR } from "@/shared/theme/palette";
import { MONO } from "@/shared/theme/theme";
import type { HomeFlowId } from "./homeFlow";

const HOME_NAV_KEYS = {
  "hero-sequence": "FLOW_HERO_SEQUENCE",
  "home-introduction": "FLOW_HOME_INTRODUCTION",
  "hero-mission": "FLOW_HERO_MISSION",
  "hero-pillars": "FLOW_HERO_PILLARS",
  "use-cases": "FLOW_USE_CASES",
  "home-cut-research": "FLOW_HOME_CUT_RESEARCH",
  "process": "FLOW_PROCESS",
  "reach": "FLOW_REACH",
  "home-academy": "FLOW_HOME_ACADEMY",
  "home-cut-closing": "FLOW_HOME_CUT_CLOSING",
  "closing": "FLOW_CLOSING",
} as const;

export function HomeFrame({ id, children }: { id: HomeFlowId; children: ReactNode }) {
  const section = homeSection(id);
  const ground = GROUNDS[section.ground ?? "base"];
  const navRef = useNavbarAnchor(NAV_ANCHORS[HOME_NAV_KEYS[id]], { dark: ground.dark });
  return <SectionBeat section={section} sx={{ py: 0, border: 0, ...(id.startsWith("home-cut-") ? { "@media (prefers-reduced-motion: reduce)": { minHeight: 0 } } : {}) }}>
    <Box ref={navRef} data-flow-section={id} sx={{ width: "100%", color: ground.fg }}>{children}</Box>
  </SectionBeat>;
}
export function HomeLabel({ children }: { children: ReactNode }) {
  return <Typography component="p" variant="overline" sx={{ fontFamily: MONO, mb: 3 }}>{children}</Typography>;
}
export function HomeHeading({ children }: { children: ReactNode }) {
  return <Typography component="h2" sx={{ typography: { xs: "h2", md: "h1" }, maxWidth: "15ch", textWrap: "balance" }}>{children}</Typography>;
}
export function HomeAction({ careers = false }: { careers?: boolean }) {
  return <Button component={Link} to={careers ? "/careers" : "/contact"} variant="contained" endIcon={<span aria-hidden="true">↗</span>} sx={{ bgcolor: NOIR.gold, color: NOIR.navyInk, borderRadius: 0, px: 3, py: 1.5, boxShadow: "none", width: "fit-content", '&:hover': { bgcolor: NOIR.goldLight, boxShadow: "none" } }}>{careers ? "Explore careers" : "Start a conversation"}</Button>;
}
