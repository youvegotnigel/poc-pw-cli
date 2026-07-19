---
name: flaky-triage
description: Use when a Playwright test passes sometimes and fails sometimes. Triggers include "flaky", "intermittent", "fails randomly", "passes locally but fails in CI", "fails only when run in parallel", or a test that needed a retry to go green. Finds the nondeterminism instead of hiding it with retries or timeouts.
---

# Flaky Test Triage

## Purpose

Turns "it fails sometimes" into a named root cause and a deterministic fix. Retries, bigger timeouts, and sleeps are banned fixes in this repo (AGENTS.md); this skill exists so they are never needed.

## Workflow

### 1. Confirm and measure the flake

```bash
# serial: does it flake in isolation?
npx playwright test tests/<file>.spec.ts --repeat-each=10 --workers=1 --trace on

# parallel: does it only flake alongside other tests?
npx playwright test --workers=4 --trace on
```

The two runs split the search space: serial flake means the test or app is racy; parallel-only flake means shared state between tests.

### 2. Compare passing and failing evidence

- Open traces from one green and one red run of the same test and diff what the page looked like at the failing step.
- Reproduce the step manually with the **playwright-cli skill**: drive the same flow, watch `playwright-cli requests` and `playwright-cli console` for slow or failing calls, and use `playwright-cli route` to simulate the slow network response you suspect.

### 3. Classify the root cause

| Symptom | Root cause |
|---|---|
| Fails at the same step with element not ready | Race: assertion checks the wrong condition, or app renders asynchronously |
| Parallel-only failure | Shared account, shared cart/data, or file written by two workers |
| Fails only after another specific test | Ordering dependency, leaked state (no reset endpoint exists; state must be reset via the app menu or storage clearing in a fixture) |
| Fails only in CI | Slower machine exposing a real race, or env config difference |
| Animation or transition mid-assertion | Asserting during movement instead of the settled state |

### 4. Fix the cause

- Races: assert the condition the user actually waits for (web-first `expect` on text, URL, or count), not element presence.
- Shared state: give each test its own data or worker-scoped fixture; make tests order-independent.
- CI-only: fix the race the slow machine exposed; the speed difference is the messenger, not the problem.
- If the nondeterminism is in the app itself, report it as an app bug with trace evidence; do not paper over it.
- For fixture scoping or parallelism API questions, query the **Context7 MCP server** for current Playwright docs.

### 5. Prove determinism

```bash
npx playwright test tests/<file>.spec.ts --repeat-each=10
npx playwright test --workers=4
```

Ten consecutive green runs plus a green parallel suite before calling it fixed.

## Banned fixes

- Raising `retries` for this test or globally
- Raising timeouts to outlast the race
- `waitForTimeout`, sleeps, or arbitrary `waitFor` conditions
- Reordering tests so the failure hides
- `test.skip` without a reason and a ticket
