import Box from "@mui/material/Box";

import { NOIR } from "@/shared/theme/palette";
import { useIsLowPowerDevice } from "@/shared/motion";
import { EASE_OUT_EXPO_CSS } from "@/shared/motion/easing";
import { useActiveBlockIndex } from "./useActiveBlockIndex";

export interface UseCaseBackdropItem {
  id: string;
  image: string;
  imageAlt: string;
}

interface UseCaseMorphStageProps {
  items: readonly UseCaseBackdropItem[];
  /** The `.uc-block` elements, in order — the stage morphs to whichever one
   *  occupies the middle of the viewport. */
  blockRefs: React.MutableRefObject<(HTMLElement | null)[]>;
}

/**
 * A sticky, centred image frame behind the vertical use-case blocks. One
 * image is at full opacity/scale at rest; as the reader scrolls a new block
 * through the middle of the viewport the active index flips and the images
 * morph (opacity + scale + blur) between each other.
 *
 * Driven by `useActiveBlockIndex`, a passive, rAF-throttled scroll listener
 * (not IntersectionObserver): the section no longer owns a pin, the state
 * changes at most 3–4 times over the whole section, and a plain rect check is
 * immune to the observer-timing edge cases that pinned/transformed ancestors
 * introduce.
 *
 * INVARIANT: `position: sticky`, never `fixed`. GSAP leaves inline transforms on
 * `.stage-inner` after the beat entrance, and a transformed ancestor becomes the
 * containing block for `fixed` descendants — which would break this. `sticky`
 * only cares about scroll ancestors with `overflow`, so the section root must
 * not set `overflow: hidden`.
 */
export function UseCaseMorphStage({
  items,
  blockRefs,
}: UseCaseMorphStageProps) {
  const lowPower = useIsLowPowerDevice();
  const active = useActiveBlockIndex(blockRefs);

  const instant = lowPower;

  return (
    <Box
      data-uc-stage
      aria-hidden={false}
      sx={{
        position: "sticky",
        top: 0,
        height: "100svh",
        marginBottom: "-100svh",
        zIndex: 0,
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "min(40vw, 560px)",
          aspectRatio: "4 / 3",
          margin: "0 auto",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 30px 80px -20px rgba(10, 42, 102, 0.35)",
          bgcolor: NOIR.panel,
        }}
      >
        {items.map((item, i) => (
          <Box
            key={item.id}
            component="img"
            src={item.image}
            alt={item.imageAlt}
            width={1536}
            height={864}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority="low"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1)" : "scale(0.94)",
              filter: i === active ? "blur(0px)" : "blur(6px)",
              transition: instant
                ? "none"
                : `opacity 620ms ${EASE_OUT_EXPO_CSS}, transform 620ms ${EASE_OUT_EXPO_CSS}, filter 620ms ${EASE_OUT_EXPO_CSS}`,
              willChange: "opacity, transform, filter",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
