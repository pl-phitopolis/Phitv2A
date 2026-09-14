import { describe, expect, test } from "vitest";
import {
  CONTAINER_START,
  PHASE_FLATTEN_END,
  PHASE_MOVE_END,
  PHASE_MOVE_SPAN,
  flattenProgress,
  moveLeftProgress,
  sideFaceOpacity,
} from "@/features/hero/canvasPhases";
import { closingHeroProgressFor } from "@/features/home/components/closing-scene/closingPhases";
import { INTERACT_END } from "@/features/hero/heroPointer";

// These numerical expectations retain the canvas contract independently of the
// discarded home hero, including its intentionally unclamped negative input.
describe("preserved closing canvas phases", () => {
  test("retains the geometry and interaction boundaries", () => {
    expect(PHASE_FLATTEN_END).toBe(0.20);
    expect(PHASE_MOVE_END).toBe(0.35);
    expect(PHASE_MOVE_SPAN).toBe(0.15);
    expect(CONTAINER_START).toBe(0.86);
    expect(INTERACT_END).toBe(0.10);
  });

  test.each([
    [-0.1, -0.5, 0, 1.9],
    [0, 0, 0, 1],
    [0.05, 0.25, 0, 0.55],
    [0.1, 0.5, 0, 0.1],
    [0.2, 1, 0, 0],
    [0.275, 1, 0.5, 0],
    [0.35, 1, 1, 0],
    [0.86, 1, 1, 0],
    [1.2, 1, 1, 0],
  ])("preserves frame values at progress %s", (progress, flatten, move, opacity) => {
    expect(flattenProgress(progress)).toBeCloseTo(flatten, 12);
    expect(moveLeftProgress(progress)).toBeCloseTo(move, 12);
    expect(sideFaceOpacity(flattenProgress(progress))).toBeCloseTo(opacity, 12);
  });

  test.each([
    [0, 0],
    [0.1, 0.175],
    [0.2, 0.35],
    [0.5, 0.35],
    [1, 0.35],
  ])("keeps closure progress capped at the move boundary for %s", (progress, expected) => {
    expect(closingHeroProgressFor(progress)).toBeCloseTo(expected, 12);
  });
});
