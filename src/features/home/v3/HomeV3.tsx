import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useEntranceSettled, useReducedMotion } from "@/shared/motion";
import { useTransitionCurtain } from "@/shared/components/transitionCurtainContext";
import { SmoothScroll } from "@/shared/components/SmoothScroll";
import { ActOpening } from "./acts/ActOpening";
import { ActProof } from "./acts/ActProof";
import { ActMethod } from "./acts/ActMethod";
import { ActAsk } from "./acts/ActAsk";
import { ActBoundary } from "./boundaries/ActBoundary";
import { HV3_ASK_PILL_CLEAR_MS, HV3_ASK_PILL_SHOT } from "./homeV3Motion";
import { useHomeV3Motion } from "./useHomeV3Motion";
import { SignalField } from "./visuals/SignalField";
import "./homeV3.css";
import "./visuals/signalField.css";
import "./visuals/parallax.css";
import "./visuals/invertedBand.css";

const NAV = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Careers", "/careers"],
  ["Blog", "/blog"],
] as const;

const HV3_SECTIONS = [
  { id: "opening", label: "Opening" },
  { id: "proof", label: "Proof" },
  { id: "method", label: "Method" },
  { id: "ask", label: "Ask" },
] as const;

/**
 * Home V3 composition root.
 *
 * Mounts the four acts and the three boundary markers between them, and owns
 * every piece of chrome ported from `cinematic/CinematicHome.tsx` per the
 * package brief: the masthead/mobile menu with Escape and focus return, the
 * motion pause/resume control, the footer, and the screen-reader section
 * nav. `useHomeV3Motion` (built alongside this package, see its own file for
 * the ScrollTrigger/View Transition mechanics this component intentionally
 * knows nothing about) owns every gsap/ScrollTrigger/`startViewTransition`
 * call; this file contains none.
 *
 * `data-hv3-act` starts at `"opening"` — the reader's first paint is Act I,
 * and `useHomeV3Motion` updates it as boundaries fire.
 *
 * The pause/resume control's reach is narrower here than in `CinematicHome`:
 * there it could gate a whole `useGSAP` scope via a dependency array. Here,
 * `useHomeV3Motion`'s only parameter is `scopeRef` (see the package 5 brief,
 * fixed by contract with the concurrently-built hook), so a manual pause
 * cannot suppress its internal `matchMedia` gate or its boundary triggers.
 * What it *can* and does do, matching `CinematicHome`'s own scope: it stops
 * `SmoothScroll` from mounting (no Lenis smoothing while paused) and pauses
 * `CompanyFilm`'s video, exactly as the ported control does today. Flagged
 * for whoever reviews `useHomeV3Motion` against this file: if boundary
 * transitions should also freeze under a manual pause, that hook needs a
 * second input, which is out of this package's file scope to add.
 */
export function HomeV3() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const { navigateWithCurtain } = useTransitionCurtain();
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const ready = useEntranceSettled();
  const staticMotion = paused || !!reduced;

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);

  useHomeV3Motion(scopeRef);

  function jumpToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" });
    window.history.replaceState(window.history.state, "", `#${id}`);
  }

  return (
    <div
      className="hv3"
      data-hv3-act="opening"
      ref={scopeRef}
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
        if (
          !link ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          link.target === "_blank"
        )
          return;
        const href = link.getAttribute("href");
        if (!href?.startsWith("/") || href === "/") return;
        event.preventDefault();
        setMenu(false);

        /**
         * VT-5, the closing CTA's morph into /contact, is armed HERE and not in
         * `ActAsk`.
         *
         * This is an `onClickCapture` on the whole page, so it runs before the
         * clicked `<Link>`'s own handler and before any `onClick` on the CTA
         * itself, and it calls `preventDefault()`. An `onClick` on the CTA
         * therefore always sees `event.defaultPrevented === true` and correctly
         * bails, which meant an earlier implementation's attribute write never
         * executed: measured in Chrome, the click navigated fine and the shot
         * attribute was never set once, so the shared element was never named
         * and no morph happened. Arming it in the one handler that is
         * guaranteed to run removes the ordering problem entirely.
         *
         * Reduced motion is not special-cased: `navigateWithCurtain` already
         * skips the view transition under reduce, and the name is only ever
         * applied by a CSS rule keyed on this attribute, so with no transition
         * running there is nothing for it to name.
         */
        if (link.closest('[data-hv3-vt="ask-pill"]') && reduced !== true) {
          document.documentElement.dataset.hv3Shot = HV3_ASK_PILL_SHOT;
          window.setTimeout(() => {
            if (document.documentElement.dataset.hv3Shot === HV3_ASK_PILL_SHOT) {
              delete document.documentElement.dataset.hv3Shot;
            }
          }, HV3_ASK_PILL_CLEAR_MS);
        }

        navigateWithCurtain(href);
      }}
    >
      {!staticMotion && ready && <SmoothScroll />}
      <header className="hv3-masthead">
        <Link to="/" className="hv3-brand" aria-label="Phitopolis home">
          <img src="/phitopolis_logo_hero.svg" alt="" width="30" height="34" />
          <span>
            PHITOPOLIS<span className="hv3-brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="hv3-desktop-nav">
          {NAV.map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="hv3-nav-contact">
          Let’s talk <span aria-hidden="true">↗</span>
        </Link>
        <button
          className="hv3-motion-button"
          aria-label={
            reduced ? "Reduced motion enabled" : paused ? "Resume motion" : "Pause motion"
          }
          aria-pressed={staticMotion}
          disabled={!!reduced}
          onClick={() => setPaused(!paused)}
        >
          {staticMotion ? "▷" : "Ⅱ"}
        </button>
        <button
          ref={menuButton}
          className="hv3-menu-button"
          aria-expanded={menu}
          aria-controls="hv3-mobile-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close −" : "Menu +"}
        </button>
        {menu && (
          <nav id="hv3-mobile-nav" className="hv3-mobile-nav" aria-label="Mobile navigation">
            {NAV.map(([label, to]) => (
              <Link key={to} to={to} onClick={() => setMenu(false)}>
                {label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setMenu(false)}>
              Contact ↗
            </Link>
          </nav>
        )}
      </header>

      <ActOpening />
      {/*
        The boundaries carry the page's one signature visual instead of the
        half-viewport of empty navy they used to be. Scattered ticks of market
        noise resolve toward a single gold line, further at each crossing, which
        is the firm's actual pitch rather than decoration. `stage` is the only
        thing that differs between them.
      */}
      <ActBoundary from="opening" to="proof" shot="proof">
        <SignalField stage={0} className="hv3-signal--fill" />
      </ActBoundary>
      <ActProof />
      <ActBoundary from="proof" to="method" shot="process">
        <SignalField stage={1} className="hv3-signal--fill" />
      </ActBoundary>
      <ActMethod paused={staticMotion} />
      <ActBoundary from="method" to="ask" shot="verdict">
        <SignalField stage={2} className="hv3-signal--fill" />
      </ActBoundary>
      <ActAsk />

      <footer className="hv3-footer">
        <Link to="/" className="hv3-footer-wordmark">
          PHITOPOLIS<span>.</span>
        </Link>
        <div className="hv3-footer-bottom">
          <span>© {new Date().getFullYear()} Phitopolis</span>
          <nav aria-label="Footer navigation">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/careers">Careers ↗</Link>
          </nav>
          <button aria-pressed={staticMotion} disabled={!!reduced} onClick={() => setPaused(!paused)}>
            {reduced ? "Reduced motion enabled" : paused ? "Resume motion" : "Pause motion"}{" "}
            <span aria-hidden="true">{staticMotion ? "▷" : "Ⅱ"}</span>
          </button>
        </div>
      </footer>

      <nav className="hv3-sr-only" aria-label="Page sections">
        {HV3_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={(event) => jumpToSection(event, s.id)}>
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
