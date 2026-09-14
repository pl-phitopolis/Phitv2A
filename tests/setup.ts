import "@testing-library/jest-dom/vitest";

import { server } from "./msw/server";

// jsdom lacks matchMedia/IntersectionObserver/ResizeObserver. The default
// stub reports prefers-reduced-motion: REDUCE so every animation renders its
// deterministic final state in tests (the jsdom landmine from the build
// contract). Override per-test with mockReducedMotion(false) from test-utils.
export function stubMatchMedia(reduce: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    // "no-preference" first: the query string "(prefers-reduced-motion:
    // no-preference)" also contains the substring "reduce".
    matches: query.includes("no-preference")
      ? !reduce
      : query.includes("prefers-reduced-motion")
        ? reduce
        : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

class ObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): never[] {
    return [];
  }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: number[] = [];
}

// Module scope, not hooks: GSAP's ScrollTrigger reads matchMedia at module
// IMPORT time (gsap.registerPlugin in routes/index.tsx), which happens before
// any beforeAll/beforeEach fires.
stubMatchMedia(true);
vi.stubGlobal("IntersectionObserver", ObserverStub);
vi.stubGlobal("ResizeObserver", ObserverStub);

const pendingFrames = new Set<ReturnType<typeof setTimeout>>();
const fallbackRaf = (cb: FrameRequestCallback): number => {
  const handle = setTimeout(() => { pendingFrames.delete(handle); cb(performance.now()); }, 16);
  pendingFrames.add(handle);
  return handle as unknown as number;
};
const fallbackCaf = (id: number): void => {
  const handle = id as unknown as ReturnType<typeof setTimeout>;
  clearTimeout(handle);
  pendingFrames.delete(handle);
};

// Ensure requestAnimationFrame and cancelAnimationFrame are always defined across all scopes (Node global and globalThis)
const ensureRaf = () => {
  if (typeof global !== "undefined") {
    const g = global as unknown as Record<string, unknown>;
    g.requestAnimationFrame = fallbackRaf;
    g.cancelAnimationFrame = fallbackCaf;
    if (!("document" in global)) {
      Object.defineProperty(global, "document", {
        get() {
          if (typeof window !== "undefined" && window.document) {
            return window.document;
          }
          return {
            documentElement: { scrollLeft: 0, scrollTop: 0, scrollWidth: 0, scrollHeight: 0, clientWidth: 0, clientHeight: 0 },
            body: { scrollLeft: 0, scrollTop: 0, scrollWidth: 0, scrollHeight: 0, clientWidth: 0, clientHeight: 0 },
          };
        },
        configurable: true,
      });
    }
    if (!("getComputedStyle" in global)) {
      Object.defineProperty(global, "getComputedStyle", {
        value: (elt: Element) => {
          if (typeof window !== "undefined" && window.getComputedStyle) {
            return window.getComputedStyle(elt);
          }
          return {
            transform: "none",
            transformOrigin: "50% 50% 0",
            getPropertyValue: () => "",
          } as unknown as CSSStyleDeclaration;
        },
        configurable: true,
        writable: true,
      });
    }
  }
  if (typeof globalThis !== "undefined") {
    const gt = globalThis as unknown as Record<string, unknown>;
    gt.requestAnimationFrame = fallbackRaf;
    gt.cancelAnimationFrame = fallbackCaf;
  }
  if (typeof window !== "undefined") {
    const w = window as unknown as Record<string, unknown>;
    w.requestAnimationFrame = fallbackRaf;
    w.cancelAnimationFrame = fallbackCaf;
  }
};

ensureRaf();

beforeAll(() => {
  ensureRaf();
  server.listen({ onUnhandledRequest: "bypass" });
});
beforeEach(() => {
  stubMatchMedia(true);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.clear();
  }
  ensureRaf();
});
afterEach(async () => {
  server.resetHandlers();
  ensureRaf();

  // Kill GSAP's deferred work before the environment is torn down.
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  try {
    ScrollTrigger.disable(false, false);
  } catch (err) {
    void err;
  }
  ScrollTrigger.killAll();
  ScrollTrigger.config({ syncInterval: 999999999 });
  const { gsap } = await import("gsap");
  gsap.globalTimeline.clear();
});
afterAll(async () => {
  server.close();
  ensureRaf();
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  try {
    ScrollTrigger.disable(false, false);
  } catch (err) {
    void err;
  }
  ScrollTrigger.killAll();
  // React cleanup has run; no frame may retain the departing jsdom document.
  for (const handle of pendingFrames) clearTimeout(handle);
  pendingFrames.clear();
});
