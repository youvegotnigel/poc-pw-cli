---
name: test-docs
description: Use when asked to document a test, feature coverage, page object, fixture, or reusable component, or to update docs/ after framework changes. Triggers include "document this page object", "write docs for the auth fixture", "explain what this suite covers", "update the architecture doc", or when a new reusable component lands without documentation.
---

# Documenting Tests and Components

## Purpose

Keeps documentation thin, accurate, and in the right place. Docs describe what code cannot say for itself: intent, constraints, and tribal knowledge. Anything derivable from reading the code stays out.

## Where documentation belongs

| What changed | Where to document it |
|---|---|
| New page object or fixture | JSDoc on the class and public methods; a one-line entry in `docs/architecture.md` if it introduces a new pattern |
| New convention or deviation from one | `docs/conventions.md` |
| Framework structure or authoring-loop change | `docs/architecture.md` |
| What a feature's tests cover and why | The plan in `specs/<feature>.md`, kept current, plus Allure feature/story labels on the tests |
| Tribal knowledge (env quirks, app oddities) | The tribal knowledge section in `CLAUDE.md`, and mirror durable rules into `AGENTS.md` |

Do not create new standalone doc files per test or per component; they go stale immediately. Well-named tests, `test.step` names, and Allure labels are the primary documentation of behavior.

## Workflow

1. Read the code being documented in full, plus the docs file it will land in. Never document from the diff summary alone.
2. If behavior is unclear, verify it against the live app with the **playwright-cli skill** before writing a word; docs must describe observed behavior, not assumed behavior.
3. Write the minimum: what it is for, when to use it, constraints and gotchas, one usage example if the call site is non-obvious. For JSDoc, document the WHY and the contract, not a restatement of the method name.
4. Update, do not append: if the docs already describe the old behavior, rewrite that section instead of adding a contradicting paragraph below it.
5. Check cross-references: does `CLAUDE.md` tribal knowledge, `AGENTS.md`, or a `specs/` plan now contradict what you wrote? Fix those in the same change. Stale instructions are worse than none.

## Style rules

- Match the existing voice and format of the target doc file.
- Concrete over abstract: name real files, commands, and selectors.
- No filler sections ("Overview", "Conclusion") for a three-line component.
- For JSDoc syntax or TypeScript doc tooling questions, check current docs via the **Context7 MCP server**.

## Example JSDoc for a page object method

```ts
/**
 * Sorts inventory via the sort dropdown. Waits for the list to re-render
 * by asserting on the first item, so callers do not need their own wait.
 * @param option - a value from SortOption; the app reloads the list async
 */
async sortBy(option: SortOption): Promise<void> {
```
