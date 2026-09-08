import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ASK } from "../content";
import { ActBoundary } from "../boundaries/ActBoundary";
import { SignalField } from "../visuals/SignalField";

/** See ActOpening's `Artwork` for the full rationale; re-authored per file to
 *  avoid a circular import back through `HomeV3.tsx`. */
function Artwork({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`hv3-art ${className}`}
      aria-hidden="true"
      data-media-failed={failed || undefined}
    >
      {!failed && (
        <picture className="hv3-plx-layer">
          <source media="(max-width: 899px)" srcSet="/images/cinematic/architecture-mobile.webp" />
          <img
            src="/images/cinematic/architecture.webp"
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

/**
 * Act IV — Ask. Full-bleed field (`architecture.webp` reused from Opening,
 * deliberately the heaviest scrim/blur treatment on the page, see
 * homeV3.css) + centered-left copy, one action (design-bar rule 10). The
 * field/scrim wrapper is `bloom-to`, the arrival point of the `verdict` shot
 * from Method's gold rule.
 *
 * Two stages sit on `data-hv3-ask-stage`: the closing statement, then the
 * CTA. Both render unconditionally and stay fully visible at all times, in
 * every motion mode — the CTA is the page's one conversion action and must
 * never be hidden behind a scroll trigger (see homeV3.css's "Ask stage flip"
 * comment for the defect this replaced). The `ask` shot still flips
 * `data-hv3-ask-stage` on the `.hv3` scope root, but CSS now reads it as a
 * treatment cue only: the statement settles (dims + lifts) and the CTA gets
 * a small settle-in-place lift and a gold rule sweep, all transform/opacity,
 * none of it changing layout.
 */
export function ActAsk() {

  /**
   * VT-5. Stays a real `<Link>` — middle-click, cmd/ctrl-click and "open in
   * new tab" all have to keep working, so anything that isn't a plain
   * left-click navigation is left alone and falls through to the browser's
   * default anchor behaviour.
   *
   * The morph itself is CSS-only (`viewTransitionsHomeV3.css`'s
   * `:root[data-hv3-shot="ask-pill"]` block): `document.documentElement`
   * gets the attribute right here, immediately before handing off to
   * `navigateWithCurtain`, which owns everything else — Lenis suspension,
   * the reduced-motion bypass, focus management, the deferred ScrollTrigger
   * refresh. No new navigation logic, no duplicate view-transition call.
   */
  /*
   * No click handler here on purpose.
   *
   * VT-5's shot attribute is armed by the page-level `onClickCapture` in
   * `HomeV3.tsx`, which runs first and calls `preventDefault()`. Any `onClick`
   * on this link would see `defaultPrevented` already true and never run its
   * body, which is exactly the bug an earlier version of this file shipped.
   * The CTA only needs to be a real anchor carrying `data-hv3-vt="ask-pill"`;
   * that attribute is both the morph target and the capture handler's signal.
   */

  return (
    <section
      data-hv3-act-panel="ask"
      id="ask"
      aria-labelledby="hv3-ask-title"
      className="hv3-ask"
    >
      <div className="hv3-ask-field" data-hv3-vt="bloom-to">
        <Artwork className="hv3-ask-art" />
        <div className="hv3-ask-scrim" aria-hidden="true" />
      </div>
      <div className="hv3-ask-copy">
        {/*
          The headline sits OUTSIDE both stages. It is this section's
          `aria-labelledby` target and the focus target the act gate moves
          focus to, and keeping it as one stable anchor above both stages
          (rather than inside either) is the better read regardless of the
          stages' own visibility: the line the reader came for does not move
          when the frame underneath it changes.
        */}
        <h2 id="hv3-ask-title" data-hv3-heading tabIndex={-1}>
          {ASK.headline}
        </h2>
        {/*
          Both stages render unconditionally and stay visible at all times —
          see the file-level docblock and homeV3.css's "Ask stage flip"
          comment. The CTA is never gated on the finale trigger firing.
        */}
        <div className="hv3-ask-stages">
        <div data-hv3-ask-stage="statement">
          <p>{ASK.subhead}</p>
        </div>
        <div data-hv3-ask-stage="cta">
          <Link
            to="/contact"
            className="hv3-link hv3-link-primary"
            data-hv3-vt="ask-pill"
          >
            {ASK.cta.label}
            <span aria-hidden="true">↗</span>
          </Link>
          <span className="hv3-ask-micro">{ASK.microLine}</span>
          <div className="hv3-ask-rule" aria-hidden="true" />
        </div>
        </div>
      </div>
      {/*
        The finale trigger. It sits at the END of Act IV, after the copy, so
        the reader arrives at the closing statement first and the push-in fires
        as they settle into it. `from` and `to` are both "ask" because this
        transition does not change act, it changes stage.
      */}
      <ActBoundary
        from="ask"
        to="ask"
        shot="ask"
        stageTo="cta"
        stageBack="statement"
      >
        {/* Stage 3: the signal fully resolved. The motif has been converging
            across three earlier crossings, so the last one before the ask is
            where it finally reads as one clean line. */}
        <SignalField stage={3} className="hv3-signal--fill" />
      </ActBoundary>
    </section>
  );
}
