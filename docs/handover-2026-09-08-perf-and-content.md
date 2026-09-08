# Handover — 2026-09-08 · route weight, preloader retime, careers content move

**Branch:** `new-hero-and-video` · **Nothing committed.** All work below is in the working tree,
alongside pre-existing uncommitted hero/services work that this session did not touch.

**Origin:** a "Fresko V3" plan proposed rebuilding every public page in Astro because the file
structure was "too bad". That premise was checked against the code and rejected — Fresko is a
conventional feature-sliced React 19 app with generated API types and a strict tsconfig. The
decision was to revise in place. Full review + workstream plan:
`~/.claude/plans/review-this-plan-for-jiggly-floyd.md`.

---

## 1. What is DONE (verified)

### WS1 — route weight ("images load late")

The reported symptom was `/about` arriving slowly on client-side navigation. The bytes were
never the first-paint problem; three separate things were.

| Fix | File | Result |
|---|---|---|
| Reinstated the daily-life loading gate | `src/features/home/components/DailyLifeSection/useDailyLifeVideo.ts` (new) | 18.7MB file no longer fetched on mount |
| Cut the film to a reel | `public/videos/daily-life-reel.mp4` (new) | 18.7MB → **2.67MB** (−86%) |
| Lazy-boundaried JourneyTimeline | `src/routes/about.tsx` | about eager chunk **112,471 → 94,793 B** (−15.7%); brotli 26,724 → 22,176 B (−17.0%) |
| Neighbour-route asset warming | `useNeighbourRouteWarming` in `src/shared/components/AppShell.tsx` | `/about`'s blocking assets load while still on `/` |
| Deleted dead assets | `public/images/about-hero-bg.{jpg,webp}` | −1.9MB, referenced nowhere |

**Root cause of the video bug:** `useDailyLifeVideo.ts` was deleted during the WS-14 file splits
(`docs/polish-log.md:361`) and `DailyLifeSection` was later rebuilt with a hard-coded `src` +
`autoPlay` and **no gate at all** — while `useBackgroundVideo.ts:25` still documented that gate as
existing. Every visitor to `/` and `/about` downloaded the master, scrolled-to or not.

**Verified in-browser (production build, preview server):**
- `daily-life*.mp4` never requested on `/about` load; only its 40KB poster.
- Client-side `/` → `/about` = **4 new requests**, media = one 40KB poster.
- JourneyTimeline chunk loads on scroll (6.3KB over the wire), 14 timeline images, 0 broken.
- 0 elements stuck at `opacity: 0` on either route.

### WS2 — preloader retimed 9.7s → 5.6s

Time-to-hero on a first load. The hero is hard-gated at `opacity: 0` until the preloader's
`onDone`, so this total *is* the visitor's wait.

| Constant | File | Was | Now |
|---|---|---|---|
| `HOLD_S` | `preloaderChoreo.ts` | 1.6 | 1.2 |
| `POST_HOLD_S` | `preloaderChoreo.ts` | 2.0 | **0** |
| `EXIT_FADE_S` | `Preloader.tsx` | 0.6 | 0.4 |
| `OUT_DURATION_S` | `Preloader.tsx` | 2.0 | 0.5 |
| `BEAT_FAILSAFE_MS` | `Preloader.tsx` | 13000 | 8500 |
| `STEP_MS` (hero cascade) | `AppShell.tsx` | 700 | 250 |

**SEQ 1 and SEQ 2 — the parts that actually animate — are untouched** at 0.00→0.90 and
2.50→3.50. The entire cut came out of held stillness and the tail. Full hero (incl. CTA buttons)
now resolves ~6.6s instead of 12.5s.

A design-guard test asserted `POST_HOLD_S >= 2` ("the whole point of the rework"). That encoded
the superseded decision, so it was replaced — the legitimate half (any hold that *exists* must
clear 1.2s to read as deliberate) is kept, plus a new stronger guard that the whole intro lands
under 6s. See `tests/motion/preloader-choreo.test.ts`.

### WS3 — careers content move

- `GraduateHallOfFameSection` **moved** `features/about/components/` → `features/careers/components/`
  (`git mv`, no code changes — it was fully self-contained). Now renders on `/careers`.
- `FuntopolisSection` **created** at `src/features/careers/components/FuntopolisSection.tsx`
  (131 lines). Reuses existing optimised `/images/grads/` WebP, so it adds **no new asset weight**.
- `AcademySection` **retained** as the `/about` closing CTA, as specified.
- Verified: `/careers` renders both (9 grads images, 0 broken); `/about` has 0 grads cohort
  images left and still ends on Academy.

> ⚠️ **Funtopolis copy is PLACEHOLDER.** There was no Funtopolis anywhere in the codebase — no
> component, route, or content key; the only mention in the whole tree was a line in
> `docs/blog-image-migration.md`. The structure is real, the words are not. It deliberately
> contains **no event names, dates, headcounts, or frequency claims** — inventing those is how a
> careers page ends up describing a company that doesn't exist. Replace the `MOMENTS` const when
> real content arrives; the shape is a drop-in. The file says all this at the top.

---

## 2. Test baseline — READ THIS BEFORE TRUSTING GREEN

**600 passed / 1 failed (601).**

The one failure is **pre-existing and unrelated**: `tests/preview-cdp.test.ts` → "Long Tasks and
frame deltas", asserting `avgFrameIntervalMs < 22`. Measured **24.45 on a clean `git stash`** vs
**24.27 with this session's changes** — it fails identically without any of this work, and these
changes marginally improved it. Do not treat it as a regression, and do not "fix" it by raising
the threshold without first finding out what regressed it on this branch.

Net test count went 596 → 601: three new gate tests, two new preloader-timing guards, one
rewritten assertion.

`yarn typecheck` is **clean**. Note the Dockerfile's comment claiming "~65 pre-existing strict-TS
errors in three files" is **stale on this branch** — see §4.

---

## 3. Corrections to the original plan (do not re-attempt these)

1. **WS1.3 was already fixed before this session.** `useWarmupSignals` is already decoupled from
   the preloader — see its own comment at `AppShell.tsx:298-314`. No change was needed or made.
2. **Lazying JourneyTimeline does NOT remove gsap from the about chunk.** `SmoothScroll` and
   `GroundLayer` both import gsap at module scope and both mount at the top of `/about`, so
   `ScrollTrigger-*.js` stays a static edge. The win was JourneyTimeline's own weight only.
3. **Re-encoding the daily-life master whole is a dead end.** Measured: x264 CRF 30 `slow` gives
   18.7MB → 17.4MB (7%); VP9 no better at matched quality (it came out *larger* — 4.9MB vs 2.5MB
   on a 40s test cut). The master already sits at ~594kbps. Size was a function of the
   **251-second duration**, which is why the fix was a 45s cut, not an encoder change.
4. **The 26 timeline PNG/JPG originals were deliberately KEPT.** They are the `onError` fallback
   target at `JourneyTimeline.tsx:544-546`, and nothing ever requests them — they cost Docker
   image size, not page weight. The plan overstated them as page weight.

---

## 4. OPEN — next session picks up here

**Blocked on you:**
- **Funtopolis real copy + imagery** → replace `MOMENTS` in `FuntopolisSection.tsx`.
- **Sign off the 45s reel.** If approved, delete `public/videos/daily-life.mp4` (18.7MB, now
  referenced by nothing, restorable from git) — it still ships in the Docker image.

**WS4 — pagination (backend-first, Heimdall gates the frontend):**
- `contact_messages` has six columns and accepts only name/email/subject/message + honeypots
  `company_website`/`website_hp`. **No career-application fields exist** (no job title/slug, no
  applicant contact, no attachment). Needs schema + Alembic migration + admin column.
- **No rate limit on the contact POST** — `grep "limiter.limit" app/` returns exactly one hit,
  `app/features/auth/router.py:51`. `app/rate_limit.py`'s docstring claiming contact-spam cover
  is wrong.
- **No admin CRUD for innovation posts** (no `admin_router` in `app/api.py`) — content is only
  insertable by SQL.
- Seed missing `page-content/home/hero` and `company-profile` records.
- Then: migrate `/careers` off `src/shared/careersData.ts` (233 lines) + `jobDetails.ts` (232) to
  `GET /api/v1/job-postings`; wire pagination UI on blog/innovation/careers. **Heimdall caps
  `limit` at 50** (`app/deps.py::pagination_params`) — "load all" needs an offset loop.
  Regenerate `src/shared/api/schema.d.ts` via `yarn typegen` after the backend lands.

**WS5 — landing page restructure.** Read `docs/product/PRD-home-client-focus.md` and the four open
`handoff.md` folders first (`open-rework-cycle-2026-08-30`, `preloader-full-preload`,
`closing-section-rebuild`, `web-intro-rework`) — there is unfinished in-flight state, including
the hero revamp stopped mid-wave.

**Housekeeping (cheap):**
- Re-verify the Dockerfile's `npx vite build` (skips typecheck). Typecheck is clean on this
  branch, so the "~65 strict-TS errors" comment is stale — restore `tsc -b` and confirm CI.
- Delete `package-lock.json` (Dockerfile and CI both use yarn; both lockfiles are committed).
- Add `location /media/` to both Fresko nginx configs. Heimdall's public vhost templates alias
  `/srv/heimdall/media/` but compose writes to `deploy/data/media`; FastAPI serves `/media` only
  when `debug=True`, so proxying it to the API 404s in UAT.
- Fix API allowlist drift in `deploy/nginx/sites-available/fresko.conf`: allows `process-steps`
  and `certification-groups`, but routers mount at `/api/v1/process` and `/api/v1/certifications`;
  `partners` omitted entirely.
- Three deploy targets exist (`netlify.toml`, `vercel.json`, Docker/nginx). Delete the unreal ones.

**Known, not acted on:** `we-build-the-future.mp4` is **13.1MB** with eager `src` +
`preload="auto"` on home (`ClosingVideoSection.tsx:332,335`). It is scroll-*scrubbed*, so gating
it would break the scrub — a WS5 design decision, not a bug.

---

## 5. Files this session touched

**New:** `src/features/home/components/DailyLifeSection/useDailyLifeVideo.ts` ·
`src/features/careers/components/FuntopolisSection.tsx` · `public/videos/daily-life-reel.mp4` ·
this file

**Moved:** `src/features/about/components/GraduateHallOfFameSection.tsx` →
`src/features/careers/components/`

**Modified:** `src/routes/about.tsx` · `src/routes/careers.index.tsx` ·
`src/shared/components/AppShell.tsx` · `src/shared/components/Preloader.tsx` ·
`src/shared/components/preloaderChoreo.ts` ·
`src/features/home/components/DailyLifeSection/DailyLifeSection.tsx` ·
`tests/motion/daily-life-pinned-scroll.test.tsx` · `tests/motion/preloader-choreo.test.ts`

**Deleted:** `public/images/about-hero-bg.jpg` · `public/images/about-hero-bg.webp`

Everything else in `git status` (hero, services, `content.ts`, `sections.ts`, `octavia/`, the
hero-loop videos) is **pre-existing uncommitted work from a prior session — not mine, not
reviewed, do not attribute.**
