# Status map

**This file owns no facts. It owns the arrows between them.** Every cell points at the file that
holds the record; nothing here is copied, so nothing here can disagree with its source. If a row
and its source conflict, the source is right and this row is stale — fix it and say so.

Reference path. Not read at session start. Update a row **only when the thing it maps changes
state** — a finding opened, a rule approved, a task closed, a fix verified — in the same edit that
records the change. It is not a per-session chore.

## Findings → rule → fix → proof

Findings live in the task file that found them. Rules live in `GUARDRAILS.md`. Tasks live in
`TASKS.md`. "Proof" is the check that would establish the fix actually works — a fix with no
proof is recorded as `not checked`, never as done.

| ID | Finding, one line | Rule | Fixed by | Fix verified? |
|---|---|---|---|---|

## Tasks

| Task | State | Record |
|---|---|---|

## Rules in force

| ID | What it constrains | Record |
|---|---|---|
