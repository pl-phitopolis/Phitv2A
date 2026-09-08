import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { COMPANY, DELIVERY } from "../content";

/**
 * `CompanyFilm`, ported from `cinematic/CinematicHome.tsx` verbatim for its
 * IntersectionObserver play/pause behaviour: the clip only decodes and plays
 * once it is near the viewport, and is paused whenever the page's motion is
 * paused or reduced. `videoAriaLabel` now comes from `content.ts` rather than
 * a literal, and the old on-frame text caption is dropped along with the rest
 * of the imagery demotion (design-bar rule 1 territory does not apply to
 * video, but the caption duplicated `aria-label` for no reason and is cut).
 */
function CompanyFilm({ paused, ariaLabel }: { paused: boolean; ariaLabel: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
        if (entry?.isIntersecting && !paused) void video.play().catch(() => undefined);
        else video.pause();
      },
      { rootMargin: "120px" },
    );
    observer.observe(video);
    if (paused) video.pause();
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [paused, failed, near]);
  return (
    <div className="hv3-company-film">
      {!failed ? (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/daily-life-poster.jpg"
          aria-label={ariaLabel}
          onError={() => setFailed(true)}
        >
          {near && <source src="/videos/daily-life-loop.mp4" type="video/mp4" />}
        </video>
      ) : (
        <div className="hv3-film-fallback">
          Phitopolis
          <br />
          <span>{COMPANY.locationLine}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Act III — Method (Delivery, then Company).
 *
 * Delivery is a centered three-step process line with no field. Company is a
 * split copy / video, the act's only image-and-text split (design-bar rule
 * 10 caps consecutive splits at two; Opening's full-bleed field does not
 * count as a split, so this is the first). Delivery node 01 is `seed-to`,
 * the arrival point of the `process` shot from Proof's last application
 * numeral. The company section's gold rule is `bloom-from`, the source of
 * the `verdict` shot into Ask's closing ground wash.
 */
export function ActMethod({ paused }: { paused: boolean }) {
  return (
    <section
      data-hv3-act-panel="method"
      id="method"
      aria-labelledby="hv3-method-title"
      className="hv3-method"
    >
      <div className="hv3-delivery hv3-band-light">
        <span className="hv3-kicker" aria-hidden="true">
          {DELIVERY.kicker}
        </span>
        <h2 id="hv3-method-title" data-hv3-heading tabIndex={-1}>
          {DELIVERY.headline}
        </h2>
        <p className="hv3-delivery-intro">{DELIVERY.intro}</p>
        <div className="hv3-delivery-steps">
          <div className="hv3-delivery-line" aria-hidden="true" />
          {DELIVERY.steps.map((step, i) => (
            <article key={step.title}>
              <div
                className="hv3-step-node"
                aria-hidden="true"
                data-hv3-vt={i === 0 ? "seed-to" : undefined}
              >
                0{i + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <span className="hv3-delivery-footnote">{DELIVERY.footnote}</span>
      </div>

      <div className="hv3-company" id="company">
        <div>
          <span className="hv3-kicker" aria-hidden="true">
            {COMPANY.kicker}
          </span>
          <h2>{COMPANY.headline}</h2>
          <div className="hv3-company-rule" data-hv3-vt="bloom-from" aria-hidden="true" />
          {COMPANY.bodies.map((body) => (
            <p key={body}>{body}</p>
          ))}
          <Link to="/about" className="hv3-link">
            {COMPANY.link.label}
            <span aria-hidden="true">↗</span>
          </Link>
          <div className="hv3-geography">
            <span className="hv3-dot" /> {COMPANY.locationLine}
          </div>
        </div>
        <CompanyFilm paused={paused} ariaLabel={COMPANY.videoAriaLabel} />
      </div>
    </section>
  );
}
