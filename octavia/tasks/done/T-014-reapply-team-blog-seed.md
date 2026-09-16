# T-014 — Reapply Team page + blog seed content (sign-off reversed)
Status: done (2026-09-16) · Mode: solo · Opened: 2026-09-16
Branch: feat/reapply-team-blog-seed · File scope: src/routes/team.tsx,
src/features/team/**, src/shared/content.ts (CONTENT.team, blog seed
entries), src/features/blog/fallback.ts, src/shared/components/megaNavItems.ts,
src/shared/components/navbarAnchors.ts
Merged: <blank — nothing pushed/merged yet>

## Current
Stage: done · Next: none — Team page and blog seed content are back, with
the same motion treatment as before the revert. Funtopolis hover stays
reverted (still "skip", untouched by this task).
Blocking: none
Last check: `npx tsc -b` clean, `npx eslint .` 0 errors (4 pre-existing
warnings), `npx vitest run` 625 passed / 7 skipped (baseline), `npx vite
build` clean, live-browser screenshot of /team confirms both bios, all 6
expertise chips, and the CTA all render correctly — 2026-09-16

## Plan

### Goal
T-012 reverted the Team page and blog seed content per stakeholder
sign-off ("skip" on both). The user has since reversed that decision and
asked to reapply them. Restore both to exactly their previously-verified
state, including the Team-specific motion enhancements from T-011
(StaggerGroup/StaggerItem card cascade, MagneticBox hover, nested chip
stagger, SpecularButton CTA) — without touching Funtopolis, which is still
explicitly "skip".

### Done when
`/team` renders again with both leadership bios, motion-enhanced exactly as
T-011 left it; `CONTENT.blog`/`FALLBACK_DATES`/`FALLBACK_BLOG_IMAGES` have
the two legacy posts back; nav (`megaNavItems.ts`) and anchor registry
(`navbarAnchors.ts`) have the Team entries back; Funtopolis remains
untouched (no MagneticBox); `npx tsc -b && npx eslint . && npx vitest run`
all clean.

### Acceptance checks
- `npx tsc -b` clean — Runner: solo session.
- `npx eslint .` 0 errors — Runner: solo session.
- `npx vitest run` at baseline (625/632, 7 known skips) — Runner: solo session.
- `npx vite build` succeeds — Runner: solo session.
- Live-browser: `/team` shows both bios + all 6 expertise chips fully
  settled; `grep` confirms Funtopolis still has zero `MagneticBox`
  references — Runner: solo session, via Playwright + grep.

### Open questions
None open.

## Build

### What was built
`git cherry-pick -n 88381ee` (the original T-010 commit) restored the base
Team route + blog seed content cleanly, no conflicts (MediaFrame.tsx's
text-color fix was already present on main and needed no changes). Then
manually reapplied just the Team-specific motion hunks from T-011's
`631af5d` to `team.tsx` and `TeamMemberCard.tsx` — that commit also touched
`FuntopolisSection.tsx`, so a full cherry-pick would have wrongly
resurrected the hover that's still supposed to stay reverted; reapplying
by hand kept the two scoped correctly.

### Build checks
```
$ npx tsc -b               # clean
$ npx eslint .             # 0 errors, 4 pre-existing warnings
$ npx vite build            # clean
$ npx vitest run            # 625 passed, 7 skipped
$ grep -c MagneticBox src/features/careers/components/FuntopolisSection.tsx  # 0
```
Live-browser (Playwright): `/team` — both bios, photos, all 6 expertise
chips (visible once fully settled — the chip stagger's intentional 0.5s
"after the card" delay means an early screenshot catches it mid-animation,
not broken), and the CTA all render correctly. No console errors on
`/team`, `/blog`, or `/careers` beyond the pre-existing, expected
local-API-unavailable noise.

### Deviations from the approach
None.

## Log
- 2026-09-16 solo/plan+build: reapplied Team page + blog seed content per
  the user's explicit reversal of the earlier sign-off decision, restoring
  the exact T-010/T-011 state for these two items only.
