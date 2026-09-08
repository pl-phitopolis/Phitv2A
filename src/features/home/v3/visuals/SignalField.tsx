import { useEffect, useRef } from "react";

import "./signalField.css";

/**
 * SignalField — market noise resolving into one clean signal.
 *
 * This is the literal pitch (Phitopolis turns noisy market data into one
 * clean signal), not a decorative flourish, so the drawing must read as
 * "scattered marks settling into a line" at a glance, not as an abstract
 * pattern that happens to end in gold.
 *
 * `stage` is which of the page's four boundaries this instance is: how far
 * the field gets to resolve at full scroll progress. Reading down the page,
 * stage 0 barely tips its hand and stage 3 is nearly a single clean line, so
 * a reader who scrolls past all four watches the same idea sharpen each time
 * rather than seeing four unrelated widgets.
 *
 * No GSAP / ScrollTrigger / Lenis. Progress comes from this element's own
 * `getBoundingClientRect()`, read inside a single `requestAnimationFrame`
 * loop that only runs while an `IntersectionObserver` says the canvas is on
 * screen. `tests/motion/home-v3-no-pinned-boundaries.test.ts` fails the build
 * on a `pin:` or `scrub:` anywhere under `src/features/home/v3/` — a real
 * ScrollTrigger scrub here would be exactly the kind of mid-flight animation
 * that a `startViewTransition()` snapshot freezes and ghosts, so this file
 * intentionally has no dependency capable of producing one.
 */

export type SignalStage = 0 | 1 | 2 | 3;

/** Valid `stage` values are 0..3 inclusive — four boundaries, four stops. */
export const SIGNAL_STAGE_COUNT = 4;

interface SignalFieldProps {
  stage: SignalStage;
  className?: string;
}

/**
 * How resolved the field is allowed to get at full scroll progress, per
 * stage. Never 1: even the last boundary keeps a handful of stragglers
 * (design note: "a few stragglers", not a perfect line — a perfectly clean
 * result would read as a chart, not as noise being tamed).
 */
const STAGE_TARGET_RESOLUTION: Record<SignalStage, number> = {
  0: 0.22,
  1: 0.48,
  2: 0.72,
  3: 0.93,
};

/** Deterministic PRNG (mulberry32) so a given tick's jitter is stable frame
 * to frame and across a resize-triggered regeneration, without reaching for
 * `Math.random()` inside the draw loop. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tick {
  /** Horizontal position, as a fraction of canvas width (0..1). Fixed for
   * the tick's lifetime so it always converges onto the same point on the
   * line. */
  xFrac: number;
  /** Vertical scatter offset in the unresolved state, in CSS pixels. */
  noiseOffset: number;
  /** Random tilt in the unresolved state, radians. */
  noiseAngle: number;
  /** How stubborn this tick is: 0 resolves first, close to 1 resolves last
   * (or never, at the stage caps above — this is what makes "stragglers"). */
  resistance: number;
  /** Tick mark length in CSS pixels; short marks read as "data ticks",
   * not as a dashed line. */
  length: number;
}

/**
 * Particle budget: this runs on a marketing page's critical scroll path, so
 * the count is capped, not just "enough to look good". One tick is a single
 * `moveTo`/`lineTo` stroke — cheap — but four of these canvases can be
 * on-screen across a fast scroll, so the loop cost is `ticks * instances`.
 * 110 ticks at ~900px wide (roughly 8px of width per tick) is the point
 * where the field reads as "a lot of data" without the redraw becoming
 * visible in a scroll-jank check; capped at 140 so an ultrawide viewport
 * doesn't scale the budget past that.
 */
const MIN_TICKS = 40;
const MAX_TICKS = 140;
const PX_PER_TICK = 7;

function buildTicks(width: number, seed: number): Tick[] {
  const rand = mulberry32(seed);
  const count = Math.max(MIN_TICKS, Math.min(MAX_TICKS, Math.round(width / PX_PER_TICK)));
  const ticks: Tick[] = [];
  for (let i = 0; i < count; i += 1) {
    // Jitter each tick's x within its own slot so they don't read as a grid.
    const slot = (i + 0.5) / count;
    const jitter = (rand() - 0.5) * (0.7 / count);
    ticks.push({
      xFrac: Math.min(1, Math.max(0, slot + jitter)),
      noiseOffset: (rand() - 0.5) * 2,
      noiseAngle: (rand() - 0.5) * 1.4,
      resistance: rand(),
      length: 5 + rand() * 5,
    });
  }
  return ticks;
}

/** Two summed sine terms read as an organic "signal", not a mechanical
 * wave — the second term is a smaller, faster wobble on top of the first. */
function lineYFrac(xFrac: number, phase: number): number {
  const a = Math.sin(xFrac * Math.PI * 2.1 + phase) * 0.16;
  const b = Math.sin(xFrac * Math.PI * 5.3 + phase * 1.7) * 0.05;
  return 0.5 + a + b;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Entry progress: 0 as the element's top crosses the bottom of the
 * viewport, 1 as its bottom crosses the top — the standard "how far through
 * its own scroll pass" measure, independent of viewport height. */
function elementProgress(rect: DOMRect, viewportHeight: number): number {
  const total = viewportHeight + rect.height;
  if (total <= 0) return 0;
  return clamp01((viewportHeight - rect.top) / total);
}

const DPR_CAP = 2;
const GOLD = "255, 199, 44";

function draw(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ticks: Tick[],
  phase: number,
  resolution: number,
): void {
  ctx.clearRect(0, 0, width, height);

  // The resolving line itself: faint at low resolution ("the faintest hint
  // of order" at stage 0), solid gold as resolution climbs.
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i += 1) {
    const xFrac = i / steps;
    const x = xFrac * width;
    const y = lineYFrac(xFrac, phase) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = `rgba(${GOLD}, ${(0.08 + resolution * 0.72).toFixed(3)})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  for (const tick of ticks) {
    const x = tick.xFrac * width;
    const targetY = lineYFrac(tick.xFrac, phase) * height;
    // Per-tick resolve fraction: ticks with low resistance snap to the line
    // early; high-resistance ticks lag or, at low overall resolution, never
    // catch up — that spread is what makes the field settle gradually
    // instead of every mark moving in lockstep.
    const resolvedFrac = clamp01((resolution - tick.resistance * 0.9) / 0.35 + resolution * 0.3);
    const scatterY = targetY + tick.noiseOffset * height * 0.32;
    const y = lerp(scatterY, targetY, resolvedFrac);
    const angle = lerp(tick.noiseAngle, 0, resolvedFrac);
    const len = tick.length;

    const dx = (Math.cos(angle) * len) / 2;
    const dy = (Math.sin(angle) * len) / 2;

    ctx.beginPath();
    ctx.moveTo(x - dx, y - dy);
    ctx.lineTo(x + dx, y + dy);

    if (resolvedFrac > 0.85) {
      // Resolved ticks merge visually into the gold line rather than
      // staying a separate pale mark on top of it.
      ctx.strokeStyle = `rgba(${GOLD}, ${(0.35 + resolvedFrac * 0.4).toFixed(3)})`;
    } else {
      const alpha = lerp(0.22, 0.05, resolvedFrac);
      ctx.strokeStyle = `rgba(244, 247, 252, ${alpha.toFixed(3)})`;
    }
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function SignalField({ stage, className }: SignalFieldProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ticksRef = useRef<Tick[]>([]);
  const phaseRef = useRef<number>(0);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef<boolean>(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetResolution = STAGE_TARGET_RESOLUTION[stage];
    // A fixed phase per mount keeps the curve's shape stable across resizes
    // and across the reduced-motion static frame, generated once instead of
    // re-rolled per tick build.
    phaseRef.current = mulberry32(stage * 97 + 13)() * Math.PI * 2;

    const sizeAndDraw = (resolution: number): void => {
      const rect = wrapper.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);

      if (sizeRef.current.width !== width || sizeRef.current.height !== height) {
        sizeRef.current = { width, height };
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ticksRef.current = buildTicks(width, stage * 1000 + 7);
      }

      draw(ctx, width, height, ticksRef.current, phaseRef.current, resolution);
    };

    if (reduceMotion) {
      // Draw the fully resolved final frame once and never start a loop
      // (design-bar rule 3 / project instructions, non-negotiable).
      sizeAndDraw(targetResolution);
      const ro = new ResizeObserver(() => sizeAndDraw(targetResolution));
      ro.observe(wrapper);
      return () => ro.disconnect();
    }

    const tick = (): void => {
      if (!visibleRef.current) {
        rafRef.current = null;
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      const progress = elementProgress(rect, window.innerHeight);
      sizeAndDraw(progress * targetResolution);
      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = (): void => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startLoop();
      },
      { threshold: 0 },
    );
    io.observe(wrapper);

    const ro = new ResizeObserver(() => {
      const rect = wrapper.getBoundingClientRect();
      const progress = elementProgress(rect, window.innerHeight);
      sizeAndDraw(progress * targetResolution);
    });
    ro.observe(wrapper);

    // Paint an initial frame immediately so there is no blank canvas before
    // the first intersection callback or the first rAF tick lands.
    sizeAndDraw(elementProgress(wrapper.getBoundingClientRect(), window.innerHeight) * targetResolution);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      io.disconnect();
      ro.disconnect();
    };
  }, [stage]);

  const classes = className ? `hv3-signal-field ${className}` : "hv3-signal-field";

  return (
    <div ref={wrapperRef} className={classes}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
