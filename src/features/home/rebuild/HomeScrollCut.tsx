import { useRef } from "react";
import Box from "@mui/material/Box";
import { GROUNDS } from "@/shared/theme/grounds";
import type { GroundName } from "@/shared/theme/grounds";
import { NOIR } from "@/shared/theme/palette";
import { HomeFrame } from "./HomeFrame";
import { useHomeScrub } from "./useHomeScrub";
function cut(tl: gsap.core.Timeline, root: HTMLElement) {
  tl.fromTo(root.querySelector(".home-cut-surface"), { scaleY: 0 }, { scaleY: 1, duration: 1, ease: "none", immediateRender: false }, 0);
}
/** Both in-page boundaries use this scroll-owned surface. No capture or scroll lock. */
export function HomeScrollCut({ id, destination }: { id: "home-cut-research" | "home-cut-closing"; destination: GroundName }) {
  const ref = useRef<HTMLDivElement>(null);
  useHomeScrub(ref, id, 1, cut, false);
  return <HomeFrame id={id}><Box ref={ref} aria-hidden="true" sx={{ height: "100svh", position: "relative", overflow: "hidden", bgcolor: id === "home-cut-research" ? NOIR.frost : NOIR.navyDeep, '@media (prefers-reduced-motion: reduce)': { height: 0 } }}>
    <Box className="home-cut-surface" sx={{ position: "absolute", inset: 0, bgcolor: GROUNDS[destination].bg, transformOrigin: "bottom center" }}/>
  </Box></HomeFrame>;
}
