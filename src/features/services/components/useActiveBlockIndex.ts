import { useEffect, useState } from "react";

/**
 * Tracks which of a list of block elements currently occupies the middle of
 * the viewport, returning its index.
 *
 * Driven by a passive, rAF-throttled scroll listener (not IntersectionObserver):
 * the section no longer owns a pin, the state changes at most 3–4 times over the
 * whole section, and a plain rect check is immune to the observer-timing edge
 * cases that pinned/transformed ancestors introduce.
 */
export function useActiveBlockIndex(
  blockRefs: React.MutableRefObject<(HTMLElement | null)[]>,
) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const loop = () => {
      raf = window.requestAnimationFrame(loop);
      // Recompute a few times a second, not every frame — the value changes at
      // most 3–4 times over the whole section.
      if (tick++ % 6 !== 0) return;

      // Only work while the section is anywhere near the viewport.
      const first = blockRefs.current[0];
      const lastEl = blockRefs.current[blockRefs.current.length - 1];
      if (!first || !lastEl) return;
      const vh = window.innerHeight;
      if (first.getBoundingClientRect().top > vh || lastEl.getBoundingClientRect().bottom < 0) {
        return;
      }

      const mid = vh / 2;
      let best = 0;
      let bestDist = Infinity;
      blockRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [blockRefs]);

  return active;
}
