# GitHub Copilot instructions

Copilot reads `AGENTS.md` natively and also reads this file. Treat `AGENTS.md`
in the repo root as the source of truth for stack, commands, architecture, and
conventions. This file only adds Copilot-specific guidance.

## Behavior

- Prefer completions that match the Page Object Model already present in
  `src/pages/`. When completing a spec, call existing page-object methods rather
  than generating raw `page.locator(...)` chains.
- For new page interactions, suggest a method on the relevant page object class,
  not inline locators in the spec.
- Use web-first assertions (`await expect(...)`). Do not suggest
  `expect(await ...).toBe(true)` patterns or `waitForTimeout`.
- Respect strict TypeScript. Do not suggest `any` or non-null assertions to clear
  type errors.
- When migrating a legacy suite, follow `docs/migration.md` in order: build the
  inventory and mapping first, port one feature at a time, and re-capture stable
  selectors from the live app rather than translating legacy CSS/XPath verbatim.
- Before a change is complete, check it against `docs/code-review.md`.
- After editing a TypeScript file, run `npx eslint --fix <file>` on it. Before
  declaring any task done, run `npm run typecheck` (mirrors the Claude Code
  lint/typecheck hooks; Husky pre-commit is the hard gate).
- Never leave `test.only` / `describe.only` / `fit` / `fdescribe` in a commit —
  the pre-commit hook rejects them.

## How this repo's agent layer maps to Copilot

The `.claude/` directory holds the Claude Code wiring; the same capabilities are
provided for Copilot here. Keep the pairs in sync when either side changes.

| Capability | Claude Code | Copilot |
| --- | --- | --- |
| Workflow skills | `.claude/skills/*/SKILL.md` | `.github/skills/*/SKILL.md` (same SKILL.md format; picked up by the Copilot coding agent/CLI) |
| Subagents | `.claude/agents/*.md` | `.github/chatmodes/*.chatmode.md` (custom chat modes in VS Code — same instructions, Copilot tool names) |
| Slash-style tasks | Skill invocations | `.github/prompts/*.prompt.md` (run with `/name` in VS Code chat) |
| Hooks: lint/typecheck | `.claude/hooks/lint-changed.sh`, `typecheck-on-stop.sh` | Behavior rules above + `.husky/pre-commit` + CI (`playwright.yml`) |
| Hooks: block focused tests | `.claude/hooks/block-test-only.sh` | `.husky/pre-commit` grep (blocks every committer) |
| Agent environment | Claude Code sandbox | `.github/workflows/copilot-setup-steps.yml` (preinstalls deps for the coding agent) |
| Permissions | `.claude/settings.json` | Repo settings / coding-agent firewall (configured in GitHub, not in-repo) |

## Scoped instructions

Path-scoped rules live under `.github/instructions/*.instructions.md`:

- `tests.instructions.md` — spec-file rules (POM-only flows, web-first
  assertions, no focused tests, auth fixtures, Allure labels).
- `src.instructions.md` — page-object/fixture/config rules (private readonly
  locators, no `expect()` in page objects, strict TS).

Keep these scoped files small and non-duplicative with AGENTS.md.
