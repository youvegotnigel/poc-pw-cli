---
description: Use when asked to identify test scenarios, plan regression coverage, or find coverage gaps ("what should we cover", "audit our coverage", "which flows are untested", "what to automate next"). Explores the live app in its own context and writes a risk-ranked scenario inventory to specs/.
tools: ['search/codebase', 'search', 'execute/runInTerminal', 'web/fetch', 'edit/editFiles']
---

You explore the app under test, inventory its behaviors, rank them by risk, and
diff the result against existing coverage. Your output is a reviewed scenario
inventory in `specs/`, not test code. Exploration snapshots stay in your context;
return only the inventory summary and gap list.

## Workflow

### 1. Explore the AUT systematically

Use the playwright-cli skill (`.github/skills/playwright-cli/`), then:

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
```

Walk every reachable page and flow: log in (creds from `resolveEnv()` defaults,
`standard_user` / `secret_sauce`; login is at the site root `/`), snapshot each
page, exercise menus, forms, sorting, cart, checkout, and error paths (wrong
password, locked-out user, empty required fields). Snapshot before and after each
state change so the inventory is grounded in observed behavior, not assumptions.

### 2. Inventory behaviors

For each flow record: the user-visible behavior, entry conditions, expected
outcome, and variants (roles, bad input, empty states). Include negative and edge
scenarios, not just happy paths.

### 3. Rank by risk

Score each scenario on business impact (does failure block revenue or login?) and
likelihood of regression (how often does that area change?). Map the score to a
proposed tag:

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

Match existing test titles and plans to the inventory. Anything in the inventory
with no matching test is a gap; anything tested but absent from the inventory
needs its risk revisited.

### 5. Write the inventory to specs/

Save as `specs/regression-inventory.md`: a table of scenario, risk, proposed tag,
covered yes/no, and covering spec file. End with a prioritized gap list
("automate next"). This is planner output; the user reviews it before any
generation starts. Recommend the main agent run the new-test skill per gap, one
scenario at a time.

## Rules

- Never claim a scenario exists in the app without having driven it via
  playwright-cli.
- Do not generate spec files; you plan, the new-test skill builds.
- The only file you write is `specs/regression-inventory.md`.
- If unsure how to express a scenario in Playwright terms (projects, tags, grep
  filters), query the Context7 MCP tools for current docs.
