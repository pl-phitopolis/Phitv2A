# T-012 — Revert Team page, blog seed content, and Funtopolis hover per stakeholder sign-off
Status: done (2026-09-16) · Mode: solo · Opened: 2026-09-16
Branch: revert/team-blog-seed-funtopolis-hover · File scope: src/routes/team.tsx (deleted),
src/features/team/** (deleted), src/shared/content.ts (CONTENT.team, blog seed entries),
src/features/blog/fallback.ts (matching fallback entries), src/shared/components/megaNavItems.ts,
src/shared/components/navbarAnchors.ts, src/features/careers/components/FuntopolisSection.tsx,
src/shared/components/AppShell.tsx (unrelated pre-existing type-inference fix, see Deviations)
Merged: <blank — nothing pushed/merged yet>

## Current
Stage: done · Next: research AI Day proof-point content from the live site for
a future Services proof-points task; decide whether to also revert/update
octavia/tasks/done/T-010 and T-011 to reflect the reduced scope.
Blocking: none
Last check: `npx tsc -b` clean, `npx eslint .` 0 errors (4 pre-existing
warnings), `npx vitest run` 625 passed / 7 skipped (same baseline),
`npx vite build` clean, live-browser check confirms /team now 404s and
/blog, /careers render without the reverted content — 2026-09-16

## Plan

### Goal
Stakeholder sign-off on the two proposal artifacts (Rebuild Carryover
Proposal, Sitewide Motion Pass) came back with three explicit "skip"
verdicts on work already merged into `fork/main`: the `/team` leadership
bios route, the two legacy blog posts appended to the fallback content, and
the `MagneticBox` hover added to Careers' Funtopolis cards. Revert all
three; everything else from those two proposals (TechStack grid stagger,
Contact page add-ons, Blog page add-ons) was explicitly approved and stays.

### Done when
`/team` no longer exists as a route (404s); `CONTENT.blog` and
`FALLBACK_DATES`/`FALLBACK_BLOG_IMAGES` are back to their original nine
entries; `FuntopolisSection` cards have no hover wrapper (entrance stagger,
which predates this work, is untouched); nav (`megaNavItems.ts`) and anchor
registry (`navbarAnchors.ts`) have no Team references;
`npx tsc -b && npx eslint . && npx vitest run` all clean at baseline.

### Acceptance checks
- `npx tsc -b` clean — Runner: solo session.
- `npx eslint .` 0 errors — Runner: solo session.
- `npx vitest run` at baseline (625/632, 7 known skips) — Runner: solo session.
- `npx vite build` succeeds — Runner: solo session.
- Live-browser: `/team` renders the 404 page; `/blog`'s featured post is
  "LikhaPolis" (the original #1 fallback entry, not a reverted seed post);
  `/careers` Funtopolis cards render without a hover glow — Runner: solo
  session, via Playwright.

### Open questions
- AI Day proof-point metrics (approved, but gated on real content) —
  handed off as a research task: pull real per-team metrics from what's
  already published on the live site/Heimdall API rather than fabricating
  numbers. Not started in this task.
- Partner-school/cert list (About) — no verdict was given in the feedback;
  left untouched, not reverted, not actioned.

## Build

### What was built
Reverted exactly the three items above. `MediaFrame.tsx`'s `SOFT.mist` →
`text.secondary` text-color fix (from T-010) was NOT reverted — it's an
independent, genuine bug fix affecting three other patterns
(`grid-3up`, `sticky-pinned`, `inline-editorial`) unrelated to the Team
feature being removed.

### Build checks
```
$ npx tsc -b               # clean (after the AppShell.tsx fix below)
$ npx eslint .             # 0 errors, 4 pre-existing warnings
$ npx vite build            # clean
$ npx vitest run            # 625 passed, 7 skipped
```
Live-browser (Playwright): `/team` → 404 page confirmed; `/blog` → featured
post is "LikhaPolis", no reverted posts present; `/careers` → Funtopolis
renders 3 cards with entrance stagger only, no hover treatment. No console
errors on any route.

### Deviations from the approach
Removing the Team route (and its `MEGA_NAV_ITEMS` entry) surfaced an
**unrelated, pre-existing** `tsc -b` error in `AppShell.tsx:1243` — an
inline `onClick={(e) => ...}` handler on a `RouterLink` inside
`NAV_ITEMS.map(...)` lost its contextual type for `e`, once the route union
`RouterLink`'s generic resolves against changed shape (fewer literal
routes). Fixed by adding an explicit `(e: React.MouseEvent)` annotation —
a minimal, safe, unrelated-to-scope fix required to get a clean typecheck
after the revert.

## Log
- 2026-09-16 solo/plan+build: reverted Team route, blog seed content, and
  Funtopolis hover per stakeholder feedback on the two proposal artifacts;
  fixed an incidental AppShell.tsx type error surfaced by the route-tree
  change.
