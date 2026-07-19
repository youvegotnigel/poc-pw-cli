---
name: migration-batch
description: Use when porting or migrating tests from a legacy E2E suite (Selenium, Cypress, Protractor, WebdriverIO, TestCafe) into this Playwright framework. Triggers include "migrate these tests", "port the login suite", "convert this Cypress spec", or any request to move legacy coverage into tests/. Runs exactly one migration batch with its green gate.
---

# Migrating a Legacy Batch

## Purpose

Ports one feature batch of legacy tests into this framework following `docs/migration.md`, with a green gate before the next batch. Bulk conversion without an inventory is forbidden by CLAUDE.md.

## Workflow

### 1. Preconditions, checked in order

- Read `docs/migration.md` in full; it is the authority on phases and definitions of done.
- An inventory of the legacy suite must exist (which tests, what they cover, priority). If it does not, stop and build the inventory first; do not port anything.
- Confirm with the user which single batch (one feature area) this run covers.

### 2. Map, do not transliterate

For each legacy test in the batch, extract the behavior it proves, not its implementation. Legacy waits, selectors, and helper chains do not carry over. Write or update the plan in `specs/` for the batch. When translating framework idioms (Cypress commands, Selenium waits) into Playwright equivalents, query the **Context7 MCP server** for both frameworks' current docs instead of guessing API mappings.

### 3. Verify every selector against the live app

Legacy selectors are the top source of bad ports. Use the **playwright-cli skill** to open the AUT, snapshot the pages the batch touches, and capture stable role/`data-test` locators via `playwright-cli generate-locator`. Never copy a selector out of the legacy suite unverified.

### 4. Port through the standard authoring loop

Generate page objects and specs per `docs/conventions.md`, exactly as the **new-test skill** does: POM, web-first assertions, fixtures, tags, Allure labels, strict types. Reuse existing page objects before creating new ones.

### 5. Green gate for the batch

```bash
npx playwright test tests/<batch-files> --repeat-each=3
npm run lint && npm run typecheck
```

All ported tests deterministic across 3 runs. Then update the inventory: mark each legacy test as ported (with its new spec path) or consciously dropped (with a reason). The batch is not done until the inventory reflects it.

### 6. Stop

One batch per run. Present the result for human review before starting the next batch.

## Rules

- No porting without an inventory; no second batch before the first is green and reviewed.
- A legacy test that fails against the current app is evidence, not an obstacle: report it, do not port a wrong expectation.
- Retire legacy tests only in the inventory at this stage; deleting the legacy suite is the final migration phase, not a batch step.
