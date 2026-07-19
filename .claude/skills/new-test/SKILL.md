---
name: new-test
description: Use when asked to write, add, create, or generate a Playwright test or coverage. Triggers include "write a test for checkout", "add coverage for sorting", "create a spec for login errors", "automate this scenario", or a request to turn a plan in specs/ into a working test. Enforces the planner, generator, healer order required by this repo.
---

# Writing a New Test

## Purpose

Produces a new spec plus any page objects, following the mandatory order: plan first, explore the live app, generate against verified selectors, prove determinism.

## Workflow

### 1. Plan before code

Check `specs/` for an existing plan covering the scenario. If none exists, write one first: a Markdown plan listing the scenario, steps, expected outcomes, test data, and proposed tags (`@smoke`, `@regression`, `@critical`). Get the user's sign-off on the plan before generating code. Never jump straight to a spec file.

### 2. Explore the live app with the playwright-cli skill

Read `docs/architecture.md` and `docs/conventions.md` first, then:

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
# log in with resolveEnv() defaults (standard_user / secret_sauce), then
# snapshot every page the test will touch
playwright-cli generate-locator <ref>
```

Capture a verified locator for every element the test needs. Never invent a selector that has not appeared in a snapshot. Note: the app exposes `data-test` attributes, and `getByTestId` only works with `testIdAttribute: 'data-test'` set in `playwright.config.ts`.

### 3. Generate code per conventions

- Page interactions go in a page object under `src/pages/` extending `BasePage`; locators are `private readonly` fields. Specs under `tests/` contain flows and assertions only.
- Reuse fixtures from `src/fixtures/test-fixtures.ts` for setup. The auth `storageState` fixture does not exist yet; do not assume it does. If the test needs it, build it first and tell the user.
- Web-first assertions, no hard waits, strict types, Allure feature/story/severity labels, and tags on every test.
- When unsure about a Playwright API, fixture pattern, or config option, query the **Context7 MCP server** for current Playwright docs rather than relying on memory.

### 4. Prove it works

```bash
npx playwright test tests/<file>.spec.ts --repeat-each=3
npm run lint && npm run typecheck
```

If the test fails, use the **test-debug skill** rather than patching blind.

### 5. Definition of done

- [ ] Plan exists in `specs/` and was reviewed
- [ ] Every locator verified against a live snapshot
- [ ] POM respected: no raw locators or `page.click` in the spec
- [ ] Lint, typecheck, and 3 consecutive test runs green
- [ ] Allure labels and criticality tags set
- [ ] Page objects and specs in separate commits when practical

## Common mistakes

- Writing the spec before the plan "because the scenario is simple"
- Copying selectors from an old suite or from memory instead of a snapshot
- Logging in through the UI in every test instead of raising the missing auth fixture with the user
- Marking a test `@critical` without checking the tagging convention
