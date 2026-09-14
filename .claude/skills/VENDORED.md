# Vendored skills — provenance

Hand-copied skills that live in this repo's `.claude/skills/` (Claude Code only
discovers skills as top-level folders there). Not installed via `claude plugin`.

| Skill folder(s) | Upstream | Version | Pulled | License |
|---|---|---|---|---|
| `caveman/` | https://github.com/MrFlashAccount/UltraSkills (`skills/caveman`) | — | 2026-09-09 | see upstream |
| `ponytail/`, `ponytail-review/`, `ponytail-audit/`, `ponytail-debt/`, `ponytail-gain/`, `ponytail-help/` | https://github.com/DietrichGebert/ponytail | 4.9.0 | 2026-09-09 | MIT |

`caveman` and `ponytail` are designed to pair: `ponytail` governs *what you
build* (YAGNI / stdlib-first), `caveman` governs *how you talk* (terse prose).

## ponytail: hooks deliberately omitted

Upstream ponytail ships a `SessionStart` / `SubagentStart` / `UserPromptSubmit`
hook bundle (`hooks/claude-codex-hooks.json` + Node scripts) that auto-activates
the mode and persists the chosen intensity across turns. Those hooks depend on
the plugin runtime (`${CLAUDE_PLUGIN_ROOT}`) and write state into
`$CLAUDE_CONFIG_DIR`, so they were not vendored.

Consequences:
- Activation is via the skill `description` triggers and the `/ponytail*`
  commands in `.claude/commands/`, not automatic at session start.
- `/ponytail lite|full|ultra` is honoured within a conversation but not written
  to disk, so it does not persist across sessions.
- No statusline indicator.

For true auto-activation, install the real plugin at user scope instead:
`claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail`
(then remove the vendored `ponytail*` folders here to avoid a double trigger).

The 6 `commands/ponytail*.toml` files upstream are Codex/OpenCode format; they
were converted to Claude Code `.claude/commands/ponytail*.md` here.
