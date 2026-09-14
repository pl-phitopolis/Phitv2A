import Box from "@mui/material/Box";
import { motion } from "motion/react";

import { usePreloaderReady } from "@/shared/motion";
import { EASE_OUT_EXPO } from "@/shared/motion/easing";
import { useBackgroundVideo, ABOUT_HERO_LOOP } from "@/shared/components/useBackgroundVideo";

/** The About hero background: a looping muted clip of the Manila skyline and the
 *  office floor, cut from the brand film. Falls back to the poster still under
 *  reduced motion / low power (`posterOnly`) or until it scrolls into view. */
export function BackgroundReveal() {
  const ready = usePreloaderReady();
  const { containerRef, videoRef, shouldLoad, posterOnly } = useBackgroundVideo();

  return (
    <Box
      ref={containerRef}
      className="background-reveal-container"
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Background Video Layer */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{
          duration: 1.4,
          ease: EASE_OUT_EXPO,
        }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
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
          aria-label="Manila skyline and the Phitopolis office floor"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
          }}
        >
          {!posterOnly && shouldLoad && (
            <>
              <source src={ABOUT_HERO_LOOP.webm} type="video/webm" />
              <source src={ABOUT_HERO_LOOP.mp4} type="video/mp4" />
            </>
          )}
        </Box>

        {/* Left Dark Gradient Overlay for optimal text legibility - Fades out earlier in the center */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(9, 18, 38, 0.90) 0%, rgba(9, 18, 38, 0.68) 20%, rgba(9, 18, 38, 0.30) 40%, rgba(9, 18, 38, 0.08) 60%, transparent 78%)",
            pointerEvents: "none",
          }}
        />

        {/* Vertical Vignette Overlays for smooth top/bottom integration */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(9, 18, 38, 0.5) 0%, transparent 25%, transparent 75%, rgba(9, 18, 38, 0.88) 100%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </Box>
  );
}
