import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

/**
 * A `view-transition-name` may be borne by at most ONE rendered element per
 * snapshot. Two, and the browser does not warn and does not throw: it performs
 * the DOM update with no transition at all. The bug therefore presents as "the
 * morphs just don't happen", with a clean console and passing types, which is
 * about the worst failure signature a feature can have.
 *
 * Home V3 is one continuous scrolling document, so both halves of every shared
 * element are rendered at the same time. The name has to MOVE: it sits on the
 * outgoing element while the old snapshot is taken, and is handed to the
 * incoming element inside the update callback, before the new one. These tests
 * inspect the DOM at both of those moments, because asserting only on the end
 * state would pass against the broken version too.
 */

vi.mock("@/shared/components/smoothScrollControls", () => ({
  stopLenis: () => {},
  startLenis: () => {},
  getLenis: () => null,
  setActiveLenis: () => {},
}));

type Act = "opening" | "proof" | "method" | "ask";
type Shot = "proof" | "process" | "verdict" | "ask";

function named(): { name: string; marker: string }[] {
  return [...document.querySelectorAll<HTMLElement>("[data-hv3-vt]")]
    .filter((el) => el.style.viewTransitionName !== "")
    .map((el) => ({
      name: el.style.viewTransitionName,
      marker: el.dataset.hv3Vt ?? "",
    }));
}

let original: unknown;
let beforeCallback: ReturnType<typeof named> = [];
let afterCallback: ReturnType<typeof named> = [];

async function renderHarness() {
  const { useActTransition } = await import("@/features/home/v3/useActTransition");
  const captured: { fireAct: ((to: Act, from: Act, shot: Shot) => void) | null } = { fireAct: null };

  function Harness() {
    const { fireAct } = useActTransition();
    captured.fireAct = fireAct;
    return (
      <div className="hv3" data-hv3-act="opening">
        <section data-hv3-act-panel="opening">
          <h1 data-hv3-heading tabIndex={-1}>Opening</h1>
          <div data-hv3-vt="lede-from">claim</div>
        </section>
        <section data-hv3-act-panel="proof">
          <h2 data-hv3-heading tabIndex={-1}>Proof</h2>
          <div data-hv3-vt="lede-to">row 01</div>
          <div data-hv3-vt="seed-from">03</div>
        </section>
        <section data-hv3-act-panel="method">
          <h2 data-hv3-heading tabIndex={-1}>Method</h2>
          <div data-hv3-vt="seed-to">node 01</div>
        </section>
      </div>
    );
  }
  render(<Harness />);
  return captured;
}

describe("home V3 shared elements: one name per snapshot, never two", () => {
  beforeEach(() => {
    beforeCallback = [];
    afterCallback = [];
    original = (document as unknown as Record<string, unknown>).startViewTransition;
    (document as unknown as Record<string, unknown>).startViewTransition = (cb: () => void) => {
      // The browser captures the OLD snapshot at this instant.
      beforeCallback = named();
      cb();
      // ...and the NEW snapshot immediately after the callback returns.
      afterCallback = named();
      return {
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        finished: Promise.resolve(),
        skipTransition: () => {},
      };
    };
  });

  afterEach(() => {
    (document as unknown as Record<string, unknown>).startViewTransition = original;
    delete document.documentElement.dataset.hv3Shot;
    delete document.documentElement.dataset.hv3Act;
  });

  it("names only the outgoing element for the old snapshot", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    expect(
      beforeCallback,
      "the old snapshot must contain exactly one element carrying the name. More than one and the browser silently skips the entire transition.",
    ).toEqual([{ name: "hv3-lede", marker: "lede-from" }]);
  });

  it("hands the name to the incoming element for the new snapshot", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    expect(
      afterCallback,
      "the new snapshot must contain exactly one element carrying the name, and it must be the incoming one",
    ).toEqual([{ name: "hv3-lede", marker: "lede-to" }]);
  });

  it("never lets both halves hold the name at the same time", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("method", "proof", "process");

    for (const phase of [beforeCallback, afterCallback]) {
      const counts = new Map<string, number>();
      for (const { name } of phase) counts.set(name, (counts.get(name) ?? 0) + 1);
      for (const [name, count] of counts) {
        expect(count, `"${name}" is on ${String(count)} elements in one snapshot`).toBe(1);
      }
    }
    expect(beforeCallback).toEqual([{ name: "hv3-seed", marker: "seed-from" }]);
    expect(afterCallback).toEqual([{ name: "hv3-seed", marker: "seed-to" }]);
  });

  it("assigns no shared-element name at all for the finale", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("ask", "ask", "ask");

    expect(
      [...beforeCallback, ...afterCallback],
      "the finale is a root-only push-in. Giving it a shared element would make it continuous with the other three, which is the exact opposite of the point.",
    ).toEqual([]);
  });
});
