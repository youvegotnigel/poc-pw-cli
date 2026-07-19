# AGENTS.md

> Single source of truth for every AI coding agent working in this repo
> (Copilot, Codex, Cursor, Gemini CLI, Aider, and Claude Code via the CLAUDE.md shim).
> Keep this file short, specific, and current. Stale instructions are worse than none.

## 1. What this project is

A Playwright + TypeScript end-to-end test automation framework (and a
migration-ready skeleton). It follows the Page Object Model, web-first
assertions, and strict TypeScript. Tests target a luxury e-commerce web app. The
framework is authored with an AI-native loop: Playwright Test Agents (planner,
generator, healer) drive test creation, and humans review every generated
artifact before merge. It is also the target skeleton when migrating a legacy
E2E suite to Playwright (see section 9 and `docs/migration.md`).

## 2. Tech stack (do not introduce alternatives without asking)

- Runtime: Node.js 24 LTS (>=22 supported), TypeScript 6.x (strict mode, no `any`)
- Test runner: `@playwright/test` (current stable, 1.61+)
- Architecture: Page Object Model + Playwright fixtures
- Reporting: `allure-playwright` plus the built-in HTML reporter (the `allure`
  CLI ships via the `allure-commandline` dev dependency)
- Lint/format: ESLint flat config (`eslint.config.mjs`) + `typescript-eslint`,
  Prettier (`.prettierrc.json`)
- Hooks: Husky (pre-commit runs lint + typecheck, see `.husky/pre-commit`)
- CI: GitHub Actions (`.github/workflows/playwright.yml`)

> Versions are kept current via Context7 / the npm registry and pinned for mutual
> compatibility. TypeScript is pinned `~6.0` because `typescript-eslint` currently
> supports `<6.1`; bump it only when that peer range moves.

## 3. Commands (use these exact scripts)

```bash
npm ci                      # install, never `npm install` in CI
npm run lint                # eslint, must pass with zero warnings
npm run typecheck           # tsc --noEmit
npm run format              # prettier --write . (format:check for CI)
npm test                    # playwright test (all projects)
npm run test:headed         # debug locally with a head
npm run report              # open allure report
npx playwright test path/to/file.spec.ts   # single file
```

## 4. Project layout

```
src/pages/        Page objects. One class per page/component. Extend BasePage.
src/fixtures/     Custom Playwright fixtures (auth, page objects, test data).
src/config/       Env resolution and typed config. No secrets committed.
tests/            Spec files only. No locators or logic here, only flows.
specs/            Markdown test PLANS written by the planner agent.
agents/           Auto-generated agent definitions (planner/generator/healer).
docs/             architecture.md, conventions.md, app-reference.md,
                  playwright-cli.md, migration.md, code-review.md.
                  Read the relevant one before authoring or migrating.
```

## 5. Non-negotiable conventions

- **POM is mandatory.** Specs call page-object methods. They never contain raw
  locators or `page.click`. If a spec needs a new interaction, add a method to
  the relevant page object.
- **Selectors:** prefer role-based and `getByTestId`. Never use brittle CSS or
  XPath chains. The app exposes stable `data-test` attributes (not `data-testid`);
  `playwright.config.ts` sets `testIdAttribute: 'data-test'` so `getByTestId`
  targets them. Verified selectors are catalogued in `docs/app-reference.md`.
- **Assertions:** web-first only (`await expect(locator).toBeVisible()`).
  Never `expect(await locator.isVisible()).toBe(true)`.
- **Waiting:** rely on auto-waiting and web-first assertions. No `waitForTimeout`
  / hard sleeps. A hard wait in a PR is a blocking review comment.
- **Auth:** reuse `storageState` via the auth fixture. Do not log in through the
  UI inside every test.
- **Types:** strict TypeScript. No `any`, no non-null `!` to silence the compiler.
  Prefer `unknown` for external data and narrow it.
- **No flaky retries-as-fix.** If a test is flaky, fix the root cause; do not
  bump retries to hide it.

## 6. Boundaries (things agents must NOT do)

- Do not edit files under `agents/` by hand. Regenerate via `init-agents`.
- Do not commit secrets, `.env`, `storageState.json`, or `auth/` artifacts.
- Do not touch `playwright.config.ts` projects/timeouts without flagging it.
- Do not add new dependencies without justification in the PR description.
- Do not disable ESLint rules inline to make code pass.

## 7. Definition of done for a new test

1. There is a plan in `specs/*.md` (planner output, human-reviewed).
2. Page interactions live in a page object, not the spec.
3. `npm run lint`, `npm run typecheck`, and the test all pass locally.
4. The test is deterministic across 3 consecutive runs.
5. Allure labels (feature/story/severity) are set on the test.

## 8. How the AI authoring loop works here

Planner explores the live app and writes a Markdown plan to `specs/`.
Generator reads that plan and produces spec files plus any new page objects.
Healer runs failing tests and repairs locators/waits, or marks genuinely
broken functionality as skipped with a reason. A human reviews every step.
See `docs/architecture.md` for the full loop and `docs/conventions.md` for
the exact code style the generator must follow.

## 9. Migrating a legacy suite into this framework

This repo is also the target skeleton for migrating an existing E2E suite
(Selenium, Cypress, Protractor, WebdriverIO, TestCafe, ...) to Playwright.
Do not start porting files ad hoc. Follow `docs/migration.md`, which gives the
prioritized, token-efficient procedure: inventory -> map -> port in feature
batches (planner/generator/healer) -> wire auth/data/config/CI -> verify ->
retire the legacy suite. Each phase has a definition of done and a human review
gate. Before opening any PR (new test or migrated test), self-review against
`docs/code-review.md`.
