# T-008 — Home hero "development powerhouse" layout + design pass
Status: active · Mode: solo · Opened: 2026-09-10
Branch: main · File scope: src/features/hero/SuperHeroSequence.tsx (JSX + layout
constants only — NOT the GSAP/pin/entrance block), src/features/hero/HeroReel.tsx
(new), src/shared/components/useBackgroundVideo.ts (`HERO_LOOP`),
src/shared/components/AppShell.tsx (`HOME_BLOCKING` + comment),
src/shared/content.ts (`hero.lead`, `hero.proof`)
Merged: <blank — nothing committed yet>

## Current
Stage: rev 3 done (2026-09-10, taste pass) — full-bleed/right-40% video + frosted L->R
seam per Albert's revised direction. Gate green. **Awaiting Albert's visual
sign-off of `/`.** Nothing committed.
Blocking: none.

## Plan                         [claude → albert]

### Goal
Layout/design-only rework of the `/` hero so it reads like a high-end
development powerhouse. Scroll + entrance choreography untouched. Albert's
calls in chat (2026-09-10): wide 16:9 cinematic video plate on the right
(replacing the P-mask), keep the "Making Tomorrow's Technology Available Today"
headline, no CTA buttons and no "Start a conversation", a "mini curtain list" of
4 stacked links (About · Services · Careers · Blog), a proof row of real facts
worded "BGC, Metro Manila". Video must be the daily-life loop (<1 MB).

References read (WebFetch, 2026-09-10): Vercel, Cerebrium, Lusion, Unseen,
Ramotion, Uncommon (via `award-site-patterns` dossier). Shared traits: terse
headline + subhead, clear action row, proof under it in small mono, one framed
showreel window, tiny meta-labels, whitespace.

### Approach
See `~/.claude/plans/scope-hero-layout-design-of-robust-lamport.md` (approved).
Two subagents with disjoint file ownership: (A) HeroReel + constants + CONTENT
keys; (B) SuperHeroSequence JSX. Orchestrator verifies.

### Done when
`/` hero shows: headline / one-sentence lead / 4-row curtain list / proof row
left; a framed 16:9 daily-life reel right; scroll cue under the reel. Only
`daily-life-loop.*` + `daily-life-poster.jpg` are requested for the hero.
Existing entrance cascade and pin fades still drive every element.

### Acceptance checks
- `yarn typecheck` clean — Runner: claude. **checked directly** 2026-09-10 — clean.
- `yarn lint` 0 errors — Runner: claude. **checked directly** — 0 errors / 6 pre-existing warnings.
- `yarn test` at baseline and `tests/motion/hero-phases.test.ts` green untouched —
  Runner: claude. **checked directly** — 611/612; the 1 failure is the documented
  `preview-cdp.test.ts` flake. `tests/warmup-manifest.test.ts` updated (it pins
  the home poster path, which legitimately changed).
- `SuperHeroSequence.tsx` GSAP/pin block untouched — Runner: claude.
  **reported by build agents, checked indirectly**: the file was already
  uncommitted-modified before T-008 so `git diff` cannot isolate today's hunks;
  all 445 motion tests pass and every element still rides the existing
  `--hp-*`/`--he-*` vars (DOM-verified).
- Live: hero `<video>` `currentSrc` = `/videos/daily-life-loop.webm`, poster =
  `/videos/daily-life-poster.jpg`; `hero-p-loop.*` not referenced — Runner:
  claude. **checked directly** via DOM on :5173.
- Live: zero `backdrop-filter` under `#hero`; the only `filter` hits are the
  pre-existing `HeroImageWall` grayscale images — Runner: claude. **checked directly**.
- Live: 375 / 768 / 1440 — motto, lockup, plate (reel + caption row + curtain
  list), proof row do not overlap — Runner: claude. **checked directly** via
  `getBoundingClientRect` at all three widths (two collisions found and fixed
  during review, see Log).
- Console clean apart from Heimdall `:8000` connection-refused (API not running)
  — Runner: claude. **checked directly**.
- Visual sign-off — Runner: **Albert**. **not checked** (direction revised twice; current state is right-40% panel + frosted seam on md+, full-bleed + veil on xs).

## Build                        [claude]
Two sonnet agents, disjoint ownership. (A) `HeroReel.tsx` new (framed 16:9
reel, same `useBackgroundVideo` gating as `HeroPMask`, no filters);
`HERO_LOOP` now aliases `BACKGROUND_LOOP` (daily-life); `HOME_BLOCKING` warms
`daily-life-poster.jpg`; `CONTENT.hero.lead` + `hero.proof` added. (B)
`SuperHeroSequence.tsx` JSX: plate = flex column [reel → caption row (caption +
scroll cue) → 4-row curtain-list nav]; motto `clamp(2.4rem,5.6vw,4.6rem)` /
13ch; lead = `hero.lead` at 40ch; new `.hero-proof` bottom-left md+; old
standalone directory + cue removed; `HERO_GUTTER` removed (unused). `HeroPMask.tsx`,
`phitopolisMarkPaths.ts`, `hero-p-loop.*` left on disk — flagged, not deleted.

## Review                       [claude]
Two layout defects found live and fixed in the same session: (1) the
curtain list at bottom-left collided with the wordmark lockup (rests at
`bottom:152px`, design-locked) → list regrouped under the reel in the right
column; (2) at `sm` the vertically-centred plate crossed the lead paragraph and
the lockup → plate bottom-anchored at sm, width `min(48vw,400px)`. Mobile note:
under 900px the master timeline is a one-shot that plays on load (pre-existing,
`media.add("(max-width: 899px)")`), so the phone hero shows the gunshot end-state
almost immediately — out of scope, but worth Albert's eye.

## Log
- 2026-09-10 claude/build (rev 3 — taste pass): Albert: "layout still looks
  shit, make it professional, use /taste" + hard rule "never use this guy"
  (the person in `daily-life-loop.mp4`). Loaded taste-skill (binding standard,
  `clair-canvas-works/docs/standards/`). Diagnosed against anti-patterns:
  AP-L06 (sparse data-table index), AP-T01 (no eyebrow anchor + off-system
  headline/lead vs the `.editorial-*` thesis below the fold), AP-C07-adjacent
  (proof row `aria-hidden`, 0.66rem @.6, running under the video), header
  floating on a black video block. Fixes: footage → `daily-life-blog-loop`
  (World Plaza lobby, no talking-head; webm 938KB/mp4 960KB); re-added the
  `.editorial-marker` eyebrow (`00 — ORIGIN`); headline/lead aligned to
  `.editorial-display`/`.editorial-lead` tokens exactly; index reworked to a
  hairline-ruled TOC (number · label · arrow hugging left, maxWidth 15rem,
  gold curtain @0.10, translateX(3px) on hover, double focus ring,
  reduced-motion guard); proof row → `<ul aria-label="Firm facts">` in-flow as
  the column's closing line, contrast-bumped (numbers/proof to alpha .62,
  cue/arrow .58 — all verified ≥3:1 over frost, lead 5.7:1); plate → inset
  framed figure (paper margin top/bottom = header now on paper, 1px hairline +
  gold tick left edge, ~38% width) on md, full-bleed under a heavy 0.96→0.82
  frost veil on xs. `NAVLINK_SX` removed (dead). 3 small edits done inline
  (`HERO_LOOP`→BLOG_LOOP, `HOME_BLOCKING` poster, warmup test); the
  `SuperHeroSequence.tsx` rework by one sonnet agent + 2 orchestrator polish
  passes (index rule tighten, seam soften, contrast). Gate: typecheck clean,
  lint 0 errors, test 611/612 (preview-cdp flake), motion 445/445, warmup 6/6,
  a11y-contrast green. Verified live 1440 (eyebrow anchor, TOC index hugs left,
  double focus ring on keyboard tab, proof legible + not aria-hidden, plate
  inset with header on paper, footage swapped, 1 masked backdrop-filter) +
  375/320 (no horizontal scroll, column on frost, video a ghost). Nothing
  committed.
- 2026-09-10 claude/build (rev 2): Albert changed direction in chat — "video
  full bg", then "consume the half right around 40% screen width", "gradient
  from frosted blur left to right 0 opacity and 0 blur", "remove the fig. 01",
  "take into consideration mobile". Reworked `.hero-plate`: md+ = right 40%
  full-height video panel with an L->R frosted-paper seam (solid `SOFT.frost`
  + masked `blur(20px)` at the inner edge, 0/0 by ~20-26%); xs/sm = full-bleed
  behind the stacked column under a flat ~0.9->0.82 frost veil, no
  backdrop-filter. Removed the "Fig. 01" caption; moved the scroll cue to a
  standalone bottom-right element; re-added the `.hero-proof` row bottom-left
  (md+). Fixed `HERO_LOOP` (agent A had aliased `BLOG_LOOP` = daily-life-blog;
  now `BACKGROUND_LOOP` = the canonical daily-life-loop, 806/862KB, which also
  matches the `daily-life-poster.jpg` the preloader warms). Gate: typecheck
  clean, lint 0 errors, test 611/612 (preview-cdp flake), motion 445/445,
  warmup-manifest 6/6. Verified live at 1440 (side panel, seam, no overlap,
  1 masked backdrop-filter) and mobile/tablet DOM (full-bleed + veil, 0
  backdrop-filter on xs). Nothing committed.

- 2026-09-10 claude/plan: references researched, plan approved by Albert in
  plan mode, T-008 opened, two build agents dispatched.
- 2026-09-10 claude/build+review: agents delivered; gate green; live review at
  1440/768/375 found the lockup collision and the sm overlap, both fixed via a
  third and fourth agent pass; `warmup-manifest.test.ts` poster expectation
  updated. Nothing committed.

## Handoff
MOBILE FLAG (pre-existing, out of scope — GSAP block + "no scroll animations"):
under 900px the hero master timeline is a one-shot that fires on load (`media.add
("(max-width: 899px)")`, trigger `top 70%` true at scrollY 0), so the phone/tablet
hero jumps to the dark "gunshot" end-state within ~1s and the resting layout is
never really seen. The resting layout IS structurally correct (verified via DOM
rects). Fixing this means touching the protected pin logic — Albert's call.

Status: code complete, gate at baseline, awaiting Albert's visual sign-off.
Could not do: isolate today's diff from the pre-existing uncommitted hero work
(same file); a real-device mobile pass (Browser pane only).
Need: Albert's look at `/` at desktop width; a call on whether the 5 MB
`hero-p-loop.*` + `HeroPMask.tsx` + `phitopolisMarkPaths.ts` (still used by
`PhitopolisLogo`? — grep before deleting) should be cleaned up in a follow-up.

## Proposed for shared files
- PROJECT.md "Careful of": the hero wordmark lockup owns the bottom-left of
  `#hero` (`bottom:152px` rest); anything anchored there collides with it.
