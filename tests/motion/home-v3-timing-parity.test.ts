import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  HV3_ASK_PILL_DURATION_MS,
  HV3_ASK_PILL_SHOT,
  HV3_SHOT_DURATIONS,
  HV3_SHOT_EASINGS,
} from "@/features/home/v3/homeV3Motion";

/**
 * CSS cannot import a TypeScript module.
 *
 * Home V3's transition timings therefore exist twice: once in
 * `homeV3Motion.ts`, which the GSAP fallback path reads at runtime, and once in
 * `viewTransitionsHomeV3.css`, which the View Transitions path reads. Nothing in
 * the type system connects them, so the two are free to drift the moment someone
 * retunes one shot and forgets its twin — and the failure is invisible, because
 * both paths keep working. They just stop agreeing, and a visitor on Firefox
 * sees a 480ms crossfade where a visitor on Chrome sees a 650ms morph.
 *
 * This test is the only thing that notices. It is deliberately blunt: parse the
 * numbers back out of the stylesheet with a regex and assert equality, in the
 * same spirit as `beat-thresholds-usage.test.ts`. A prettier mechanism (CSS
 * custom properties written from JS at runtime) was considered and rejected —
 * it would put the durations behind an indirection at exactly the moment a
 * reader is trying to find out what they are.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(HERE, "../../src/shared/theme/viewTransitionsHomeV3.css");

const css = readFileSync(CSS_PATH, "utf8");

/** Every `animation-duration`/`animation` shorthand time under one shot's block. */
function durationsForShot(shot: string): number[] {
  const blocks = [
    ...css.matchAll(
      new RegExp(
        `:root\\[data-hv3-shot="${shot}"\\][^{]*\\{([^}]*)\\}`,
        "g",
      ),
    ),
  ];
  const seconds: number[] = [];
  for (const block of blocks) {
    for (const time of block[1]!.matchAll(/(?<![\w-])(\d*\.?\d+)s(?![\w-])/g)) {
      seconds.push(Number(time[1]));
    }
  }
  return seconds;
}

function easingsForShot(shot: string): string[] {
  const blocks = [
    ...css.matchAll(
      new RegExp(
        `:root\\[data-hv3-shot="${shot}"\\][^{]*\\{([^}]*)\\}`,
        "g",
      ),
    ),
  ];
  const curves: string[] = [];
  for (const block of blocks) {
    for (const curve of block[1]!.matchAll(/cubic-bezier\([^)]*\)/g)) {
      curves.push(curve[0].replace(/\s+/g, " "));
    }
  }
  return curves;
}

describe("home V3 transition timings agree across the TS and CSS sources", () => {
  it("the stylesheet defines every shot the constants module declares", () => {
    for (const shot of Object.keys(HV3_SHOT_DURATIONS)) {
      expect(
        css,
        `viewTransitionsHomeV3.css has no :root[data-hv3-shot="${shot}"] block, but homeV3Motion.ts declares that shot`,
      ).toContain(`[data-hv3-shot="${shot}"]`);
    }
  });

  it.each(Object.entries(HV3_SHOT_DURATIONS))(
    "%s runs for the same duration in both files",
    (shot, ms) => {
      const expected = ms / 1000;
      const found = durationsForShot(shot);

      expect(
        found.length,
        `no animation timings found in the "${shot}" blocks of viewTransitionsHomeV3.css`,
      ).toBeGreaterThan(0);

      expect(
        [...new Set(found)],
        `"${shot}" is ${String(ms)}ms in homeV3Motion.ts, so every animation in its CSS blocks must be ${String(expected)}s. Change both files or neither.`,
      ).toEqual([expected]);
    },
  );

  it("covers the route shot too, which is not in HV3_SHOT_DURATIONS", () => {
    // VT-5 is armed on click rather than by the scroll gate, so it is not a
    // member of the `Hv3Shot` union the map above is keyed by. It is still a
    // duration duplicated across a TS file and a CSS file, which is the exact
    // thing this suite exists to keep honest, so it gets its own check rather
    // than being quietly exempt.
    const found = durationsForShot(HV3_ASK_PILL_SHOT);
    expect(
      found.length,
      `no animation timings found in the "${HV3_ASK_PILL_SHOT}" blocks of viewTransitionsHomeV3.css`,
    ).toBeGreaterThan(0);
    expect(
      [...new Set(found)],
      `"${HV3_ASK_PILL_SHOT}" is ${String(HV3_ASK_PILL_DURATION_MS)}ms in homeV3Motion.ts, so every animation in its CSS blocks must be ${String(HV3_ASK_PILL_DURATION_MS / 1000)}s.`,
    ).toEqual([HV3_ASK_PILL_DURATION_MS / 1000]);
  });

  it.each(Object.entries(HV3_SHOT_EASINGS))(
    "%s uses only the easing curves the constants module names",
    (shot, curves) => {
      const allowed = new Set(
        [curves.old, curves.new].map((c) => c.replace(/\s+/g, " ")),
      );
      const found = easingsForShot(shot);

      for (const curve of found) {
        expect(
          allowed.has(curve),
          `"${shot}" uses ${curve} in viewTransitionsHomeV3.css, which is not one of the curves HV3_SHOT_EASINGS names for it (${[...allowed].join(", ")}). These come from @/shared/motion/easing; do not hand-write a bezier here.`,
        ).toBe(true);
      }
    },
  );
});
