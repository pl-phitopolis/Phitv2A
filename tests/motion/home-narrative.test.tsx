import type { ReactNode } from "react";
import { NavbarProvider } from "@/shared/components/NavbarContext";
import { act } from "@testing-library/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { renderWithProviders } from "../test-utils";
import { HomeIntroduction, HomeMission } from "@/features/home/rebuild/HomeOpening";
import { HomeScrollCut } from "@/features/home/rebuild/HomeScrollCut";
import { HomeGlobalReach } from "@/features/home/rebuild/HomeEvidence";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a> }));
const mount = (node: ReactNode) => renderWithProviders(<NavbarProvider>{node}</NavbarProvider>);
beforeEach(() => ScrollTrigger.enable());
const samples = [0, 0.1, 0.25, 0.3, 0.5, 0.74, 0.75, 0.85, 1];
const scenes = [
  { id: "home-introduction", node: <HomeIntroduction />, selector: ".home-strip,.home-years" },
  { id: "hero-mission", node: <HomeMission />, selector: ".home-mission-panel,.home-mission-copy" },
  { id: "home-cut-research", node: <HomeScrollCut id="home-cut-research" destination="deep" />, selector: ".home-cut-surface" },
  { id: "home-cut-closing", node: <HomeScrollCut id="home-cut-closing" destination="base" />, selector: ".home-cut-surface" },
  { id: "reach", node: <HomeGlobalReach />, selector: "[data-home-map-arc]" },
];
for (const scene of scenes) {
  describe(scene.id, () => {
    test.each(samples)("same state at %s from either direction and after direct entry", progress => {
      const view = mount(scene.node);
      const trigger = ScrollTrigger.getById(`home:${scene.id}`);
      const timeline = trigger?.animation;
      if (!timeline) throw new Error("Missing narrative timeline");
      const nodes = [...view.container.querySelectorAll<HTMLElement>(scene.selector)];
      expect(nodes.length).toBeGreaterThan(0);
      const read = () => nodes.map(node => node.getAttribute("style"));
      act(() => { timeline.progress(0); timeline.progress(progress); });
      const forward = read();
      act(() => { timeline.progress(1); timeline.progress(progress); });
      expect(read()).toEqual(forward);
      act(() => { timeline.invalidate(); timeline.progress(1); timeline.progress(progress); });
      expect(read()).toEqual(forward);
      expect(timeline.paused()).toBe(true);
      expect(trigger?.vars.once).not.toBe(true);
      if (scene.id.includes("cut")) expect(trigger?.vars.pin).toBe(false);
      view.unmount();
      expect(ScrollTrigger.getById(`home:${scene.id}`)).toBeUndefined();
    });
  });
}
test("the first quarter is empty navy and the finisher waits for all five strips", () => {
  const view = mount(<HomeIntroduction />);
  const timeline = ScrollTrigger.getById("home:home-introduction")!.animation!;
  const strips = [...view.container.querySelectorAll(".home-strip")];
  const years = view.container.querySelector(".home-years")!;
  act(() => { timeline.progress(0.24); });
  for (const strip of strips) expect(gsap.getProperty(strip, "yPercent")).toBe(110);
  expect(gsap.getProperty(years, "opacity")).toBe(0);
  act(() => { timeline.progress(0.75); });
  for (const strip of strips) expect(gsap.getProperty(strip, "yPercent")).toBe(0);
  expect(gsap.getProperty(years, "opacity")).toBe(0);
  act(() => { timeline.progress(1); });
  expect(gsap.getProperty(years, "opacity")).toBe(1);
});
