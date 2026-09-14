/**
 * Guards the single-source-of-truth mark geometry shared by <PhitopolisLogo>
 * and the hero video clip-path mask (HeroPMask).
 */
import { render } from "@testing-library/react";

import PhitopolisLogo from "@/shared/components/PhitopolisLogo";
import {
  PHITOPOLIS_MARK_PATHS,
  PHITOPOLIS_MARK_VIEWBOX,
} from "@/shared/components/phitopolisMarkPaths";

describe("PHITOPOLIS_MARK_PATHS", () => {
  it("has exactly three paths", () => {
    expect(PHITOPOLIS_MARK_PATHS).toHaveLength(3);
  });

  it("every entry has a non-empty d and transform", () => {
    for (const p of PHITOPOLIS_MARK_PATHS) {
      expect(typeof p.d).toBe("string");
      expect(p.d.length).toBeGreaterThan(0);
      expect(typeof p.transform).toBe("string");
      expect(p.transform.length).toBeGreaterThan(0);
    }
  });

  it("marks exactly one accent path, at index 1 (the phi)", () => {
    const accents = PHITOPOLIS_MARK_PATHS.map((p) => p.accent);
    expect(accents.filter(Boolean)).toHaveLength(1);
    expect(accents).toEqual([false, true, false]);
  });

  it("keeps the original viewBox", () => {
    expect(PHITOPOLIS_MARK_VIEWBOX).toBe("533 51 1768 1911");
  });
});

describe("<PhitopolisLogo>", () => {
  it("renders three <path> nodes in order", () => {
    const { container } = render(<PhitopolisLogo />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(3);
    paths.forEach((node, i) => {
      expect(node.getAttribute("d")).toBe(PHITOPOLIS_MARK_PATHS[i]!.d);
      expect(node.getAttribute("transform")).toBe(PHITOPOLIS_MARK_PATHS[i]!.transform);
    });
  });
});
