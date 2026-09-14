import { HOME_PHASES, phaseProgress, stripProgress, closingProgress } from "@/features/home/rebuild/homeFlow";

test.each([-10, -1, 0, 0.1, 0.25, 0.5, 0.75, 0.9, 1, 2, 10])("phase ranges clamp at progress %s", p => {
  const value = phaseProgress(p, 0.25, 0.75);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(1);
  if (p <= 0.25) expect(value).toBe(0);
  else if (p >= 0.75) expect(value).toBe(1);
  else expect(value).toBeCloseTo((p - 0.25) * 2);
});
for (let i = 0; i < 5; i++) {
  test.each([0, 0.5, 1])(`strip ${i + 1} has independent opening boundary %s`, amount => {
    const progress = 0.25 + (i + amount) * 0.1;
    expect(stripProgress(progress, i)).toBeCloseTo(amount);
    if (i > 0) expect(stripProgress(progress, i - 1)).toBeCloseTo(1);
    if (i < 4) expect(stripProgress(progress, i + 1)).toBeCloseTo(0);
  });
}
test.each([0, 0.25, 0.5, 0.749, 0.75, 0.8, 0.875, 1])("closing film and CTA are disjoint at %s", progress => {
  const state = closingProgress(progress);
  expect(state.video).toBeCloseTo(Math.min(1, progress / 0.75));
  expect(state.cta).toBeCloseTo(Math.max(0, (progress - 0.75) / 0.25));
  if (state.cta > 0) expect(state.video).toBe(1);
});
test("the scroll distance contract is independent of motion duration tokens", () => {
  expect(HOME_PHASES.introduction.screens).toBe(3);
  expect(HOME_PHASES.mission.screens).toBe(1);
  expect(HOME_PHASES.closing.screens).toBe(3);
});
