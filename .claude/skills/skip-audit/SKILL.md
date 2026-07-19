---
name: skip-audit
description: Use when asked to audit skipped, disabled, or quarantined tests, or periodically during suite maintenance. Triggers include "what tests are skipped", "audit the skips", "can we re-enable anything", "clean up fixme tests", or reviewing test debt. Finds every skip, checks whether its reason still holds, and recommends re-enable, keep, or delete.
---

# Skipped Test Audit

## Purpose

Skipped tests are where coverage quietly dies. This audit inventories every disabled test, verifies each stated reason against the current app, and produces a re-enable / keep / delete recommendation per test.

## Workflow

### 1. Find every disabled or suppressed test

```bash
grep -rn "test\.skip\|test\.fixme\|test\.only\|describe\.skip\|describe\.only" tests/ src/
grep -rn "eslint-disable" tests/ src/
```

`test.only` anywhere is an immediate finding on its own (it silently disables the rest of the suite). Also check `playwright.config.ts` for `grepInvert` or project filters that exclude tests from CI.

### 2. Assess each skip

For every hit record: file:line, skip type, stated reason (or "none"), ticket reference (or "none"), and git age (`git log -1 --format=%as -L<line>,<line>:<file>` or blame). A skip with no reason string is automatically a finding.

### 3. Verify whether the reason still holds

- If the reason was an app bug: drive the flow manually with the **playwright-cli skill** against the live app and check whether the bug still reproduces.
- If the reason was a flaky or broken test: run it (`npx playwright test <file> -g "<title>" --repeat-each=3`) and see what actually happens now.
- If the reason references a ticket, ask the user for its status rather than assuming.

### 4. Recommend per test

| Finding | Recommendation |
|---|---|
| Underlying bug fixed, test passes 3x | Re-enable, remove skip in this PR |
| Bug still reproduces | Keep, ensure reason string and ticket are present |
| Test obsolete (feature removed, duplicate coverage) | Delete the test, note it in the coverage inventory |
| Skip with no reason and nobody remembers why | Run it; passing means re-enable, failing means hand to the test-debug skill |
| `test.only` or `describe.only` | Remove immediately, always |

### 5. Report

Output a table sorted by criticality tag (`@critical` skips first), with the recommendation and evidence for each. Offer to apply the safe changes (re-enables that passed 3x, `.only` removals) as a single PR; deletions need explicit user confirmation.

## Rules

- Never re-enable a test without proving it passes 3 consecutive runs first.
- Never delete a test without user confirmation, even when it looks obsolete.
- A skip you add during this audit needs a reason string and a ticket, same as any other.
