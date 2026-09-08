import Box from "@mui/material/Box";
import { motion } from "motion/react";

import { NOIR } from "@/shared/theme/palette";
import { EASE_OUT_EXPO } from "@/shared/motion/easing";
import { useBackgroundVideo, ABOUT_HERO_LOOP } from "@/shared/components/useBackgroundVideo";

/**
 * The About hero's right-hand visual.
 *
 * Was a slanted, drifting column of six `hero-wall` photo strips (WS-05). The
 * brand-video rework replaces that column with one framed looping clip cut from
 * the same film that backs `BackgroundReveal` — the gold-framed `PrimaryImage`
 * on the left is untouched and stays a photo.
 */
export function HeroGallery() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 880,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(12, 1fr)" },
        gridTemplateRows: { xs: "auto auto", sm: "repeat(2, 1fr)" },
        gap: { xs: 3, sm: 3, md: 4 },
        height: { xs: "auto", sm: 520, md: 600 },
        alignItems: "stretch",
      }}
    >
      <PrimaryImage />
      <FramedVideo />
    </Box>
  );
}

/** ── Image 1: Primary Focal Centerpiece — unchanged ── */
function PrimaryImage() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.3, ease: EASE_OUT_EXPO, delay: 0.1 }}
      sx={{
        gridColumn: { xs: "1 / -1", sm: "1 / 8" },
        gridRow: { xs: "auto", sm: "1 / 3" },
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        border: `2.5px solid ${NOIR.gold}`,
        minHeight: { xs: 320, sm: "auto" },
      }}
    >
      <Box
        component="img"
        decoding="async"
        src="/images/AboutPage1.webp"
        alt="Phitopolis Headquarters & Engineers"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Subtle Dark Gradient Overlay for bottom text legibility */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(9, 18, 38, 0.88) 0%, rgba(9, 18, 38, 0.1) 60%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

/**
 * The framed brand-film loop that replaced the six-strip column.
 *
 * `useBackgroundVideo()` gates the fetch on viewport proximity and swaps to the
 * poster for reduced-motion / low-power visitors — same treatment the `/blog`,
 * `/careers` and `/services` video heroes use.
 */
function FramedVideo() {
  const { containerRef, videoRef, shouldLoad, posterOnly } = useBackgroundVideo();

  return (
    <Box
      ref={containerRef}
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.2 }}
      sx={{
        gridColumn: { xs: "1 / -1", sm: "8 / 13" },
        gridRow: { xs: "auto", sm: "1 / 3" },
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1.5px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
        minHeight: { xs: 220, sm: "auto" },
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={ABOUT_HERO_LOOP.poster}
        aria-label="Phitopolis engineers at work"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      >
        {!posterOnly && shouldLoad && (
          <>
            <source src={ABOUT_HERO_LOOP.webm} type="video/webm" />
            <source src={ABOUT_HERO_LOOP.mp4} type="video/mp4" />
          </>
        )}
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(9, 18, 38, 0.55) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
