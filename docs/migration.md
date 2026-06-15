# Migration playbook: any legacy E2E framework -> this Playwright skeleton

This document is the prioritized, token-efficient procedure an AI agent (GitHub
Copilot, Claude Code, Codex, etc.) follows to migrate an existing end-to-end
suite (Selenium, Cypress, Protractor, WebdriverIO, TestCafe, Puppeteer,
Nightwatch, ...) into this repo's architecture.

Read this once, then work the phases in order. Do not skip ahead: each phase
produces an artifact the next one consumes. Humans review every phase boundary.

## 0. Operating principles (these save the most time and tokens)

1. **Plan before you port.** Produce the inventory (Phase 1) and the mapping
   (Phase 2) as small Markdown files _before_ writing any TypeScript. Porting
   without a map is where agents burn tokens re-reading the same files.
2. **Work in batches by feature, not file-by-file.** Migrate one feature
   end-to-end (page object + spec + data) so it can be reviewed and merged. A
   merged feature is context you never have to reload.
3. **Read narrowly.** Open only the legacy files for the feature you are porting.
   Never read the whole legacy repo into context. Use search to find a selector
   or flow, then read just that region.
4. **Reuse, don't regenerate.** Before adding a locator or helper, check
   `src/pages/` and `src/fixtures/` for an existing one. The skeleton already has
   `BasePage`, the auth fixture pattern, and typed config.
5. **Let the Playwright Test Agents do the mechanical work.** The planner explores
   the live app and the generator writes verified locators (see
   `architecture.md`). Hand them the legacy plan as input instead of translating
   brittle legacy selectors literally.
6. **Verify selectors against the running app, never translate them blind.** A
   legacy XPath is a hint about _what_ element, not _how_ to find it. Capture a
   stable role/testid from a live snapshot via the Playwright CLI.
7. **Stop at the gate.** Each phase has a definition of done. Do not start the
   next phase until the current one passes lint + typecheck (and, from Phase 4,
   the tests).

## 1. Inventory (cheap, do it first) -> `specs/_migration/inventory.md`

Goal: one small manifest that lets you size and order the work without rereading
the legacy repo.

Capture, per legacy test file:

- Feature / user journey it covers (one line).
- Source tool and language (e.g. Cypress/JS, Selenium/Java).
- External dependencies: login, test data/seed, API mocks, env/config.
- Flakiness or `skip`/`only` markers (these become healer or backlog items).
- Priority: P0 smoke (login, checkout) first; long-tail edge cases last.

Output a table sorted by priority. **This is the migration backlog.** Stop and
let a human confirm priority before porting.

## 2. Map the concepts (no code yet) -> `specs/_migration/mapping.md`

Translate _concepts_, not syntax. Fill in the per-tool cheat sheet at the bottom
of this file for the source tool(s) in your inventory, plus project specifics:

- Where do legacy selectors live? (page objects? inline? a selectors map?)
- How does legacy auth work, and what is the Playwright `storageState`
  equivalent? (See `CLAUDE.md` tribal knowledge for this repo's auth cookie.)
- How is test data seeded/reset? Map it to a fixture (`resetApp`), not per-test
  setup.
- Which assertions are state checks (-> web-first `expect`) vs. control flow?

## 3. Port in batches: planner -> generator -> healer

For each feature, highest priority first:

1. **Plan.** Run the planner against the _live_ app for this feature, seeded with
   the legacy test's intent from the inventory. Save to `specs/<feature>-plan.md`.
   Human reviews scope here (cheapest place to fix it).
2. **Generate.** The generator turns the approved plan into:
   - page-object methods in `src/pages/*.page.ts` (all locators live here),
   - a spec in `tests/*.spec.ts` (flows only, calls page objects),
   - any new fixture wiring in `src/fixtures/`.
     Keep page objects and specs in separate commits when practical.
3. **Heal.** Run the spec. Let the healer repair locator/wait drift. If the
   underlying app feature is genuinely broken, it marks the test skipped with a
   reason -> that reason goes back to the backlog, it does not block the batch.
4. **Gate.** `npm run lint && npm run typecheck && npx playwright test tests/<feature>.spec.ts`
   must pass, deterministically across 3 runs, before the batch is done.

## 4. Wire the cross-cutting concerns once

These are done once for the whole suite, not per test:

- **Auth:** reuse `storageState` via the auth fixture. Port the legacy login into
  a single setup that persists state; specs start authenticated.
- **Test data / reset:** call the app reset endpoint in a fixture (`resetApp`),
  not inside tests.
- **Config / env:** move legacy hardcoded URLs and creds into `src/config/env.ts`
  (typed, env-sourced, no committed secrets).
- **CI:** the legacy CI job is replaced by `.github/workflows/playwright.yml`.
  Run both suites in parallel during the cutover window, then delete the legacy
  job.

## 5. Verify and stabilize

- Full run green across all `projects` (chromium/firefox/webkit) at the
  parallelism CI uses.
- Zero hard waits, zero `any`, zero inline locators in specs (ESLint enforces).
- Each migrated test has Allure feature/story/severity labels.
- Coverage check: every P0/P1 row in the inventory has a passing spec or an
  explicit, reviewed skip-with-reason.

## 6. Retire the legacy suite

Only after the Playwright suite has run green in CI for the agreed cutover window:
delete the legacy tests, its runner config, and its CI job in a single clearly
labelled PR. Keep the inventory/mapping files as the migration record.

---

## Per-tool cheat sheet (concept mapping, not literal translation)

| Legacy concept                   | Playwright equivalent in this repo                      |
| -------------------------------- | ------------------------------------------------------- |
| Page Object (any tool)           | `src/pages/*.page.ts` extending `BasePage`              |
| Inline selectors in tests        | Move into a page object; never in `tests/`              |
| Explicit/implicit waits, `sleep` | Auto-waiting + web-first `expect` (no `waitForTimeout`) |
| `beforeEach` login               | Auth fixture + `storageState` (login once)              |
| Global setup / DB seed           | Fixture (`resetApp`) calling the reset endpoint         |
| Env via properties/JSON          | `src/config/env.ts`, typed, env-sourced                 |
| Custom reporter                  | `allure-playwright` + built-in HTML reporter            |

**Cypress** -> `cy.get(sel)` becomes a role/testid locator on a page object;
`cy.intercept` becomes `page.route`; `cy.visit` becomes `page.goto` via a page
object `goto()`; chained `.should('be.visible')` becomes
`await expect(locator).toBeVisible()`; custom commands become page-object methods
or fixtures. There is no implicit retry of arbitrary code -- rely on web-first
assertions.

**Selenium (Java/Python/C#/JS)** -> `WebDriverWait`/`ExpectedConditions`
disappear; use auto-waiting assertions. `By.xpath`/`By.cssSelector` become
`getByRole`/`getByTestId` verified against a live snapshot. PageFactory
`@FindBy` fields become `Locator` fields in the page-object constructor. One
WebDriver per thread becomes Playwright's built-in isolation per test.

**Protractor** -> `element(by.*)` becomes a `Locator`; `browser.get` becomes a
page-object `goto()`; Angular auto-sync is replaced by Playwright auto-waiting;
`protractor.ExpectedConditions` becomes web-first assertions.

**WebdriverIO** -> `$()/$$()` become `Locator`/`locator.all()`; `browser.url`
becomes `page.goto`; WDIO services/hooks become fixtures; `expect-webdriverio`
matchers become Playwright `expect` matchers.

**TestCafe / Puppeteer / Nightwatch** -> selectors become role/testid locators on
page objects; manual waits become auto-waiting assertions; test hooks become
fixtures; assertions become web-first `expect`.

## Definition of done (the migration acceptance gate)

A migrated feature is done when it satisfies `AGENTS.md` section 7 _and_:

- the corresponding inventory row is marked migrated (or skip-with-reason),
- no legacy artifact for that feature remains referenced by CI,
- the spec passes deterministically across 3 consecutive runs.

## Anti-patterns (do not do these during migration)

- Literal selector translation (porting an XPath chain verbatim into a CSS
  locator). Re-capture a stable selector instead.
- Porting `sleep`/explicit waits as `waitForTimeout`. They are a blocking review
  comment here.
- Copying per-test login. Use the auth fixture.
- Bulk-converting every file at once with no plan, no batches, and no green gate
  between them. That maximizes tokens and rework.
- Bumping retries to hide flakiness inherited from the legacy suite. Fix the root
  cause or skip with a reason.
