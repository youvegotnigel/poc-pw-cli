---
name: run-summary
description: Use when asked to summarize test results or a test run for humans. Triggers include "summarize the test run", "how did the suite do", "test results summary", "prepare a status update from the results", "what failed last night", or turning Allure or Playwright report output into a readable update for stakeholders or a standup.
---

# Test Run Summary

## Purpose

Turns raw run output (Playwright JSON results, `allure-results`, or a CI run) into a short, honest summary a non-engineer can read: pass rate, what broke, what is flaky, and whether the release signal is green.

## Workflow

### 1. Locate or produce machine-readable results

In preference order:

```bash
ls allure-results/ playwright-report/ test-results/           # existing local results
gh run download <run-id> --dir=./ci-artifacts                 # results from CI
npx playwright test --reporter=json > results.json            # fresh run if none exist and a run is acceptable
```

Never summarize from memory of earlier output; parse the actual result files. `allure-results/*.json` carries per-test status, severity labels, and retries; the Playwright JSON reporter carries status, duration, and error per test.

### 2. Compute the numbers

- Totals: passed / failed / skipped, and the pass rate
- New failures vs known ones (diff against the previous run or the skip/fixme list)
- Flakes: tests that failed then passed on retry, listed by name
- Slowest 5 tests and total wall time
- Skipped tests with their stated reasons (unexplained skips get called out; the skip-audit skill owns the deep dive)

### 3. Group failures by cause before reporting

Apply the same clustering as the ci-triage skill: one broken selector failing ten tests is one line item, not ten. If cause is unclear from the results, open the trace or drive the flow with the **playwright-cli skill** before writing the summary; do not label a failure "unknown" without having looked.

### 4. Write the summary

Template, adapt as needed:

```markdown
## Test run summary: <date, trigger, branch>

**Signal: GREEN / AMBER / RED** (one sentence why)

- 142/150 passed (94.7%), 5 failed, 3 skipped, run time 6m 12s
- Failures: 1 root cause. Inventory page renamed the sort control;
  breaks 5 sorting tests. Fix in progress, product behavior is correct.
- Flaky: checkout.spec.ts "declined card" passed on retry. Queued for flaky-triage.
- Skipped: 3, all with tickets (QA-118, QA-121).
- Slowest: checkout e2e at 41s.
```

Signal rules: RED if any `@critical` or `@smoke` test genuinely failed; AMBER for real failures outside critical paths or unresolved flakes; GREEN only when failures are zero or fully explained as test-code issues with fixes merged.

## Rules

- Report only what the result files show. No invented pass rates, no rounding a flake up to a pass.
- Name the flaky tests every time; silent flakes become permanent.
- Keep it under ~15 lines; detail lives in the report, the summary carries the signal.
