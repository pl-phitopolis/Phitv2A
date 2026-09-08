# Fresko (Phitv2A)

## Purpose
Public-facing marketing site for Phitopolis, a fintech engineering / quant R&D firm. Heavy
GSAP/Lenis/R3F scroll-driven motion on the home page.

## Stack & conventions
React 19 + Vite + TypeScript (strict) + TanStack Router/Query, MUI 7, GSAP 3.15 + @gsap/react +
Lenis 1.3 for scroll motion, motion/react 12 for micro-interactions. yarn as package manager,
vitest as test runner. See `../CLAUDE.md` for the full house conventions (bundle-splitting
rules, beat architecture, motion invariants) — not duplicated here.

## Architecture map
- `src/routes/index.tsx` — home page, beat sequence
- `src/features/hero/` — hero pin + P/Phitopolis lockup (SuperHeroSequence.tsx, heroPhases.ts, heroVars.ts)
- `src/features/home/components/closing-scene/` — closing CTA pinned scroll-scrubbed video
- `src/shared/motion/` — beat thresholds, scroll speed, hero pin constants

## Careful of
- Route files with a `loader` must import from feature `api` modules and components directly —
  never the feature barrel (drags the eager bundle down). See `../CLAUDE.md`.
- No gsap/lenis imports at route-module scope.

## Deliberately rejected — don't rebuild these
| Approach | Why rejected |
|---|---|
| Re-encoding closing CTA video for "faststart" | Already faststart + all-intraframe; verified via ffprobe 2026-09-07, not the cause of the scrub freeze |
