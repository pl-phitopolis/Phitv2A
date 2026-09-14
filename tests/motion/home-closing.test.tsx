import type { ReactNode } from "react";
import { act } from "@testing-library/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NavbarProvider } from "@/shared/components/NavbarContext";
import { HomeClosing } from "@/features/home/rebuild/HomeClosing";
import { renderWithProviders } from "../test-utils";

// The decoder/coalescing boundary has its own tests. Keep the real GSAP
// timeline here and observe exactly the targets it sends to that boundary.
const decoder = vi.hoisted(() => ({ seek: vi.fn(), dispose: vi.fn() }));
vi.mock("@/features/home/rebuild/videoScrub", () => ({ createVideoScrubber: () => decoder }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a> }));

function viewport(width: number, reduced = false) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", 900);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("no-preference") ? !reduced
      : query.includes("prefers-reduced-motion") ? reduced
        : query.includes("min-width: 768px") ? width >= 768 : false,
    media: query, onchange: null, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  }));
}
function mount() {
  return renderWithProviders(<NavbarProvider><HomeClosing /></NavbarProvider>);
}
function runtime(view: ReturnType<typeof mount>) {
  const trigger = ScrollTrigger.getById("home:closing");
  if (!trigger?.animation) throw new Error("Missing closing timeline");
  const picture = view.container.querySelector(".home-closing-picture")!;
  const cta = view.container.querySelector(".home-closing-cta")!;
  return {
    trigger, timeline: trigger.animation,
    read: () => ({ picture: Number(gsap.getProperty(picture, "xPercent")), cta: Number(gsap.getProperty(cta, "xPercent")) }),
  };
}
beforeEach(() => { ScrollTrigger.enable(); decoder.seek.mockClear(); decoder.dispose.mockClear(); });

for (const width of [1440, 768, 375]) {
  describe(`closing at ${width}px`, () => {
    test.each([0, 0.2, 0.5, 0.75, 0.875, 1])("maps progress %s identically forward, backward, and on fresh entry", progress => {
      viewport(width);
      const view = mount();
      const scene = runtime(view);
      const set = (value: number) => act(() => { scene.timeline.progress(value); });
      // Start away from the target so even endpoint assertions observe a write.
      set(1); set(0); set(progress);
      const video = decoder.seek.mock.calls.at(-1)?.[0] as number;
      expect(video).toBeCloseTo(Math.min(1, progress / 0.75), 5);
      const expectedCta = Math.max(0, (progress - 0.75) / 0.25);
      const forward = scene.read();
      expect(forward.picture).toBeCloseTo(width >= 768 ? -22.5 * expectedCta : 0, 5);
      expect(forward.cta).toBeCloseTo(width >= 768 ? 100 * (1 - expectedCta) : 0, 5);
      set(1); set(progress);
      expect(scene.read()).toEqual(forward);
      expect(decoder.seek.mock.calls.at(-1)?.[0]).toBeCloseTo(video, 5);
      expect(scene.timeline.paused()).toBe(true);
      expect(scene.trigger.vars.once).not.toBe(true);
      expect(scene.trigger.vars.pin).toBe(width >= 768);
      view.unmount();
      expect(ScrollTrigger.getById("home:closing")).toBeUndefined();
      expect(decoder.dispose).toHaveBeenCalledOnce();

      const fresh = mount();
      const entry = runtime(fresh);
      act(() => { entry.timeline.progress(progress); });
      expect(entry.read()).toEqual(forward);
      expect(decoder.seek.mock.calls.at(-1)?.[0]).toBeCloseTo(video, 5);
      fresh.unmount();
      expect(decoder.dispose).toHaveBeenCalledTimes(2);
    });
    test("uses the requested scroll travel without autoplay", () => {
      viewport(width);
      const view = mount();
      const scene = runtime(view);
      expect(scene.trigger.vars.start).toBe(width >= 768 ? "top top" : "top bottom");
      const end = scene.trigger.vars.end;
      expect(typeof end === "function" ? end(scene.trigger) : end).toBe(width >= 768 ? "+=2700" : "bottom top");
      expect(scene.timeline.paused()).toBe(true);
      expect(scene.timeline.repeat()).toBe(0);
      expect(scene.trigger.vars.scrub).toBeGreaterThan(0);
      view.unmount();
    });
  });
}

