/** Shared phase math retained for the closing canvas when the home hero is removed.
 * Values and formulas preserve the original canvas rendering contract. */
/** Phase 1 ends here: the 3D logo has finished flattening to 2D. */
export const PHASE_FLATTEN_END = 0.20;
/** Phase 2 ends here: the P logo has finished shifting left (or up on mobile). */
export const PHASE_MOVE_END = 0.35;
/** Span of phase 2. Equals PHASE_MOVE_END - PHASE_FLATTEN_END. */
export const PHASE_MOVE_SPAN = 0.15;
/** Phase 9: Container transform — P exit, AT enter, tighten (0.86 → 1.00). */
export const CONTAINER_START = 0.86;
/** How fast the logo's side faces fade as it flattens. */
export const SIDE_FACE_FADE_RATE = 1.8;

/** 0..1 across phase 1. Reaches 1 at PHASE_FLATTEN_END and stays there. */
export function flattenProgress(p: number): number {
  return Math.min(1, p / PHASE_FLATTEN_END);
}

/** 0 until PHASE_FLATTEN_END, then 0..1 across phase 2, then 1. */
export function moveLeftProgress(p: number): number {
  if (p <= PHASE_FLATTEN_END) return 0;
  if (p >= PHASE_MOVE_END) return 1;
  return (p - PHASE_FLATTEN_END) / PHASE_MOVE_SPAN;
}

/** Opacity of the 3D logo's side faces, as a function of FLATTEN progress. */
export function sideFaceOpacity(flatten: number): number {
  return Math.max(0, 1 - flatten * SIDE_FACE_FADE_RATE);
}
