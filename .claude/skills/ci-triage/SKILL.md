---
name: ci-triage
description: Use when the CI pipeline is red or a GitHub Actions run failed. Triggers include "CI failed", "the pipeline is red", "why did the workflow fail", "triage the nightly run", a failed playwright.yml run, or a PR blocked by checks. Groups CI failures by root cause and separates infra noise from real test and product failures.
---

# CI Failure Triage

## Purpose

Turns a red CI run into a short, grouped diagnosis: what failed, why, whether it is infra, test code, or the product, and what to do next. One root cause often fails many tests; triage groups them so nobody debugs the same cause fifteen times.

## Workflow

### 1. Pull the run data with the gh CLI

```bash
gh run list --workflow=playwright.yml --limit=5
gh run view <run-id> --log-failed
gh run download <run-id> --dir=./ci-artifacts   # playwright report, traces, allure-results
```

Read the failed logs and the downloaded report before concluding anything.

### 2. Group failures by root cause, not by test

Cluster the failed tests: same error message, same locator, same page, same first-failing step. Typical clusters:

| Cluster signature | Likely cause |
|---|---|
| Many tests fail on the same locator or page | One selector or app change broke a shared page object |
| Failures at setup/login across the board | Env, credentials, or the AUT was down |
| `npm ci`, browser install, or runner errors before tests ran | Infra, not tests |
| One test failed, passed on retry | Flake: hand off to the flaky-triage skill |
| New tests in this PR failed | Author's change: hand off to the test-debug skill |

### 3. Check reproducibility locally

For each real cluster, run one representative test locally (`npx playwright test <file> --trace on`). If it passes locally, compare env: CI is headless, uses `npm ci`, and may point at a different `BASE_URL`. Use the **playwright-cli skill** to check whether the AUT itself is currently up and behaving before blaming the tests.

### 4. Report the triage

Output a table: cluster, affected test count, classification (infra / test code / app bug / flake), evidence, and recommended owner or next skill. Lead with the single most likely root cause. Never report fifteen raw failures when three clusters explain them.

## Rules

- Do not rerun the workflow as a "fix"; a rerun is only for confirmed infra causes, and say so explicitly.
- Do not raise retries or timeouts to make CI green (AGENTS.md).
- Infra conclusions need evidence from the logs (runner errors, install failures), not absence of other ideas.
- For questions about workflow syntax or Playwright CI options (sharding, reporters, blob reports), query the **Context7 MCP server** for the current docs.
