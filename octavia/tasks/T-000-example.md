# T-000 — Rate-limit the upload endpoint  (worked example — delete or keep as reference)
Status: active · Mode: session-council · Opened: 2026-09-05
Branch: main · File scope: src/upload/**, routes/upload.ts
Merged: <MR link, commit SHA, or blank — filled when the work lands>

## Current                      [common — startup path, replaced each session]
Stage: build · Next: wire the limiter into routes/upload.ts
Blocking: none
Last check: `npm test -- upload` green as of 2026-09-06 (build session)

## Plan                         [claude]

### Goal
Stop a single client saturating the upload endpoint during batch imports.

### Done when
The 11th request from one client inside a 60-second window returns 429.

### Acceptance checks
- `npm test -- upload` passes, including a test asserting the 11th request returns 429.
- Manual: a batch import of 500 files completes without a 429. (No command; a person runs it.)

### Approach
Sliding-window counter in middleware, keyed per client, applied before the body parser.

<!-- A revised approach is APPENDED here with a date, never overwritten. A plan that changed
     is a fact about the task. -->

### Open questions
- None open. (If one blocks, set Status: blocked and say so in SESSION.md.)

## Build                        [antigravity]

### What was built
`UploadLimiter` middleware; wired at routes/upload.ts:31, ahead of the body parser.

### Build checks
```
$ npm test -- upload
  ✓ rejects the 11th request in window (34ms)
  18 passing
```
<!-- These are reports. Review either re-runs them, upgrading the tag, or cites them as
     reported by this session. -->

### Deviations from the approach
Keyed on IP rather than authenticated client — the middleware runs before auth resolves.
Silence in this section claims nothing surprised you, so say it plainly when something did.

## Review                       [codex]

### Evidence
- Done-when: the 11th request returns 429 — **checked directly**
  ```
  $ npm test -- upload
    ✓ rejects the 11th request in window (34ms)
    18 passing
  ```
- Middleware ordering is correct — **reported by the build session**, not re-run here.
- Batch import of 500 files — **not checked**.
- Behaviour under concurrent uploads from one client — **not checked**.

### Findings
- The limiter keys on IP, so one NAT'd office shares a bucket. Out of scope for this task;
  raised as T-016.

## Proposed for shared files    [common — any role]
- Guardrail: the mock S3 client accepts any body length, so size limits cannot be tested
  against it. [incident T-000]
- Decision: sliding window over token bucket — the bucket's refill made the 429 timing
  untestable.

<!-- Nothing reaches DECISIONS.md or GUARDRAILS.md from here without Albert's approval,
     observed directly by the session that appends it. -->

## Log                          [common — append-only, every entry signed]
- 2026-09-05 claude/plan: chose sliding window; token bucket refill made timing untestable.
  Albert approved in chat: "yes, go with the sliding window."
- 2026-09-06 antigravity/build: UploadLimiter middleware, routes/upload.ts:31. Deviated to
  IP keying; recorded above.

## Handoff                      [common — replaced by whoever ran last]
Status: partial · Could not do: verify concurrent-upload behaviour, no load harness here ·
Needs: Albert to run the 500-file batch import, or authorise adding a load test.
