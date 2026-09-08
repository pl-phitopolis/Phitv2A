# Astra Reimagined — Polished Plan

Rewrite of Astra's draft plan for `/astra-landingpage-reimagined`. Same scope and
route — the technical shell, GSAP/Lenis ownership, breakpoints, and validation
list all carry over — but every creative decision that was gesture-at-it
("generous spacing," "ink-navy... gold," "cinematic panels") is now a specific,
defensible choice, grounded in what the codebase already has rather than
invented in parallel. Where a decision knowingly departs from the site's
existing system, it's logged as a departure, not left silent.

## Aesthetic position

**Phitopolis's edge is that it makes market noise legible — Astra should feel
like the moment a trading floor's static resolves into one clean signal, not
like a fintech pitch deck with a gold accent bolted on.** Swap in a generic
quant-fund name and the "scattered signals → ordered composition" narrative,
the Manila-specific geography in Ch. 6, and the reuse of the firm's real
architecture footage would all read as wrong, not just different — that's the
test this plan is written to pass.

## Design tokens — reused, and where this page deliberately departs

Astra is scoped to `src/features/astra-landing/`; nothing here touches
`src/shared/theme/`. Where a value is new, it lives in a scoped
`src/features/astra-landing/theme/tokens.ts` layered on top of the shared
theme, not a parallel design system.

**Color — reused as-is, this is the actual brand, not an invention.**
Phitopolis has exactly one accent color already
([`palette.ts`](" Master P Frontend/Phitv2A/src/shared/theme/palette.ts")):
`NOIR.gold #FFC72C`. That *is* signal gold — Astra uses it directly, plus its
existing `goldLight #FFD966` (glow/hover) and `goldDark #E5B228`
(pressed/active) steps. Ink backgrounds reuse `NOIR.navyInk #061226` /
`navyDeep #06183B`; layered panels reuse `navyPanel #0A1833`; the lighter
accent line-work on ivory grounds reuses `duskNavy #182647`. The existing
navy→gold `DAWN` ramp is the seed for the traveling-signal gradient in §Motif
— reused, not redrawn.

**Warm ivory — a logged departure.** The site's existing "light" token,
`frost #F4F7FC`, is a cool blue-white built for UI chrome. Astra's brief asks
for *warm* ivory because this page is editorial, not app-UI. New scoped
values: `astra.ivory #F2E9D8`, `astra.ivoryDim #EAE0C9` (card/panel fill on
light grounds). These exist only inside the Astra feature folder.

**Space Grotesk — a logged departure.** The site's display font is Outfit
([`theme.ts`](" Master P Frontend/Phitv2A/src/shared/theme/theme.ts")); that
stays the product-UI voice everywhere else. Space Grotesk is not in the repo
today and is added deliberately: its squared "o," flat-cut "g," and
architectural proportions read as *drafted*, not *appified* — which is the
split Astra needs to earn its "standalone concept" framing rather than
looking like a marketing skin over the dashboard. Body copy stays **Inter**,
consistent with the rest of the site — only the display voice changes.
Self-host it the same way Outfit/Inter are hosted (variable woff2 under
`src/assets/fonts/`, not a Google Fonts link).

**Type scale — extended, not replaced.** Reuse the existing step values and
`TRACKING`/`LINE_HEIGHT` tokens (tight `1.15` for display, `-0.03em` tracking
on headlines, `0.16em` meta-tracking for labels). Add two scoped steps above
the site's current ceiling (`h1: clamp(3rem, 8vw, 6rem)`), because Astra's
opening and closing chapters need to go past what any in-app heading needs:

| Token | Value | Use |
|---|---|---|
| `astra.displayHero` | `clamp(3.5rem, 9vw, 8.5rem)` | Ch. 1 / Ch. 7 headline |
| `astra.displayChapter` | `clamp(2.5rem, 6vw, 4.5rem)` | Ch. 2–6 chapter statements |
| `astra.meta` | `0.75rem`, tracking `0.16em`, `ui-monospace` stack | index/coordinate labels (P8, below) |

**Spacing — reuse the 8px unit, add an explicit asymmetric rhythm.** MUI's
default 8px base stays the atom (no parallel spacing system). What was
"generous spacing and asymmetric editorial layouts" becomes a stated rule:
section padding-block moves in `8 × {3, 6, 9, 14, 20}` (24/48/72/112/160px),
and the primary text column is never centered — it sits offset by `8 × 2`
(16px) from the grid's live edge, with the caption/meta column locked to the
opposite edge. That offset, held identically in every chapter, *is* the
"asymmetric" claim — one rule applied everywhere, not a different layout
improvised per section.

**Radii** — reuse existing `--r-panel: 20px` / `--r-card: 16px` from
`glass.css` for any panel edges; no new radius scale.

## References and anti-goals

Three specific, named borrowings (not "clean like Linear" — the actual
borrowed quality):

- **Unseen** — the mono, wide-tracked meta-label doing real informational
  work (index numbers, coordinates), and a static grain overlay giving flat
  ink-navy fields print-like depth instead of looking like a solid CSS fill.
- **Uncommon** — the footer treated as a destination the scroll *arrives* at
  (oversized CTA + address, not an afterthought), and a video showreel with a
  visible, user-controlled mute/pause toggle rather than silent forced
  autoplay.
- **Lusion** — split-text stagger reveals with real pacing between lines
  (not everything arriving in one burst), and restrained, transform-only
  hover feedback on interactive elements.

**Explicitly not doing** (extends Astra's original three anti-goals with two
more that the pattern catalog specifically warns against):

1. No generic card grids.
2. No invented performance statistics.
3. No decorative trading dashboards.
4. No shader/WebGL hero as the LCP element — the opening chapter's first
   paint is the real architecture footage frame, full stop; nothing GPU-bound
   gates it.
5. No custom cursor, no magnetic-follow CTA, no ambient audio — Lusion and
   Unseen both use these, and both are excluded on purpose: cursor-gated
   interaction breaks touch/AT users by definition, and autoplay-adjacent
   audio is a corporate/accessibility liability regardless of a mute toggle's
   presence. The CTA gets a real but restrained hover state (§Interaction
   states below), not a physics follow.

## The signature, and the pattern budget

One signature, three supporting, per the composition rule (never more, never
a signature that's just a supporting pattern turned up louder).

**Signature — the Signal Line.** A single continuous SVG path, stroked in
`NOIR.gold`, whose `stroke-dashoffset` is driven off one global scroll
progress value for the whole page (not one path per section). In Ch. 2 it's
fragmented into disconnected short strokes scattered across the field; by
Ch. 5 it's one unbroken line connecting the three discipline panels; in Ch. 7
it resolves into the Phitopolis mark. It is the literal "gold signal travels
through the page" concept made into one concrete, buildable primitive instead
of a mood description — build it once as a shared path-progress hook
(`useSignalProgress`), consumed by every chapter that needs a segment of it.

**Supporting (3, all already load-bearing in the original brief, none heavy):**

- **Pinned narrative scroll** (Ch. 1, 3, 5 only, per the original scope) —
  Lenis + ScrollTrigger, `gsap.matchMedia()` as the reduced-motion/mobile
  split, native scroll never captured without a stacked fallback.
- **Split-text reveals** on every chapter headline — GSAP SplitText (free
  since 3.13), split only after `document.fonts.ready` so it never causes
  layout shift; real text stays in the DOM throughout for assistive tech.
- **Route transition** between Astra and the rest of the site — `Motion`
  `AnimatePresence` keyed on pathname, feature-detected
  `document.startViewTransition` as a progressive layer, capped at ≤300ms,
  instant under reduced motion.

**Seasoning (trivial, don't count against the budget):** mono meta-labels
(§Type scale), a static SVG `feTurbulence` grain tile at ≤0.06 opacity over
ink fields (no re-graining on a rAF loop), the existing footage as a
showreel with a visible mute/pause control, and the closing chapter built
explicitly as a footer-as-destination band.

**Deliberately excluded:** WebGL pointer-reactive hero, image/geometry
distortion, ambient audio, custom cursor. If any of these get requested
later, that's a scope change to revisit here, not something to smuggle back
in during implementation.

## The seven chapters

Each entry states the one thing the eye hits first — commitment to exactly
one primary focal point per view, not three things competing.

**1 — Opening.** *Eye hits: the footage, full-bleed, before any text paints.*
Architecture footage plays behind a `navyInk` scrim strong enough to hold
4.5:1 contrast for the headline. "Complex markets. Clear engineering."
splits and staggers in `astra.displayHero`, one word per line, timed to let
the footage register first. The Signal Line begins here as a single scattered
gold mark near the wordmark — not yet a path, just a point, so Ch. 2 has
somewhere to fragment *from*. Contact CTA is visible on load, not scrolled to.

**2 — The challenge.** *Eye hits: the scattered gold marks, mid-field.*
Pinned. The Signal Line's point multiplies into a dozen disconnected strokes
scattered across the frame, arrhythmic, over a `navyDeep` field. As the pin
progresses they migrate and connect into one ordered stroke. Large-format
statements about Phitopolis's quantitative R&D positioning appear one at a
time in `astra.displayChapter` — never more than one on screen — timed to the
strokes' resolution, not independent of it.

**3 — Capabilities.** *Eye hits: whichever of the three panels is centered
at that scroll position — never more than one panel at full opacity.*
Vertical scroll drives horizontal traversal across three panels (quant
research/AI, product/cloud engineering, technical operations), each on an
`astra.ivoryDim` ground so this chapter is the one visible break from the ink
field — a deliberate contrast beat, not an accident of "the next section is
lighter." Diagrams and stat-adjacent copy stagger in behind each panel's
headline, never ahead of it.

**4 — Applications.** *Eye hits: one full-bleed original SVG illustration per
scene, copy secondary to it.* Three editorial scenes — algorithmic signal
generation, cloud-native infrastructure, global technical operations — each
built as illustration-first, using only the existing factual copy. No
pinning here; this chapter is deliberately a breathing interval between the
pinned Ch. 3 and Ch. 5, per the "keep reading intervals between transitions"
rule.

**5 — Delivery.** *Eye hits: the Signal Line, now unbroken, connecting three
overlapping panels.* Pinned. Research → engineer → operate rendered as three
panels that physically overlap at their edges (not a card row), with the
Signal Line drawn as the connective element between them — this is where the
signature pattern does its clearest narrative work, since "how the
disciplines work together" *is* the line's job across the whole page,
concentrated into one chapter.

**6 — Global partnership.** *Eye hits: Manila, as the map's origin point,
before any other market.* Geographic reveal built from real company
information, with client/investor presence visually distinct from office
locations (different mark weight, not just a legend entry) and leadership
experience presented as a supporting credibility line beneath the map, never
above it.

**7 — Closing.** *Eye hits: the Signal Line resolving into the Phitopolis
mark, then nothing else moves.* Footer-as-destination (Uncommon's pattern,
§References): full-bleed final band, "Bring us your next complex challenge,"
one prominent CTA, compact company/legal links below at `astra.meta` scale —
present but visually last, never competing with the CTA for the one primary
action this view is allowed.

## Interaction states (commitment 5 — no happy-path-only specs)

**Primary CTA ("Start a conversation" → `/contact`)**, present in Ch. 1 and
Ch. 7:

- *Default:* `NOIR.gold` fill, `navyInk` text, `--r-pill` radius (reuse).
- *Hover:* fill steps to `goldLight`, an underline draws left-to-right under
  the label in 150ms — transform/opacity only, no layout shift.
- *Focus-visible:* 2px `NOIR.gold` outline, 2px offset, visible against both
  the ink and ivory grounds it can appear on (verify both, not just one).
- *Active:* scale `0.98`, 80ms, no color change (avoids a flash that reads as
  a second state under fast taps).
- *Reduced motion:* all of the above collapse to instant state changes, no
  transform.

**Section nav / mobile menu** get the same default/hover/focus-visible/active
set, plus an explicit *current-section* state (persistent, not just on
hover) so keyboard and screen-reader users can tell where they are without
relying on scroll position.

## Technical implementation

Unchanged from Astra's original scope, tightened to name real files:

- New TanStack route + lazy feature under `src/features/astra-landing/`;
  GSAP and Lenis stay out of eager route imports.
- Standalone shell for this route only: own header, mobile menu, skip link,
  footer, existing cookie notice; root metadata/analytics preserved; the
  homepage preloader and nav choreography are not reused here.
- `SmoothScroll` remains the sole Lenis owner — extend its documented route
  scope to include Astra; keep ticker sync, reduced-motion handling, cleanup.
- GSAP timelines through scoped `useGSAP` hooks + `matchMedia` contexts.
  Pinning limited to Ch. 1, 3, 5. Refresh ScrollTrigger measurements after
  fonts (`document.fonts.ready`) and media settle.
- Below 900px: vertical layouts for Ch. 3/5, native touch scroll, shorter
  reveals, no horizontal pins. Reduced motion: full static flow, no pinning,
  no Signal Line animation — the line renders as its final resolved state.
- Existing local footage + posters; original SVG/CSS graphics elsewhere.
  Below-fold media loads near visibility; offscreen footage pauses; a
  pause-motion control is present. Media failure preserves layout and
  readable copy (no broken-image holes).

## Validation

Unchanged from the original scope, cross-referenced to what the repo already
checks rather than re-specifying from scratch:

- Direct load, refresh, browser history, section links, contact nav, repeat
  transitions between Astra and existing routes.
- Slow/rapid scroll both directions, resize during a pinned section, missing
  media, delayed fonts. Confirm animation/listener/Lenis cleanup on exit.
- Inspect at 320/390/768/1440/1920px — no horizontal overflow, no obscured
  CTAs, no inaccessible panels, no duplicate `main` landmarks.
- Keyboard-only pass + reduced motion; contrast checked with a tool against
  the same pinned ratios `tests/a11y-contrast.test.ts` already enforces
  sitewide — Astra's new ivory/gold/navy combinations get added there, not
  eyeballed separately.
- Typecheck, tests, lint, production build; confirm Astra's bundle stays
  lazy (check the build output, don't assume the import is lazy because it's
  written that way).
- `noindex`, unique metadata, not added to main nav or sitemap. No deploy in
  this scope.
