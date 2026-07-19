---
name: regression-scenarios
description: Use when asked to identify test scenarios, plan regression coverage, or find coverage gaps in the app under test. Triggers include "what should we cover", "identify regression scenarios", "build a regression suite", "audit our coverage", "which flows are untested", or planning what to automate next. Produces a risk-ranked scenario inventory mapped against existing tests.
---

# Identifying Regression Scenarios

## Purpose

Explores the app under test, inventories its behaviors, ranks them by risk, and diffs the result against existing coverage. Output is a reviewed scenario inventory in `specs/`, not test code.

## Workflow

### 1. Explore the AUT systematically with the playwright-cli skill

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
```

Walk every reachable page and flow: log in (creds from `resolveEnv()` defaults), snapshot each page, exercise menus, forms, sorting, cart, checkout, and error paths (wrong password, locked-out user, empty required fields). Snapshot before and after each state change so the inventory is grounded in observed behavior, not assumptions.

### 2. Inventory behaviors

For each flow record: the user-visible behavior, entry conditions, expected outcome, and variants (roles, bad input, empty states). Include negative and edge scenarios, not just happy paths.

### 3. Rank by risk

Score each scenario on business impact (does failure block revenue or login?) and likelihood of regression (how often does that area change?). Map the score to a proposed tag:

| Risk | Tag |
|---|---|
| Blocks core journey (login, checkout, payment) | `@critical` and `@smoke` |
| Core feature, high traffic | `@regression` |
| Edge case, cosmetic, rare path | `@regression` low severity, or explicitly deferred |

### 4. Diff against existing coverage

List what already exists before proposing anything new:

```bash
grep -rn "test(" tests/ --include="*.spec.ts"
ls specs/
```

Match existing test titles and plans to the inventory. Anything in the inventory with no matching test is a gap; anything tested but absent from the inventory needs its risk revisited.

### 5. Write the inventory to specs/

Save as `specs/regression-inventory.md`: a table of scenario, risk, proposed tag, covered yes/no, and covering spec file. End with a prioritized gap list ("automate next"). This is planner output; the user reviews it before any generation starts. To automate a gap, hand off to the **new-test skill** one scenario at a time.

## Rules

- Never claim a scenario exists in the app without having driven it via playwright-cli.
- Do not generate spec files from this skill; it plans, the new-test skill builds.
- Keep the inventory in git so coverage discussions have a single source of truth.
- If unsure how to express a scenario in Playwright terms (projects, tags, grep filters), check current docs via the **Context7 MCP server**.
