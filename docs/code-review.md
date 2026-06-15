# Code review checklist

The gate every change passes before it is proposed for merge. AI agents run this
as a **self-review** before opening a PR; humans use the same list to review.
It restates `AGENTS.md` as pass/fail checks so nothing is left to interpretation.

A failing item is a blocking comment, not a nit. Fix it, do not wave it through.

## Architecture (POM boundary)

- [ ] Specs in `tests/` contain flows only: no raw locators, no `page.click`,
      no waits, no business logic.
- [ ] All locators and interactions live in a `src/pages/*.page.ts` page object
      extending `BasePage`.
- [ ] New repeated setup is a fixture in `src/fixtures/`, not copy-paste across
      specs.
- [ ] Page objects expose state for the spec to assert; they do not assert
      business outcomes themselves.

## Selectors

- [ ] Role-based or `getByTestId` locators, in that order of preference. Label or
      text only when those do not fit.
- [ ] No brittle CSS descendant chains, no XPath.
- [ ] Every selector was verified against a live snapshot (Playwright CLI), not
      invented or translated verbatim from a legacy test.

## Assertions and waiting

- [ ] Web-first, auto-retrying assertions only
      (`await expect(locator).toBeVisible()`).
- [ ] No `expect(await locator.isVisible()).toBe(true)`.
- [ ] No `waitForTimeout` / hard sleeps. Auto-waiting and assertions only.

## Types and lint

- [ ] `npm run lint` passes with zero warnings.
- [ ] `npm run typecheck` passes.
- [ ] `npm run format:check` passes.
- [ ] No `any`, no non-null `!` to silence the compiler. External data is
      `unknown` and narrowed.
- [ ] No inline ESLint disables added to make code pass.

## Auth, data, config

- [ ] Auth reuses `storageState` via the fixture; no per-test UI login.
- [ ] App reset / seed runs in a fixture (`resetApp`), not inside a test.
- [ ] No hardcoded URLs or credentials; values come through `src/config/env.ts`.
- [ ] No secrets, `.env`, `storageState.json`, or `auth/` artifacts committed.

## Determinism and reporting

- [ ] Test passes across 3 consecutive local runs.
- [ ] Flakiness is fixed at the root cause, not hidden by bumping `retries`.
- [ ] Allure `feature` / `story` / `severity` labels are set.

## Process

- [ ] A reviewed plan exists in `specs/` for any new test (planner output).
- [ ] `agents/` was not hand-edited (regenerate via `init-agents`).
- [ ] `playwright.config.ts` projects/timeouts were not changed without flagging
      it in the PR description.
- [ ] New dependencies are justified in the PR description.
- [ ] Page objects and specs are in separate commits where practical.

> Tip: in Claude Code, `/code-review` runs an automated pass over the current
> diff against these same conventions. It complements this checklist; it does not
> replace the human review.
