/** Normalized scroll ranges, not elapsed-time animation durations. */
export const HOME_FLOW_IDS = ["hero-sequence", "home-introduction", "hero-mission", "hero-pillars", "use-cases", "home-cut-research", "process", "reach", "home-academy", "home-cut-closing", "closing"] as const;
export type HomeFlowId = typeof HOME_FLOW_IDS[number];
export const HOME_PHASES = {
  introduction: { screens: 3, stripsStart: 0.25, stripsEnd: 0.75, finisherStart: 0.75 },
  mission: { screens: 1, slideEnd: 0.4, openEnd: 0.7 },
  closing: { screens: 3, videoEnd: 0.75 },
} as const;
export const HOME_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const HOME_DESKTOP_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
export const CLOSING_MEDIA = { video: "/videos/we-build-the-future-delivery.mp4", poster: "/videos/we-build-the-future-poster.jpg" } as const;
export function phaseProgress(progress: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}
export function stripProgress(progress: number, index: number): number {
  const { stripsStart, stripsEnd } = HOME_PHASES.introduction;
  const span = (stripsEnd - stripsStart) / 5;
  return phaseProgress(progress, stripsStart + index * span, stripsStart + (index + 1) * span);
}
export function closingProgress(progress: number) {
  return { video: phaseProgress(progress, 0, HOME_PHASES.closing.videoEnd), cta: phaseProgress(progress, HOME_PHASES.closing.videoEnd, 1) };
}
