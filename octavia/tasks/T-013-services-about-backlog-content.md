# T-013 — Backlog: Services proof-points + About partner/cert overlap check
Status: backlog (not scheduled) · Mode: n/a · Opened: 2026-09-16
Branch: n/a — logging only, no branch/work started
File scope: (future) src/features/services/**, src/routes/services.tsx,
src/shared/content.ts (CONTENT.about.talent/certifications), src/features/about/**

## Current
Stage: backlog · Next: needs a scope owner for Services and/or About before
any implementation starts. Logged per sign-off note #2 on the Rebuild
Carryover Proposal ("Good to have" — log, don't schedule).
Blocking: none — explicitly not scheduled.

## Plan

### Goal (as approved, not yet scoped into an implementation plan)
Two backlog items carried over from the Rebuild Carryover Proposal's
decision matrix, both approved in principle by stakeholder sign-off but
neither ready to build:

**1. Services proof-point metrics** ("good catch, do if possible" — but
gated on real content, not the old repo's fabricated-looking numbers).
Research done 2026-09-16: `phitopolis.com` (production) is still the old
2019-era static site, not this rewrite — its Heimdall API path 404s, so
there is no live per-team metrics API to pull from yet. Its WordPress blog
(`phitopolis.com/blog/`) does have one real, relevant post: **"Inside AI
Day 3: How Four Teams Are Putting AI to Work"** (Aug 12, 2026), covering
four real teams —
  - Data Science: agentic data-integrity/pipeline-health tooling
  - DevOps: AIOps platform bridging Slack/monitoring/ticketing
  - Quantitative Research: "Idea-to-Alpha", research-to-strategy pipeline
  - Software Engineering: L3 diagnostic engine for version-locked bug triage

  **No hard numbers appear in that post** (no latency/accuracy/throughput
  figures) — it's qualitative project descriptions only. Building a
  "proof-points" section from this real source means either (a) reframing
  it as capability/project descriptions rather than a stats strip, or (b)
  finding a different, numeric source — not fabricating figures the way the
  legacy repo's AI Day page did. This is a content/design decision for
  whoever owns `/services`, not something to implement without that call.

**2. About partner-school/cert list overlap check.** No verdict was given
in the sign-off feedback at all. `About`'s existing Academy section already
has its own cohort copy (e.g. "5 cohorts since 2023," "30+ interns placed");
whether the legacy repo's partner-school list (UP/ADMU/DLSU/Mapúa/UST/PUP…)
and cert list (AWS/Azure/PMP/ITIL/ISO27001/CFA…) add anything not already
covered was never confirmed. Needs someone to actually diff the two content
sets before this can move past "maybe."

### Open questions
- Who owns scoping the Services proof-points content decision?
- Does anyone want a verdict on the About partner/cert overlap, or does it
  stay indefinitely backlogged?

## Log
- 2026-09-16 solo: logged per sign-off note #2 ("Good to have") on the
  Rebuild Carryover Proposal — this task file did not exist yet even though
  the research (AI Day 3 post) had already been done and reported in
  conversation. No code changes, no branch.
