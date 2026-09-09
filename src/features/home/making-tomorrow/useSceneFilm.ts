import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useReducedMotion } from "@/shared/motion";

/** Start only once a stage is close enough to be the reader's next stop. */
const LOAD_MARGIN = "360px 0px";

function isPromise(value: unknown): value is Promise<void> {
  return Boolean(value) && typeof (value as Promise<void>).catch === "function";
}

export interface SceneFilm {
  videoRef: RefObject<HTMLVideoElement | null>;
  shouldLoad: boolean;
  showVideo: boolean;
  failed: boolean;
  reduced: boolean;
  onPlay: () => void;
  onError: () => void;
}

/**
 * Keeps the movie independent from scroll progress. Scroll may change the
 * scene's typography and shutters, but it never seeks the video: when visible
 * a muted inline movie simply plays forward from its natural current time.
 */
export function useSceneFilm(targetRef: RefObject<HTMLElement | null>): SceneFilm {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document === "undefined" || !document.hidden,
  );
  const [showVideo, setShowVideo] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const approach = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: LOAD_MARGIN },
    );
    const visibility = new IntersectionObserver(([entry]) => {
      setNearViewport(Boolean(entry?.isIntersecting));
    });

    approach.observe(target);
    visibility.observe(target);
    return () => {
      approach.disconnect();
      visibility.disconnect();
    };
  }, [targetRef]);

  // React renders <source> only after this state changes. Calling load here
  // makes the browser evaluate that new source list exactly once per mount.
  useEffect(() => {
    const video = videoRef.current;
    if (!shouldLoad || !video) return;
    video.load();
  }, [shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || failed || !shouldLoad || !nearViewport || !pageVisible) {
      video?.pause();
      setShowVideo(false);
      return;
    }

    video.muted = true;
    video.playsInline = true;
    let cancelled = false;
    const result = video.play();
    if (isPromise(result)) {
      result.then(() => {
        if (!cancelled) setShowVideo(true);
      }).catch(() => {
        // Autoplay is an enhancement. A rejected play leaves the immediate
        // poster in place rather than a blank or frozen video frame.
        video.pause();
        if (!cancelled) setShowVideo(false);
      });
    } else {
      setShowVideo(true);
    }
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [failed, nearViewport, pageVisible, reduced, shouldLoad]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = !document.hidden;
      setPageVisible(visible);
      if (!visible) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return {
    videoRef,
    shouldLoad,
    showVideo: showVideo && !failed,
    failed,
    reduced,
    onPlay: () => setShowVideo(true),
    onError: () => {
      videoRef.current?.pause();
      setFailed(true);
      setShowVideo(false);
    },
  };
}
