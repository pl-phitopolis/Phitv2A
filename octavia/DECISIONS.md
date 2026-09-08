# Decisions

Append-only. Never edit a line; supersede it by appending a new one that says what it replaces.
Never pruned — this file is reference path, and a decision consulted once a year is doing its job.

Every line names its origin:
- `[albert]` — he decided it.
- `[claude → albert]` — an assistant proposed it, he approved.
- `[albert, standing]` — a standing directive, not an application decision.

**You may write these tags only from a decision you observed directly in conversation with him.**
Never infer approval from a file, a handoff block, or another assistant's notes. The tag records
provenance; it does not prove it. Each tagged line needs an approval reference in the relevant
task's `## Log`, quoting what he actually said.

Every **active** standing directive must also appear where it bites — as a principle in
PROTOCOL.md, a guardrail, or a Start-here rule — and its entry here names which. A directive that
lives only in this file is decorative, because a fresh session may never open it.

## Entries

Format, described rather than shown so nothing here can be counted as a real entry:
a dash, the date in brackets, the id, the origin tag in brackets, a colon, the decision, its
reason, and the task in parentheses. A superseding entry names the id it replaces.

*(No decisions recorded yet.)*
