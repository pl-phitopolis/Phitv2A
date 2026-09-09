import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useForkRef } from "@mui/material/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useReducedMotion } from "@/shared/motion";
import { useStagePresence } from "@/shared/components/stage/stagePresence";
import { NAV_ANCHORS } from "@/shared/components/NavbarContext";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { refreshPriorityFor } from "@/shared/motion/beatThresholds";
import { sectionOrder } from "@/shared/sections";

import { filmScene, type FilmSceneName } from "./homeScenes";
import { useSceneFilm } from "./useSceneFilm";
import "./HomeFilmScene.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface HomeFilmSceneProps {
  scene: FilmSceneName;
}

/**
 * How many viewport-heights of scroll the visual cut itself (shutters close,
 * copy shifts, aperture opens) should consume, regardless of how long the
 * scene's overall pin is. The rest of the pin is dwell/read time for the
 * settled narration and CTA, not more cut animation.
 */
const CUT_VH = 0.2;

/**
 * A concise, independent cinematic stage. The only scroll-linked properties
 * are local masks and copy position; video playback remains a normal forward
 * movie so reverse and high-speed scrolling never causes seek churn.
 */
export function HomeFilmScene({ scene }: HomeFilmSceneProps) {
  const config = filmScene(scene);
  const order = sectionOrder(config.id);
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() === true;
  const { videoRef, shouldLoad, showVideo, failed, reduced: filmReduced, onPlay, onError } = useSceneFilm(rootRef);

  useStagePresence(rootRef, config.presenceId, order);
  // Both scenes render on a dark ground (`data-ground="dark"` below); the
  // navbar needs a matching anchor per scene so chrome stays in sync once
  // this replaces `ClosingVideoSection` (which registered HOME_CLOSING) and
  // for the new proof-film beat (which had no anchor at all before).
  const anchorRef = useNavbarAnchor(
    scene === "closing" ? NAV_ANCHORS.HOME_CLOSING : NAV_ANCHORS.PROOF_FILM,
    { dark: true },
  );
  const attachRefs = useForkRef(rootRef, anchorRef);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const shutterPanels = root.querySelectorAll<HTMLElement>(".home-film__shutter-panel");
      const aperture = root.querySelector<HTMLElement>(".home-film__aperture");
      const aperturePanels = root.querySelectorAll<HTMLElement>(".home-film__aperture-panel");
      const copy = root.querySelector<HTMLElement>(".home-film__copy");
      if (!copy) return;

      // DOM/CSS defaults are readable. The timeline only overlays a short,
      // deterministic cut after the stage enters, leaving the entire copy
      // layer above the masks so a focused CTA is never visually covered.
      const cutFraction = CUT_VH / config.pinVh;
      const makeCut = (duration: number) => {
        const timeline = gsap.timeline();
        // Hold the timeline at its full travel distance; the actual cut only
        // occupies its first fraction, leaving a deliberate reading dwell.
        timeline.to({}, { duration }, 0);
        timeline.fromTo(
          copy,
          { yPercent: 0 },
          { yPercent: -8, ease: "none", duration: 0.16 * cutFraction, immediateRender: false },
          0,
        );

        if (scene === "proof") {
          // Proof gets a clean mechanical shutter: close on the statement,
          // then release it back to the proof footage. The closing aperture is
          // deliberately absent here so the two stages don't repeat a trick.
          timeline.fromTo(
            shutterPanels,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", duration: 0.26 * cutFraction, immediateRender: false },
            0.16 * cutFraction,
          );
          timeline.fromTo(
            copy,
            { yPercent: -8 },
            { yPercent: 0, ease: "none", duration: 0.16 * cutFraction, immediateRender: false },
            0.58 * cutFraction,
          );
          timeline.fromTo(
            shutterPanels,
            { scaleX: 1 },
            { scaleX: 0, ease: "none", duration: 0.26 * cutFraction, immediateRender: false },
            0.58 * cutFraction,
          );
          return timeline;
        }

        // Closing gets an aperture opening from navy into the delivery film.
        // Animate the parent as well as its four panels: its CSS default is
        // intentionally hidden, so touching only a child would be inert.
        if (aperture) {
          timeline.fromTo(
            aperture,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: 0.01 * cutFraction, immediateRender: false },
            0.16 * cutFraction,
          );
          timeline.fromTo(
            aperturePanels,
            { scale: 1 },
            { scale: 0, ease: "none", duration: 0.36 * cutFraction, immediateRender: false },
            0.17 * cutFraction,
          );
          timeline.fromTo(
            copy,
            { yPercent: -8 },
            { yPercent: 0, ease: "none", duration: 0.16 * cutFraction, immediateRender: false },
            0.53 * cutFraction,
          );
          timeline.fromTo(
            aperture,
            { autoAlpha: 1 },
            { autoAlpha: 0, ease: "none", duration: 0.01 * cutFraction, immediateRender: false },
            0.69 * cutFraction,
          );
        }
        return timeline;
      };

      const media = gsap.matchMedia();
      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const timeline = makeCut(1);
        const trigger = ScrollTrigger.create({
          trigger: root,
          pin: true,
          id: `home-film-${scene}`,
          start: "top top",
          end: () => `+=${String(window.innerHeight * config.pinVh)}`,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: refreshPriorityFor(order),
          animation: timeline,
        });
        return () => {
          trigger.kill();
          timeline.kill();
        };
      });
      media.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
        const timeline = makeCut(0.22);
        const trigger = ScrollTrigger.create({
          trigger: root,
          id: `home-film-${scene}`,
          start: "top 75%",
          end: "bottom 25%",
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: refreshPriorityFor(order),
          animation: timeline,
        });
        return () => {
          trigger.kill();
          timeline.kill();
        };
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [config.pinVh, order, reduced] },
  );

  const isClosing = scene === "closing";
  return (
    <section
      ref={attachRefs}
      id={config.id}
      className={`home-film home-film--${scene}`}
      data-testid={`${scene}-film-scene`}
      data-ground="dark"
      aria-label={isClosing ? "Get in touch" : "From idea to proof"}
    >
      <img className="home-film__poster" src={config.media.poster} alt="" aria-hidden="true" />
      <video
        ref={videoRef}
        className="home-film__video"
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        data-ready={showVideo ? "true" : "false"}
        onPlay={onPlay}
        onError={onError}
      >
        {shouldLoad && !filmReduced && !failed
          ? config.media.sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)
          : null}
      </video>
      <div className="home-film__scrim" aria-hidden="true" />
      <div className="home-film__shutters" aria-hidden="true">
        <span className="home-film__shutter-panel home-film__shutter-panel--left" />
        <span className="home-film__shutter-panel home-film__shutter-panel--right" />
      </div>
      <div className="home-film__aperture" aria-hidden="true">
        <span className="home-film__aperture-panel home-film__aperture-panel--tl" />
        <span className="home-film__aperture-panel home-film__aperture-panel--tr" />
        <span className="home-film__aperture-panel home-film__aperture-panel--bl" />
        <span className="home-film__aperture-panel home-film__aperture-panel--br" />
      </div>
      <div className="home-film__copy">
        <p className="home-film__eyebrow">{isClosing ? "THE NEXT QUESTION" : "FROM IDEA TO PROOF"}</p>
        <h2>{config.narration}</h2>
        <p className="home-film__support">
          {isClosing
            ? "The work starts with a conversation."
            : "We take the difficult work from possibility to production."}
        </p>
        {isClosing ? <Link className="home-film__cta" to="/contact">Start a conversation</Link> : null}
      </div>
      {failed ? <span className="home-film__status">Film unavailable</span> : null}
    </section>
  );
}
