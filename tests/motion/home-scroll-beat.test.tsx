import { act } from "@testing-library/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionBeat } from "@/shared/components/stage/SectionBeat";
import { renderWithProviders } from "../test-utils";

beforeEach(() => ScrollTrigger.enable());

test("scroll beats reverse to identical states and clean up their triggers", () => {
  const rendered = renderWithProviders(
    <SectionBeat section={{ id: "foundation-beat", label: "Foundation", chapter: 0, motion: "scroll", noExitDim: true }} order={0}>
      <h2 data-home-reveal>Readable default</h2>
    </SectionBeat>,
  );
  const trigger = ScrollTrigger.getById("foundation-beat:reveal");
  expect(trigger).toBeDefined();
  expect(trigger?.vars.once).not.toBe(true);
  const animation = trigger?.animation;
  if (!animation) throw new Error("Missing reversible beat animation");
  const heading = rendered.getByText("Readable default");
  act(() => { animation.progress(0.4); });
  const forward = heading.getAttribute("style");
  act(() => { animation.progress(1); animation.progress(0.4); });
  expect(heading.getAttribute("style")).toBe(forward);
  expect(animation.paused()).toBe(true);
  rendered.unmount();
  expect(ScrollTrigger.getById("foundation-beat:reveal")).toBeUndefined();
});


describe("staggered scroll beats", () => {
  const samples = [
    [0, [0, 0, 0]],
    [0.1, [1 / 6, 0, 0]],
    [0.2, [1 / 3, 0, 0]],
    [0.4, [2 / 3, 1 / 3, 0]],
    [0.5, [5 / 6, 1 / 2, 1 / 6]],
    [0.6, [1, 2 / 3, 1 / 3]],
    [0.8, [1, 1, 2 / 3]],
    [1, [1, 1, 1]],
  ] as const;

  test.each(samples)("owns every child at normalized progress %s", (progress, expected) => {
    const rendered = renderWithProviders(
      <SectionBeat section={{ id: "multi-beat", label: "Multi", chapter: 0, motion: "scroll", noExitDim: true }} order={0}>
        {["First", "Second", "Third"].map(label => <h2 key={label} data-home-reveal>{label}</h2>)}
      </SectionBeat>,
    );
    const trigger = ScrollTrigger.getById("multi-beat:reveal");
    const animation = trigger?.animation;
    if (!animation) throw new Error("Missing multi-target animation");
    const nodes = rendered.getAllByRole("heading", { hidden: true });
    const check = () => nodes.forEach((node, index) => {
      expect(Number(gsap.getProperty(node, "opacity"))).toBeCloseTo(expected[index]!, 4);
      expect(Number(gsap.getProperty(node, "y"))).toBeCloseTo(32 * (1 - expected[index]!), 3);
    });
    act(() => { animation.progress(0); animation.progress(progress); });
    check();
    act(() => { animation.progress(1); animation.progress(progress); });
    check();
    // Refresh invalidates property caches; direct entry must still derive
    // every child's value solely from the settled progress.
    act(() => { trigger?.refresh(); animation.invalidate(); animation.progress(1); animation.progress(progress); });
    check();
    expect(animation.paused()).toBe(true);
    rendered.unmount();
    expect(ScrollTrigger.getById("multi-beat:reveal")).toBeUndefined();
  });
});
