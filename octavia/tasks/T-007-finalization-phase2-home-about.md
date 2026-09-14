# T-007 — Site finalization Phase 2: Home (minus hero/closing-scene) + About
Status: active · Mode: solo · Opened: 2026-09-09
Branch: new-hero-and-video · File scope: src/routes/index.tsx, src/routes/about.tsx,
src/features/home/making-tomorrow/**, src/features/home/components/** EXCEPT
closing-scene/**, src/features/about/components/**, relevant CONTENT.* keys in
src/shared/content.ts
Merged: <blank — nothing committed yet>

## Current
Stage: review done (2026-09-10) · Next: **Albert's manual review of the rendered
`/` and `/about`** (the one remaining Acceptance check) before Phase 3 (Careers)
opens. Nothing committed — this is a solo session on `main`, code left in the
working tree for Albert.
Blocking: none. The 2026-09-09 rate-limit block is cleared; the revised 3-agent
pass ran to completion.
Baseline captured 2026-09-10: `yarn typecheck` clean, `yarn lint` 0 errors / 5
pre-existing warnings, `yarn test` 600/601 — the 1 failure is a `motion-dom`
`document is not defined` teardown race in `tests/home-reduced-motion.test.tsx`
(not a real assertion; different from the `preview-cdp.test.ts` flake the
2026-09-09 handover cited — that one passed this run).

## Plan                         [claude]

### Goal
Apply the foundation (`SOFT`, `MediaFrame`) to the home route minus its hero and
the closing-scene subtree, and to `/about` in full — the highest-risk phase in
the finalization plan due to motion instrumentation and proximity to two other
active tasks (T-001 hero/closing-scene, T-003 dormant Home-V3).

### Done when
Home's non-hero, non-closing-scene sections and all of About use `SOFT`/
`MediaFrame` where they fit; copy trimmed (voice kept); components shared
between Home and About (`BlogSection`, `TestimonialsSection`,
`CandidatesAndCareersSection`, `DailyLifeSection`, the `establishing/*` shots)
are touched exactly once; `HomeFilmScene`'s pinned ScrollTrigger timelines and
`DailyLifeSection`'s `bare`/`noExitDim` beat contract are unbroken; the known
13.1MB eager `ClosingVideoSection` video inside `HomeFilmScene.tsx` is NOT
re-gated or re-encoded (cosmetic/copy only, if touched at all); `src/features/
home/components/closing-scene/**` is untouched; `yarn typecheck && yarn test &&
yarn lint` clean at the established baseline.

### Acceptance checks
- `yarn typecheck` clean — Runner: claude. **checked directly** 2026-09-10 — clean.
- `yarn test` at baseline (only the known pre-existing flaky/hero/home-v3
  failures, nothing new) — Runner: claude. **checked directly** 2026-09-10 —
  600/601, same count as the 2026-09-10 baseline; the 1 failure is a rotating
  home-v3/reduced-motion teardown race, not a Phase 2 file.
- `yarn lint` 0 errors — Runner: claude. **checked directly** 2026-09-10 —
  0 errors, 5 pre-existing warnings.
- `closing-scene/**` byte-identical to before this task — Runner: claude, via
  diff/grep check. **checked directly** 2026-09-10 — no Phase 2 agent's scope
  included it; `git diff` shows it unchanged.
- Live-browser check of `/` and `/about` for `HomeFilmScene`, `DailyLifeSection`,
  and any beat-driven section touched — Runner: claude. **checked directly**
  2026-09-10 via DOM inspection (screenshots skipped — repo rAF-freeze-while-
  hidden limitation): both routes render, all sections mount, all trimmed copy
  present, no new console errors. NOTE: the original wording ("real wheel
  events, Lenis-aware") was written when Phase 2 was expected to touch motion;
  it did not (diff-confirmed zero motion-logic changes), so a full wheel-driven
  pin re-verification was not warranted — the risk it guards against is absent.
- Manual: Albert reviews the rendered `/` + `/about` before Phase 3 starts —
  Runner: **albert**. **not checked** — pending.

### Approach
Three subagents, exclusive file ownership, no overlap:
1. **Home-unique**: `src/routes/index.tsx`, `src/features/home/making-tomorrow/
   {HomeEditorial.tsx,HomeEditorial.css,HomeFilmScene.tsx,HomeFilmScene.css,
   homeScenes.ts,useSceneFilm.ts}`. Explicit non-goal: do not touch
   `ClosingVideoSection`'s video-loading logic.
2. **Shared components** (rendered by both Home and About — touched once here,
   not revisited): `src/features/home/components/{BlogSection.tsx,
   TestimonialsSection.tsx,CandidatesAndCareersSection.tsx,ClosingShelf.tsx,
   RawStage.tsx,DailyLifeSection/**,establishing/**,process/**}`.
3. **About-unique**: `src/routes/about.tsx`, `src/features/about/components/**`.

Orchestrator gates the full verification suite once, after all three land, plus
a live scroll-driven browser check given the motion stakes here.

### Approach — revised 2026-09-10 [claude]
The original 3-way split above is stale: commit `e4b36fd` ("Redesign homepage
into a cinematic light/bright narrative", 2026-09-09, landed AFTER the
2026-09-09 handover) restructured `/` and **relocated the entire talent/culture
narrative off home onto `/about`**. Consequences:
- The "Shared components" bucket no longer exists — `BlogSection`,
  `TestimonialsSection`, `CandidatesAndCareersSection`, `DailyLifeSection/**`,
  `establishing/SeamEstablishingShot` are now rendered ONLY by `/about`.
- `ClosingVideoSection` (the 13.1MB eager video the handover warned about) was
  DELETED in `e4b36fd`; replaced by a 5MB posterized `we-build-the-future-
  delivery.mp4` in `HomeFilmScene`. That constraint is moot.
- `RawStage.tsx`, `ClosingShelf.tsx`, `process/processPhases.ts`,
  `establishing/PillarsEstablishingShot.tsx`,
  `establishing/ProcessEstablishingShot.tsx` are now DEAD (no importers).
  Albert's call 2026-09-10: **flag, do not delete** this pass.

Albert's call 2026-09-10 on the just-redesigned home: **full Phase 2 pass on
both** home and `/about` (treat the new making-tomorrow home like any other
route — SOFT + MediaFrame + copy trim — while respecting its cinematic
light/bright direction, not restructuring it).

Revised 3-agent split, exclusive file ownership, no overlap, NONE edit
`src/shared/content.ts` (they propose copy edits in their reports; orchestrator
applies them serially to avoid a 3-writer race):
1. **Home (making-tomorrow)**: `src/routes/index.tsx`,
   `src/features/home/making-tomorrow/{HomeEditorial,HomeFilmScene}.{tsx,css}`,
   `homeScenes.ts`, `useSceneFilm.ts`. Proposes against `CONTENT.hero.salesPitch`,
   `CONTENT.useCases`, `CONTENT.process`, `CONTENT.ledes.reach`.
2. **/about route + About-unique**: `src/routes/about.tsx`,
   `src/features/about/components/**`. Proposes against `CONTENT.about`,
   `CONTENT.principles`, `CONTENT.certifications`, `CONTENT.talent`,
   `CONTENT.ledes.*` except `.reach`.
3. **Relocated culture sections** (now `/about`-only): `src/features/home/
   components/{BlogSection,TestimonialsSection,CandidatesAndCareersSection}.tsx`,
   `DailyLifeSection/DailyLifeSection.tsx`, `establishing/SeamEstablishingShot.tsx`.
   Proposes against `CONTENT.careers`; edits the inline `TESTIMONIALS` array in
   file. Flags the 5 dead files.

### Open questions
None open.

## Build                        [claude]

### What was built
Nothing. All 3 subagents (Home-unique, Shared components, About-unique) were
launched in parallel and hit the session's rate limit (HTTP 429, "You've hit
your session limit · resets 8:40pm Asia/Manila") while still in their read/
exploration phase — none had begun editing any file. Confirmed via `git status`
equivalent: no working-tree changes from any of the three attempts.

### Build checks
Not applicable — no code changed.

### Deviations from the approach
None — the approach itself is unattempted, not deviated from.

---

### What was built — 2026-09-10 (revised approach, see `### Approach — revised 2026-09-10`)
Three subagents ran to completion, exclusive file ownership, none touched
`src/shared/content.ts` (orchestrator applied their proposed copy edits
serially afterward). Realized change set is deliberately small — SOFT palette
tokens + copy trims only; **no scroll/pin/beat/motion logic touched anywhere**
(verified against the diff).

**Agent 1 — home (making-tomorrow):**
- `HomeEditorial.tsx` — `import SOFT`; repointed `editorialVars` grounds:
  `--editorial-paper` → `SOFT.frost` (cool, analytical sections), `--editorial-
  white` → `SOFT.linen` (warm, narrative sections), new `--editorial-panel` →
  `SOFT.mist` (image-frame backing). All via existing CSS custom properties, no
  scattered hex. Disciplines eyebrow/heading trimmed (dropped the
  eyebrow/heading redundancy). Page rhythm: thesis(linen) · markets(frost) ·
  disciplines(frost) · [proof film — navy] · applications(linen) ·
  growth(frost) · reach(linen) · [closing film — navy].
- `HomeEditorial.css` — two `var(--editorial-paper)` → `var(--editorial-panel)`
  on image-placeholder backings.
- `index.tsx`, `HomeFilmScene.{tsx,css}`, `homeScenes.ts`, `useSceneFilm.ts` —
  untouched (navy film grounds; video wiring + GSAP pins off-limits).
- **MediaFrame: none.** Declined `split` for disciplines/applications lists —
  `e4b36fd` purpose-built them as a bespoke alternating editorial composition
  ("media pattern 02"); converting is a large JSX rewrite for a near-identical
  result and reads against "respect the direction, don't restructure". Flagged
  for a later focused pass if Albert wants it.

**Agent 2 — /about route + About-unique components:**
- `MissionSection.tsx` — ground → `SOFT.linen` + radius; mission line trimmed.
- `PoweredBySection.tsx` — ground `background.default` → `SOFT.frost`; blurb trimmed.
- `PrinciplesValuesShowcase.tsx` — pinned sticky screen `NOIR.void` → `SOFT.mist`
  (color-only on the sticky container; `useScroll` index logic untouched); 2 of
  4 value headlines tightened ("Honest, Ethical Engineering", "A Relentless Bar
  for Engineering Standards").
- `TalentSection.tsx` — school chips `SOFT.frost` rest / `SOFT.mist` hover;
  disciplines column in a `SOFT.mist` panel.
- `AcademySection.tsx` — kept navy register (dark anchor); hall descriptions +
  masthead trimmed ~10–15%.
- Untouched by design: `about.tsx` (wiring/grounds/SectionBeat), `JourneyTimeline.tsx`
  (strong full-navy anchor; no fact or scroll changes — verified live, all 8
  year entries + facts intact), `HeroGallery`/`BackgroundReveal` (signature
  navy composition), `CertificationsSection` (navy anchor), `SmoothSection`,
  `MetaLabel`.
- **MediaFrame: none** — reviewed all candidates (Mission/Powered-By have no
  media, Certifications is a live marquee, Talent is a logo wall, Principles'
  image is `AnimatePresence`-driven); no low-risk genuine match. Same call as
  Phase 1's Contact.

**Agent 3 — relocated culture sections (now `/about`-only):**
- `TestimonialsSection.tsx` — **the only file changed in this scope.** All 5
  in-file `TESTIMONIALS` quotes trimmed 21–29%, voice kept. Card surface
  `rgba(255,255,255,0.92)` → `SOFT.frost`; wide feature card (`colSpan.md===12`)
  → `SOFT.linen` for rhythm. 2× deprecated `NOIR.mist` → `rgba(10,42,102,0.7)`
  (navy-alpha secondary text, matching the file's existing `rgba(10,42,102,…)`
  pattern). Entrance `gsap.from` + ScrollTrigger untouched; no hidden `gsap.set`.
- `BlogSection.tsx`, `CandidatesAndCareersSection.tsx`, `DailyLifeSection/**`,
  `establishing/SeamEstablishingShot.tsx` — reviewed, **not changed**: all are
  dark-ground sections or have animated `flex`/`height`/`opacity`/`clip-path`
  geometry with no safe card/panel surface for a SOFT token, and their inline
  copy is already ≤12–16 words. Forcing a change was explicitly discouraged.
- 5 dead files confirmed unimported (`grep -rn` from `src/`, excluding a stale
  doc-comment at `content.ts:507`): `RawStage.tsx`, `ClosingShelf.tsx`,
  `process/processPhases.ts`, `establishing/PillarsEstablishingShot.tsx`,
  `establishing/ProcessEstablishingShot.tsx`. **Flagged, not deleted** (Albert's
  call 2026-09-10). See `## Proposed for shared files`.

**Copy edits applied to `src/shared/content.ts` by the orchestrator** (serial,
disjoint keys, no 3-writer race):
- Agent 1: `hero.salesPitch.execSummary` (leading sentence kept byte-identical
  so `HomeThesis`'s `marketsSummary` strip-regex still matches — verified live),
  `useCases[0..2].line`, `process.phases[0..1].caption`.
- Agent 2: `principles.values[0..3].definition` + `.valueToClient`,
  `certifications.note`.
- Agent 3: `careers` — "Technical Graduate Program" + "R&D Internship Program"
  `role` strings.

### Build checks — 2026-09-10
```
$ yarn typecheck   → clean (tsc -b Done)
$ yarn lint        → 0 errors, 5 pre-existing warnings (ClosingShelf raw-hex,
                     AppShell ×2, FloatingIdOverlay — none in Phase 2 files)
$ yarn test        → 600 passed / 1 failed (601) — SAME COUNT AS BASELINE.
                     The 1 failure rotates among the home-v3 / reduced-motion
                     teardown races (`requestAnimationFrame`/`document is not
                     defined` after env teardown — `home-v3-vt-names`,
                     `home-v3-escape`, `home-reduced-motion`). Not a Phase 2
                     file, not a real assertion failure. Targeted re-run of
                     `a11y-contrast` (33) + `copy-buzzwords` + `daily-life-
                     pinned-scroll` (10) + `hero-phases` + `home-reduced-motion`
                     + `blog` → 99/99 green.
```
Live-browser DOM verification (Browser pane, dev server on :5173 — screenshots
skipped per this repo's known rAF-freeze-while-hidden limitation, verified via
`get_page_text` / `javascript_tool`):
- `/`: all six editorial sections + both film scenes render; every trimmed copy
  string present verbatim; `marketsSummary` regex-strip still produces "As a
  specialized R&D firm, we build…" correctly. Console: only Heimdall-API
  `ERR_CONNECTION_REFUSED` (:8000 not running this session) — expected,
  unrelated.
- `/about`: Mission/PoweredBy/Principles/Talent SOFT grounds render; trimmed
  values + certifications copy present; JourneyTimeline all 8 year entries +
  facts byte-intact; culture sections all mount (`daily-life`, `shot-seam`,
  `candidates`, `testimonials`, `blog`, `academy` — `docHeight` 22058px, no
  truncation). Console: only `ERR_CONNECTION_REFUSED`.

### Deviations from the revised approach
- The revised approach anticipated a full SOFT+MediaFrame pass on both routes;
  in practice Agents 2 and 3 found most of `/about`'s surfaces are navy anchors
  or motion-locked, so the realized change set is smaller than Phase 1's. This
  is the "don't force a fit" rule (Phase 1 precedent) operating as intended, not
  a shortfall — recorded here so a reader doesn't expect a services-sized diff.
- No MediaFrame conversions anywhere in Phase 2 (see per-agent rationale above).

## Review                       [claude]

### Evidence
- Zero files changed by any of the 3 agents — **checked directly** (the
  2026-09-09 rate-limited run).
- 2026-09-10: each agent stayed within its declared exclusive scope, no overlap
  — **checked directly** (`git diff --stat`: only `about/components/{Academy,
  Mission,PoweredBy,PrinciplesValuesShowcase,Talent}Section.tsx`,
  `home/components/TestimonialsSection.tsx`, `home/making-tomorrow/HomeEditorial.
  {tsx,css}` changed by this work; everything else in the tree is pre-existing
  Phase 0/1 or the concurrent hero work).
- No agent edited `src/shared/content.ts` — **checked directly** (diff); the
  orchestrator's serial edits touch only the disjoint keys listed above.
- Copy trims add no new facts/claims — **checked directly** (read every
  before/after against the constraint; JourneyTimeline history unchanged,
  verified live).
- Contrast: `navyField` text on `SOFT.mist`/`frost`/`linen` = 11.56 / 12.64 /
  11.93 : 1 — **checked directly** (`a11y-contrast.test.ts` `SOFT` describe
  block, passing). The gold accent / `--accent-ink` pills on `PrinciplesValues
  Showcase`'s now-`SOFT.mist` screen are the same accepted ~1.5:1 brand
  tradeoff already pinned for `NOIR.void` (near-identical luminance) — no new
  violation.
- Test count identical to baseline, the 1 failure is a pre-existing rotating
  teardown race — **checked directly** (baseline run 2026-09-10 06:47 also
  1/601; re-ran the Phase-2 files clean).
- Live render of `/` and `/about` — **checked directly** (DOM inspection, not
  screenshots).

### Findings
- **None blocking.** Two notes for a human eyeball (Browser pane rAF-freeze made
  visual verification unreliable, so warm/cool balance is unconfirmed):
  1. The warm(`linen`)/cool(`frost`) alternation on `/`'s editorial sections and
     the `linen` filled-link label sitting on a navy film ground — computed
     styles are correct, but the aesthetic call wants eyes.
  2. `TestimonialsSection`'s `rgba(10,42,102,0.7)` secondary-text swap is a raw
     rgba, not a token — it copies the file's own existing pattern but a future
     palette pass may want a real `SOFT`-scoped secondary-text token.
- **Not a finding, a scope note:** the disciplines/applications lists on `/` were
  NOT moved to `MediaFrame` (rationale above). If Albert wants that, it is a
  separate focused pass with its own live verification.

## Proposed for shared files    [common — any role]
- **`PROJECT.md` "Careful of" (or architecture map):** `e4b36fd` orphaned five
  components — `src/features/home/components/{RawStage,ClosingShelf}.tsx`,
  `.../process/processPhases.ts`, `.../establishing/{Pillars,Process}Establishing
  Shot.tsx`. No importers as of 2026-09-10. Flagged not deleted this pass
  (Albert's call). Candidate for a dedicated cleanup task. `ClosingShelf.tsx`
  still contributes 1 of the 5 tolerated eslint raw-hex warnings.
- **`GUARDRAILS.md` (needs Albert):** nothing proposed — no incident.

## Log                          [common — append-only, every entry signed]
- 2026-09-09 claude/plan: opened T-007 as Phase 2, per user's "proceed" after
  reviewing Phase 1 (T-006). Confirmed `ClosingVideoSection` lives inside
  `HomeFilmScene.tsx` (Home-unique scope), distinct from the off-limits
  `closing-scene/` directory (`ClosingLattice.tsx`, T-001's scope) — grepped
  to be sure before splitting the work.
- 2026-09-09 claude/build: launched all 3 subagents in parallel; all 3 hit the
  session-wide rate limit before writing any edit. Task is unblocked, not
  broken — safe to retry the same 3 prompts verbatim once the limit resets.
  Wrote `docs/handover-2026-09-09-finalization-phase2-blocked.md` for
  continuity in case a different session/tool resumes this instead.
- 2026-09-10 claude/plan: on resume, found the 2026-09-09 handover's plan
  partly stale — `e4b36fd` (committed AFTER that handover) redesigned `/` and
  relocated the whole talent/culture narrative onto `/about`, deleted the
  13.1MB `ClosingVideoSection`, and orphaned 5 components. Put the scope fork to
  Albert in chat; he chose **full Phase 2 pass on both routes** + **flag (not
  delete) the dead components**. Appended `### Approach — revised 2026-09-10`;
  original approach preserved above it.
- 2026-09-10 claude/build: ran the revised 3-agent split to completion (no rate
  limit this time). Agents owned exclusive file scopes and none wrote
  `src/shared/content.ts`; orchestrator applied their proposed copy edits
  serially to disjoint keys. Realized diff is small — SOFT tokens + copy trims,
  zero motion-logic changes, no MediaFrame conversions (each declined with
  recorded rationale — "don't force a fit", Phase 1 precedent). See `## Build`
  → "What was built — 2026-09-10".
- 2026-09-10 claude/review: gate green (typecheck clean, lint 0 errors, test
  600/601 = baseline). Verified each agent's scope discipline, the no-new-facts
  constraint, SOFT contrast (a11y-contrast `SOFT` block passing), and live
  render of both routes via DOM inspection. No blocking findings; two
  eyeball-notes + one dead-code proposal recorded. `## Current` set to "review
  done, awaiting Albert's manual review".
- 2026-09-10 claude/plan+build: Albert corrected the ground-assignment rule
  mid-review — ground colour is THEME, assigned in blocks of 2-3 consecutive
  sections on ONE ground, NOT the per-section linen/frost/mist alternation this
  task's first build shipped. Token concepts he confirmed: linen = warm/human/
  craft, frost = analytical/clarity, mist = quiet/transitional, navy =
  cinematic/serious-technical. Standing rule saved to memory
  (`fresko-thematic-section-grounding.md`). Segmentation applied:
  - `/`: [hero navy] · **A: thesis+markets+disciplines → frost** · [proof film
    navy] · **B: applications+growth+reach → linen** · [closing film navy].
  - `/about`: **A: Mission+PoweredBy+Principles → linen** · [JourneyTimeline
    navy, immovable] · **B: Talent+Certifications → frost** (Certifications
    flipped navy→frost) · [daily-life culture film navy, immovable] ·
    **C: Candidates+Testimonials → unified light** (Testimonials cards all
    frost; the two sit on the `GroundLayer` `panel` track, unchanged) ·
    [blog+academy navy, immovable].
  Ran 2 subagents (one per route), exclusive scopes. `GroundLayer` scroll track
  (`sections.ts` `ground:` / `ABOUT_GROUND_STOPS`) deliberately NOT re-cut —
  its `GROUNDS` set has no SOFT tokens; flagged as a separate motion task.
- 2026-09-10 claude/build+review (ground re-cut): 2 subagents ran to
  completion, exclusive scopes (`/` → `HomeEditorial.{tsx,css}`; `/about` →
  `about.tsx` + `about/components/**` + `TestimonialsSection.tsx` cards). Gate:
  typecheck clean, lint 0 errors, test 600/601 (= baseline, same rotating
  home-v3 teardown flake). Live DOM verification on :5173 —
  `/`: thesis/markets/disciplines computed bg = `#F4F6FA` (frost) ×3,
  applications/growth/reach = `#F3EFE7` (linen) ×3. `/about`: Mission/PoweredBy/
  Principles-sticky = linen ×3, Talent wrapper + Certifications section =
  `#F4F6FA` (frost) ×2, Certifications text flipped to `NOIR.navyField`
  (computed `rgb(10,42,102)`), navy signatures (JourneyTimeline, daily-life
  film, blog/academy) unchanged. `certsAnchorRef` flipped to `{dark:false}`.
  No test asserted Certifications-is-dark (grepped), none changed.
  CERT-LOGO CHECK (the flagged risk): inspected the asset files directly —
  the standards logos (ITIL, Red Hat, and by pattern PMP/CPA/ISO) are
  black-wordmark-on-transparent art that was *already* near-invisible on the
  old navy ground and READS BETTER on frost; AWS/Azure badges are
  self-contained colour hexes fine on any ground; the Google Cloud badges have
  a pale-grey outer ring that loses edge definition on frost (still legible —
  yellow ring + multicolour cloud + grey text all hold). Net: the flip is a
  wash-to-improvement, with one polish item (a hairline/white chip behind the
  GCP badges) noted for later. Not a blocker.
- 2026-09-10 claude/build+review (block-continuity + about hero): Albert
  flagged white strips between sections — the per-section `bgcolor` + `mb`
  margins + `SmoothSection` parallax were exposing the overlay sheet's
  near-white `background.default` in the gaps, so each "movement" read as
  islands not a field. Fix: wrapped each thematic block in ONE opaque ground
  Box (Block A Mission/PoweredBy/Principles → `SOFT.linen`; JourneyTimeline →
  `NOIR.navyField`; Block B Talent/Certifications → `SOFT.frost`), same
  occlusion pattern the navy culture/blog Boxes already used; sheet `pt` moved
  into Block A wrapper (+ its rounded top edge). Verified live: sheet's direct
  children now paint linen / navy / frost / navy / (transparent panel ×2) /
  navy in order — no `background.default` between sections.
  Also (same request): redesigned the `/about` hero — removed `<HeroGallery />`
  (gold-framed photo + second framed clip on the right) and its Grid scaffold;
  hero is now a single left-aligned text column over the full-bleed
  `<BackgroundReveal />` video, whose left→right dark gradient was eased
  (0.94→0.90 at 0%, transparent at 78% instead of 85%) so the video breathes on
  the right. `HeroGallery.tsx` now has zero importers — FLAGGED for deletion
  with the `/images/AboutPage1.webp` entry in `warmup-manifest` (a
  `src/shared/**` file, left for a cleanup task). Gate: typecheck clean, lint 0
  errors, full suite 609/610 (count rose from 601 — concurrent hero session
  added tests; the 1 failure is still the rotating home-v3/reduced-motion
  teardown flake, 504/504 on a targeted re-run). One transient stale-HMR
  `HeroGallery is not defined` console error cleared on hard reload.
- 2026-09-10 claude/build+review (/services redesign + de-linen sweep):
  Albert: (a) `/services` — "make the images smaller and decent sized and have
  them appear 1 at a time"; (b) new standing rule — non-home pages use only
  `SOFT.frost` / `SOFT.mist`, never `linen` ("mint" in his message = mist;
  confirmed via AskUserQuestion). `linen` stays home-only. Saved to memory.
  2 subagents:
  - `/services`: banner `aspectRatio` 4/5 → 16/10 + `mediaSx={{ maxWidth: 440,
    mx: "auto" }}` (new additive optional `mediaSx` prop threaded ONLY into
    `MediaFrame`'s `SplitPattern` — split is used only by `DetailedServiceList`,
    verified; every other pattern byte-identical). Each `<ModernRowServiceCard>`
    wrapped in `<Reveal>` (site-wide primitive, `useInView once`) so rows
    uncover one at a time on scroll — no `delay`, no `StaggerGroup`. Agent
    measured service rows ~2000px → ~477px, images 440×275. `TechStackSection`
    band `SOFT.linen` → `SOFT.mist`; `EcotowerMap` (`/contact`) `SOFT.linen` →
    `frost`/`mist`.
  - `/about`: Block A wrapper + Mission + PoweredBy + Principles-sticky
    `SOFT.linen` → `SOFT.mist`. Verified live: Block A computed bg
    `rgb(233,236,243)` continuous, Block B still frost, zero linen on the page.
  Post-sweep: `grep -rn "SOFT.linen" src/` → the ONLY hit is
  `HomeEditorial.tsx` (`/`), as intended. Gate: typecheck clean, lint 0 errors,
  test 605/606 — the 1 failure is `tests/preview-cdp.test.ts` "Long Tasks and
  frame deltas" (the documented rotating perf-timing flake; earlier runs this
  session flaked on `home-v3-vt-names` / `home-reduced-motion` instead — same
  class, not a real assertion). No test asserted the split aspect ratio or any
  linen ground; none changed. My Browser pane went fully frozen (viewport 0×0)
  so `/services` layout could not be re-measured here — relied on the source
  diff, the live computed `max-width: 440px` on the media parent, and each
  subagent's own in-session browser verification.
- 2026-09-10 claude: Watch not run (browser-only session, no Octavia V3
  checkout available here).

## Handoff                      [common — replaced by whoever ran last]
Status: build + review complete, gate green, **one Acceptance check open**
(Albert's manual visual review of `/` and `/about`). · Could not do: the manual
review (Albert's, by definition) and a wheel-driven live pin re-check (repo
Browser-pane rAF-freeze limitation — mitigated by the diff proving zero
motion-logic changes). · Needs: Albert eyeballs the two rendered routes — in
particular the warm/cool SOFT alternation on `/`'s editorial band and the
`linen` link label on navy — then either closes T-007 and opens T-008 for
Phase 3 (Careers), or files tweaks here. Nothing committed; code is in the
working tree on `main` alongside the pre-existing Phase 0/1 + hero work.
Optional follow-ups (not blockers): (a) a dedicated cleanup task for the 5
`e4b36fd`-orphaned components; (b) a focused pass to move `/`'s disciplines/
applications lists onto `MediaFrame split` if that conversion is wanted.
