import { useEffect } from "react";
import Box from "@mui/material/Box";
import { motion, useMotionValue } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { NOIR } from "@/shared/theme/palette";
import { useReducedMotion } from "@/shared/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll timeline — a single hairline that fills left-to-right across the top of
 * the viewport as the reader moves down the page (lenis.dev style). Replaces the
 * old fixed right-edge chapter rail: the seven-chapter quick-jump list and its
 * vertical progress line are gone; this is pure read-position feedback.
 *
 * Home route only (`src/routes/index.tsx`). `about.tsx` never rendered it.
 *
 * Progress is `scrollY / (scrollHeight - innerHeight)`, recomputed only when the
 * layout could have moved — mount, `ScrollTrigger.refresh` (after every pin
 * spacer is sized), and resize — never per frame. The per-frame tick reads only
 * `window.scrollY`. Under reduced motion a passive `scroll` listener drives it
 * instead of the GSAP ticker, so it stays truthful without a rAF loop.
 */
export function EyeFlow() {
  const progress = useMotionValue(0);
  const reduced = useReducedMotion();
  // Step 4 of the post-intro hero cascade. On a warm/repeat visit this is
  // already 5, so the bar is on from first paint.

  useEffect(() => {
    let limit = 0;

    const measure = () => {
      limit = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      if (limit <= 0) {
        progress.set(0);
        return;
      }
      progress.set(Math.max(0, Math.min(window.scrollY / limit, 1)));
    };

    const refresh = () => {
      measure();
      update();
    };

    measure();
    update();

    ScrollTrigger.addEventListener("refresh", refresh);
    window.addEventListener("resize", refresh, { passive: true });

    if (reduced === true) {
      window.addEventListener("scroll", update, { passive: true });
      return () => {
        ScrollTrigger.removeEventListener("refresh", refresh);
        window.removeEventListener("resize", refresh);
        window.removeEventListener("scroll", update);
      };
    }

    gsap.ticker.add(update);
    return () => {
      ScrollTrigger.removeEventListener("refresh", refresh);
      window.removeEventListener("resize", refresh);
      gsap.ticker.remove(update);
    };
  }, [progress, reduced]);

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        zIndex: (theme) => theme.zIndex.appBar + 2,
        pointerEvents: "none",
        backgroundColor: "transparent",
        opacity: 1,
      }}
    >
      <motion.div
        style={{
          scaleX: progress,
          transformOrigin: "left",
          width: "100%",
          height: "100%",
          background: NOIR.gold,
        }}
      />
    </Box>
  );
}
