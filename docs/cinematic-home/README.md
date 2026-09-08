# Phitopolis cinematic home

The home route now tells one client story: opening → capabilities → applications → delivery → company → contact. It replaces the previous overlapping beat layout without changing the other pages' content or backend contracts.

## UI and interaction decisions

- Outfit display type and Inter body copy, a consistent navy surface, pale text, and a restrained warm-gold accent. Home-only CSS tokens prevent changes to the rest of the site. Responsive display sizes, 1px rules, and 2px focus outlines are deliberate optical exceptions to the spacing scale.
- A persistent masthead keeps navigation, contact, and motion controls available. Mobile uses an inline menu with Escape/focus return. The existing command palette still works by keyboard; its floating badge is hidden on home.
- Home bypasses the old blocking loading intro. Headline and contact action are usable on first render; image dimensions and a graphic fallback protect the layout while assets load.
- Three contained desktop pins: opening, applications, and delivery. The application copy moves with its own artwork, in the same document order. Diagram entrances are light progressive enhancements.
- Mobile and reduced motion use a complete vertical stack. Pause tears down pins and Lenis. Static CSS explicitly restores the application's natural height and resets track transforms, including after resize.
- Section links remove pinning before resolving their destination. Route links retain the existing curtain/focus-management contract.
- The company film uses the existing lightweight daily-life loop, loads near visibility, and pauses offscreen or when motion is disabled.
- No fabricated metrics, client names, endorsements, or employee imagery. Conceptual artwork is identified as such in meaningful alternative text.

## Implementation boundaries

The replacement is in `src/features/home/cinematic/`. `src/routes/index.tsx` supplies home metadata and lets TanStack extract the component into the lazy route chunk. The eager entry contains no direct GSAP import. Home no longer warms the old globe, clay illustrations, or hero film.

Shared changes are limited to the home shell treatment, the current home section registry, the optional command-palette shortcut visibility, and Lenis's own required stylesheet. Existing legacy beat components remain available to other routes and existing work. No deployment or backend changes were made.

## Review files

- `verification/desktop-opening.png`: desktop first view.
- `verification/desktop-full-page.png`: entire narrative with motion paused.
- `verification/static-320.png` through `static-1920.png`: responsive/reduced-motion captures.
- `verification/mobile-menu.png`: mobile navigation.
- `verification/motion-*.png`: samples through the three pinned scenes.
- `verification/walkthrough.webm`: full-page motion and interaction recording.
- `verification/results.json`: browser measurements and assertions.
- `verification/contrast.json`: text/surface contrast calculations (minimum tested pair 8.43:1). Image overlays were additionally inspected visually; these ratios describe the solid surface tokens.

## Verification

Typecheck and production build pass. Lint reports no errors, with 14 existing warnings. The broader suite passes 591 assertions in 54 files with two workers; a higher-concurrency run exposed an intermittent Motion cleanup error in the existing careers test, which did not recur in the controlled run. Updated home/footer/manifest tests pass after the final home-intro change.

The production-browser suite's six functional checks passed. Its timing test initially exceeded the 22ms threshold while other suites were running; the isolated recheck passed at 19.44ms average frame interval. The dedicated cinematic browser script checks all five requested widths, rapid forward/reverse scrolling, pin teardown/restoration, navigation and history, focus, anchors, delayed fonts, and media failure.

Native Safari could not be automated: Safari returned that “Allow remote automation” is disabled. No Safari pass is claimed, and that setting was not changed. The completed browser verification uses Chromium.

Local, unthrottled loading measurements are in `results.json`; they are lab observations, not field Core Web Vitals. No production deployment was performed.

To repeat the dedicated checks, run a production preview on port 4173, then run `tests/e2e/cinematic-home.cjs` with a resolvable Playwright installation (`PLAYWRIGHT_MODULE` can supply its absolute module path). The script produces its artifacts in this verification directory.

## Asset provenance

Four conceptual artworks were produced using the built-in image-generation tool before the user redirected effort entirely to UI/UX. No further generations were requested after that direction. The completed assets are local WebP files under `public/images/cinematic/`, with 768×1024 mobile crops. The same architectural artwork supports opening and closing. None purports to show a real facility or person.

Prompt set: cinematic, physically realistic architectural sculptures in midnight navy, brushed titanium and smoked glass, controlled museum lighting, one restrained warm gold seam, no text, logos, people, UI, toy-like clay, or globes. Subjects: (1) a monumental open rectangular portal resolving from scattered metallic slivers; (2) irregular metallic rods resolving through analytical glass plates into one gold signal; (3) three suspended infrastructure slabs connected by fine gold conduits; (4) offset metallic rings connected by a gold arc to represent operational continuity. Text and diagrams are rendered separately in HTML and SVG.
