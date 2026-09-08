import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

/**
 * The act-boundary scroll gate holds the reader's scroll for the length of a
 * View Transition. That is a deliberate, owner-approved deviation from the
 * site's no-scroll-jacking rule, and it was approved *on the condition* that a
 * reader can always get out. These tests are that condition.
 *
 * The second test is a regression guard for a bug that would have shipped: the
 * escape listeners were originally armed synchronously, but a boundary's
 * `onEnter` fires *during* a wheel-driven scroll, so the inertia of the gesture
 * that crossed the threshold keeps delivering `wheel` events for a few hundred
 * milliseconds. An escape armed at t=0 cancels the transition it exists to
 * rescue, on every scroll-driven entry, and the page reads as "the transitions
 * do not work". `HV3_ESCAPE_ARM_MS` is the fix; this test is what stops anyone
 * "simplifying" the delay away later.
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
let originalStartViewTransition: unknown;

function installNeverFinishingViewTransition() {
  originalStartViewTransition = (document as unknown as Record<string, unknown>).startViewTransition;
  (document as unknown as Record<string, unknown>).startViewTransition = (cb: () => void) => {
    cb();
    return {
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      // Deliberately never settles, so the only ways out are the escape hatch
      // and the timeout valve — which is exactly what is under test.
      finished: new Promise<void>(() => {}),
      skipTransition,
    };
  };
}

type FireAct = (
  to: "opening" | "proof" | "method" | "ask",
  from: "opening" | "proof" | "method" | "ask",
  shot: "proof" | "process" | "verdict" | "ask",
) => void;

async function renderHarness() {
  const { useActTransition } = await import("@/features/home/v3/useActTransition");
  const captured: { fireAct: FireAct | null } = { fireAct: null };

  function Harness() {
    const { fireAct } = useActTransition();
    captured.fireAct = fireAct as FireAct;
    return (
      <div className="hv3" data-hv3-act="opening">
        <section data-hv3-act-panel="opening">
          <h1 data-hv3-heading tabIndex={-1}>Opening</h1>
        </section>
        <section data-hv3-act-panel="proof">
          <h2 data-hv3-heading tabIndex={-1}>Proof</h2>
        </section>
      </div>
    );
  }

  render(<Harness />);
  return captured;
}

describe("home V3 act gate: the reader can always escape", () => {
  beforeEach(() => {
    stopLenis.mockClear();
    startLenis.mockClear();
    skipTransition.mockClear();
    installNeverFinishingViewTransition();
  });

  afterEach(() => {
    (document as unknown as Record<string, unknown>).startViewTransition = originalStartViewTransition;
    delete document.documentElement.dataset.hv3Shot;
    delete document.documentElement.dataset.hv3Act;
  });

  it("suspends scroll when a boundary fires", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    expect(stopLenis).toHaveBeenCalledTimes(1);
    expect(startLenis).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.hv3Shot).toBe("proof");
  });

  it("ignores the wheel inertia of the gesture that opened the gate", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    // A real trackpad fling does not deliver its tail in the same tick: the
    // events trickle in over the next couple of hundred milliseconds. Model
    // that, because dispatching synchronously would pass against ANY arming
    // delay (including none) and prove nothing.
    for (const at of [30, 70, 110, 150]) {
      await new Promise((r) => setTimeout(r, at === 30 ? 30 : 40));
      window.dispatchEvent(new Event("wheel"));
    }

    expect(
      skipTransition,
      "the transition was cancelled by the same scroll gesture that triggered it — the escape hatch is arming synchronously again",
    ).not.toHaveBeenCalled();
    expect(startLenis).not.toHaveBeenCalled();
  });

  it("releases on a deliberate wheel once the escape has armed", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    const { HV3_ESCAPE_ARM_MS } = await import("@/features/home/v3/homeV3Motion");
    await new Promise((r) => setTimeout(r, HV3_ESCAPE_ARM_MS + 40));

    // One stray post-arm event must NOT cancel: ordinary continuous scrolling
    // delivers those incidentally, and treating one as intent cancelled 42 of
    // 45 transitions when measured in real Chrome.
    window.dispatchEvent(new Event("wheel"));
    expect(skipTransition).not.toHaveBeenCalled();

    const { ESCAPE_INTENT_EVENTS } = await import("@/features/home/v3/useActTransition");
    for (let i = 1; i < ESCAPE_INTENT_EVENTS; i += 1) {
      window.dispatchEvent(new Event("wheel"));
    }

    await waitFor(() => {
      expect(skipTransition).toHaveBeenCalled();
      expect(startLenis).toHaveBeenCalled();
    });
    expect(document.documentElement.dataset.hv3Shot).toBeUndefined();
  });

  it("does not re-fire into the state it is already in", async () => {
    const captured = await renderHarness();

    captured.fireAct?.("proof", "opening", "proof");
    await waitFor(() => { expect(startLenis).toHaveBeenCalled(); });

    stopLenis.mockClear();
    // A ScrollTrigger.refresh() after the transition can re-fire onEnter for a
    // boundary the reader has already crossed. Before the idempotence guard
    // this looped: transition -> refresh -> re-enter -> transition, 60+ times.
    captured.fireAct?.("proof", "opening", "proof");
    captured.fireAct?.("proof", "opening", "proof");

    expect(
      stopLenis,
      "a boundary re-fired into the act that is already current, which is the feedback loop that made the finale fire 60+ times",
    ).not.toHaveBeenCalled();
  });

  it("releases on Escape, and ignores other keys", async () => {
    const captured = await renderHarness();
    captured.fireAct?.("proof", "opening", "proof");

    const { HV3_ESCAPE_ARM_MS } = await import("@/features/home/v3/homeV3Motion");
    await new Promise((r) => setTimeout(r, HV3_ESCAPE_ARM_MS + 40));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(startLenis).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await waitFor(() => {
      expect(startLenis).toHaveBeenCalled();
    });
  });
});
