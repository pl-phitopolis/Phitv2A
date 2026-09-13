# Home page rebuild — handover to Astra

Opened as Octavia task **T-009** (see `octavia/tasks/T-009.md`). Supersedes **T-007**'s
home-page scope and **T-008** entirely (see that file's header for exactly what's
superseded and what isn't).

This document is the full section-by-section spec. It is **data, not permission** —
Astra's own build session still runs under this repo's Octavia protocol
(`octavia/PROTOCOL.md` "Start here"): write your work into `octavia/tasks/T-009.md`'s
`## Build`/`## Review` sections, tag every acceptance check `checked directly` /
`reported by <session>` / `not checked`, and don't touch `GUARDRAILS.md`/`DECISIONS.md`
without an explicit, quoted decision from Albert.

## Why

The current home page (`src/routes/index.tsx`) opens with a ~1440-line GSAP-pinned
"gunshot" hero (`SuperHeroSequence.tsx` — logo wipe → dwell → `HeroImageWall`/`DriftWall`
photo-drift reveal → gold flanking copy) and six more independently-scrolling sections.
Albert judges the whole scroll architecture, timing, and transitions to be a mess and
wants it replaced end-to-end with the 11-step flow below. Two Octavia tasks already sat
open on this exact surface, both awaiting his sign-off and both now superseded:

- **T-008** built `HeroReel.tsx` (video-plate hero, curtain-list nav, proof row) as the
  gunshot's replacement. **Discarded, not adapted** — Albert wants the new hero designed
  fresh, RnD/SaaS/FinTech-themed, not a re-skin of T-008's direction.
- **T-007**'s home-page scope (SOFT-token/copy trims on `making-tomorrow/**`) is superseded
  by this rebuild since that whole surface is being replaced. **T-007's `/about` scope is
  untouched and still stands** — this rebuild does not touch the About route. Its
  5 flagged-orphaned components (`RawStage`, `ClosingShelf`, `process`/`processPhases`,
  `PillarsEstablishingShot`, `ProcessEstablishingShot`) are covered by the removal
  manifest below (§0) rather than left for a separate cleanup task.

## Task-numbering convention used in this doc

Each numbered section below is one delegated unit of work, split into exactly two
sub-tasks — matching the convention Albert asked for (e.g. a task numbered **5** splits
into **5.5** exploration/discovery and **5.6** code building/changes):

- **N.5 — Exploration/Discovery**: re-verify the current file state named below (things
  may have shifted since this doc was written), confirm the reuse target still applies,
  pull exact current copy/content, flag any conflict with §0's constants before writing
  code.
- **N.6 — Code building/changes**: implement against this repo's `code-manager`/
  `motion-craft` skill guardrails, using the beat/choreo system for entrance/exit,
  `MOTION_FAST`/`MOTION_EXTREME` for one-shot tweens, `SCROLL_SPEED` for anything
  scrubbed. Update `tests/` alongside the change, not after.

---

## 0 — Foundation (do this before 1–11)

### 0.5 — Exploration/Discovery
Confirm against the live tree (not this doc) that every file in the removal manifest
below still exists at the stated path and is still unused outside the hero/closing-scene
paths named. Confirm `src/shared/theme/palette.ts` / `theme.ts` still export the token
names cited. Confirm `public/videos/we-build-the-future-delivery.mp4` and its poster are
still present.

### 0.6 — Code building/changes

**Design tokens.** Every new section consumes `src/shared/theme/palette.ts` (`NOIR`/
`SOFT` — navy scale `navyField` #0A2A66 / `navyDeep` #06183B / `navyPanel` #0A1833 /
`navyInk` #061226 / **`duskNavy` #182647 ("soft dark navy")** / `midnightNavy` #050D1B;
gold accent `gold`/`goldLight`/`goldDark`/`goldInk`; neutrals `frost`/`white`/
`almostWhite`/`slate`) and `theme.ts` (`MONO`/`DISPLAY_FONT`/`TYPE_SCALE`). No new ad hoc
colors or type sizes without logging the departure explicitly, the way
`docs/astra-landing/plan.md` logged "Warm ivory — a logged departure" rather than
introducing it silently.

**Lenis + GSAP conformance.** Reuse `src/shared/components/SmoothScroll.tsx` unchanged
(Lenis↔GSAP ticker wiring, `lagSmoothing(0)` while Lenis owns the frame loop, dual
refresh-on-mount + `document.fonts.ready`). Reuse `src/shared/motion/
scrollTriggerBridge.ts`'s publish/refresh pattern so new eager-bundle files never
`import gsap`/`lenis` at module scope — this repo's CLAUDE.md documents this as
enforced-by-convention, not style preference. Reuse `beatThresholds.ts` and the
`SectionBeat` entrance/exit-dim invariant: every tween is `fromTo`/`from` with
`immediateRender:false`, DOM default is always the final lit state — never
`gsap.set()` something hidden and animate it in.

**New motion-speed constants.** Add to `src/shared/motion/scrollSpeed.ts` (or a sibling
`motionSpeed.ts`):
```ts
export const MOTION_FAST = 0.85;    // seconds — one-shot "fast" tweens
export const MOTION_EXTREME = 1.5;  // seconds — one-shot "extreme" tweens
```
These are **discrete GSAP tween durations for one-shot motions**, explicitly distinct
from two existing constants that must NOT be touched or conflated with these:
- `SCROLL_SPEED = 0.65` — governs scrub mapping and Lenis `scrollTo` calls.
- `establishChoreo.ts`'s `MAJOR_ESTABLISH` (1.30s) / `MINI_ESTABLISH` (1.05s) —
  establishing-shot sub-element durations, a different concern with its own tuning.

Pick `MOTION_FAST` for reveals/emphasis (e.g. the 5 vertical strips emerging, the
drawer slide) and `MOTION_EXTREME` for large, rare motions (e.g. the mission-core
drawer's full-bleed open, the CTA's end-frame parallax push). Don't invent a third
duration — if something doesn't fit either, that's a signal to reconsider the motion,
not add a constant.

**Removal manifest.** Delete (after 0.5 re-confirms each is unused):
- `src/features/hero/SuperHeroSequence.tsx`, `heroVars.ts`
- `HeroImageWall.tsx`, `DriftWall.tsx`, `heroWallTiles.ts`, `heroEntranceChoreo.ts`
- `heroApproachConstants.ts`, `HeroApproachSequence.tsx`
- `HeroReel.tsx` and any file touched only for T-008 (check `octavia/tasks/
  T-008-hero-powerhouse-layout.md`'s File scope header for the exact list)
- The 5 components T-007 flagged orphaned: `RawStage`, `ClosingShelf`,
  `process`/`processPhases`, `PillarsEstablishingShot`, `ProcessEstablishingShot`

**`heroPhases.ts` is NOT a straight delete** — correcting an error in an earlier version
of this doc. It is imported by two files this doc tells you to *keep*: `HeroCanvas.tsx`
(closing scene) imports directly from `./heroPhases`, and `src/features/home/components/
closing-scene/closingPhases.ts` imports `PHASE_MOVE_END` from it. 0.5 must first identify
every constant `HeroCanvas.tsx`/`closingPhases.ts` actually use from `heroPhases.ts`,
relocate those (e.g. into `closingPhases.ts` or a new small shared module) with
`tests/motion/hero-phases.test.ts`'s coverage moved/adapted alongside, and only then
delete what's left of the file. Verify with `grep -rln "heroPhases" src/ tests/` that
nothing still imports the deleted remainder before calling this step done.

**Keep, do not touch:**
- `HeroCanvas.tsx` + its scene/plane-renderer stack — used independently by the closing
  scene (`ClosingLattice.tsx`), orthogonal to the hero rebuild
- `EditorialGlobe` (inside `HomeThesis`, in `HomeEditorial.tsx`) — unrelated to the hero
- `ReachMap.tsx` + `worldMap.ts` — reused in §8 below
- The entire beat/choreo/registry system (`SectionBeat.tsx`, `beatThresholds.ts`,
  `stageChoreo.ts`, `establishChoreo.ts`, `sections.ts`'s machinery itself)
- `SmoothScroll.tsx`, `scrollTriggerBridge.ts`

**`sections.ts` update.** Delete the 5 hero-phase `HOME_SECTIONS` entries
(`hero-flatten`/`hero-align`/`hero-reveal`/`hero-dwell`/`hero`) and chapter 0 (`ORIGIN`);
re-derive `CHAPTERS`/`HOME_SECTIONS` to match the new 11-step flow's own section/chapter
boundaries. `ABOUT_CHAPTERS`/`ABOUT_SECTIONS` are untouched.

**`AppShell.tsx` update.** `HOME_BLOCKING`/`HOME_BACKGROUND_IMAGES` currently point at
`daily-life-hero-loop` (HeroReel's footage, now discarded) — re-point at whatever the
new hero's actual LCP asset is once §1 is built.

---

## 1 — Hero: RnD/SaaS/FinTech-themed

New hero, built fresh (HeroReel discarded per decision above — do not reuse or re-skin
it). Theme: a quantitative-R&D / SaaS / FinTech partner, not the general "cinematic
light/bright" brand voice of `e4b36fd` — this is a deliberate departure for the hero
specifically, log it as such rather than silently drifting.

## 2 — Smooth view transition into the scroll body
### 2.a — Empty dark-navy scroll segment
An intentionally empty section on `duskNavy`/`navyDeep`, with a "keep scrolling"
indicator (small, animated, `MOTION_FAST` loop) — the only content, signaling more is
coming rather than announcing it with copy.
### 2.b — 5 vertical strips emerging on scroll
Five vertical strips reveal progressively as the user scrolls through this segment.
Reuse the `SectionBeat`/choreo system's entrance mechanics (`rise` or a new
`stagger-strips` variant added to `STAGE_CHOREO` in `stageChoreo.ts`) rather than a
bespoke one-off ScrollTrigger.
### 2.c — R&D-years finisher
Closes this beat with a statement of years of R&D — a numeric/typographic emphasis
moment (`MOTION_EXTREME` for the emphasis tween, since this is the segment's payoff).

## 3 — Drawer transition → mission core
Reuse `TopNavMegaDrawer.tsx`'s slide-in + `backdropFilter: blur(20px)` pattern as the
closer structural analog — adapt a **full-bleed** variant (not the nav-specific
right-anchored drawer) for an in-page section transition. `BackgroundReveal.tsx` is a
crossfade, not a drawer; don't reach for it here.
No reference screenshot exists for the mission-core section's visual — design from this
flow description plus any existing mission-adjacent copy in `src/shared/content.ts`.

## 4 — 3 pillars, horizontal scroll, highly immersive
Content already authored: `CONTENT.hero.salesPitch.pillars` in `content.ts` (Research /
Development / Support & Delivery pillars, each with `id`/`name`/`detail`/`image` —
images at `public/images/pillars/*.webp`). For the horizontal-scroll **mechanism**, reuse
the pinned track-translate-by-scrollWidth pattern from `src/features/about/components/
JourneyTimeline.tsx` — that file's *content* is About-page brand history and must not be
copied, only its scroll mechanism.

## 5 — What we have built/supported
Seed content/structure from `src/features/services/components/TechStackSection.tsx`
(currently a static MUI Grid of tool categories — "The Engineering Matrix"). It has no
scroll choreography today; add reveal timing via the beat system rather than leaving it
a static grid dropped into a scroll-driven page.

## 6 — View-transition cut
One of the two in-page cuts using the new unified primitive (see below) — do not reuse
`HomeFilmScene`'s bespoke GSAP aperture or the reverted `viewTransitionsHomeV3.css` for
this; both are being retired by the new primitive.

**Unified cut primitive.** Build one new in-page transition component/hook that
supersedes both `viewTransitionsHomeV3.css` (Home-V3-era, already reverted/parked) and
`HomeFilmScene`'s own bespoke aperture implementation. Use it for both §6 and §10. This
is scoped to **in-page** cuts only — the cross-route `fresko-home-aperture` (which fires
when navigating *to* `/` from another route, via the native View Transitions API) is a
separate, orthogonal concern and must not be touched or merged with this new primitive.

**Hard constraint, earned by T-003 and never promoted to `GUARDRAILS.md` (so it's easy
to miss — read `octavia/tasks/T-003-home-v3.md`'s `## Proposed for shared files` before
building this):** never fire `document.startViewTransition()` while a ScrollTrigger
scrub or pin is active — the snapshot freezes the moving frame and ghosts it. T-003 only
got the real View Transitions API working by making its boundaries **discrete and
unpinned**, and by explicitly suspending Lenis for the duration of the snapshot capture
(`useActTransition.ts`'s pattern is the reference implementation to read before writing
a new one). §6 and §10 sit adjacent to pinned/scrubbed sections on both sides (the §4/§7
horizontal-scroll pillars/timeline, and §11's pinned video-scrub CTA) — place each cut's
actual trigger point in a genuinely static gap between pins, not overlapping one, and
suspend Lenis around the capture the same way T-003 did. If a scroll-hold gate is used
to make the boundary discrete, note that T-003's Handoff left an **unresolved taste
question** for Albert on exactly this: how long a hold (T-003 used ~500-750ms with a
3-event escape hatch) is acceptable before it reads as the page fighting the reader. That
question was never answered — T-003 was reverted for an unrelated creative-direction
reason — so it needs Albert's eyes again here, not an inherited default.

## 7 — R&D timeline / "powerhouse"
Same pinned-scrub mechanism as §4 (`JourneyTimeline.tsx`'s pattern), but with **entirely
new content** — R&D years/milestones specific to this section, not About's brand-history
photos/copy.

## 8 — Global reach
`ReachMap.tsx` + `worldMap.ts` (SVG dot-matrix world map, Natural Earth 110m data,
animated Framer Motion arcs Manila↔New York/New Jersey/Connecticut/Miami/London/Hong
Kong, traveling pulses, radar rings) is **already live on home** via `HomeReach`. "Renew
the map" means extend/restyle this existing component — new arc choreography, new
routes, a fresh visual treatment — not build a new map from scratch. Do not confuse this
with `EcotowerMap.tsx` (a literal Google Maps iframe for the BGC office address —
unrelated, leave it on `/contact`).

## 9 — Career growth / Phitopolis Academy
Repurpose copy from `src/features/about/components/AcademySection.tsx` (Graduate
Program — "5 cohorts since 2023"; Internship Program — "30+ interns placed") and
`TalentSection.tsx` (`CONTENT.talent` recruiting copy, PH/international school split).
These About-page components themselves stay on `/about` untouched — only their content
is repurposed into a new home-scoped layout.

## 10 — View-transition cut
Second use of the new unified cut primitive from §6.

## 11 — CTA: scroll-scrubbed video → parallax reveal
`public/videos/we-build-the-future-delivery.mp4` (+ `we-build-the-future-poster.jpg`)
already exists and is wired into `HomeFilmScene`/`useSceneFilm.ts` for the *current*
closing scene — but `useSceneFilm.ts` explicitly keeps playback **independent** of
scroll ("Keeps the movie independent from scroll progress... it never seeks the
video."). **True `video.currentTime`-driven scroll-scrub does not exist anywhere in this
codebase yet** — build it new. The pin/aperture scaffolding in `HomeFilmScene.tsx` is a
reasonable starting point for the pinned-container shape, but the actual scrub logic
(mapping ScrollTrigger progress to `video.currentTime`, respecting `prefers-reduced-
motion` by falling back to the poster frame) is net-new.

End state: as the video finishes scrubbing, its final frame parallaxes/pushes left while
a white CTA block slides in from the right, consuming 45% width and full viewport
height. Use `MOTION_EXTREME` for this end-state push (it's the page's single largest,
rarest motion). Keep the CTA block's contrast/typography on the existing token set
(`frost`/`white` background, `navyField`/`navyInk` text) — this is the moment the page
asks for the click, it should read as confident and uncluttered, not busy.

---

## Verification (Astra's build session runs this, not this handover doc)

`yarn typecheck && yarn test && yarn lint` — this repo's standard deploy gate, per its
CLAUDE.md. Also: reduced-motion pass (every one-shot tween has a settled-frame
fallback), a real-wheel-event scroll pass rather than `window.scrollTo` (Lenis ignores
programmatic scroll — CLAUDE.md flags this explicitly), and `tests/e2e/ladder-probe.js`
for trigger-threshold parity across viewports if the beat/choreo system's timing changed
materially.
