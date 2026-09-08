import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useReducedMotion } from "@/shared/motion";

/**
 * Gating for the daily-life culture film.
 *
 * This hook existed once, was deleted with its consumer during the WS-14 file
 * splits (docs/polish-log.md), and the section was then rebuilt in
 * `DailyLifeSection.tsx` with a hard-coded `src` + `autoPlay` and no gate — so
 * every visitor to `/` and `/about` began downloading `daily-life.mp4` on mount,
 * whether or not they ever scrolled to it. That is the single largest asset on
 * either route. `useBackgroundVideo`'s docstring still claimed this gate was
 * here; it is again.
 *
 * Why this and not `useBackgroundVideo`: there the film is decoration, so
 * reduced-motion and low-power visitors are given the poster and never the
 * video at all. Here the film **is the content** and carries real `controls`,
 * so withholding it entirely would remove content rather than remove motion.
 * The distinction this hook draws instead:
 *
 *  - nothing is fetched until the section is near the viewport (`src` stays off
 *    the element, so `preload` cannot race ahead of the gate),
 *  - playback pauses when it scrolls away or the tab is backgrounded,
 *  - reduced-motion visitors get the video, loadable and playable, but it never
 *    starts on its own — WCAG 2.2.2 is about auto-playing motion, not about
 *    denying access to the media.
 *
 * The poster paints in every case, so the card is never an empty box.
 */

/** How far outside the viewport the film starts loading. */
const PRELOAD_MARGIN = "200px";

/**
 * `play()` returns a promise in browsers and `undefined` under jsdom, so the
 * return value is checked rather than assumed. A rejection is a non-event: the
 * autoplay policy declined, and the poster stays up until the viewer presses
 * play.
 */
function safePlay(video: HTMLVideoElement): void {
  const playing = video.play() as Promise<void> | undefined;
  if (playing && typeof playing.catch === "function") playing.catch(() => {});
}

export interface DailyLifeVideo {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** True once the film may be fetched. Keep `src` off the element until then. */
  shouldLoad: boolean;
  /** True when playback must never start unprompted. */
  manualPlaybackOnly: boolean;
}

/**
 * @param targetRef the element whose visibility gates the fetch. Taken as a
 * parameter rather than returned so the caller can reuse the section ref it
 * already holds for ScrollTrigger, instead of merging two refs onto one node.
 */
export function useDailyLifeVideo(
  targetRef: RefObject<HTMLElement | null>,
): DailyLifeVideo {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const reduced = useReducedMotion();
  const manualPlaybackOnly = reduced === true;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          // Fetch on approach regardless of motion preference — the gate is
          // about bytes, and a reduced-motion visitor may still press play.
          // Playback is NOT started here: the <source> children do not exist
          // until React has rendered this state change, so play() would find an
          // empty element. The effect below picks it up instead.
          setShouldLoad(true);
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetRef]);

  // Sources are rendered as children, and appending them to a media element
  // does not by itself start a fetch — `load()` is required to make the browser
  // re-evaluate the (previously empty) source set. Only then can playback begin.
  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    video.load();
    if (!manualPlaybackOnly) safePlay(video);
  }, [shouldLoad, manualPlaybackOnly]);

  // A backgrounded tab should not keep decoding frames. Resuming is deliberately
  // not automatic: the viewer may have paused it themselves before switching away.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return { videoRef, shouldLoad, manualPlaybackOnly };
}

/**
 * The culture reel: 960x540, 45s, silent, h264, 2.67MB, poster-backed by a
 * 40KB still.
 *
 * This is a cut of `daily-life.mp4` (1280x720, 251s, 18.7MB), not a re-encode
 * of it. Re-encoding the master whole buys nothing — measured, x264 CRF 30 at
 * the `slow` preset returns 18.7MB → 17.4MB (7%), and VP9 does no better at
 * equivalent quality, because the master already sits at ~594kbps. The size was
 * a function of the 251-second **duration**, so the duration is what changed.
 *
 * No `webm` twin: at matched quality VP9 came out *larger* than h264 on this
 * source (4.9MB vs 2.5MB on a 40s test cut), so a second encode would cost
 * bytes and a request for nothing.
 *
 * The 251s master is retained in `public/videos/` for re-cutting. It is
 * referenced by nothing and can be dropped from the image once the reel is
 * signed off — see the session handover.
 */
export const DAILY_LIFE_FILM = {
  mp4: "/videos/daily-life-reel.mp4",
  poster: "/videos/daily-life-poster.jpg",
} as const;
