import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Home V3's act boundaries must never be pinned or scrubbed.
 *
 * `document.startViewTransition()` takes a synchronous snapshot of the page.
 * Fire it while a ScrollTrigger scrub or pin is mid-flight and the snapshot
 * freezes that motion, then paints the stale frame over a scene that is still
 * moving underneath. The sibling AmssaiV2 codebase hit exactly this and
 * abandoned real View Transitions at its three scroll boundaries because of it
 * (see the comment at `components/sections/home/HomeMotion.tsx:376`). V3 only
 * gets to use the real API because its boundaries are discrete, non-scrubbed
 * `onEnter` triggers on markers sitting in normal flow between settled acts.
 *
 * That is a load-bearing property, not a style preference, and it is invisible
 * once broken: adding `scrub` or `pin` here would not fail typecheck, would not
 * fail lint, and would produce a page that mostly works with an occasional
 * ghosted frame. So it is asserted at the source level, the same way
 * `beat-thresholds-usage.test.ts` guards the threshold convention.
 *
 * The original plan called for extending `ladder-probe.js` to prove no boundary
 * trigger's resolved range overlaps a pin. That check turned out to be
 * unnecessary in the stronger sense: V3 creates no pinned trigger anywhere, so
 * there is no range to overlap. This test pins that stronger property instead.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const V3_DIR = resolve(HERE, "../../src/features/home/v3");

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

/** Strip comments, so the prose explaining why we don't pin isn't a hit. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("home V3 act boundaries stay discrete", () => {
  const files = sourceFiles(V3_DIR);

  it("scans a non-empty set of V3 source files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("declares no pinned or scrubbed ScrollTrigger anywhere in the feature", () => {
    const hits: string[] = [];

    for (const file of files) {
      const source = stripComments(readFileSync(file, "utf8"));
      for (const match of source.matchAll(/\b(pin|scrub)\s*:/g)) {
        const line = source.slice(0, match.index).split("\n").length;
        hits.push(`${relative(V3_DIR, file)}:${String(line)} — "${match[1] ?? ""}:"`);
      }
    }

    expect(
      hits,
      [
        "A pinned or scrubbed trigger in home V3 breaks the invariant the whole",
        "transition design rests on: startViewTransition() snapshots the page, so",
        "firing a boundary while a pin or scrub is animating ghosts a frozen frame",
        "over the moving scene. If a pinned narrative is genuinely wanted here, the",
        "boundary trigger must sit strictly outside that pin's range and this test",
        "needs replacing with the range-overlap check, not deleting.",
        hits.join("\n"),
      ].join("\n"),
    ).toEqual([]);
  });
});
