---
name: pr-description
description: Use when asked to write, draft, or generate a pull request description, summarize the changes on a branch for a PR, or prepare text for a Bitbucket PR. Triggers include "write the PR description", "summarize this branch for the PR", "draft the Bitbucket description", "what should the PR say", or when creating a PR and a description is needed. Produces paste-ready Bitbucket markdown from the actual branch diff.
---

# PR Description

## Purpose

Writes a pull request description from the real changes on the current branch, formatted as Bitbucket-flavored markdown the author can paste straight into the PR description field.

## How to build the description

1. Establish the facts from git. Never describe changes from memory or conversation alone:
   - `git log --oneline <base>..HEAD` for the commit trail (base is usually `master`)
   - `git diff --stat <base>...HEAD` for the shape of the change
   - `git diff <base>...HEAD` and read the actual hunks for anything non-obvious
2. Classify the change: new tests, page objects, fixtures, config/CI, migration batch, refactor, or a mix. Group the description by those buckets, not by file order.
3. Extract the ticket key if the branch name contains one (e.g. `feature/QA-123-checkout-smoke`). Put it in the title line; Bitbucket auto-links Jira keys.
4. State verification honestly. Only claim `lint`, `typecheck`, or test runs that were actually executed in this session, with their real results. If something was not run, list it as unchecked.
5. Output the final description inside one fenced markdown block so it can be copied in a single click. Everything else (questions, caveats) goes outside the block.

## Description template

```markdown
## QA-123: Short imperative summary of the change

### What changed

- New specs: `tests/checkout.spec.ts` covering happy path and declined card
- Page objects: `CheckoutPage` added, `CartPage.checkout()` extracted
- Fixtures: auth storageState fixture wired into `test-fixtures.ts`
- Config/CI: (only if touched, and why)

### Why

One or two sentences of intent: the plan in `specs/checkout.md`, the migration
batch, or the bug being covered.

### How it was verified

- [x] `npm run lint` clean
- [x] `npm run typecheck` clean
- [x] `npx playwright test tests/checkout.spec.ts` passing, 3 consecutive runs
- [ ] Allure labels (feature/story/severity) set

### Notes for the reviewer

- Anything intentionally out of scope, follow-ups, or review-order hints
  (e.g. page objects and specs are in separate commits, review pages first)
```

Adapt sections to the change: drop empty buckets, keep the order. A one-file fix needs only a summary line, What changed, and How it was verified.

## Rules

- Ground every claim in the diff. If a file is not in `git diff --stat`, it does not appear in the description.
- Lead with behavior, not files: "Covers checkout with a declined card" beats "Added checkout.spec.ts".
- Flag anything AGENTS.md treats as review-sensitive so reviewers see it immediately: changes to `playwright.config.ts` projects/timeouts, new dependencies (with the required justification), or edits under `agents/`.
- Keep it scannable: bullets over paragraphs, no restating the diff line by line, no filler like "This PR aims to".
- Bitbucket markdown: standard headings, bullets, fenced code, and `- [ ]` checklists all render. Avoid GitHub-only syntax such as `<details>` collapsibles or issue `#` references.
- Never invent verification results. An unchecked box is correct; a falsely checked one is not.
- Do not include secrets, credentials, or internal URLs in the description.

## Example

Branch `feature/QA-311-inventory-sort` with two commits touching `src/pages/InventoryPage.ts` and `tests/inventory-sort.spec.ts`:

```markdown
## QA-311: Cover inventory sorting end to end

### What changed

- New spec `tests/inventory-sort.spec.ts`: one test per sort option (name A-Z,
  Z-A, price low-high), parametrized from a data array, tagged `@regression`
- `InventoryPage`: added `sortBy()` and an `itemNames` locator; no changes to
  existing methods

### Why

Implements the plan in `specs/inventory-sort.md`. Sorting had no coverage and
regressed twice in the legacy suite.

### How it was verified

- [x] `npm run lint` and `npm run typecheck` clean
- [x] `npx playwright test tests/inventory-sort.spec.ts` passing, 3 consecutive runs
- [x] Allure feature/story/severity labels set

### Notes for the reviewer

- Page object and spec are separate commits; review the page object first.
```
