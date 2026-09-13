# T-009 — Home page rebuild: remove gunshot hero, rebuild scroll flow end-to-end
Status: active · Mode: solo · Opened: 2026-09-13
Branch: main · File scope: src/routes/index.tsx, src/features/hero/** (deletions),
src/shared/sections.ts, src/shared/motion/scrollSpeed.ts (new MOTION_FAST/MOTION_EXTREME),
src/shared/components/AppShell.tsx (HOME_BLOCKING/HOME_BACKGROUND_IMAGES), new home
section components (per docs/home-rebuild-2026-09/handover.md), src/features/home/**,
tests/ (motion + home-route coverage for the new flow)
Merged: <blank — nothing built yet>

## Current
Stage: plan done (2026-09-13) — full handover written for an Astra orchestrator to
delegate and drive the build. No application code touched yet. Supersedes T-007's
home-page scope and all of T-008 (see below).
Blocking: none. Next: Astra's build session, delegating per the N.5/N.6 breakdown in
the handover doc.

## Plan                         [claude → albert]

### Goal
Tear out the home page's "gunshot" hero (`SuperHeroSequence.tsx`) and the entire
existing home scroll architecture, and rebuild it to Albert's 11-step flow: an
RnD/SaaS/FinTech hero → empty-navy scroll teaser → 5 vertical strips → R&D-years
finisher → drawer transition → mission core → 3-pillars horizontal scroll → built/
supported → view-transition cut → R&D timeline → global reach → career-growth/Academy
→ view-transition cut → video-scrub CTA — conforming to this repo's design tokens and
Lenis+GSAP conventions, with two new named motion-speed constants (`MOTION_FAST=0.85s`,
`MOTION_EXTREME=1.5s`).

### Done when
`/` renders all 11 flow steps in the full spec at `docs/home-rebuild-2026-09/
handover.md`; the removal manifest in that doc's §0 is fully deleted with nothing left
importing the removed files; `yarn typecheck && yarn test && yarn lint` pass at this
repo's documented green baseline.

### Acceptance checks
- `yarn typecheck` clean — Runner: Astra's build session. **not checked**.
- `yarn lint` 0 errors — Runner: Astra's build session. **not checked**.
- `yarn test` at or above the documented baseline (611/612, one pre-existing
  `preview-cdp.test.ts` flake) — Runner: Astra's build session. **not checked**.
- No remaining import of any file in the §0 removal manifest
  (`SuperHeroSequence.tsx`, `heroPhases.ts`, `heroVars.ts`, `HeroImageWall.tsx`,
  `DriftWall.tsx`, `HeroReel.tsx`, the 5 T-007-orphaned components, etc.) — Runner:
  Astra's build session. **not checked**.
- Live, real-wheel-event scroll pass (not `window.scrollTo` — Lenis ignores
  programmatic scroll) confirms all 11 sections render and reveal correctly at
  1440/768/375 — Runner: Astra's build session. **not checked**.
- Reduced-motion pass: every one-shot tween (`MOTION_FAST`/`MOTION_EXTREME`) has a
  settled-frame fallback, no stranded hidden content — Runner: Astra's build session.
  **not checked**.
- `AppShell.tsx`'s `HOME_BLOCKING`/`HOME_BACKGROUND_IMAGES` point at the new hero's
  actual LCP asset, not the discarded `daily-life-hero-loop` — Runner: Astra's build
  session. **not checked**.

### Approach
See `docs/home-rebuild-2026-09/handover.md` for the full section-by-section spec,
reuse-target table, and the N.5 (exploration/discovery) / N.6 (code building/changes)
delegation breakdown per flow step — that document is this task's Approach in full;
it is not duplicated here per Octavia's own "Approach" precedent (T-008 links out to
its plan file the same way).

Key decisions made in chat with Albert (2026-09-13), recorded here since they are not
otherwise evidenced anywhere in the repo:
- `HeroReel.tsx` (T-008) is **discarded**, not adapted — new hero built fresh.
- No mission-core reference screenshot exists; design section 3 from the text flow
  description plus existing `content.ts` copy.
- Both in-page view-transition cuts (flow steps 6 and 10) use **one new unified cut
  primitive**, retiring `viewTransitionsHomeV3.css` and `HomeFilmScene`'s bespoke
  aperture. The cross-route `fresko-home-aperture` (View Transitions API, fires on
  navigation *to* `/`) is untouched — orthogonal concern.

### Open questions
- T-007's `/about` scope (untouched by this task) still needs Albert's manual visual
  review independently — not resolved by T-009 superseding T-007's home-page half.
- Whether `HeroCanvas.tsx`'s scene/plane-renderer stack should eventually also serve
  something in the new hero (§1) is left to Astra's 0.5/1.5 exploration to judge — this
  plan keeps it untouched by default since it's currently only consumed by the closing
  scene.

## Build                        [pending — Astra]
Not started.

## Review                       [pending]
Not started.

## Proposed for shared files
- PROJECT.md "Careful of" (candidate, not yet promoted — needs Astra's build session to
  confirm it still holds): the home page has **three separate "view transition"
  mechanisms** in flight before this task (cross-route `fresko-home-aperture`, the
  reverted Home-V3 `viewTransitionsHomeV3.css`, and `HomeFilmScene`'s own bespoke GSAP
  aperture) — a future session touching "transitions" on this page should check which
  one it means before assuming there's only one.

## Log
- 2026-09-13 claude/plan: Explored current hero/home architecture (SuperHeroSequence,
  heroPhases/heroVars, sections.ts registry, beat/choreo system, SmoothScroll,
  scrollTriggerBridge), reusable components for the new flow (JourneyTimeline's
  horizontal-scrub mechanism, ReachMap, TechStackSection, AcademySection/TalentSection,
  pillar content already in content.ts, TopNavMegaDrawer's drawer pattern), and the
  Octavia/Astra context (read SESSION.md, PROTOCOL.md, TASKS.md; found T-007/T-008 open
  and unsigned-off on this exact surface; found `docs/astra-landing/plan.md` as the
  closest prior Astra-authored doc, and `docs/hero-upgrade/`'s stage ledger as the
  closer precedent for a numbered task-delegation structure). Asked Albert 4 clarifying
  questions in chat (HeroReel disposition, missing mission-core screenshot, Octavia
  task-filing relationship to T-007/T-008, which view-transition mechanism to
  standardize on) — answers recorded in Approach above. Wrote
  `docs/home-rebuild-2026-09/handover.md` (full spec) and this task file. Nothing
  committed; no application code touched.

## Handoff
Status: plan complete, handed off — next runner is an Astra orchestrator session (or
Albert kicking it off), not this session. Could not do: any actual code changes (out of
this session's scope by design — deliverable was the plan/handover only). Need: Albert
to hand `docs/home-rebuild-2026-09/handover.md` + this task file to the Astra session
that will run the N.5/N.6 delegations; Astra's build session must still open with
`GUARDRAILS.md` + `PROTOCOL.md` "Start here" like any other session.
Watch not run — no repo checkout listed for the Watch tool from this session.
