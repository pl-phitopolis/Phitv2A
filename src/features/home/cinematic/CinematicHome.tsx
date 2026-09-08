import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEntranceSettled, useReducedMotion } from "@/shared/motion";
import { useTransitionCurtain } from "@/shared/components/transitionCurtainContext";
import { SmoothScroll } from "@/shared/components/SmoothScroll";
import { CINEMATIC_HOME_SECTIONS } from "@/shared/sections";
import { APPLICATIONS, CAPABILITIES, DELIVERY } from "./content";
import "./cinematic.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const NAV = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Careers", "/careers"],
  ["Blog", "/blog"],
] as const;

function Artwork({
  name,
  alt = "",
  priority = false,
  className = "",
}: {
  name: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`ch-art ${className}`}
      data-media-failed={failed || undefined}
    >
      {!failed && (
        <picture>
          <source
            media="(max-width: 899px)"
            srcSet={`/images/cinematic/${name}-mobile.webp`}
          />
          <img
            src={`/images/cinematic/${name}.webp`}
            alt={alt}
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
        <svg viewBox="0 0 900 600" aria-hidden="true" className="ch-fallback">
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
function ArrowLink({
  to,
  children,
  primary = false,
}: {
  to: "/contact" | "/about" | "/services";
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link to={to} className={`ch-link ${primary ? "ch-link-primary" : ""}`}>
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
function Diagram({ index }: { index: number }) {
  return (
    <svg className="ch-diagram" viewBox="0 0 420 160" aria-hidden="true">
      <path
        className="ch-diagram-grid"
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
            className="ch-diagram-gold"
            d="M20 112C70 112 76 25 130 64S194 136 233 82S305 59 400 65"
          />
        </>
      ) : index === 1 ? (
        <>
          <path
            className="ch-diagram-gold"
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
          <path className="ch-diagram-gold" d="M70 80H350M210 30V130" />
          <circle cx="70" cy="80" r="6" />
          <circle cx="350" cy="80" r="6" />
          <circle cx="210" cy="30" r="6" />
        </>
      )}
    </svg>
  );
}
function CompanyFilm({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video || failed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
        if (entry?.isIntersecting && !paused)
          void video.play().catch(() => undefined);
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
    <div className="ch-company-film">
      {!failed ? (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/daily-life-poster.jpg"
          aria-label="A look inside Phitopolis"
          onError={() => setFailed(true)}
        >
          {near && (
            <source src="/videos/daily-life-loop.mp4" type="video/mp4" />
          )}
        </video>
      ) : (
        <div className="ch-film-fallback">
          Phitopolis
          <br />
          <span>Manila, Philippines</span>
        </div>
      )}
      <span className="ch-film-caption">
        The people behind the systems / Phitopolis
      </span>
    </div>
  );
}

export function CinematicHome() {
  const root = useRef<HTMLDivElement>(null);
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
  function jumpToSection(
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) {
    event.preventDefault();
    setPaused(true);
    // Wait for pin and Lenis teardown before resolving the native anchor geometry.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ block: "start", behavior: "instant" });
        window.history.replaceState(window.history.state, "", `#${id}`);
      }),
    );
  }
  useGSAP(
    () => {
      if (!ready || staticMotion) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const hero = root.current!.querySelector<HTMLElement>(".ch-hero")!;
          gsap
            .timeline({
              scrollTrigger: {
                id: "cinematic-opening",
                trigger: hero,
                start: "top top",
                end: "+=65%",
                pin: true,
                pinSpacing: true,
                scrub: 0.45,
                refreshPriority: 30,
              },
            })
            .fromTo(
              ".ch-hero-art",
              { scale: 1.13, xPercent: 3 },
              {
                scale: 1,
                xPercent: 0,
                duration: 0.65,
                ease: "none",
                immediateRender: false,
              },
            )
            .fromTo(
              ".ch-signal-strokes path",
              { strokeDashoffset: 500 },
              {
                strokeDashoffset: 0,
                duration: 0.25,
                stagger: 0.02,
                ease: "none",
                immediateRender: false,
              },
              0,
            )
            .to(".ch-hero-art", { scale: 1.025, duration: 0.25, ease: "none" });
          const stage =
            root.current!.querySelector<HTMLElement>(".ch-app-stage")!;
          const track = stage.querySelector<HTMLElement>(".ch-app-track")!;
          // CSS owns scene dimensions; pin teardown must not restore a stale inline height.
          stage.classList.add("ch-app-enhanced");
          const timeline = gsap.timeline({
            scrollTrigger: {
              id: "cinematic-applications",
              trigger: stage,
              start: "top top",
              end: "+=220%",
              pin: true,
              pinSpacing: true,
              scrub: 0.45,
              refreshPriority: 20,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(track, { y: 0, duration: 0.35 })
            .to(track, {
              y: () => -stage.clientHeight,
              duration: 0.6,
              ease: "power2.inOut",
            })
            .to(track, { duration: 0.5 })
            .to(track, {
              y: () => -stage.clientHeight * 2,
              duration: 0.6,
              ease: "power2.inOut",
            })
            .to(track, { duration: 0.45 });
          const delivery =
            root.current!.querySelector<HTMLElement>(".ch-delivery-stage")!;
          gsap
            .timeline({
              scrollTrigger: {
                id: "cinematic-delivery",
                trigger: delivery,
                start: "top top",
                end: "+=65%",
                pin: true,
                pinSpacing: true,
                scrub: 0.45,
                refreshPriority: 10,
              },
            })
            .fromTo(
              ".ch-delivery-line",
              { scaleX: 0 },
              {
                scaleX: 1,
                transformOrigin: "left",
                duration: 1,
                ease: "none",
                immediateRender: false,
              },
            );
          return () => stage.classList.remove("ch-app-enhanced");
        },
      );
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root
          .current!.querySelectorAll(".ch-diagram")
          .forEach((diagram, index) => {
            gsap.fromTo(
              diagram,
              { y: 16, opacity: 0.3 },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                immediateRender: false,
                scrollTrigger: {
                  id: `cinematic-diagram-${index}`,
                  trigger: diagram,
                  start: "top 90%",
                  once: true,
                },
              },
            );
          });
      });
      let cancelled = false;
      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { scope: root, dependencies: [ready, staticMotion], revertOnUpdate: true },
  );

  return (
    <div
      className="ch"
      ref={root}
      data-motion={staticMotion ? "static" : "full"}
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
          "a",
        );
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
        navigateWithCurtain(href);
      }}
    >
      {!staticMotion && <SmoothScroll />}
      <header className="ch-masthead">
        <Link to="/" className="ch-brand" aria-label="Phitopolis home">
          <img src="/phitopolis_logo_hero.svg" alt="" width="30" height="34" />
          <span>
            PHITOPOLIS<span className="ch-brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="ch-desktop-nav">
          {NAV.map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="ch-nav-contact">
          Let’s talk <span aria-hidden="true">↗</span>
        </Link>
        <button
          className="ch-motion-button"
          aria-label={
            reduced
              ? "Reduced motion enabled"
              : paused
                ? "Resume motion"
                : "Pause motion"
          }
          aria-pressed={staticMotion}
          disabled={!!reduced}
          onClick={() => setPaused(!paused)}
        >
          {staticMotion ? "▷" : "Ⅱ"}
        </button>
        <button
          ref={menuButton}
          className="ch-menu-button"
          aria-expanded={menu}
          aria-controls="ch-mobile-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close −" : "Menu +"}
        </button>
        {menu && (
          <nav
            id="ch-mobile-nav"
            className="ch-mobile-nav"
            aria-label="Mobile navigation"
          >
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
      <section className="ch-hero" id="opening" aria-labelledby="ch-title">
        <Artwork name="architecture" priority className="ch-hero-art" />
        <div className="ch-hero-shade" />
        <svg
          className="ch-signal-strokes"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${830 + i * 24} 900 L${870 + i * 24} 590 L${1030 + i * 24} 350`}
            />
          ))}
        </svg>
        <div className="ch-hero-copy">
          <p className="ch-eyebrow">
            <span className="ch-dot" /> Quantitative research & engineering
          </p>
          <h1 id="ch-title">
            Research translated <br />
            into{" "}
            <em>
              working
              <br className="ch-desktop-break" /> systems.
            </em>
          </h1>
          <p className="ch-hero-description">
            We bring quantitative research, software engineering, and technical
            operations together for global markets.
          </p>
          <ArrowLink to="/contact" primary>
            Start a conversation
          </ArrowLink>
        </div>
        <div className="ch-hero-bottom">
          <span>Based in Manila. Built for global markets.</span>
          <a
            href="#capabilities"
            onClick={(event) => jumpToSection(event, "capabilities")}
          >
            Explore the work <span aria-hidden="true">↓</span>
          </a>
        </div>
        <span className="ch-art-label">
          Research / Engineering / Operations
        </span>
      </section>
      <section
        className="ch-capabilities ch-section"
        id="capabilities"
        aria-labelledby="ch-cap-title"
      >
        <div className="ch-section-heading">
          <p className="ch-eyebrow">01 / What we do</p>
          <h2 id="ch-cap-title">
            From models <br />
            to infrastructure<span className="ch-gold">.</span>
          </h2>
          <p className="ch-section-intro">
            The best ideas need more than a model.
            <br />
            They need the engineering to make them work.
          </p>
        </div>
        <div className="ch-cap-list">
          {CAPABILITIES.map((c, i) => (
            <article className="ch-cap-row" key={c.title}>
              <span className="ch-index">0{i + 1}</span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <ul>
                  {c.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <Diagram index={i} />
            </article>
          ))}
        </div>
        <ArrowLink to="/services">Explore our capabilities</ArrowLink>
      </section>
      <section id="applications" aria-labelledby="ch-app-title">
        <div className="ch-app-heading ch-section">
          <p className="ch-eyebrow">02 / In practice</p>
          <h2 id="ch-app-title">
            Where the work runs<span className="ch-gold">.</span>
          </h2>
          <p>Complex problems. Concrete engineering.</p>
        </div>
        <div className="ch-app-stage">
          <div className="ch-app-track">
            {APPLICATIONS.map((app, i) => (
              <article
                className={`ch-application ch-application-${app.id}`}
                key={app.id}
              >
                <Artwork name={app.id} alt={app.alt} />
                <div className="ch-app-shade" />
                <div className="ch-app-copy">
                  <p className="ch-eyebrow">
                    0{i + 1} / {app.label}
                  </p>
                  <h3>{app.title}</h3>
                  <p className="ch-app-problem">{app.problem}</p>
                  <p>{app.contribution}</p>
                  <span className="ch-app-detail">{app.detail}</span>
                </div>
                <div className="ch-app-number" aria-hidden="true">
                  0{i + 1}
                  <span> / 03</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="ch-delivery-stage ch-section"
        id="delivery"
        aria-labelledby="ch-delivery-title"
      >
        <p className="ch-eyebrow">03 / How we work</p>
        <h2 id="ch-delivery-title">
          Define. Build. <em>Operate.</em>
        </h2>
        <p className="ch-delivery-intro">
          A connected approach, from the first question
          <br />
          to the systems that answer it.
        </p>
        <div className="ch-delivery-steps">
          <div className="ch-delivery-line" aria-hidden="true" />
          {DELIVERY.map((step, i) => (
            <article key={step.title}>
              <div className="ch-step-node" aria-hidden="true">
                0{i + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <span className="ch-delivery-footnote">
          Research informs the build. Operations inform what comes next.
        </span>
      </section>
      <section
        className="ch-company ch-section"
        id="company"
        aria-labelledby="ch-company-title"
      >
        <div>
          <p className="ch-eyebrow">04 / The company</p>
          <h2 id="ch-company-title">
            Built in Manila. <br />
            <em>Working globally.</em>
          </h2>
          <p>
            Engineers, researchers, and technical specialists working together
            on the challenges of financial technology.
          </p>
          <p>
            Our leadership brings experience from global financial institutions.
            Our teams bring the research and engineering to put that experience
            to work.
          </p>
          <ArrowLink to="/about">Meet Phitopolis</ArrowLink>
          <div className="ch-geography">
            <span className="ch-dot" /> Manila{" "}
            <span>14.5995° N / 120.9842° E</span>
          </div>
        </div>
        <CompanyFilm paused={staticMotion} />
      </section>
      <section
        className="ch-closing ch-section"
        id="contact"
        aria-labelledby="ch-close-title"
      >
        <Artwork name="architecture" />
        <div className="ch-close-shade" />
        <div className="ch-close-copy">
          <p className="ch-eyebrow">05 / Your next challenge</p>
          <h2 id="ch-close-title">
            Bring us <br />
            the <em>hard problem.</em>
          </h2>
          <ArrowLink to="/contact" primary>
            Start a conversation
          </ArrowLink>
        </div>
      </section>
      <footer className="ch-footer">
        <Link to="/" className="ch-footer-wordmark">
          PHITOPOLIS<span>.</span>
        </Link>
        <div className="ch-footer-bottom">
          <span>© {new Date().getFullYear()} Phitopolis</span>
          <nav aria-label="Footer navigation">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/careers">Careers ↗</Link>
          </nav>
          <button
            aria-pressed={staticMotion}
            disabled={!!reduced}
            onClick={() => setPaused(!paused)}
          >
            {reduced
              ? "Reduced motion enabled"
              : paused
                ? "Resume motion"
                : "Pause motion"}{" "}
            <span aria-hidden="true">{staticMotion ? "▷" : "Ⅱ"}</span>
          </button>
        </div>
      </footer>
      <nav className="ch-sr-only" aria-label="Page sections">
        {CINEMATIC_HOME_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(event) => jumpToSection(event, s.id)}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
