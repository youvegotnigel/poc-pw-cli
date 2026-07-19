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

Read `docs/architecture.md`, `docs/conventions.md`, and `docs/app-reference.md` first — the app-reference selector table may already have a verified locator for what you need. Then:

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
# log in with resolveEnv() defaults (standard_user / secret_sauce), then
# snapshot every page the test will touch
playwright-cli generate-locator <ref>
```

Capture a verified locator for every element the test needs. Never invent a selector that has not appeared in a snapshot.

Locator priority, in order:

1. `getByRole` with an accessible name
2. `getByLabel` / `getByPlaceholder` for form fields
3. `getByText` for static, unique content
4. `getByTestId` as fallback — this app exposes `data-test`, which works because `playwright.config.ts` sets `testIdAttribute: 'data-test'`
5. Raw CSS or XPath: never

All Playwright locators auto-wait equally; determinism comes from web-first assertions, not from locator choice.

### 3. Generate code per conventions

- Page interactions go in a page object under `src/pages/` extending `BasePage`; locators are `private readonly` fields. Specs under `tests/` contain flows and assertions only.
- Page-object methods are single-purpose, take typed parameters (union types like `SortOption`, not bare strings), return a page object or data, and never contain `expect()`. Setup repeated across specs belongs in a fixture, not another page-object method.
- Reuse fixtures from `src/fixtures/test-fixtures.ts` for setup. Tests needing an authenticated session use the `authedPage` fixture (storageState captured by `tests/auth.setup.ts`). Beware: browser projects set `storageState` at the project level, so a test that must start logged out has to override it with `test.use({ storageState: { cookies: [], origins: [] } })`.
- Web-first assertions, no hard waits, strict types, Allure feature/story/severity labels, and tags on every test.
- When unsure about a Playwright API, fixture pattern, or config option, query the **Context7 MCP server** for current Playwright docs rather than relying on memory.

### 4. Async and TypeScript rules that prevent flakes at the source

- **Await everything.** A floating promise means the test can pass while its assertion never ran. Every `expect()` and every page/locator call is awaited; no `.then()` chains mixed with `await`.
- **Register the wait before the trigger.** For downloads, popups, and responses, a wait started after the action races the event and loses intermittently:

  ```ts
  // Bad: event can fire before the listener exists
  await checkoutPage.submitOrder();
  const response = await page.waitForResponse('**/api/orders');

  // Good: listener first, then act
  const responsePromise = page.waitForResponse('**/api/orders');
  await checkoutPage.submitOrder();
  const response = await responsePromise;
  ```

  `Promise.all([waitForX, action])` is the equivalent form. Never use `Promise.all` to "parallelize" two UI actions on the same page — that is a race, not an optimization.
- **No `async` callbacks in `forEach`.** `forEach` does not await; assertions run after the test ends. Use `for...of`, or one `test()` per case from a data array.
- **No branching on `if (await locator.isVisible())`.** It is a one-shot, non-retrying check that races the render. Assert the state the user actually reaches; if two outcomes are genuinely valid, model it with `locator.or()`.
- **Locators, not handles.** Never store `elementHandle` / `page.$` results; handles go stale after re-renders, locators re-resolve.
- **No shared mutable state.** No module-level `let` shared across tests (parallel workers interleave); test data is `const`, typed with `as const` or `satisfies`, and owned per test.
- **Pin time and randomness.** UI that depends on the clock uses `page.clock`; generated data uses a fixed seed. Asserting against `new Date()` or unseeded random values is nondeterminism you wrote yourself.
- **Eventually-consistent values** that aren't locators (API polling, computed totals) use `expect.poll()` or `expect().toPass()` — never a hand-rolled retry loop or sleep.

### 5. Prove it works

```bash
npx playwright test tests/<file>.spec.ts --repeat-each=3
npm run lint && npm run typecheck
```

If the test fails, use the **test-debug skill** rather than patching blind.

### 6. Definition of done

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
