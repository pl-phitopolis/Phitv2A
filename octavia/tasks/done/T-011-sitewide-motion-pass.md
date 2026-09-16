# T-011 — Sitewide motion pass (Team, Services, Careers, Contact, Blog)
Status: done (2026-09-15) · Mode: solo · Opened: 2026-09-15
Branch: feat/sitewide-motion-pass · File scope: src/routes/team.tsx,
src/routes/contact.tsx, src/features/team/components/TeamMemberCard.tsx,
src/features/services/components/TechStackSection.tsx,
src/features/careers/components/FuntopolisSection.tsx,
src/features/contact/components/{ContactFAQ,ContactForm,EcotowerMap}.tsx,
src/features/blog/components/{BlogPostList,BlogToolbar,BlogYearRail,BlogPostArticle}.tsx
Merged: <blank — nothing pushed/merged yet>

## Current
Stage: done · Next: none — both motion proposals (Team-only, then sitewide)
are now fully applied.
Blocking: none
Last check: `npx tsc -b` clean, `npx eslint .` 0 errors (4 pre-existing
warnings, none in touched files), `npx vitest run` 625 passed / 7 skipped
(same baseline as T-010), `npx vite build` clean, live-browser screenshots
of /team, /services, /careers, /contact, /blog — 2026-09-15

## Plan

### Goal
Apply the "Team Page Motion Pass" and "Sitewide Motion Pass" proposals:
give every plain section found across Services, Careers, Contact, Blog and
Team an entrance/hover treatment, reusing existing site primitives only —
no new dependencies.

### Done when
All 15 items from the two proposals are applied:
- `/team`: bio grid staggers (StaggerGroup/StaggerItem), each card wrapped in
  `MagneticBox`, expertise chips nested-stagger in behind the card, CTA button
  swapped to `SpecularButton`.
- `/services` TechStackSection: header `Reveal`, 4 category cards stagger in.
- `/careers` FuntopolisSection: each moment card wrapped in `MagneticBox`.
- `/contact`: form + inspector columns stagger in; "What happens next" line
  becomes a scroll-linked draw (same `useScroll`/`useSpring`/`useTransform`
  technique as `GraduateHallOfFameSection`); `EcotowerMap` and `ContactFAQ`
  `Reveal`-wrapped, FAQ category chips stagger; `ContactForm` fields
  `Reveal`-wrapped, success state fades/scales in via `motion/react`.
- `/blog`: post card grid staggers; toolbar `Reveal`-wrapped; year rail rows
  stagger; article title block `Reveal`-wrapped, cover image scale-in on
  `whileInView`.
`npx tsc -b && npx eslint . && npx vitest run` all clean at baseline.

### Acceptance checks
- `npx tsc -b` clean — Runner: solo session.
- `npx eslint .` 0 errors — Runner: solo session.
- `npx vitest run` at baseline (625/632, 7 known skips) — Runner: solo session.
- `npx vite build` succeeds — Runner: solo session.
- Live-browser screenshots of all 5 changed routes, console-error-free
  (only pre-existing CORS noise from the local-only Heimdall API) — Runner:
  solo session, via Playwright.

### Approach
Every change reuses an existing, already-shipped component — no new
capability was needed for any of the 15 items (see the Sitewide Motion Pass
proposal's package-verdict section). Card-level hover uses `MagneticBox`
(the block-level sibling of `Magnetic`/`MagneticGold`, already used by
`ServicesGrid.tsx` — the right fit for a full card, not the inline-oriented
`Magnetic`/`MagneticGold` originally named in the Team-only proposal; this is
a correction made after reading `Magnetic.tsx`'s actual `display:
inline-block` wrapper, which doesn't suit a block-level card). The
"What happens next" scroll-linked line reuses
`GraduateHallOfFameSection.tsx`'s exact `useScroll`/`useSpring`/`useTransform`
pattern rather than inventing a new one.

### Open questions
None open.

## Build

### What was built
12 files touched, listed in the header's File scope. Each edit follows the
Sitewide Motion Pass treatment matrix row-for-row — no scope beyond what was
proposed and signed off.

### Build checks
```
$ npx tsc -b               # clean
$ npx eslint .             # 0 errors, 4 pre-existing warnings (unrelated files)
$ npx vite build            # clean
$ npx vitest run            # 625 passed, 7 skipped
```
Live-browser (Playwright, headless Chromium): navigated to /team, /services,
/careers, /contact (default scroll + scrolled to the FAQ), /blog — captured
after the intro preloader was skipped (Escape) and a settle delay past the
stagger/reveal timings. All six screenshots show the changed sections intact
and correctly laid out; zero console errors traceable to any of these
changes (only the same pre-existing Heimdall-API CORS noise present on every
route in this environment).

### Deviations from the approach
Swapped `MagneticGold` (named in the original Team-only proposal) for
`MagneticBox` on every card-hover item (Team bio cards, Funtopolis cards) —
see Approach above. Functionally equivalent goal (cursor-follow drift on a
precise pointer, inert under reduced motion/coarse pointers), better-suited
component for a block-level card.

## Log
- 2026-09-15 solo/plan+build: applied both motion-pass proposals in one pass
  (15 items, 12 files); corrected Magnetic → MagneticBox for card-level hover
  after reading the actual component source.
