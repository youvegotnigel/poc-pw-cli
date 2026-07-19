---
name: pr-review
description: Use when asked to review a Playwright PR, review test automation changes, or review a diff containing .spec.ts, page object, or fixture files. Triggers include "review this Playwright PR", "check these tests before merge", "review changed .spec.ts files", "code review these Playwright/TypeScript tests", or "check this test code against our standards". Reviews Playwright + TypeScript changes against framework and industry best practices.
---

# Playwright PR Review

## Purpose

Reviews Playwright + TypeScript automation changes for correctness, maintainability, and reliability before merge. Output is an actionable review a lead would sign off on.

## How to run the review

1. Read the actual changed files or diff first (`git diff`, `gh pr diff`, or the files named by the user). Never review from assumptions or file names alone.
2. Walk the rubric below against each changed file.
3. Group findings by severity:
   - **Blocker**: must fix before merge
   - **Major**: should fix
   - **Minor / Nit**: optional polish, author's call
   Any item `docs/code-review.md` or AGENTS.md marks as blocking (hard waits, failed checklist items) is a Blocker here, regardless of how small it looks. Reserve Major for judgment calls those docs do not mandate.
4. For every finding: cite `file:line`, explain WHY it matters, and show a concrete suggested fix in TypeScript.
5. End with a verdict: **Approve**, **Approve with comments**, or **Request changes**, plus a one-line summary.

## Review rubric

Each item states the passing condition. "Flag" is the anti-pattern to call out.

### Page Object Model

- [ ] Locators encapsulated in page objects as `private readonly` fields. Flag: raw selectors, `page.locator()`, or `page.click()` in spec files.
- [ ] Assertions live in tests. Flag: `expect()` calls inside page object methods.
- [ ] Page methods are single-purpose and return a page object or data. Flag: `void` grab-bag methods that click, assert, and navigate in one call.
- [ ] Fixtures handle setup/teardown and shared context. Flag: copy-pasted `beforeEach` login or seeding logic across spec files.

### Locators

- [ ] `getByRole`, `getByLabel`, or `getByTestId` preferred. Flag: brittle CSS chains, XPath, `nth()`, or volatile text matches.
- [ ] Auto-waiting locators used as-is. Flag: manual element polling or existence checks in loops.
- [ ] Selectors survive DOM reordering. Flag: chained or index-based selectors like `.card >> nth=2`.
- [ ] Repo note: the app exposes `data-test` attributes, so `getByTestId` only works with `testIdAttribute: 'data-test'` set in `playwright.config.ts`. Flag: `getByTestId` usage without that config.

### Waits and timing

- [ ] No hardcoded waits anywhere. Flag: `page.waitForTimeout()`, `sleep`, `setTimeout` wrappers. Always a Blocker.
- [ ] Web-first assertions carry the waiting. Flag: manual `waitForSelector` before an interaction that auto-waits anyway.
- [ ] `waitFor` appears only with an explicit, genuinely needed condition. Flag: `waitFor` sprinkled defensively "just in case".

### Assertions

- [ ] At least one meaningful assertion per test. Flag: tests that only navigate and click.
- [ ] Web-first, auto-retrying `expect` on locators. Flag: `expect(await locator.isVisible()).toBe(true)`.
- [ ] Assertions verify the specific outcome. Flag: `toBeVisible()` on everything when `toHaveText`, `toHaveURL`, or `toHaveCount` would prove the behavior. Use `expect.soft` where multiple independent checks aid reporting.

### Test hygiene and structure

- [ ] Tests are independent and isolated. Flag: ordering dependencies, shared mutable state, one test consuming another's data.
- [ ] No `test.only` in the diff. Always a Blocker. No `test.skip` / `test.fixme` without a reason string.
- [ ] `describe` and `test` titles describe behavior. Flag: titles like "test 1" or "check page".
- [ ] Data-driven cases use parametrization or a clean data array feeding `test()`. Flag: hand-rolled `for` loops around assertions inside one test.
- [ ] `test.step` breaks up long tests so failures point at a step. Flag: 30-line tests with no structure.

### Tags and criticality

- [ ] Tests carry tags matching business criticality (e.g. `@smoke`, `@regression`, `@critical`). Flag: untagged tests or a checkout test missing `@critical`.
- [ ] Tags follow the team convention and are usable for CI `--grep` filtering. Flag: one-off tag spellings.

### Code quality and lint

- [ ] ESLint clean. Flag: `eslint-disable` without a justifying comment.
- [ ] Every promise awaited. Flag: floating promises, missing `await` on `expect` or page calls. Always a Blocker.
- [ ] Strict types. Flag: `any`, non-null `!` to silence the compiler. Prefer `unknown` plus narrowing for external data.
- [ ] DRY. Flag: copy-paste blocks, unnecessary `for` loops, over-complicated conditionals.
- [ ] No dead code, commented-out code, or leftover `console.log`.
- [ ] Readable naming, small functions, low nesting.

### CI and reliability

- [ ] Retries configured for CI only. Flag: retries enabled locally, or retries bumped to hide a flaky test.
- [ ] Trace, screenshot, and video captured on failure or on-first-retry. Flag: diagnostics turned off, or always-on video bloating CI.
- [ ] Tests are parallel-safe and deterministic across workers. Flag: shared accounts or files mutated by concurrent tests.
- [ ] Timeouts appropriate to the action. Flag: globally inflated timeouts masking flakiness.

### Troubleshootability

- [ ] Failures produce clear diagnostics: `test.step` names, meaningful assertion messages, useful error context.
- [ ] Reporting attachments (e.g. Allure labels, screenshots) present where the convention expects them. Flag: tests missing feature/story/severity labels.

### Secrets and data

- [ ] No hardcoded credentials, tokens, base URLs, or environment specifics. Use env/config resolution. Always a Blocker for secrets.
- [ ] No sensitive data written to logs, reports, or attachments.
- [ ] Test data set up and torn down deterministically. Prefer API/backend setup over UI setup for speed and isolation. Flag: tests seeding data through long UI flows.

## Good vs bad examples

**Hardcoded wait vs web-first assertion**

```ts
// Bad: hard sleep, flaky and slow
await page.waitForTimeout(3000);
expect(await page.locator('.toast').isVisible()).toBe(true);

// Good: auto-retrying, fails fast with a useful message
await expect(page.getByRole('alert')).toHaveText('Order placed');
```

**Raw selector in test vs POM**

```ts
// Bad: locator logic leaks into the spec
await page.locator('#inventory_container .btn_primary').nth(0).click();

// Good: spec reads as a flow, locator lives in the page object
await inventoryPage.addFirstItemToCart();
```

**Unawaited promise**

```ts
// Bad: assertion never awaited, test passes even when it fails
expect(page.getByTestId('cart-badge')).toHaveText('1');

// Good
await expect(page.getByTestId('cart-badge')).toHaveText('1');
```

**Hand-rolled loop vs parametrized tests**

```ts
// Bad: one test hides three cases, first failure masks the rest
test('sort options', async ({ inventoryPage }) => {
  for (const option of ['az', 'za', 'lohi']) {
    await inventoryPage.sortBy(option);
    // assertions...
  }
});

// Good: each case is its own test with its own result
for (const { option, expected } of sortCases) {
  test(`sorts inventory by ${option}`, async ({ inventoryPage }) => {
    await inventoryPage.sortBy(option);
    await expect(inventoryPage.itemNames).toHaveText(expected);
  });
}
```

## Reviewer mindset

Review as a lead accountable for the suite at scale, not a linter. Prioritize what keeps the suite maintainable a year from now and what you would defend in a design review. Flag Blockers plainly and insist on them; keep Minor items explicitly labeled optional so authors can triage without noise. When a pattern is wrong but widespread in the codebase, note it once and suggest a follow-up rather than repeating it per line.
