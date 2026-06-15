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
- Before authoring a test, read `docs/architecture.md` and `docs/conventions.md`.
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

- The app under test is https://www.saucedemo.com (override with `BASE_URL`).
  Login is at the site root `/`, not `/login`. Credentials come from
  `resolveEnv()` in `src/config/env.ts` (defaults `standard_user` /
  `secret_sauce`); a successful login lands on `/inventory.html`.
- saucedemo exposes `data-test` attributes (e.g. `username`, `password`,
  `login-button`), not `data-testid`. Playwright's `getByTestId` defaults to
  `data-testid`, so set `testIdAttribute: 'data-test'` in `playwright.config.ts`
  (currently unset) before relying on `getByTestId`, or use role/`data-test`
  selectors directly.
- The intended auth pattern is to capture the post-login `session-username` cookie
  once and reuse it via `storageState` in an auth fixture — but that fixture does
  NOT exist yet. `src/fixtures/test-fixtures.ts` only provides `loginPage`. Build
  the auth fixture before assuming `storageState` is wired; don't expect it to be
  there.
- There is no server-side seed/reset endpoint (no `/api/test/reset`). To reset
  state, use the app menu's "Reset App State" or clear cookies/localStorage in a
  fixture.
- `tests/login.spec.ts` is an illustrative placeholder: it hardcodes creds and
  asserts `/login` and `/dashboard`, none of which match saucedemo. Treat it as a
  sample, not a working baseline.
- `npm run test:headed` is for local debugging only. CI always runs headless.

> Maintainer note: keep this file thin. Shared rules live in AGENTS.md so every
> tool stays in sync. If a rule applies to all agents, put it there, not here.
