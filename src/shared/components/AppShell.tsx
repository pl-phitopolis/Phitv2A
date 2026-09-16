import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { SpecularFx } from "@/shared/components/ui/specular";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useLocation, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { EntrancePhaseContext, HeroCascadeContext, useReducedMotion } from "@/shared/motion";
import type { EntrancePhase } from "@/shared/motion";
import { MONO, TYPE_SCALE } from "@/shared/theme/theme";
import { motion } from "motion/react";

import { CommandPalette } from "./CommandPalette";
import { CookieNotice } from "./CookieNotice";
import { FloatingIdOverlay } from "./FloatingIdOverlay";

import { NAV_ANCHORS, NavbarProvider } from "./NavbarContext";
import { useNavbar, useNavbarAnchor } from "./navbarHooks";
import { Preloader, PRELOADER_SESSION_KEY } from "./Preloader";
import { TransitionCurtainProvider } from "./TransitionCurtain";
import { useTransitionCurtain } from "./transitionCurtainContext";
import type { LoadSignal } from "./Preloader";
import { TopNavMegaDrawer } from "./TopNavMegaDrawer";
import { MEGA_NAV_ITEMS } from "./megaNavItems";
import { SiteFooter } from "./SiteFooter";
import { RouterLink } from "./RouterLink";
import PhitopolisLogo from "./PhitopolisLogo";

import { NOIR } from "@/shared/theme/palette";
import { alpha } from "@mui/material/styles";
import { EASE_OUT_EXPO_CSS, EASE_OUT_EXPO } from "@/shared/motion/easing";
import { useNavAutohide } from "./useNavAutohide";

// The inline desktop nav-links row (standard/island modes only — see
// `isStandard || isAnyIsland` below) omits Contact, which renders as its
// own always-visible button beside it. Sourced from MEGA_NAV_ITEMS —
// TopNavMegaDrawer's nav card — so there is one list of pages, not two.
const NAV_ITEMS = MEGA_NAV_ITEMS.filter((item) => item.to !== "/contact");

const NARRATION_FLOW: Record<string, { next: string; label: string }> = {
  "/": { next: "/about", label: "ABOUT PHITOPOLIS" },
  "/about": { next: "/services", label: "CAPABILITIES & SERVICES" },
  "/services": { next: "/careers", label: "CAREERS & POSITIONS" },
  "/careers": { next: "/blog", label: "RESEARCH & ARTICLES" },
  "/blog": { next: "/contact", label: "GET IN TOUCH" },
  "/contact": { next: "/", label: "HOME" },
};

/** Gates the full ~5s choreographed intro to a visitor's genuine first load of a
 *  session — Preloader writes PRELOADER_SESSION_KEY to sessionStorage once its exit
 *  finishes (see Preloader.tsx), but nothing previously read it back, so the intro
 *  (and the ~5.4s of opaque, pointer-blocking overlay that comes with it) replayed
 *  on every hard refresh and every hard navigation, not just a visitor's first one.
 *
 *  Called from a useState lazy initializer, which runs during render — `sessionStorage`
 *  access must be guarded here rather than left to bubble, since it throws in Safari
 *  private browsing and some sandboxed/embedded contexts, and an uncaught throw during
 *  a lazy initializer would take the whole render down with it. Failing open (treat the
 *  read as "no key yet" and show the intro) is the safe default: worst case a returning
 *  visitor sees the intro again, which is what today's behavior already is for everyone,
 *  never a broken page. */
function shouldShowPreloader(reduced: boolean): boolean {
  if (reduced) return false;
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(PRELOADER_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

/** Routes warmed while the preloader plays: preloadRoute downloads + compiles
    each lazy chunk and runs its loader into the query cache, so first
    navigation anywhere is instant. Failures (e.g. API down) resolve silently —
    the bar tracks best-effort work, never blocks on it. */
const WARM_ROUTES = [
  { to: "/about", label: "ABOUT" },
  { to: "/services", label: "SERVICES" },
  { to: "/blog", label: "BLOG" },
  { to: "/contact", label: "CONTACT" },
] as const;

/**
 * Route-aware warm-up manifest — signal tiers.
 *
 * The preloader shows on a genuine first load only, so the landing `pathname`
 * IS the route the visitor arrived on. Warm *that* route's default scroll path
 * properly instead of a one-size-fits-all list that under-served `/` and
 * mis-served `/about` / `/blog`.
 *
 * Two tiers per {@link LoadSignal}:
 *  - **blocking** (absent/`undefined` on the signal): the reveal waits on it.
 *    Fonts (added in `Preloader`) + the landing route's above-fold-critical
 *    assets.
 *  - **background** (`blocking: false`): keeps warming without holding the
 *    overlay — `WARM_ROUTES` precompiles and lower/other-route imagery.
 *
 * Every path below was checked against the filesystem (`public/…`) and against
 * what the component actually renders. Deliberately absent:
 *  - `/images/topHalfHero.webp` / `botHalfHero.webp` — the old split-pane hero,
 *    replaced by `HeroImageWall`; nothing renders them any more.
 *  - The hero drift wall (`fetchPriority=low`, mounts ~60% into the hero pin).
 *  - Home now opens with text and an inline diagram; neither needs media warming.
 */
// The new hero LCP is text, with no image/video fetch dependency.
const HOME_BLOCKING: readonly string[] = [];
const HOME_BACKGROUND_IMAGES: readonly string[] = [];

/** About hero, above the fold: the skyline background loop's poster
 *  (`BackgroundReveal` → `/videos/about-hero-loop.*`) and the gold-framed primary
 *  photo (`HeroGallery` → `/images/AboutPage1.webp`). The right-hand strip column
 *  was replaced by a single framed clip off the same loop. */
const ABOUT_BLOCKING: readonly string[] = [
  "/videos/about-hero-loop-poster.jpg",
  "/images/AboutPage1.webp",
];

/** About hero loop — poster already blocks; the `webm` warms without holding the
 *  reveal (backs both `BackgroundReveal` and `HeroGallery`'s framed tile). */
const ABOUT_BACKGROUND_IMAGES: readonly string[] = [
  "/videos/about-hero-loop.webm",
];

/** Decorative hero-background loops (`VideoPageHero` on each route's hero).
 *  The poster (always shown) and the `webm` are warmed so the `<video>` plays
 *  from cache the moment its IntersectionObserver arms — the hero sits at the
 *  top of each page, so it is wanted immediately. The `mp4` fallback is left
 *  out: only Safari/iOS uses it, and there the top-of-page hero fetches it via
 *  the gate on arrival anyway. Background tier: never holds the intro reveal.
 *  ~0.9–1.8 MB per route (1280w / crf 24). */
const BLOG_VIDEO_LOOP: readonly string[] = [
  "/videos/daily-life-blog-loop.webm",
  "/videos/daily-life-blog-loop-poster.jpg",
];
const CAREERS_VIDEO_LOOP: readonly string[] = [
  "/videos/daily-life-careers-loop.webm",
  "/videos/daily-life-careers-loop-poster.jpg",
];
const SERVICES_VIDEO_LOOP: readonly string[] = [
  "/videos/daily-life-services-loop.webm",
  "/videos/daily-life-services-loop-poster.jpg",
];

export interface RouteManifest {
  /** Reveal-gating assets for this landing route. */
  blocking: readonly string[];
  /** Assets warmed in the background; never hold the overlay. */
  background: readonly string[];
}

/** The per-landing-route asset split. Routes with no bespoke manifest
 *  (`/contact`, `/innovation-hub`, …) block on fonts + their own
 *  already-loading route chunk only; everything else is background. */
export function resolveRouteManifest(rawPathname: string): RouteManifest {
  // Router config may or may not keep a trailing slash; match either form.
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  if (pathname === "/") {
    return {
      blocking: HOME_BLOCKING,
      background: HOME_BACKGROUND_IMAGES,
    };
  }
  if (pathname === "/about") {
    return { blocking: ABOUT_BLOCKING, background: ABOUT_BACKGROUND_IMAGES };
  }
  if (pathname === "/blog") {
    return { blocking: [], background: BLOG_VIDEO_LOOP };
  }
  if (pathname === "/careers") {
    return { blocking: [], background: CAREERS_VIDEO_LOOP };
  }
  if (pathname === "/services") {
    return { blocking: [], background: SERVICES_VIDEO_LOOP };
  }
  return { blocking: [], background: [] };
}

function labelForAsset(url: string): string {
  return (url.split("/").pop() || "ASSET").toUpperCase().substring(0, 15);
}

function preloadAsset(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    let doneCalled = false;
    const done = () => {
      if (!doneCalled) {
        doneCalled = true;
        resolve();
      }
    };

    // Safety timeout so no broken or slow asset ever hangs the preloader
    const timer = setTimeout(done, 1200);

    try {
      if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
        if (typeof Image !== "undefined") {
          const img = new Image();
          img.src = url;
          if (typeof img.decode === "function") {
            img.decode()
              .then(() => { clearTimeout(timer); done(); })
              .catch(() => { clearTimeout(timer); done(); });
          } else {
            img.onload = () => { clearTimeout(timer); done(); };
            img.onerror = () => { clearTimeout(timer); done(); };
          }
        } else {
          clearTimeout(timer);
          done();
        }
      } else if (typeof fetch !== "undefined") {
        fetch(url, { cache: 'force-cache' })
          .then(() => { clearTimeout(timer); done(); })
          .catch(() => { clearTimeout(timer); done(); });
      } else {
        clearTimeout(timer);
        done();
      }
    } catch {
      clearTimeout(timer);
      done();
    }
  });
}

/** A {@link LoadSignal} whose work is deferred: `promise` is created up front
 *  (so the array has its full length and identity from first render) but the
 *  underlying work only begins when `__start` is called from a mount effect —
 *  used for route warm-ups, whose `router.preloadRoute()` must not run during
 *  render. `__start` is absent on signals that start themselves. */
interface DeferredLoadSignal extends LoadSignal {
  __start?: () => void;
}

function useWarmupSignals(pathname: string): LoadSignal[] {
  const router = useRouter();

  // Asset/route warmup is a page-load concern, not an intro-overlay concern:
  // it must happen on every mount of this hook (first visit, repeat visit,
  // prefers-reduced-motion, whatever) regardless of whether the animated
  // Preloader is going to render at all. This used to take an `active`
  // param wired to `showPreloader` and skip building the signal array
  // entirely when it was false at first render — which meant repeat visits
  // and reduced-motion visitors (both cases where the intro is
  // intentionally skipped, see `shouldShowPreloader`) never warmed a single
  // image, since `useState`'s lazy initializer only ever runs once. Whether
  // the intro *plays* and whether images *warm* are independent questions;
  // this hook only answers the second one now.
  //
  // The signal array is built once, at first render, so Preloader's one-time
  // snapshot of `warmup` (when it does render) captures every signal
  // (routes + manifest + fonts) and its progress bar stays paced against
  // real work.
  //
  // The catch: router.preloadRoute() synchronously dispatches into TanStack
  // Router's Transitioner state, so calling it during render (which a useState
  // lazy initializer is) makes React warn "Cannot update a component
  // (Transitioner) while rendering a different component (AppShellInner)".
  // So each route signal ships a settled-but-not-started promise plus a
  // `__start` thunk; the mount effect below fires the actual preloadRoute()
  // after commit, where a cross-component state update is legal, and resolves
  // the signal's promise when the preload settles.
  //
  // preloadAsset() is plain fetch()/Image() — no React state — so the manifest
  // signals still kick off straight from the initializer, unchanged.
  const [signals] = useState<DeferredLoadSignal[]>(() => {
    const manifest = resolveRouteManifest(pathname);

    // Route precompiles never gate the reveal — best-effort warm work.
    const routeSignals: DeferredLoadSignal[] = WARM_ROUTES.map((route) => {
      let resolve!: () => void;
      const promise = new Promise<void>((r) => {
        resolve = r;
      });
      return {
        label: route.label,
        blocking: false,
        promise,
        __start: () => {
          router
            .preloadRoute({ to: route.to })
            .catch(() => undefined)
            .finally(resolve);
        },
      };
    });

    const blockingAssetSignals: DeferredLoadSignal[] = manifest.blocking.map((url) => ({
      label: labelForAsset(url),
      promise: preloadAsset(url),
    }));

    const backgroundAssetSignals: DeferredLoadSignal[] = manifest.background.map((url) => ({
      label: labelForAsset(url),
      blocking: false,
      promise: preloadAsset(url),
    }));

    return [...blockingAssetSignals, ...backgroundAssetSignals, ...routeSignals];
  });

  useEffect(() => {
    signals.forEach((signal) => signal.__start?.());
  }, [signals]);

  return signals;
}

/** Warmed neighbour assets, deduped across navigations for this page session. */
const warmedNeighbourAssets = new Set<string>();

/** Test seam: neighbour warming is a module-level cache, so it must be resettable. */
export function resetNeighbourWarming(): void {
  warmedNeighbourAssets.clear();
}

/**
 * Warm the *other* routes' blocking assets once the current page has settled.
 *
 * `useWarmupSignals` resolves its manifest from the landing pathname, which is
 * correct for a first load and useless for every navigation after it: arriving
 * at `/about` by clicking a nav link meant its hero poster and gallery still had
 * to be fetched from cold, while `defaultPreload: "intent"` had already taken
 * care of the JS. Chunks were warm and pictures were not — which is exactly what
 * "the about page loads so late" describes.
 *
 * Deliberately narrow:
 *  - **blocking tier only.** Those are the above-fold, reveal-gating images (two
 *    files for `/about`). Pulling neighbours' background tiers as well would put
 *    megabytes of video on the wire for pages nobody asked for.
 *  - **on idle**, so it never competes with the current route's own paint.
 *  - **deduped per page session**, so bouncing between routes re-warms nothing.
 */
function useNeighbourRouteWarming(pathname: string): void {
  useEffect(() => {
    const current = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    const urls = WARM_ROUTES.filter((route) => route.to !== current)
      .flatMap((route) => resolveRouteManifest(route.to).blocking)
      .filter((url) => !warmedNeighbourAssets.has(url));
    if (urls.length === 0) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      for (const url of urls) {
        warmedNeighbourAssets.add(url);
        void preloadAsset(url);
      }
    };

    // requestIdleCallback is unavailable in Safari <16.4 and in jsdom.
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const handle = idle(run, { timeout: 3000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(handle);
      };
    }
    const handle = window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [pathname]);
}

function AnimatedContactButton({
  label,
  sx,
  isActive,
  variant = "default",
}: {
  label: string;
  sx?: object;
  isActive?: boolean;
  variant?: "default" | "onDark";
}) {
  const [hovered, setHovered] = useState(false);
  // Was `useRouter()` + a bare `router.navigate({ to: "/contact" })` - every
  // other nav trigger (logo, desktop nav items) goes through
  // `navigateWithCurtain`, which is what actually sets `viewTransition: true`,
  // marks `data-route-transition`, and suspends/resumes Lenis around the
  // swap. Going around it here meant clicking Contact fell back to the
  // router's own untransitioned default - the "contact doesn't get the same
  // transition as the other pages" bug.
  const { navigateWithCurtain } = useTransitionCurtain();
  const onDark = variant === "onDark";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithCurtain("/contact");
  };

  // Filled pill, not a border-only chip — a solid surface so it reads as a
  // real control against the page rather than an outline that has to borrow
  // its contrast from whatever's behind it. Border carries the same color as
  // the text, same as AnimatedMenuButton's, so the two read as one coherent
  // pairing. Gold takes over as the fill on hover/active regardless of
  // ground. Idle fill differs by ground: light stays an opaque frost chip;
  // dark drops to a translucent frosted grey (30% alpha + blur) instead of a
  // solid navy block, since a fully opaque fill read as too heavy over the
  // hero imagery it usually sits on there.
  const idleBg = onDark ? alpha(NOIR.slate, 0.3) : NOIR.frost;
  const idleColor = onDark ? NOIR.white : NOIR.navyField;
  const activeBg = NOIR.gold;
  const activeColor = NOIR.navyInk;
  const isPrimary = hovered || isActive;
  const idleBlur = onDark && !isPrimary;

  return (
    <Button
      variant="contained"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      onClick={handleClick}
      sx={{
        borderRadius: "999px",
        ml: { md: 1.5 },
        opacity: 0.8,
        border: `1px solid ${isPrimary ? activeColor : idleColor} !important`,
        color: `${isPrimary ? activeColor : idleColor} !important`,
        bgcolor: `${isPrimary ? activeBg : idleBg} !important`,
        backgroundImage: "none !important",
        boxShadow: "none !important",
        backdropFilter: `${idleBlur ? "blur(10px) saturate(140%)" : "none"} !important`,
        WebkitBackdropFilter: `${idleBlur ? "blur(10px) saturate(140%)" : "none"} !important`,
        // `MuiButton`'s "contained" variant (components.ts) lifts 2px and adds a
        // glow box-shadow on hover/active - overridden above, but not `transform`,
        // so it still floated on hover despite the fill/shadow being pinned.
        transform: "none !important",
        transition: `all 0.3s ${EASE_OUT_EXPO_CSS}`,
        "&:hover": {
          border: `1px solid ${activeColor} !important`,
          bgcolor: `${activeBg} !important`,
          backgroundImage: "none !important",
          boxShadow: "none !important",
          backdropFilter: "none !important",
          WebkitBackdropFilter: "none !important",
          color: `${activeColor} !important`,
          transform: "none !important",
        },
        "&:active": {
          transform: "none !important",
          boxShadow: "none !important",
        },
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>
        {label}
      </Box>
    </Button>
  );
}

/** Static 3-bar icon — no shape/position animation of its own; only its
 *  color transitions, driven by the parent button's own hover/active state
 *  (same behavior as the Contact button's label: a color change, nothing
 *  moving). */
function ThreeBarMenuIcon({ color }: { color: string }) {
  const barSx = {
    width: 18,
    height: 2,
    bgcolor: color,
    borderRadius: "1px",
    transition: "background-color 0.3s ease",
  } as const;
  return (
    <Box
      sx={{
        width: 20,
        height: 14,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
        // The chip's own bg/border stay fully opaque — only the glyph itself
        // is dialed down, same treatment as Contact's 80% button opacity.
        opacity: 0.8,
      }}
    >
      <Box sx={barSx} />
      <Box sx={barSx} />
      <Box sx={barSx} />
    </Box>
  );
}

/** 3-Bar Menu Icon Button — same chrome-less treatment as the Contact button:
    no background, no border, no shadow; it just goes gold on hover/active. */
function AnimatedMenuButton({
  active,
  onClick,
  onHoverEnter,
  onHoverLeave,
  isImmersiveDark,
  ariaLabel,
  sx,
}: {
  active: boolean;
  onClick: () => void;
  /** Optional hover-intent hooks (glassmorphism mode only) — layered on top
   *  of the button's own internal hover state below, which still drives the
   *  gold color-shift regardless. */
  onHoverEnter?: (() => void) | undefined;
  onHoverLeave?: (() => void) | undefined;
  isNotch?: boolean;
  isImmersiveDark: boolean;
  ariaLabel: string;
  sx?: object;
  noBorder?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = hovered || active;

  // Filled, bordered chip — the border carries the same color as the
  // icon/text so it reads as one coherent outline instead of a separate
  // accent. Gold takes over as the fill on hover/active regardless of
  // ground. Idle fill differs by ground: light stays an opaque frost chip;
  // dark drops to a translucent frosted grey (30% alpha + blur), same
  // treatment as Contact, instead of a solid navy block.
  const idleBg = isImmersiveDark ? alpha(NOIR.slate, 0.3) : NOIR.frost;
  const idleColor = isImmersiveDark ? NOIR.white : NOIR.navyField;
  const activeBg = NOIR.gold;
  const activeColor = NOIR.navyInk;
  const iconColor = isPrimary ? activeColor : idleColor;
  const idleBlur = isImmersiveDark && !isPrimary;

  return (
    <Box
      component="button"
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onHoverEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onHoverLeave?.(); }}
      aria-label={ariaLabel}
      aria-expanded={active}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 42,
        height: 42,
        borderRadius: "10px",
        border: `1px solid ${iconColor} !important`,
        bgcolor: `${isPrimary ? activeBg : idleBg} !important`,
        backgroundImage: "none !important",
        color: `${iconColor} !important`,
        boxShadow: "none !important",
        backdropFilter: `${idleBlur ? "blur(10px) saturate(140%)" : "none"} !important`,
        WebkitBackdropFilter: `${idleBlur ? "blur(10px) saturate(140%)" : "none"} !important`,
        cursor: "pointer",
        // No `outline: none` here. This is a real <button> with an onClick, and it
        // renders in the app bar on every route. An `sx` rule is injected after
        // MuiCssBaseline's `*:focus-visible`, so suppressing the outline locally beat
        // the theme's designed focus ring and left the primary nav trigger with no
        // keyboard indicator at all.
        transition: `all 0.3s ${EASE_OUT_EXPO_CSS}`,
        ...sx,
        "&:hover": {
          border: `1px solid ${activeColor} !important`,
          bgcolor: `${activeBg} !important`,
          backgroundImage: "none !important",
          color: `${activeColor} !important`,
          boxShadow: "none !important",
          backdropFilter: "none !important",
          WebkitBackdropFilter: "none !important",
        },
      }}
    >
      <ThreeBarMenuIcon color={iconColor} />
    </Box>
  );
}

/** Delay before the entrance plays when there is no preloader to cover it
    (repeat visits) — lets the first paint commit so nothing moves mid-layout. */
const SETTLE_MS = 80;
const HEADER_AT_MS = 300;
const OPEN_AT_MS = 600;

function AppShellInner({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  // Home exposes its content immediately; its motion progressively enhances the page.
  const [showPreloader, setShowPreloader] = useState(() => pathname !== "/" && shouldShowPreloader(reduced === true));
  // Tiered entrance: hero → header → content, instead of one boolean
  // releasing every animation system on the same tick.
  const [phase, setPhase] = useState<EntrancePhase>(() => (pathname === "/" || reduced === true ? "open" : "covered"));
  const releasedRef = useRef(pathname === "/" || reduced === true);
  const hadPreloaderRef = useRef(showPreloader);
  // The post-intro hero cascade — see `useHeroCascadeStep`'s docblock for why
  // this is independent of `phase`/`EntrancePhaseContext`. Starts fully
  // revealed (5) on a warm/repeat visit; starts at 0 and is stepped up by
  // `handlePreloaderDone` only when the real intro played.
  const [heroCascadeStep, setHeroCascadeStep] = useState(() => (showPreloader ? 0 : 5));
  const heroCascadeTimersRef = useRef<number[]>([]);

  // useReducedMotion() can resolve asynchronously — its type is
  // `boolean | null`, and it is null until the media-query listener has run.
  // The lazy initializers above only see whatever value was available at
  // mount, so a preference that resolves to `true` on a later render would
  // otherwise be missed entirely: showPreloader and phase already committed
  // to their "reduced === true" branch, and useState's lazy initializer never
  // re-runs. A reduced-motion visitor could get the full bounce-timeline
  // preloader and staged entrance regardless of their OS setting.
  //
  // This corrects course the instant the preference resolves. It's a
  // useLayoutEffect (not useEffect) specifically so the correction lands
  // before the browser paints the frame — a reduced-motion user never sees
  // the preloader flash on before it's dismissed, and a non-reduced user sees
  // no change at all (this effect is a no-op for them).
  useLayoutEffect(() => {
    if (reduced !== true) return;
    if (releasedRef.current) return; // already correct — the common case
    releasedRef.current = true;
    hadPreloaderRef.current = false;
    setShowPreloader(false);
    setPhase("open");
    setHeroCascadeStep(5);
  }, [reduced]);
  const entranceTimersRef = useRef<number[]>([]);
  // Both the desktop and mobile hamburger triggers share this one boolean —
  // one nav card (TopNavMegaDrawer), not two separate nav UIs.
  const [megaNavOpen, setMegaNavOpen] = useState(false);
  // Glassmorphism-only hover-intent: opens/closes the mega drawer on hover of
  // the menu button (or the drawer itself), with a short delay so the drawer
  // doesn't flicker open/closed as the cursor merely passes over the icon or
  // crosses the gap between button and drawer edge. Click still works
  // independently (see the button's onClick below) in every mode.
  const megaNavHoverTimeoutRef = useRef<number | null>(null);
  const clearMegaNavHoverTimeout = useCallback(() => {
    if (megaNavHoverTimeoutRef.current !== null) {
      window.clearTimeout(megaNavHoverTimeoutRef.current);
      megaNavHoverTimeoutRef.current = null;
    }
  }, []);
  const openMegaNavOnHover = useCallback(() => {
    clearMegaNavHoverTimeout();
    megaNavHoverTimeoutRef.current = window.setTimeout(() => setMegaNavOpen(true), 180);
  }, [clearMegaNavHoverTimeout]);
  const closeMegaNavOnHover = useCallback(() => {
    clearMegaNavHoverTimeout();
    megaNavHoverTimeoutRef.current = window.setTimeout(() => setMegaNavOpen(false), 180);
  }, [clearMegaNavHoverTimeout]);
  useEffect(() => clearMegaNavHoverTimeout, [clearMegaNavHoverTimeout]);
  const warmup = useWarmupSignals(pathname);
  useNeighbourRouteWarming(pathname);
  const onContactPage = pathname === "/contact";

  const releaseEntrance = useCallback(() => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    const timers = entranceTimersRef.current;
    setPhase("hero");
    timers.push(window.setTimeout(() => setPhase("header"), HEADER_AT_MS));
    timers.push(window.setTimeout(() => setPhase("open"), OPEN_AT_MS));
  }, []);

  const handlePreloaderDone = useCallback(() => {
    setShowPreloader(false);
    // The post-intro hero cascade — only for a visitor who genuinely saw the
    // preloader this page load. `onDone` fires after the full 2s aperture
    // reveal has completed (Preloader.tsx's `finish()`, called once every
    // exit tween has resolved), so step 1 begins from a fully-revealed page,
    // not mid-reveal.
    if (hadPreloaderRef.current) {
      // 250ms, not 700. At 700 the five hero steps took 2.8s AFTER the intro
      // had already ended, so the CTA buttons landed at 12.5s while everything
      // needed to draw them had been in cache for ten of those seconds. The
      // cascade should read as the hero assembling itself, not as a queue.
      const STEP_MS = 250;
      [1, 2, 3, 4, 5].forEach((step, i) => {
        heroCascadeTimersRef.current.push(
          window.setTimeout(() => setHeroCascadeStep(step), i * STEP_MS),
        );
      });
    }
  }, []);

  useEffect(() => {
    // Repeat visits skip the preloader, so nothing else triggers the release.
    if (!hadPreloaderRef.current) {
      entranceTimersRef.current.push(window.setTimeout(releaseEntrance, SETTLE_MS));
    }
    const timers = entranceTimersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, [releaseEntrance]);

  useEffect(() => {
    const timers = heroCascadeTimersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  // The overscroll-to-navigate machine that used to live here is gone.
  // It accumulated "scroll pressure" from non-passive wheel/touchmove listeners —
  // each tick calling checkIsAtBottom(), which read scrollY, innerHeight, two
  // scrollHeights and an offsetHeight, forcing a full synchronous layout — then
  // auto-navigated to the next page and played a full-screen curtain wipe. It
  // hijacked the browser's own overscroll gesture, its escape hatch (Esc) was
  // undiscoverable, and it re-attached five window listeners mid-gesture because
  // its own setState was one of the effect's dependencies.
  // The footer now offers the next chapter as an ordinary link.
  const currentNarration = NARRATION_FLOW[pathname] ?? NARRATION_FLOW["/"]!;

  useEffect(() => {
    // Reset body overflow on route change to guarantee scroll is never blocked on new pages
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    // TransitionCurtain.tsx owns stopLenis()/startLenis() and refreshScrollTriggers()
    // around every in-app navigation — on both its full curtain-sweep path and its
    // prefers-reduced-motion fast path, which skips the sweep but keeps the same
    // scroll-freeze/refresh sequencing. gsap is loaded on demand there, not eagerly.

    // Trigger staggered entrance animations for the new route
    if (hadPreloaderRef.current && phase === "open") {
      setPhase("hero");
      const timers = entranceTimersRef.current;
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
      timers.push(window.setTimeout(() => setPhase("header"), HEADER_AT_MS));
      timers.push(window.setTimeout(() => setPhase("open"), OPEN_AT_MS));
    }
  }, [pathname]);


  const headerReleased = phase === "header" || phase === "open";
  const { navigateWithCurtain } = useTransitionCurtain();
  const { overrideMode, derivedIsCompact, isOverDarkSection, autohideEnabled, showMotto, toggleMotto } = useNavbar();
  const navHidden = useNavAutohide(autohideEnabled, pathname);

  // Global keyboard shortcut to toggle company motto (Alt+M / Option+M)
  useEffect(() => {
    const handleMottoKey = (e: KeyboardEvent) => {
      // Toggle motto only if not inside editable text elements
      const activeEl = document.activeElement;
      const isEditable = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        (activeEl as HTMLElement).isContentEditable
      );
      if (!isEditable && e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMotto();
      }
    };
    window.addEventListener("keydown", handleMottoKey);
    return () => window.removeEventListener("keydown", handleMottoKey);
  }, [toggleMotto]);

/** Scroll offset at which non-home routes leave the transparent navbar state.
 *  Small on purpose: those routes have no pinned hero to sit over. */
const NAV_SOLID_AFTER_PX = 50;

/** The "dark mode" navbar surface — used by every non-island mode whenever a
 *  `data-ground="dark"` anchor is current (`isOverDarkSection`). A single
 *  cohesive treatment instead of the old per-mode grab-bag (murky
 *  `rgba(30,30,30,0.28)` on glass/compact, flat navy on standard): a deep
 *  brand-navy pane, a real blur, a light hairline, and a soft lift — so over a
 *  dark hero the bar reads as a deliberate dark-mode chrome, not an accident. */
const NAV_DARK = {
  surface: `rgba(${NOIR.navyDeepRgb}, 0.74)`,
  /** Opaque fallback for the genuinely-solid `standard` mode. */
  surfaceSolid: NOIR.navyDeep,
  blur: "blur(18px) saturate(140%)",
  hairline: "1px solid rgba(255, 255, 255, 0.14)",
  shadow: "0 8px 32px rgba(0, 0, 0, 0.28)",
} as const;

/** island-v2's dark surface — a soft dark navy, distinct from `NAV_DARK`'s
 *  deeper brand navy. The floating pill sits over the home page's own navy
 *  sections and bar-transition blocks; `NOIR.duskNavy` is lighter than
 *  `navyDeep`/`navyInk`/`navyDark` so the pill still reads as its own surface
 *  instead of disappearing into them, without falling back to an off-brand
 *  grey. */
const NAV_ISLAND_V2 = {
  surface: `rgba(${NOIR.duskNavyRgb}, 0.82)`,
} as const;

/** Glassmorphism's own dark-section surface — deliberately separate from
 *  `NAV_DARK` (shared by `standard` and other modes) so pushing glass to a
 *  true frosted 80% opacity doesn't also change standard mode's chrome. */
const NAV_GLASS_DARK = {
  surface: `rgba(${NOIR.navyDeepRgb}, 0.8)`,
  blur: "blur(20px) saturate(160%)",
} as const;

  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/') {
        // Follow the actual scene boundary: desktop owns pin spacing, while
        // mobile and reduced motion use an ordinary, shorter hero.
        const hero = document.getElementById("hero-sequence");
        setIsAtTop(hero ? hero.getBoundingClientRect().bottom > window.innerHeight : window.scrollY < NAV_SOLID_AFTER_PX);
      } else {
        setIsAtTop(window.scrollY < NAV_SOLID_AFTER_PX);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  const effectiveMode = (pathname === '/' && isAtTop) ? "minimal" : overrideMode;

  const isMinimal = effectiveMode === "minimal";
  const isGlass = effectiveMode === "glassmorphism";
  const isNotch = effectiveMode === "notch";
  const isStandard = effectiveMode === "standard";
  const isStandardOrGlass = isStandard || isGlass;
  const isIsland = effectiveMode === "island";
  // island-v2: island, tightened. Same content as island (logo + wordmark +
  // nav + Contact + menu) but a narrower, shorter pill, less padding, smaller
  // type, lighter chrome — the compact/minimal take. Shares the island pill
  // treatment (blur, radius, rim, always-light) via `isAnyIsland`.
  const isIslandV2 = effectiveMode === "island-v2";
  const isAnyIsland = isIsland || isIslandV2;

  // The dark mode should accurately reflect the anchors, even at the top.
  // island / island-v2 used to be exempt (their pill was "always-light"); they
  // now take the dark-mode treatment too — a deep-navy pill + inverted text —
  // so the chrome stays legible over the VideoPageHero bands and dark home
  // sections in every mode.
  const onDark = isNotch || isOverDarkSection;
  const islandOnDark = isAnyIsland && isOverDarkSection;
  const isImmersive = effectiveMode === "immersive";
  const footerAnchorRef = useNavbarAnchor(NAV_ANCHORS.SITE_FOOTER, { dark: pathname !== "/" });

  return (
    <EntrancePhaseContext.Provider value={phase}>
    <HeroCascadeContext.Provider value={heroCascadeStep}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {showPreloader ? (
          <Preloader
            warmup={warmup}
            onStartExit={releaseEntrance}
            onDone={handlePreloaderDone}
          />
        ) : null}
        {/* Rendered outside the `inert` wrapper below — its own open state
            (`megaNavOpen`) is one of that wrapper's inert conditions, and a
            modal can't be inert while it's the thing keyboard focus is
            supposed to be inside. */}
        <TopNavMegaDrawer
          open={megaNavOpen}
          onClose={() => setMegaNavOpen(false)}
          onPaperMouseEnter={isGlass ? clearMegaNavHoverTimeout : undefined}
          onPaperMouseLeave={isGlass ? closeMegaNavOnHover : undefined}
        />
        {/* `inert` while the preloader is up locks focus, pointer interaction, and
            AT visibility for everything it visually covers — skip link, header,
            page content, footer — for exactly as long as `showPreloader` is true.
            It goes on this wrapper, not on <Preloader> itself: Preloader owns no
            focusable elements, so marking *it* inert would do nothing about the gap
            a runtime audit found — z-index blocks the mouse, but not Tab order, so a
            keyboard user could tab past the opaque overlay and Enter-activate a header
            link hidden behind it, something a mouse user physically cannot do. Scoping
            inert to "everything behind the curtain" instead fixes both input modalities
            with one primitive, and it clears in the same render as the overlay's own
            unmount (both keyed off `showPreloader`), so keyboard access returns exactly
            when the header becomes visible and interactive — never before, never after.
            `display: "contents"` keeps this Box out of the flex layout box model, so
            AppBar/main/footer still participate in the parent flex column exactly as if
            this wrapper weren't here; only the `inert` attribute (which propagates
            through the DOM regardless of the rendering box) does anything.

            A separate, narrower `inert` (main + footer only, not the header) handles
            `megaNavOpen` below — the header itself stays interactive so the hamburger
            button that was just clicked doesn't self-blur out from under the focus
            handoff in TopNavMegaDrawer's own effect. */}
        <Box sx={{ display: "contents" }} inert={showPreloader || undefined}>
        {/* First tab stop on every page. There was no skip link, so a keyboard user
            had to tab through the whole header — logo, six nav items, contact button,
            menu trigger — on every single navigation before reaching content.
            Styling lives in components.ts (.skip-to-content); it is off-screen until
            focused. */}
        <Box component="a" href="#main-content" className="skip-to-content">
          Skip to content
        </Box>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            // viewTransitionName: "site-header" is temporarily removed because it breaks backdrop-filter in Chromium.
            // Standard mode is a genuinely solid bar, not a glass treatment
            // in disguise — brand navy over dark sections, white/panel over
            // light ones, a hairline border, no backdrop blur. Glass mode
            // (isGlass) is untouched and still fully translucent/blurred.
            bgcolor: isGlass
              ? "transparent"
              : isStandard
              ? (isOverDarkSection
                ? NAV_DARK.surfaceSolid
                : NOIR.white)
              : "transparent",
            backdropFilter: "none",
            borderBottom: isStandard
              ? (isOverDarkSection
                ? NAV_DARK.hairline
                : "1px solid rgba(0, 0, 0, 0.08)")
              : "none",
            boxShadow: isStandard
              ? (isOverDarkSection ? NAV_DARK.shadow : "0 2px 20px rgba(0,0,0,0.03)")
              : "none",
            pt: isNotch || isStandardOrGlass ? 0 : 1,
            // `heroCascadeStep < 2`: step 2 of the post-intro cascade (see
            // `useHeroCascadeStep`). On a warm/repeat visit this starts at 5
            // and never gates anything here; on the genuine intro path it
            // holds the navbar hidden until the canvas (step 1) has had its
            // beat, instead of dropping in the instant the preloader unmounts.
            pointerEvents:
              showPreloader || heroCascadeStep < 2 ? "none" : (isStandardOrGlass ? "auto" : "none"),
            transform:
              navHidden || showPreloader || heroCascadeStep < 2 ? "translateY(-120%)" : "translateY(0%)",
            opacity: showPreloader || heroCascadeStep < 2 ? 0 : 1,
            transition: `transform 0.5s ${EASE_OUT_EXPO_CSS}, opacity 0.5s ease, background-color 0.6s ${EASE_OUT_EXPO_CSS}, border-color 0.6s ${EASE_OUT_EXPO_CSS}, box-shadow 0.6s ${EASE_OUT_EXPO_CSS}`,
          }}
        >
          {/* Glassmorphism Background layer — lenis.dev's actual technique:
              ONE layer carries both the blur and the tint, and `mask-image`
              fades that whole layer (blur included) toward the bottom, so
              the blur visually tapers off along with the tint instead of
              switching off in one row of pixels (a separate always-100%-blur
              layer was tried first and made it worse — backdrop-filter has a
              hard geometric edge wherever its own box ends, so an unmasked
              blur layer just relocates the hard cut to the box's edge). The
              mask reaches literal transparent by the very bottom — a
              non-zero floor was tried and that residual band was itself the
              hard cut the box edge revealed. Multiple stops ease the curve
              (holds solid, then rounds off) rather than a stark linear ramp,
              and the box overhangs 28px past the toolbar so the last bit of
              fade has room to dissolve into the page instead of being
              cropped at the bar's own edge; `pointerEvents: "none"` keeps
              that overhang from swallowing clicks on whatever's underneath.
              Over a dark section the tint takes the shared `NAV_DARK`
              treatment — deep navy pane, a light hairline seam — so glass
              mode gets the same deliberate dark-mode chrome as the other
              modes. */}
          {isGlass && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "calc(100% + 28px)",
                zIndex: -1,
                pointerEvents: "none",
                backdropFilter: isOverDarkSection ? NAV_GLASS_DARK.blur : "blur(20px) saturate(160%)",
                WebkitBackdropFilter: isOverDarkSection ? NAV_GLASS_DARK.blur : "blur(20px) saturate(160%)",
                bgcolor: isOverDarkSection ? NAV_GLASS_DARK.surface : "rgba(255, 255, 255, 0.8)",
                borderBottom: isOverDarkSection ? NAV_DARK.hairline : "1px solid transparent",
                boxShadow: isOverDarkSection ? NAV_DARK.shadow : "none",
                maskImage:
                  "linear-gradient(to bottom, #000 0%, #000 40%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,0.4) 74%, rgba(0,0,0,0.12) 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 0%, #000 40%, rgba(0,0,0,0.75) 58%, rgba(0,0,0,0.4) 74%, rgba(0,0,0,0.12) 90%, transparent 100%)",
                transition: `background-color 0.6s ${EASE_OUT_EXPO_CSS}, border-color 0.6s ${EASE_OUT_EXPO_CSS}, box-shadow 0.6s ${EASE_OUT_EXPO_CSS}`,
              }}
            />
          )}
          <Container disableGutters maxWidth={false} sx={{ display: "flex", justifyContent: "center", pointerEvents: 'none' }}>
            <Toolbar
              disableGutters
              sx={{
                position: "relative",
                width: "100%",
                // island-v2 is island, tightened: a narrower pill, shorter, less
                // padding, smaller type. Same content (logo + wordmark + nav +
                // Contact + menu) — just denser and lighter-weight chrome.
                maxWidth: isMinimal
                  ? "100vw"
                  : (isIslandV2
                    ? { xs: "1000px", xl: "1200px" }
                    : (isStandardOrGlass
                    ? "1536px"
                    : (isNotch
                      ? "100vw"
                      : (derivedIsCompact ? { xs: "1200px", xl: "1536px" } : "1536px")))),
                minHeight: isIslandV2 ? "46px !important" : (isIsland ? "54px !important" : undefined),
                pointerEvents: 'auto',
                // width/margin-top are excluded from the transition list while
                // liquid — they're driven by per-pointermove React state and
                // would lag behind the cursor under a CSS transition.
                transition:
                  `background-color 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `border-color 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `box-shadow 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `padding 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `max-width 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `backdrop-filter 0.6s ${EASE_OUT_EXPO_CSS}, ` +
                  `gap 0.6s ${EASE_OUT_EXPO_CSS}`,
                bgcolor: isStandardOrGlass
                  ? "transparent"
                  : (isMinimal
                    ? "transparent"
                    : isNotch
                    ? NOIR.charcoal
                    : isAnyIsland
                    ? (islandOnDark
                      ? (isIslandV2 ? NAV_ISLAND_V2.surface : NAV_DARK.surface)
                      // island-v2 light surface raised toward opaque white —
                      // the home rebuild's lighter/editorial direction reads
                      // this pill as a crisp chip, not a translucent dark bar.
                      : (isIslandV2 ? "rgba(255, 255, 255, 0.86)" : "rgba(255, 255, 255, 0.5)"))
                    : isOverDarkSection
                      ? NAV_DARK.surface
                      : (derivedIsCompact ? NOIR.white : "transparent")),
                backdropFilter: isStandardOrGlass
                  ? "none"
                  : (isMinimal
                    ? "none"
                    : isAnyIsland
                    ? "blur(20px) saturate(160%)"
                    : isOverDarkSection
                      ? NAV_DARK.blur
                      : "none"),
                WebkitBackdropFilter: isStandardOrGlass
                  ? "none"
                  : (isMinimal
                    ? "none"
                    : isAnyIsland
                    ? "blur(20px) saturate(160%)"
                    : isOverDarkSection
                      ? NAV_DARK.blur
                      : "none"),
                // No CSS `border` here any more — island used to draw a flat
                // 1px rgba(255,255,255,0.4) line, but `borderRadius` below had
                // no `isIsland` case, so that flat line rendered on a 0px-radius
                // (square) box while bgcolor/backdropFilter/boxShadow all styled
                // this as a floating rounded pill. The straight edges clipped
                // squarely across the Contact/menu buttons' own rounded
                // specular rims sitting just inside it, reading as two
                // different, misaligned borders at the same corner. Fixed by
                // giving island its own radius below and replacing the flat
                // line with a `SpecularFx` rim (mounted just below, matching
                // the buttons' own treatment) that traces whatever radius this
                // box actually resolves to, so the two can never disagree again.
                border: "none",
                borderColor: "transparent",
                borderRadius: isStandardOrGlass
                  ? "0px"
                  : (isNotch
                    ? "0px 0px 24px 24px"
                    : isImmersive
                      ? "28px"
                      : (isAnyIsland || derivedIsCompact ? "100px" : "0px")),
                padding: isMinimal
                  ? { xs: "4px 32px", md: "4px 72px" }
                  : (isIslandV2
                    ? { xs: "0px 14px", md: "0px 20px" }
                    : (isStandardOrGlass
                    ? { xs: "4px 16px", sm: "4px 24px" }
                    : (isNotch
                      ? "2px 20px"
                      : isImmersive
                        ? "6px 24px"
                        : (derivedIsCompact ? "0px 32px" : { xs: "4px 16px", sm: "4px 24px" })))),
                boxShadow: isAnyIsland
                  ? (islandOnDark
                    ? NAV_DARK.shadow
                    // island-v2 shadow softened further to match the raised
                    // surface opacity above — a nearly-opaque white pill
                    // reads as floating chrome without also needing a
                    // noticeable drop shadow to separate it from the page.
                    : (isIslandV2 ? "0 1px 4px rgba(0,0,0,0.035)" : "0 4px 12px rgba(0,0,0,0.06)"))
                  : (isOverDarkSection && !isStandardOrGlass && !isMinimal ? NAV_DARK.shadow : "none"),
                display: "flex",
                justifyContent: isNotch ? "center" : "center",
                alignItems: "center",
                gap: isNotch ? 2.5 : 4,
                mx: "auto",
              }}
            >
              {/* The island pill's own edge, light mode only. Mounted here
                  rather than a CSS `border` so it traces whatever
                  `borderRadius` this box actually resolves to (SpecularFx
                  reads `getComputedStyle`). Static (no pointer-follow) - a
                  full-width nav bar sweeping a highlight on every mouse move
                  would be a bigger motion cue than this chrome should make.
                  Dropped entirely on the dark pill (`islandOnDark`) — its
                  bgcolor/blur/shadow already read as a floating surface
                  without an edge; the rim there just looked like an unwanted
                  outline. */}
              {isAnyIsland && !islandOnDark && (
                <SpecularFx
                  baseColor={NOIR.white}
                  intensity={0}
                  followMouse={false}
                  speed={0}
                  // `enabled` inside SpecularFx is gated on a fine pointer
                  // unless `autoAnimate` is set - without it this rim would
                  // vanish on touch devices while the pill's bgcolor/blur/
                  // shadow stayed, reintroducing the same "border doesn't
                  // match the rest of the chrome" mismatch this exists to
                  // fix. `intensity={0}` already kills the moving highlight,
                  // so `autoAnimate` here only unlocks the static base stroke
                  // for coarse pointers, not an idle sweep.
                  autoAnimate
                />
              )}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  maxWidth: isMinimal ? "100%" : (isNotch ? "720px" : "1536px"),
                  justifyContent: "space-between",
                  alignItems: "center",
                  mx: "auto",
                  px: 0,
                }}
              >
              <RouterLink
                to="/"
                underline="none"
                onClick={(e) => {
                  if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    navigateWithCurtain("/");
                  }
                }}
                sx={{
                  textDecoration: "none",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: isIslandV2 ? 0.75 : 1,
                  position: "relative",
                  overflow: "hidden",
                  p: 0.5,
                  m: -0.5,
                  borderRadius: "8px",
                }}
              >
                {/* Frosted backdrop spanning the logo + wordmark — a rectangle,
                    not a soft circular glow, so it reads as a panel behind the
                    lockup rather than a spotlight. `farthest-side` sizes the
                    mask ellipse to reach every edge of this box independently
                    in each dimension, so a wide-but-short cluster still gets a
                    fade that touches all four sides instead of a centered
                    circle floating inside a wider rect; the mask fades both
                    the tint AND the backdrop-filter blur together (masking a
                    backdrop-filter layer affects its whole composited output),
                    so the ends of the panel land at 0 opacity and 0 blur, not
                    just 0 tint. */}
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: -1,
                    pointerEvents: "none",
                    borderRadius: "10px",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    bgcolor: onDark ? "rgba(6, 24, 59, 0.34)" : "rgba(255, 255, 255, 0.55)",
                    maskImage: "radial-gradient(ellipse farthest-side at center, #000 0%, #000 55%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse farthest-side at center, #000 0%, #000 55%, transparent 100%)",
                    transition: "background-color 0.4s ease",
                  }}
                />
                <Box sx={{ color: onDark ? NOIR.white : (derivedIsCompact ? "text.primary" : "primary.main"), display: 'flex' }}>
                  <PhitopolisLogo
                    style={{ height: isGlass ? 24 : (isIslandV2 ? 15 : ((isStandard || isIsland) ? 18 : 24)), width: 'auto', transition: "height 0.4s ease" }}
                    color="currentColor"
                    accentColor={NOIR.gold}
                  />
                </Box>
                <motion.div
                  initial={false}
                  animate={headerReleased ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Stack spacing={0.1}>
                    <Typography
                      component="span"
                      variant="h4"
                      sx={{ color: onDark ? NOIR.white : "primary.main", fontWeight: 800, fontSize: isGlass ? "1.15rem" : (isIslandV2 ? "0.8rem" : ((isStandard || isIsland) ? "0.95rem" : "1.15rem")), letterSpacing: isIslandV2 ? "0.06em" : "0.08em", lineHeight: 1.1, transition: "color 0.4s ease, font-size 0.4s ease" }}
                    >
                      PH<Box component="span" sx={{ color: NOIR.gold }}>IT</Box>OPOLIS
                    </Typography>
                    {showMotto && (
                      <Typography
                        sx={{
                          fontFamily: MONO,
                          fontSize: "0.58rem",
                          letterSpacing: "0.12em",
                          color: onDark ? "rgba(255,255,255,0.7)" : "text.secondary",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          opacity: 0.85,
                        }}
                      >
                        MAKING TOMORROW'S TECHNOLOGY AVAILABLE TODAY
                      </Typography>
                    )}
                  </Stack>
                </motion.div>
              </RouterLink>

              {/* Central Navigation Items for Standard / Island / Island-v2.
                  Glassmorphism deliberately excludes these — the hamburger
                  (below) is its sole nav trigger, opening the mega drawer. */}
              {(isStandard || isAnyIsland) && (
                <Box
                  component="nav"
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: isIslandV2 ? 2.25 : 3.5,
                  }}
                >
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                    return (
                      <RouterLink
                        key={item.to}
                        to={item.to}
                        underline="none"
                        onClick={(e: React.MouseEvent) => {
                          if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                            e.preventDefault();
                            navigateWithCurtain(item.to);
                          }
                        }}
                        sx={{
                          fontFamily: MONO,
                          fontSize: isIslandV2 ? "0.72rem" : TYPE_SCALE.caption,
                          fontWeight: 700,
                          letterSpacing: isIslandV2 ? "0.06em" : "0.08em",
                          textDecoration: "none !important",
                          // Bright gold as nav-item TEXT on both grounds — a
                          // deliberate brand call. On dark it measures 9.4:1
                          // to 12:1; on light it's 1.49:1, well under AA, and
                          // that's accepted (see tests/a11y-contrast.test.ts)
                          // rather than routed through a bronze walk-down.
                          color: isActive
                            ? NOIR.gold
                            : (onDark ? "rgba(255,255,255,0.7)" : "text.secondary"),
                          transition: "color 0.3s ease",
                          position: "relative",
                          "&:hover": {
                            color: NOIR.gold,
                            textDecoration: "none !important",
                          },
                        }}
                      >
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavIndicator"
                            transition={{ type: "tween", duration: 0.65, ease: EASE_OUT_EXPO }}
                            style={{
                              position: "absolute",
                              bottom: "-6px",
                              left: 0,
                              right: 0,
                              height: "2px",
                              backgroundColor: NOIR.gold,
                            }}
                          />
                        )}
                      </RouterLink>
                    );
                  })}
                </Box>
              )}

              {/* Rightmost Controls: Contact + 3-Bar Menu Icon with Hover Dropdown & Click Mega Drawer */}
              {/* Minimal mode used to fall through to the "else" branch on every
                  ternary below - the plain, uncompacted MUI Button size/padding
                  and a 36px menu box instead of the tight mono chip glass/island
                  get. Same specular rim component either way, but at a
                  different size and proportion the rim traces a differently
                  shaped box, which is what read as "the border look doesn't
                  match" between minimal and glassmorphism. `isMinimal` joins
                  the other two modes here so all three render this cluster
                  identically; home's own distinct treatment (logo size, no nav
                  items) is untouched — that's decided elsewhere, above. */}
              <Box sx={{ display: "flex", alignItems: "center", gap: isIslandV2 ? 1 : 1.5 }}>
                <AnimatedContactButton
                  label="Contact"
                  isActive={onContactPage}
                  variant={onDark ? "onDark" : "default"}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    height: isGlass ? "32px" : ((isStandard || isAnyIsland || isMinimal) ? "40px" : "32px"),
                    fontSize: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? "0.72rem" : undefined),
                    fontWeight: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? 700 : undefined),
                    fontFamily: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? MONO : undefined),
                    letterSpacing: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? "0.08em" : undefined),
                    textTransform: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? "none" : undefined),
                    // Was "2px 0px" - zero horizontal padding, so the pill's
                    // own border sat flush against the label glyphs with no
                    // breathing room. A little horizontal room keeps the
                    // border from reading as "the border is touching the
                    // text".
                    padding: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? "8px 18px" : undefined),
                    minWidth: isGlass ? undefined : ((isStandard || isAnyIsland || isMinimal) ? "auto" : undefined),
                  }}
                />

                {/* Desktop 3-Bar Menu Button — only when the nav links above
                    are NOT already rendered inline (line ~1173's
                    `isStandardOrGlass || isAnyIsland` gate). Showing this next
                    to a fully visible Home/About/Services/Careers/Blog row was
                    redundant chrome; modes without inline links still need it
                    to reach the mega drawer. */}
                <AnimatedMenuButton
                  active={megaNavOpen}
                  onClick={() => setMegaNavOpen(!megaNavOpen)}
                  onHoverEnter={isGlass ? openMegaNavOnHover : undefined}
                  onHoverLeave={isGlass ? closeMegaNavOnHover : undefined}
                  isNotch={false}
                  isImmersiveDark={onDark}
                  ariaLabel="Open navigation menu"
                  noBorder={isStandardOrGlass || isIsland || isMinimal}
                  sx={{ display: (isStandard || isAnyIsland) ? "none" : { xs: "none", md: "inline-flex" }, height: (isStandard || isAnyIsland || isMinimal) ? "40px" : "32px", width: (isStandard || isAnyIsland || isMinimal) ? "40px" : "36px" }}
                />

                {/* Mobile 3-Bar Menu Button — opens the same nav card as the
                    desktop trigger above (shared `megaNavOpen` state). */}
                <AnimatedMenuButton
                  active={megaNavOpen}
                  onClick={() => setMegaNavOpen(!megaNavOpen)}
                  isNotch={false}
                  isImmersiveDark={onDark}
                  ariaLabel="Open mobile navigation menu"
                  noBorder={isStandardOrGlass || isIsland || isMinimal}
                  sx={{ display: { xs: "inline-flex", md: "none" }, height: (isStandardOrGlass || isAnyIsland || isMinimal) ? "40px" : "32px", width: (isStandardOrGlass || isAnyIsland || isMinimal) ? "40px" : "36px" }}
                />
              </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Inert while the nav card is open — the header is deliberately left out
            of this one (see the comment above) so the trigger button keeps focus
            through the handoff into the card. */}
        <Box sx={{ display: "contents" }} inert={megaNavOpen || undefined}>
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, outline: "none" }}>
          {children}
        </Box>



        <SiteFooter
          light={pathname === "/"}
          footerAnchorRef={footerAnchorRef}
          currentNarration={currentNarration}
        />
        </Box>
        <CommandPalette showShortcut />
        <FloatingIdOverlay />
        <CookieNotice />
        </Box>

      </Box>
    </HeroCascadeContext.Provider>
    </EntrancePhaseContext.Provider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TransitionCurtainProvider>
      <NavbarProvider>
        <AppShellInner>{children}</AppShellInner>
      </NavbarProvider>
    </TransitionCurtainProvider>
  );
}
