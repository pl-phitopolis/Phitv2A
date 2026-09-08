import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { APPLICATIONS, CAPABILITIES } from "../content";

/** See ActOpening's `Artwork` for the full rationale; re-authored per file to
 *  avoid a circular import back through `HomeV3.tsx`. */
function Artwork({ name, className = "" }: { name: string; className?: string }) {
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
            loading="lazy"
            fetchPriority="low"
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

/** The three capability-row infographics, ported verbatim from
 *  `cinematic/CinematicHome.tsx`'s `Diagram`. These are infographics that
 *  encode each row's own content shape (design-bar deviation log item 2), not
 *  decoration, so they survive the imagery demotion untouched. */
function Diagram({ index }: { index: number }) {
  return (
    <svg className="hv3-diagram" viewBox="0 0 420 160" aria-hidden="true">
      <path
        className="hv3-diagram-grid"
        d="M0 40H420M0 80H420M0 120H420M70 0V160M140 0V160M210 0V160M280 0V160M350 0V160"
      />
      {index === 0 ? (
        <>
          {Array.from({ length: 25 }, (_, i) => (
            <circle
              key={i}
              cx={22 + i * 15}
              cy={80 + Math.sin(i * 1.7) * (60 - i * 1.8)}
              r="2"
            />
          ))}
          <path
            className="hv3-diagram-gold"
            d="M20 112C70 112 76 25 130 64S194 136 233 82S305 59 400 65"
          />
        </>
      ) : index === 1 ? (
        <>
          <path
            className="hv3-diagram-gold"
            d="M20 80H110M170 80H245M305 80H400M140 40V20H275V40M140 120V140H275V120"
          />
          {[110, 245].map((x) => (
            <rect key={x} x={x} y="40" width="60" height="80" rx="1" />
          ))}
        </>
      ) : (
        <>
          <ellipse cx="210" cy="80" rx="140" ry="50" />
          <ellipse cx="210" cy="80" rx="80" ry="50" />
          <path className="hv3-diagram-gold" d="M70 80H350M210 30V130" />
          <circle cx="70" cy="80" r="6" />
          <circle cx="350" cy="80" r="6" />
          <circle cx="210" cy="30" r="6" />
        </>
      )}
    </svg>
  );
}

/**
 * Act II — Proof (Capabilities, then Applications).
 *
 * Two layout families in sequence, each internally consistent with
 * design-bar rule 10: Capabilities is heading + three indexed rows with
 * diagrams and *no photographic field at all*; Applications is three panels,
 * each with its own field. Never the same composition twice in a row.
 *
 * Capability row 01 is `lede-to` (the `proof` shot's shared-element target,
 * arriving from Opening's claim card). The last application panel's numeral
 * is `seed-from` (the `process` shot's shared-element source, continuing into
 * Method's first delivery node).
 */
export function ActProof() {
  return (
    <section
      data-hv3-act-panel="proof"
      id="proof"
      aria-labelledby="hv3-proof-title"
      className="hv3-proof"
    >
      <div className="hv3-cap" id="capabilities">
        <div className="hv3-section-heading">
          <span className="hv3-kicker" aria-hidden="true">
            {CAPABILITIES.kicker}
          </span>
          <h2 id="hv3-proof-title" data-hv3-heading tabIndex={-1}>
            {CAPABILITIES.headline}
          </h2>
          <p className="hv3-section-intro">{CAPABILITIES.intro}</p>
        </div>
        <div className="hv3-cap-list">
          {CAPABILITIES.rows.map((row, i) => (
            <article
              className="hv3-cap-row"
              key={row.title}
              data-hv3-vt={i === 0 ? "lede-to" : undefined}
            >
              <span className="hv3-index" aria-hidden="true">
                0{i + 1}
              </span>
              <div>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                <ul>
                  {row.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <Diagram index={i} />
            </article>
          ))}
        </div>
        <Link to="/services" className="hv3-link">
          {CAPABILITIES.link.label}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="hv3-app" id="applications">
        <div className="hv3-app-heading">
          <span className="hv3-kicker" aria-hidden="true">
            {APPLICATIONS.kicker}
          </span>
          <h2>{APPLICATIONS.headline}</h2>
          <p>{APPLICATIONS.intro}</p>
        </div>
        <div className="hv3-app-list">
          {APPLICATIONS.panels.map((panel, i) => {
            const isLast = i === APPLICATIONS.panels.length - 1;
            return (
              <article className={`hv3-application hv3-application-${panel.id}`} key={panel.id}>
                <Artwork name={panel.id} className="hv3-app-art" />
                <div className="hv3-app-shade" aria-hidden="true" />
                <div className="hv3-app-copy">
                  <p className="hv3-eyebrow">
                    0{i + 1} / {panel.label}
                  </p>
                  <h3>{panel.title}</h3>
                  <p className="hv3-app-problem">{panel.problem}</p>
                  <p>{panel.contribution}</p>
                  <span className="hv3-app-detail">{panel.detail}</span>
                </div>
                <div
                  className="hv3-app-number"
                  aria-hidden="true"
                  data-hv3-vt={isLast ? "seed-from" : undefined}
                >
                  0{i + 1}
                  <span> / 0{APPLICATIONS.panels.length}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
