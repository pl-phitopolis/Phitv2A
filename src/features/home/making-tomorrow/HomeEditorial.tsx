import type { CSSProperties } from "react";

import { Link } from "@tanstack/react-router";

import { CONTENT } from "@/shared/content";
import { ReachMap } from "@/shared/components/ReachMap";
import { NAV_ANCHORS } from "@/shared/components/navbarAnchors";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { NOIR } from "@/shared/theme/palette";

import "./HomeEditorial.css";

const { salesPitch } = CONTENT.hero;

const editorialVars = {
  "--editorial-navy": NOIR.navyField,
  "--editorial-navy-rgb": NOIR.navyFieldRgb,
  "--editorial-gold": NOIR.gold,
  "--editorial-gold-rgb": NOIR.goldRgb,
  "--editorial-paper": NOIR.panel,
  "--editorial-white": NOIR.frost,
  "--editorial-rule": `rgba(${NOIR.navyFieldRgb}, 0.17)`,
} as CSSProperties;

function SectionMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="editorial-marker">
      <span>{index}</span>
      <span className="editorial-marker-line" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function EditorialGlobe() {
  return (
    <div className="editorial-globe" aria-hidden="true">
      <span className="editorial-globe-ring editorial-globe-ring--outer" />
      <span className="editorial-globe-ring editorial-globe-ring--inner" />
      <span className="editorial-globe-lat editorial-globe-lat--one" />
      <span className="editorial-globe-lat editorial-globe-lat--two" />
      <span className="editorial-globe-lon editorial-globe-lon--one" />
      <span className="editorial-globe-lon editorial-globe-lon--two" />
      <span className="editorial-globe-dot editorial-globe-dot--manila" />
      <span className="editorial-globe-dot editorial-globe-dot--london" />
      <span className="editorial-globe-dot editorial-globe-dot--new-york" />
      <span className="editorial-globe-dot editorial-globe-dot--hong-kong" />
      <span className="editorial-globe-arc editorial-globe-arc--one" />
      <span className="editorial-globe-arc editorial-globe-arc--two" />
    </div>
  );
}

export function HomeThesis() {
  const { heroLine, execSummary, cta } = salesPitch;
  const thesisAnchorRef = useNavbarAnchor(NAV_ANCHORS.HOME_SERVICES, { dark: false });
  const marketsAnchorRef = useNavbarAnchor(NAV_ANCHORS.GLOBAL_MARKETS, { dark: false });
  const marketsSummary = execSummary.replace(
    /^At Phitopolis, we view global markets as the ultimate intellectual puzzle\.\s*/,
    "",
  );

  return (
    <div className="home-editorial editorial-thesis-group" style={editorialVars}>
      <section
        id="hero-mission"
        ref={thesisAnchorRef}
        className="editorial-section editorial-thesis"
        aria-labelledby="thesis-title"
      >
        <div className="editorial-container">
          <SectionMarker index="01" label="The thesis" />
          <div className="editorial-thesis-grid">
            <div className="editorial-thesis-copy">
              <p className="editorial-eyebrow">Quantitative R&amp;D partner</p>
              <h2 id="thesis-title" className="editorial-display editorial-display--thesis">
                The quantitative R&amp;D partner for global markets.
              </h2>
              <p className="editorial-lead">{heroLine.subheading}</p>
              <Link className="editorial-link editorial-link--filled" to={cta.to}>
                <span>{cta.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="editorial-thesis-visual">
              <EditorialGlobe />
              <p className="editorial-caption">Manila / London / New York / Hong Kong</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="global-markets"
        ref={marketsAnchorRef}
        className="editorial-section editorial-markets"
        aria-labelledby="markets-title"
      >
        <div className="editorial-container">
          <SectionMarker index="02" label="Global markets" />
          <div className="editorial-markets-grid">
            <div className="editorial-markets-heading">
              <h2 id="markets-title" className="editorial-display editorial-display--markets">
                At Phitopolis, we view <em>global markets</em> as the ultimate intellectual puzzle.
              </h2>
            </div>
            <div className="editorial-markets-body">
              <p className="editorial-copy">{marketsSummary}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HomeDisciplines() {
  const pillars = salesPitch.pillars;
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.HOME_PILLARS, { dark: false });

  return (
    <section
      id="hero-pillars"
      ref={anchorRef}
      className="home-editorial editorial-section editorial-disciplines"
      style={editorialVars}
      aria-labelledby="disciplines-title"
    >
      <div className="editorial-container">
        <SectionMarker index="03" label="Disciplines" />
        <div className="editorial-intro editorial-intro--disciplines">
          <p className="editorial-eyebrow">Three disciplines. One continuous practice.</p>
          <h2 id="disciplines-title" className="editorial-display">Research, engineering, and delivery meet in one practice.</h2>
        </div>
        <div className="editorial-discipline-list">
          {pillars.map((pillar, index) => (
            <article className="editorial-discipline" data-even={index % 2 === 1} key={pillar.id}>
              {index % 2 === 1 ? (
                <>
                  <div className="editorial-discipline-copy">
                    <p className="editorial-index">{pillar.id} / 03</p>
                    <h3>{pillar.name}</h3>
                    <p>{pillar.detail}</p>
                  </div>
                  <div className="editorial-discipline-image-wrap">
                    <img
                      src={pillar.image}
                      alt={pillar.alt}
                      className="editorial-discipline-image"
                      width={960}
                      height={1200}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="editorial-image-index">{pillar.id}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="editorial-discipline-image-wrap">
                    <img
                      src={pillar.image}
                      alt={pillar.alt}
                      className="editorial-discipline-image"
                      width={960}
                      height={1200}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="editorial-image-index">{pillar.id}</span>
                  </div>
                  <div className="editorial-discipline-copy">
                    <p className="editorial-index">{pillar.id} / 03</p>
                    <h3>{pillar.name}</h3>
                    <p>{pillar.detail}</p>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeApplications() {
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.HOME_USE_CASES, { dark: false });

  return (
    <section
      id="use-cases"
      ref={anchorRef}
      className="home-editorial editorial-section editorial-applications"
      style={editorialVars}
      aria-labelledby="applications-title"
    >
      <div className="editorial-container">
        <SectionMarker index="04" label="Applications" />
        <div className="editorial-intro editorial-intro--applications">
          <p className="editorial-eyebrow">Selected applications</p>
          <h2 id="applications-title" className="editorial-display">Built for systems where the details carry the outcome.</h2>
        </div>
        <div className="editorial-case-list">
          {CONTENT.useCases.map((useCase, index) => (
            <article className="editorial-case" data-even={index % 2 === 1} key={useCase.id}>
              {index % 2 === 1 ? (
                <>
                  <div className="editorial-case-copy">
                    <p className="editorial-index">{useCase.caseTag}</p>
                    <h3>{useCase.title}</h3>
                    <p className="editorial-case-line">{useCase.line}</p>
                    <ul className="editorial-specs">
                      {useCase.specs.map((spec) => (
                        <li key={spec.num}>
                          <span>{spec.num}</span>
                          <span>{spec.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <figure className="editorial-case-visual">
                    <img
                      src={useCase.image}
                      alt={useCase.imageAlt}
                      width={1536}
                      height={864}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <figcaption>{useCase.tag}</figcaption>
                  </figure>
                </>
              ) : (
                <>
                  <figure className="editorial-case-visual">
                    <img
                      src={useCase.image}
                      alt={useCase.imageAlt}
                      width={1536}
                      height={864}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <figcaption>{useCase.tag}</figcaption>
                  </figure>
                  <div className="editorial-case-copy">
                    <p className="editorial-index">{useCase.caseTag}</p>
                    <h3>{useCase.title}</h3>
                    <p className="editorial-case-line">{useCase.line}</p>
                    <ul className="editorial-specs">
                      {useCase.specs.map((spec) => (
                        <li key={spec.num}>
                          <span>{spec.num}</span>
                          <span>{spec.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeGrowth() {
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.PROCESS_IMMERSIVE, { dark: false });

  return (
    <section
      id="process"
      ref={anchorRef}
      className="home-editorial editorial-section editorial-growth"
      style={editorialVars}
      aria-labelledby="growth-title"
    >
      <div className="editorial-container">
        <SectionMarker index="05" label="Growth" />
        <div className="editorial-growth-grid">
          <div>
            <p className="editorial-eyebrow">From our practices</p>
            <h2 id="growth-title" className="editorial-display">A development powerhouse, built over time.</h2>
          </div>
          <ol className="editorial-timeline">
            {CONTENT.process.phases.map((phase, index) => (
              <li key={phase.id}>
                <span className="editorial-timeline-dot" aria-hidden="true" />
                <span className="editorial-index">0{index + 1}</span>
                <h3>{phase.name}</h3>
                <p>{phase.caption}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function HomeReach() {
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.HOME_REACH, { dark: false });

  return (
    <section
      id="reach"
      ref={anchorRef}
      className="home-editorial editorial-section editorial-reach"
      style={editorialVars}
      aria-labelledby="reach-title"
    >
      <div className="editorial-container">
        <SectionMarker index="06" label="Reach" />
        <div className="editorial-reach-heading">
          <p className="editorial-eyebrow">Manila / global markets</p>
          <h2 id="reach-title" className="editorial-display">{CONTENT.ledes.reach.gunshot}</h2>
        </div>
        <div className="editorial-reach-map">
          <ReachMap />
        </div>
      </div>
    </section>
  );
}
