---
name: "source-command-ponytail-review"
description: "Review changes for over-engineering, what can be deleted"
---

# source-command-ponytail-review

Use this skill when the user asks to run the migrated source command `ponytail-review`.

## Command Template

Review the current code changes for over-engineering only, not correctness. One line per finding: L<line>: <tag> <what to cut>. <replacement>. Tags: delete (dead code/speculative feature), stdlib (reinvented standard library), native (dependency doing what the platform does), yagni (abstraction with one implementation), shrink (same logic, fewer lines). End with the net lines removable. If nothing to cut: 'Lean already. Ship.'
