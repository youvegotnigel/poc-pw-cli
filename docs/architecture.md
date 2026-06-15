# Architecture

This document is written for both humans and AI agents. Agents must read it
before authoring or modifying tests. It explains how the framework is layered
and how the AI authoring loop fits on top.

## Layers

```
tests/ (flows)
   |  calls methods on
src/pages/ (page objects)  <-- all locators + interactions live here
   |  receives
src/fixtures/ (auth, page objects, test data, app reset)
   |  reads
src/config/ (typed env resolution)
```

The rule that keeps this maintainable at scale: **locators live in exactly one
place**, the page object. A selector change touches one file, not fifty specs.
That is the single most important thing to defend in a design review, and the
first thing to teach a junior joining the team.

## Page objects

- One class per page or significant component, extending `BasePage`.
- Constructor takes the Playwright `page`. Locators are private readonly fields.
- Methods are intention-revealing actions (`login(user)`, `addToCart(sku)`),
  not thin wrappers around a single click.
- Page objects do not contain assertions about business outcomes; they expose
  state for the spec to assert on. (Self-check assertions about element presence
  inside an action are fine.)

## Fixtures

Custom fixtures (Playwright's dependency injection) provide:

- `loginPage`, `productPage`, etc., already constructed with `page`.
- `authedPage`, a page with `storageState` already applied so tests skip UI login.
- `resetApp`, which calls the app reset endpoint to restore a known seed.

Fixtures are the right place for setup that would otherwise be copy-pasted across
tests. If you find setup repeated in three specs, it belongs in a fixture.

## The AI authoring loop

Playwright Test Agents are initialized with:

```bash
npx playwright init-agents --loop=claude     # or --loop=vscode for Copilot
```

This writes three agent definitions under `agents/`:

1. **Planner** opens the live app, explores it, and writes a human-readable plan
   to `specs/<feature>-plan.md`: scenarios, preconditions, steps, expected
   outcomes, success and failure criteria. A human reviews and edits the plan.
2. **Generator** reads the approved plan and produces spec files plus any new
   page-object methods. It verifies selectors live against the running app as it
   writes them, so locators are real, not guessed.
3. **Healer** runs failing tests, finds substitute selectors when elements moved,
   adjusts waits, and either repairs the test or skips it with a reason if the
   underlying functionality is genuinely broken.

The agents use Playwright MCP tools under the hood. They are interactive tools
for authoring; the tests they emit are plain Playwright tests that CI runs the
normal way. **Humans review every plan, spec, and heal before merge.** The agents
accelerate authoring; they do not own quality.

## Where the CLI and Skills fit

- **Playwright CLI** (`playwright-cli`) drives a real browser from the terminal
  using accessibility snapshots with stable refs. Agents (and you, manually) use
  it to inspect the app and confirm selectors before writing code.
- **Skills** are the `SKILL.md` files under `.claude/skills/playwright-cli/` that
  teach the agent how to use the CLI well. The agent reads the skill once and
  internalizes the command vocabulary, so it stops guessing flags.
