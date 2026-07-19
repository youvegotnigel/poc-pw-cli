# CLAUDE.md

Claude Code does not read `AGENTS.md` natively (as of mid-2026), so this file
is the entry point for Claude Code. It imports the shared rules and adds a few
Claude-specific behaviors.

## Read this first

@AGENTS.md

Everything in `AGENTS.md` is binding. The sections below only add Claude-specific
behavior; they never override the shared conventions.

## Claude-specific behavior

- Respond inline. Do not create artifacts for code that belongs in the repo;
  write it to the correct file path instead.
- Before authoring a test, read `docs/architecture.md`, `docs/conventions.md`,
  and `docs/app-reference.md` (app facts + verified selector table).
- Use the Playwright CLI skill (`.claude/skills/playwright-cli/`) to inspect the
  live app and capture stable selectors before writing locators. Never invent a
  selector you have not verified against a snapshot.
- When generating a test, follow the planner -> generator -> healer order. Do not
  jump straight to a spec file without a plan in `specs/`.
- When migrating an existing suite, follow `docs/migration.md` in order
  (inventory -> map -> port in batches -> wire -> verify -> retire). Do not bulk-
  convert files without an inventory and a per-batch green gate.
- Before opening a PR, self-review against `docs/code-review.md`.
- Keep page objects and specs in separate commits when practical, so reviews are
  easy to read.

## Tribal knowledge

App facts (URLs, credentials, `data-test` vs `data-testid`, auth wiring, the
verified selector table) live in `docs/app-reference.md` — read that, don't
rely on memory. What remains here is genuinely Claude-workflow-specific:

- Auth is already wired: the `setup` project (`tests/auth.setup.ts`) captures
  `auth/storageState.json` once, browser projects load it at the project level,
  and the `authedPage` fixture derives from it. A test that must start logged
  out (e.g. login tests) overrides with
  `test.use({ storageState: { cookies: [], origins: [] } })`.
- `npm run test:headed` is for local debugging only. CI always runs headless.

> Maintainer note: keep this file thin. Shared rules live in AGENTS.md so every
> tool stays in sync. If a rule applies to all agents, put it there, not here.
