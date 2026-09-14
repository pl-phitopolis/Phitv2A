import { useSyncExternalStore } from "react";

import type { GroundName } from "./theme/grounds";

/** Named stage-entrance variants. Pure data here (this module is eagerly
 *  loaded by the rails) — the GSAP tween values live in stageChoreo.ts,
 *  which rides the lazy home chunk with StageSection. */
export type StageChoreo = "rise" | "grow-left" | "grow-right" | "zoom-center" | "spotlight-clip";

/** The two things this company sells. The home page is one act per variety:
 *  SERVICES runs hero → global footprint, PEOPLE runs the daily-life film →
 *  careers → the feed. `ledes.dailyLife` in content.ts is the written handover
 *  between the two voices ("That is the work. These are the people who do it.")
 *  — the act model exists so the rails stop contradicting that line. */
export type Act = "services" | "people";

export const ACT_LABELS: Record<Act, string> = {
  services: "SERVICES",
  people: "PEOPLE",
};

/** Chapter index. Seven chapters, all "services" now that the PEOPLE act
 *  (daily-life, candidates, testimonials, blog) has relocated to /about —
 *  see PRD-home-client-focus §US-1/US-2. The `Act`/`ACT_LABELS` model is kept
 *  (it is shared with /about's own chapter registry below) but on home it
 *  now collapses to a single act, and EyeFlow.tsx renders a flat list of the
 *  seven chapters with no act header — a one-act page needs no group label.
 *  ABOUT_CHAPTERS below only uses 0–2, so the narrowing is safe for it. */
export type ChapterIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ChapterDef {
  index: ChapterIndex;
  label: string;
  act: Act;
}

/** Chapters in scroll order.
 *
 *  Seven chapters, widened from six ("Making tomorrow" homepage redesign):
 *  the new `proof-film` cinematic scene (`HomeFilmScene scene="proof"`) earns
 *  its own PROOF chapter, and `use-cases` — no longer sharing a chapter with
 *  `process` — becomes its own APPLICATIONS chapter. The four hero-phase
 *  positions (FLATTEN, ALIGN, REVEAL, DWELL) remain collapsed into a single
 *  ORIGIN chapter covering the whole logo choreography plus the signal core,
 *  because splitting one uninterrupted animation across four rail rows gave
 *  the reader nothing to navigate between. The phase constants in
 *  `heroScene.ts` (PHASE_FLATTEN_END, DWELL_END and friends) keep the
 *  engineering names; the rail just no longer mirrors them.
 *
 *  Every label names what is on screen at that position — the rail is
 *  visitor-facing navigation, not a map of the internal beat list:
 *    ORIGIN       hero (logo choreography → signal core)
 *    THESIS       HomeThesis (mission + the global-markets wager)
 *    DISCIPLINES  HomeDisciplines (the operating pillars, unpinned)
 *    PROOF        the proof-film cinematic scene (pinned)
 *    APPLICATIONS the architectural use-cases + growth timeline
 *    REACH        the global footprint
 *    HORIZON      the closing gateway
 *  The thesis begins immediately after the hero, which is why THESIS sits
 *  second. */
export const CHAPTERS: readonly ChapterDef[] = [
  { index: 0, label: "RESEARCH", act: "services" },
  { index: 1, label: "SINCE 2019", act: "services" },
  { index: 2, label: "MISSION", act: "services" },
  { index: 3, label: "PILLARS", act: "services" },
  { index: 4, label: "IN PRODUCTION", act: "services" },
  { index: 5, label: "R&D JOURNEY", act: "services" },
  { index: 6, label: "GLOBAL REACH", act: "services" },
  { index: 7, label: "ACADEMY", act: "people" },
  { index: 8, label: "LET'S BUILD", act: "services" },
];

/** One home-page section: single source of truth for snap points, the left
 *  dot rail, the right chapter rail, and anchor ids. */
export interface SectionDef {
  /** Home rebuild opts into reversible progress; existing consumers keep event entrances. */
  motion?: "scroll";
  /** DOM id of the section element (anchor target). */
  id: string;
  /** Display number shown in the kicker, e.g. "02". Absent on unnumbered sections. */
  kicker?: string;
  label: string;
  /** Groups sections into the EyeFlow chapters. The act is derived from
   *  this, never stored alongside it. */
  chapter: ChapterIndex;
  /** Stage entrance choreography; StageSection defaults to 'rise'. */
  choreo?: StageChoreo;
  /**
   * The surface this section sits on.
   *
   * Declared here rather than passed to StageSection, because two consumers need
   * it and they must not disagree: the section paints it, and the scroll-driven
   * ground layer interpolates between consecutive values of it. A section that set
   * its own `bgcolor` inline would be invisible to the layer and would re-introduce
   * the hard cut the layer exists to remove.
   */
  ground?: GroundName;
  /**
   * This section's `SectionBeat` owns a pinned ScrollTrigger of its own
   * (`UseCasesNarrative`, `DailyLifeSection`) rather than being a normal
   * scrolling beat.
   *
   * Previously this fact and "render children outside `.stage-inner`" were
   * one overloaded prop (`bare`) passed at every call site — two unrelated
   * questions collapsed into one boolean that had to be inferred correctly at
   * each usage. `ownsPin` is the real, declared fact about the section;
   * `SectionBeat` derives the "outside `.stage-inner`" rendering choice from
   * it internally, because a trigger with a moving ancestor needs
   * `containerAnimation` (which disables pinning/snapping) — so a pin-owning
   * section can never be an ordinary descendant of the reveal transform.
   */
  ownsPin?: boolean;
  /** Suppresses `SectionBeat`'s scrubbed exit-dim tween. Only for a beat with
   *  nothing after it to recede toward (the page's closing section) or one
   *  that owns its own pin and has nothing for the dim to target. */
  noExitDim?: boolean;
  /** Which tempo this section's establishing shot plays at, if it has one —
   *  `MAJOR_ESTABLISH` (1.30s statement) or `MINI_ESTABLISH` (1.05s aside).
   *  Absent when the section has no establishing shot. See `SectionBeat`'s
   *  `establishScale` doc for what each scale implies about layout. */
  establishScale?: "major" | "mini";
  /** Caliper growth anchor for the establishing shot. Defaults to `"left"`
   *  inside `SectionBeat` when `establishScale` is set and this is omitted. */
  establishAlign?: "left" | "center";
  /**
   * Accessible name for the section landmark. Left unset on most sections —
   * `SectionBeat` renders no `aria-label` in that case, exactly matching the
   * sections that had no route-level wrapper Box supplying one before this
   * moved. Set only on the sections that used to get one from that wrapper
   * (`reach`, `candidates`, `testimonials`, `blog`), so behaviour is
   * unchanged rather than newly added.
   */
  ariaLabel?: string;
  /**
   * `data-act` for the section's root element, for the small set of sections
   * that used to get it from a route-level wrapper `<Box component="section">`
   * that existed solely to carry `id`/`aria-label`/`data-act` — attributes
   * `SectionBeat`'s own `<section id={section.id}>` had nowhere else to put
   * them. Sections that need no such attribute (most of them) leave this
   * unset and render no `data-act`.
   */
  act?: Act;
}

/** Attribute marking a snap-target stage element. */
export const STAGE_ATTR = "data-stage-section";

/** One entry here is not what it looks like, and has bitten people:
 *
 *  - `services` is rendered by CapabilityRack, which no longer mounts on the
 *    home page at all (PRD-home-client-focus §2b removed it from
 *    routes/index.tsx to de-duplicate against /services) — but CapabilityRack
 *    itself, and its `homeSection("services")` lookup, are untouched, so this
 *    entry stays for it.
 *
 *  This list is also NOT the registry the navbar uses. NavbarContext keeps its
 *  own anchor ids in a separate namespace ("daily-life-video", "home-compact")
 *  that deliberately does not line up with these — see NavbarContext.tsx.
 *
 *  `daily-life`, `candidates`, `testimonials`, `blog` relocated to
 *  `ABOUT_SECTIONS` below (PRD-home-client-focus §US-2) — the talent/culture
 *  narrative now lives on /about instead of closing out the home page. */
// Home's bright editorial flow: hero -> thesis -> disciplines -> proof film
// -> applications -> growth -> reach -> closing film. `HOME_SECTIONS` remains
// the ordered source for the rail and refresh priorities even though the route
// no longer mounts the dynamic ground layer.
export const HOME_SECTIONS: readonly SectionDef[] = [
  { id: "hero-sequence", label: "Quantitative R&D", chapter: 0, ground: "base", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "home-introduction", label: "R&D since 2019", chapter: 1, ground: "deep", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "hero-mission", label: "Core mission", chapter: 2, ground: "panel", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "hero-pillars", label: "Three pillars", chapter: 3, ground: "deep", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "use-cases", label: "Built and supported", chapter: 4, ground: "panel", motion: "scroll", noExitDim: true },
  { id: "home-cut-research", label: "Into research", chapter: 5, ground: "deep", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "process", label: "R&D journey", chapter: 5, ground: "deep", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "reach", label: "Global reach", chapter: 6, ground: "panel", motion: "scroll", noExitDim: true },
  { id: "home-academy", label: "Phitopolis Academy", chapter: 7, ground: "deep", motion: "scroll", noExitDim: true },
  { id: "home-cut-closing", label: "Into what's next", chapter: 8, ground: "base", motion: "scroll", ownsPin: true, noExitDim: true },
  { id: "closing", label: "Start a conversation", chapter: 8, ground: "base", motion: "scroll", ownsPin: true, noExitDim: true },
];

/** Parked components retain lookups without adding phantom stops to the live flow. */
const LEGACY_HOME_SECTIONS: readonly SectionDef[] = [
  { id: "services", label: "Capabilities", chapter: 4, ground: "panel", establishScale: "mini" },
  { id: "global-markets", label: "Global markets", chapter: 2, ground: "deep" },
  { id: "proof-film", label: "Proof film", chapter: 4, ground: "base", ownsPin: true, noExitDim: true },
];

export function homeSection(id: string): SectionDef {
  const def = HOME_SECTIONS.find((section) => section.id === id) ?? LEGACY_HOME_SECTIONS.find((section) => section.id === id);
  if (!def) throw new Error(`Unknown home section: ${id}`);
  return def;
}

/**
 * Page order for `refreshPriorityFor` (see beatThresholds.ts), derived from a
 * section's position in the registry array that declares it rather than
 * hand-written at each `SectionBeat` call site — PRD-home-client-focus §US-5
 * AC-1's "one ordered registry" requirement. Reordering, inserting, or
 * removing an entry in `HOME_SECTIONS`/`ABOUT_SECTIONS` changes every
 * downstream `order` automatically; there is no second list that can drift
 * out of sync with it.
 *
 * `refreshPriorityFor` only needs the *relative* top-to-bottom rank to stay
 * correct and the result to stay positive (see its own doc for why) — it does
 * not depend on any particular numbering scheme, so the raw array index
 * satisfies it exactly.
 *
 * Searches `HOME_SECTIONS` first, then `ABOUT_SECTIONS`; the two registries
 * share no ids, so there is exactly one match for any real section id.
 */
export function sectionOrder(id: string): number {
  const home = HOME_SECTIONS.findIndex((section) => section.id === id);
  if (home !== -1) return home;
  const about = ABOUT_SECTIONS.findIndex((section) => section.id === id);
  if (about !== -1) return about;
  const legacy = LEGACY_HOME_SECTIONS.findIndex((section) => section.id === id);
  if (legacy !== -1) return legacy;
  throw new Error(`Unknown section for order derivation: ${id}`);
}

/** /about's chapter registry — the four sections relocated from home
 *  (PRD-home-client-focus §US-2) keep their own `Act`/ground metadata so
 *  `groundStops.ts`'s ground-track builder stays a single generic function
 *  shared by both pages rather than forking per page. /about does NOT render
 *  `EyeFlow` (see about.tsx's top-of-file comment for why), so `chapter`
 *  here only feeds the ground track's act-break math, never a rail UI. */
export const ABOUT_CHAPTERS: readonly ChapterDef[] = [
  { index: 0, label: "BEHIND THE CODE", act: "people" },
  { index: 1, label: "TALENT", act: "people" },
  { index: 2, label: "SIGNAL", act: "people" },
];

export const ABOUT_SECTIONS: readonly SectionDef[] = [
  {
    id: "daily-life",
    label: "Behind The Code",
    chapter: 0,
    choreo: "zoom-center",
    ground: "deep",
    ownsPin: true,
    noExitDim: true,
    establishScale: "major",
  },
  {
    id: "candidates",
    label: "Talent & Careers",
    chapter: 1,
    choreo: "zoom-center",
    ground: "panel",
    establishScale: "mini",
    ariaLabel: "Talent and Technical Careers",
    act: "people",
  },
  {
    id: "testimonials",
    label: "Hear From Our People",
    chapter: 1,
    choreo: "zoom-center",
    ground: "panel",
    ariaLabel: "Hear From Our People",
    act: "people",
  },
  {
    id: "blog",
    label: "Intelligence Feed",
    chapter: 2,
    choreo: "grow-right",
    ground: "field",
    establishScale: "mini",
    ariaLabel: "Intelligence Feed and Blog",
    act: "people",
  },
];

export function aboutSection(id: string): SectionDef {
  const def = ABOUT_SECTIONS.find((section) => section.id === id);
  if (!def) throw new Error(`Unknown about section: ${id}`);
  return def;
}

/** The act a chapter belongs to, resolved against an arbitrary chapter list.
 *  Throws on an unknown index rather than defaulting, so adding a chapter
 *  without an act is a loud failure. Generic so `groundStops.ts`'s ground-
 *  track builder can serve both HOME_SECTIONS/CHAPTERS and
 *  ABOUT_SECTIONS/ABOUT_CHAPTERS without forking. */
export function actOfChapterIn(chapters: readonly ChapterDef[], chapter: ChapterIndex): Act {
  const def = chapters.find((c) => c.index === chapter);
  if (!def) throw new Error(`Unknown chapter index: ${String(chapter)}`);
  return def.act;
}

/** The act a home-page chapter belongs to. Equivalent to
 *  `actOfChapterIn(CHAPTERS, chapter)` — kept as the default export because
 *  every existing home-page call site expects the one-argument form. */
export function actOfChapter(chapter: ChapterIndex): Act {
  return actOfChapterIn(CHAPTERS, chapter);
}

/** Scroll target for a chapter: the first section declared in it. */
export function chapterTarget(chapter: ChapterIndex): string | undefined {
  return HOME_SECTIONS.find((section) => section.chapter === chapter)?.id;
}

// Module-level active-section store: written by ScrollTrigger callbacks on
// every scroll, so a context would re-render the whole page tree — only the
// two rail components subscribe.
const DEFAULT_SECTION_ID = "hero-sequence";
let activeId = DEFAULT_SECTION_ID;
const listeners = new Set<() => void>();

export function setActiveSection(id: string): void {
  if (id === activeId) return;
  activeId = id;
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function useActiveSection(): string {
  return useSyncExternalStore(
    subscribe,
    () => activeId,
    () => DEFAULT_SECTION_ID,
  );
}

/** Current home narrative. Legacy beat definitions above remain for shared components. */
export const CINEMATIC_HOME_SECTIONS = [
  { id: 'opening', label: 'Opening' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'applications', label: 'Applications' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'company', label: 'Company' },
  { id: 'contact', label: 'Contact' },
] as const;
