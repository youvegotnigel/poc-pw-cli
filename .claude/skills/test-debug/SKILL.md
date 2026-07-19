---
name: test-debug
description: Use when a Playwright test is failing and needs to be debugged or fixed. Triggers include "this test is failing", "debug this test", "why is checkout.spec.ts red", a pasted stack trace or failed run output, locator not found errors, strict mode violations, or timeout errors. Finds the root cause before changing any code.
---

# Debugging Failed Playwright Tests

## Purpose

Diagnoses a failing test to its root cause, then fixes the cause, not the symptom. Guessing at fixes is not allowed; every fix must be backed by evidence.

## Workflow

### 1. Reproduce

Run exactly the failing test, headless, with tracing:

```bash
npx playwright test tests/<file>.spec.ts --trace on
```

Read the full output: error message, expected vs received, the call log, and attachment paths. Do not skim.

### 2. Gather evidence before forming a hypothesis

- Read the artifacts under `test-results/` for the failed test: `error-context.md`, screenshots, and the trace.
- Inspect the live app with the **playwright-cli skill**. Open the same page the test was on, take a `playwright-cli snapshot`, and compare what the test expects against what actually exists. Use `playwright-cli generate-locator <ref>` to get a correct, stable locator for the real element. Never guess a selector from memory.
- Check what changed recently: `git log -p -3 -- <spec> <page-object>`.
- If the failure involves a network call, use `playwright-cli requests` on the live app to see what the endpoint really returns.

### 3. Classify the failure

| Evidence | Class |
|---|---|
| Locator resolves to 0 elements, or strict mode violation | Broken or ambiguous locator |
| Element exists but assertion times out | Timing or wrong condition |
| Passes alone, fails in the full suite | Isolation problem: use the flaky-triage skill instead |
| Assertion compares against wrong value or account | Test data or environment config |
| The app itself misbehaves when driven manually via playwright-cli | Genuine app bug |

### 4. Fix by class

- **Broken locator**: replace with a locator verified against the live snapshot. Prefer `getByRole` or `data-test` attributes. The fix belongs in the page object, never inline in the spec.
- **Timing**: assert the actual condition with a web-first assertion (`await expect(locator).toHaveText(...)`). Never add `waitForTimeout` or inflate timeouts.
- **Test data / env**: route values through `resolveEnv()` in `src/config/env.ts`. No hardcoded credentials or URLs.
- **App bug**: do NOT bend the test to pass. Mark it `test.fixme('<reason and evidence>')` and report the bug to the user with reproduction steps.

### 5. Verify the fix

```bash
npx playwright test tests/<file>.spec.ts --repeat-each=3
npm run lint && npm run typecheck
```

All three runs must pass before claiming the test is fixed.

## Rules

- Never bump retries, inflate timeouts, or add sleeps to get green (AGENTS.md). These hide the bug for the next person.
- Never weaken an assertion just to make it pass.
- When unsure how a Playwright API or matcher actually behaves, query the **Context7 MCP server** (resolve the `playwright` library id, then query the docs) instead of answering from memory.
- Repo specifics: login is at the site root `/`, not `/login`; a successful login lands on `/inventory.html`; `getByTestId` only works with `testIdAttribute: 'data-test'` configured; there is no server-side reset endpoint, reset state via the app menu or by clearing storage in a fixture.

## Red flags that mean you are guessing

- Editing a selector without having taken a live snapshot
- Adding a wait "to see if it helps"
- Rerunning unchanged code hoping for a different result
- Fixing the spec when the defect is in the page object (or the app)
