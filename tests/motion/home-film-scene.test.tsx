import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRef } from "react";
import { act, cleanup, render } from "@testing-library/react";

import { HOME_SCENES } from "@/features/home/making-tomorrow/homeScenes";
import { useSceneFilm } from "@/features/home/making-tomorrow/useSceneFilm";
import * as motionHook from "@/shared/motion";
import { triggerIntersect } from "../setup.motion";

function FilmHarness() {
  const targetRef = useRef<HTMLDivElement>(null);
  const {
    videoRef,
    shouldLoad,
    showVideo,
    failed,
    reduced,
    onPlay,
    onError,
  } = useSceneFilm(targetRef);

  return (
    <div ref={targetRef} data-testid="film-target">
      <video
        ref={videoRef}
        data-ready={showVideo ? "true" : "false"}
        data-failed={failed ? "true" : "false"}
        onPlay={onPlay}
        onError={onError}
      >
        {shouldLoad && !reduced ? <source src="/film.mp4" type="video/mp4" /> : null}
      </video>
    </div>
  );
}

function videoOf(container: HTMLElement): HTMLVideoElement {
  const video = container.querySelector("video");
  if (!video) throw new Error("film harness did not render a video");
  return video;
}

describe("home film scene media", () => {
  beforeEach(() => {
    vi.spyOn(motionHook, "useReducedMotion").mockReturnValue(false);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    // jsdom models `play()` as undefined while browsers normally return a
    // promise. The hook intentionally supports both; this keeps lifecycle
    // state changes synchronous and observable in this focused test.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockReturnValue(undefined as unknown as Promise<void>);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  test("uses the services loop for proof and only the delivery copy for closing", () => {
    expect(HOME_SCENES.proof.id).toBe("proof-film");
    expect(HOME_SCENES.proof.pinVh).toBe(1.5);
    expect(HOME_SCENES.proof.media?.sources).toEqual([
      { src: "/videos/daily-life-services-loop.mp4", type: "video/mp4" },
    ]);
    expect(HOME_SCENES.closing.id).toBe("closing");
    expect(HOME_SCENES.closing.pinVh).toBe(2);
    expect(HOME_SCENES.closing.media?.sources).toEqual([
      { src: "/videos/we-build-the-future-delivery.mp4", type: "video/mp4" },
    ]);
  });

  test("defers the request, plays only while in view, and pauses when it leaves", () => {
    const { container } = render(<FilmHarness />);
    const target = container.querySelector('[data-testid="film-target"]');
    const video = videoOf(container);
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);

    expect(video.querySelector("source")).toBeNull();
    expect(play).not.toHaveBeenCalled();

    act(() => {
      expect(triggerIntersect(target!, true)).toBe(2);
    });
    expect(video.querySelector("source")?.getAttribute("src")).toBe("/film.mp4");
    expect(play).toHaveBeenCalledTimes(1);
    expect(video.dataset.ready).toBe("true");

    act(() => {
      expect(triggerIntersect(target!, false)).toBe(2);
    });
    expect(pause).toHaveBeenCalled();
    expect(video.dataset.ready).toBe("false");
  });

  test("pauses in a hidden tab and resumes only once the tab becomes visible", () => {
    const { container } = render(<FilmHarness />);
    const target = container.querySelector('[data-testid="film-target"]');
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);

    act(() => {
      triggerIntersect(target!, true);
    });
    expect(play).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(pause).toHaveBeenCalled();

    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(play).toHaveBeenCalledTimes(2);
  });

  test("keeps the poster state for reduced motion or a media error", () => {
    const reduced = vi.spyOn(motionHook, "useReducedMotion").mockReturnValue(true);
    const reducedRender = render(<FilmHarness />);
    const reducedTarget = reducedRender.container.querySelector('[data-testid="film-target"]');
    act(() => {
      triggerIntersect(reducedTarget!, true);
    });
    expect(videoOf(reducedRender.container).querySelector("source")).toBeNull();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    reducedRender.unmount();

    reduced.mockReturnValue(false);
    const { container } = render(<FilmHarness />);
    const target = container.querySelector('[data-testid="film-target"]');
    const video = videoOf(container);
    act(() => {
      triggerIntersect(target!, true);
      video.dispatchEvent(new Event("error"));
    });
    expect(video.dataset.failed).toBe("true");
    expect(video.dataset.ready).toBe("false");
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();

  });

  test("pauses a playing film when its scene unmounts", () => {
    const { container, unmount } = render(<FilmHarness />);
    const target = container.querySelector('[data-testid="film-target"]');
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);

    act(() => {
      triggerIntersect(target!, true);
    });
    pause.mockClear();

    unmount();
    expect(pause).toHaveBeenCalledTimes(1);
  });
});
