import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { OPENING } from "../content";

/**
 * The responsive `<picture>` + broken-image fallback ported from
 * `cinematic/CinematicHome.tsx`'s `Artwork`. Re-authored here (rather than
 * imported) because the original accepted an `alt` prop for a descriptive
 * caption; V3's imagery demotion (see homeV3.css and docs/design-bar.md) makes
 * every instance atmosphere only, so `alt` is fixed to `""` and the image is
 * always `aria-hidden`, with no caption path left for a future call site to
 * accidentally restore.
 */
function Artwork({
  name,
  priority = false,
  className = "",
}: {
  name: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`hv3-art ${className}`}
      aria-hidden="true"
      data-media-failed={failed || undefined}
    >
      {!failed && (
        <picture className="hv3-plx-layer">
          <source
            media="(max-width: 899px)"
            srcSet={`/images/cinematic/${name}-mobile.webp`}
          />
          <img
            src={`/images/cinematic/${name}.webp`}
            alt=""
            width="1536"
            height="1024"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      {failed && (
        <svg viewBox="0 0 900 600" aria-hidden="true" className="hv3-fallback">
          {Array.from({ length: 18 }, (_, i) => (
            <rect
              key={i}
              x={180 + i * 13}
              y={70 + i * 7}
              width={450 - i * 15}
              height={450 - i * 15}
              fill="none"
              stroke="currentColor"
            />
          ))}
        </svg>
      )}
    </div>
  );
}

/**
 * Act I — Opening.
 *
 * One layout family: full-bleed field + left copy (design-bar rule 10). The
 * hero's claim card (`.hv3-hero-copy`) is `lede-from`, the shared-element
 * source for the `proof` shot into Capabilities row 01.
 */
export function ActOpening() {
  return (
    <section
      data-hv3-act-panel="opening"
      id="opening"
      aria-labelledby="hv3-opening-title"
      className="hv3-opening"
    >
      <Artwork name="architecture" priority className="hv3-opening-art" />
      <div className="hv3-opening-scrim" aria-hidden="true" />
      <div className="hv3-hero-copy" data-hv3-vt="lede-from">
        <h1 id="hv3-opening-title" data-hv3-heading tabIndex={-1}>
          {OPENING.headline}
        </h1>
        <p className="hv3-hero-subhead">{OPENING.subhead}</p>
        <div className="hv3-hero-actions">
          <Link to="/contact" className="hv3-link hv3-link-primary">
            {OPENING.primaryCta.label}
            <span aria-hidden="true">↗</span>
          </Link>
          <a href={OPENING.secondaryLink.href} className="hv3-link">
            {OPENING.secondaryLink.label}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="hv3-opening-micro">
        <span>{OPENING.microLine}</span>
      </div>
    </section>
  );
}
