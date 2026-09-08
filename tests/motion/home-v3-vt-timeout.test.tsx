import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

/**
 * The unconditional safety net under the act gate.
 *
 * `stopLenis()` is called before a View Transition starts and `startLenis()`
 * only on the way out. If the transition's `finished` promise never settles,
 * scroll stays dead and the page is bricked with no error in the console. That
 * is not hypothetical: a View Transition can hang when the tab loses visibility
 * mid-transition, and the sibling AmssaiV2 codebase swallows every VT promise
 * for exactly this class of reason.
 *
 * So the gate races every transition against `HV3_GATE_TIMEOUT_MS` and releases
 * regardless. Unlike the escape hatch, this valve is armed immediately, because
 * it responds to no user input that could fire it early.
 */

const stopLenis = vi.fn();
const startLenis = vi.fn();

vi.mock("@/shared/components/smoothScrollControls", () => ({
  stopLenis: () => { stopLenis(); },
  startLenis: () => { startLenis(); },
  getLenis: () => null,
  setActiveLenis: () => {},
}));

const skipTransition = vi.fn();
let original: unknown;

type Act = "opening" | "proof" | "method" | "ask";
type Shot = "proof" | "process" | "verdict" | "ask";

async function renderHarness() {
  const { useActTransition } = await import("@/features/home/v3/useActTransition");
  const captured: { fireAct: ((to: Act, from: Act, shot: Shot) => void) | null } = { fireAct: null };

  function Harness() {
    const { fireAct } = useActTransition();
    captured.fireAct = fireAct;
    return (
      <div className="hv3" data-hv3-act="opening">
        <section data-hv3-act-panel="opening"><h1 data-hv3-heading tabIndex={-1}>Opening</h1></section>
        <section data-hv3-act-panel="proof"><h2 data-hv3-heading tabIndex={-1}>Proof</h2></section>
      </div>
    );
  }
  render(<Harness />);
  return captured;
}

describe("home V3 act gate: a hung transition cannot brick scrolling", () => {
  beforeEach(() => {
    stopLenis.mockClear();
    startLenis.mockClear();
    skipTransition.mockClear();
    original = (document as unknown as Record<string, unknown>).startViewTransition;
    (document as unknown as Record<string, unknown>).startViewTransition = (cb: () => void) => {
      cb();
      return {
        ready: new Promise<void>(() => {}),
        updateCallbackDone: new Promise<void>(() => {}),
        finished: new Promise<void>(() => {}),
        skipTransition,
      };
    };
  });

  afterEach(() => {
    (document as unknown as Record<string, unknown>).startViewTransition = original;
    delete document.documentElement.dataset.hv3Shot;
    delete document.documentElement.dataset.hv3Act;
  });

  it("restarts Lenis after the timeout even though nothing ever resolved", async () => {
    const captured = await renderHarness();
    const { HV3_GATE_TIMEOUT_MS } = await import("@/features/home/v3/homeV3Motion");

    captured.fireAct?.("proof", "opening", "proof");
    expect(stopLenis).toHaveBeenCalledTimes(1);
    expect(startLenis).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(
          startLenis,
          "the View Transition never settled and the timeout valve did not fire, so Lenis is still stopped and the page cannot be scrolled",
        ).toHaveBeenCalled();
      },
      { timeout: HV3_GATE_TIMEOUT_MS + 600 },
    );

    expect(document.documentElement.dataset.hv3Shot).toBeUndefined();
  });

  it("commits the act change rather than stranding the page mid-state", async () => {
    const captured = await renderHarness();
    const { HV3_GATE_TIMEOUT_MS } = await import("@/features/home/v3/homeV3Motion");

    captured.fireAct?.("proof", "opening", "proof");

    await waitFor(() => { expect(startLenis).toHaveBeenCalled(); }, {
      timeout: HV3_GATE_TIMEOUT_MS + 600,
    });

    expect(document.documentElement.dataset.hv3Act).toBe("proof");
  });

  it("releases only once, however many times the valve and escape overlap", async () => {
    const captured = await renderHarness();
    const { HV3_GATE_TIMEOUT_MS } = await import("@/features/home/v3/homeV3Motion");

    captured.fireAct?.("proof", "opening", "proof");
    await new Promise((r) => setTimeout(r, HV3_GATE_TIMEOUT_MS + 300));
    window.dispatchEvent(new Event("wheel"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(startLenis).toHaveBeenCalledTimes(1);
  });
});
