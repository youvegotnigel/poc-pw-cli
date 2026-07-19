---
applyTo: "tests/**/*.ts"
---

Rules for spec files (mirrors the Claude Code hooks and AGENTS.md §5):

- Specs contain flows and web-first assertions only. No raw locators, no
  `page.click`/`page.locator` chains, no logic. Call page-object methods; if an
  interaction is missing, add a method to the page object in `src/pages/`.
- Never leave a focused or silently skipped test: `test.only`, `describe.only`,
  `fit`, `fdescribe` must not survive into a commit. A `test.skip` needs a
  reason string.
- Web-first assertions only (`await expect(locator).toBeVisible()`), never
  `expect(await locator.isVisible()).toBe(true)`. No `waitForTimeout` or hard
  sleeps.
- Tests needing an authenticated session use the `authedPage`-derived fixtures
  from `src/fixtures/test-fixtures.ts`. Browser projects load `storageState` at
  the project level, so a test that must start logged out overrides it with
  `test.use({ storageState: { cookies: [], origins: [] } })`.
- Every test carries Allure feature/story/severity labels and a criticality tag
  (`@smoke`, `@regression`, `@critical`).
- Selectors come from `docs/app-reference.md` or a fresh playwright-cli
  snapshot — never from memory.
