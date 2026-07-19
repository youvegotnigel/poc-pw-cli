# POC-PW-CLI

[![Allure Report](https://img.shields.io/badge/Allure-Report-blue)](https://youvegotnigel.github.io/poc-pw-cli/)

An AI-native Playwright + TypeScript end-to-end test automation framework. It
pairs a conventional, review-friendly architecture (Page Object Model, fixtures,
strict TypeScript, Allure) with the Playwright AI authoring loop (planner,
generator, healer) driven by Claude Code or GitHub Copilot.

## The instruction-file layer (read this first)

AI agents only behave well when the repo tells them how it works. This repo uses
the converged 2026 pattern:

| File                              | Read by                                         | Purpose                                                                                                                     |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                       | Copilot, Codex, Cursor, Gemini, Aider, Windsurf | Single source of truth: stack, commands, architecture, conventions, boundaries                                              |
| `CLAUDE.md`                       | Claude Code                                     | Thin shim that imports `AGENTS.md` and adds Claude-specific guardrails (Claude Code does not read `AGENTS.md` natively yet) |
| `.github/copilot-instructions.md` | Copilot                                         | Copilot-specific behavior on top of `AGENTS.md`                                                                             |
| `docs/architecture.md`            | humans + agents                                 | How the layers fit and how the AI loop works                                                                                |
| `docs/conventions.md`             | humans + agents                                 | Exact code style with good/bad examples                                                                                     |
| `docs/migration.md`               | humans + agents                                 | Prioritized, token-efficient playbook to migrate a legacy suite here                                                        |
| `docs/code-review.md`             | humans + agents                                 | The pass/fail checklist every change clears before merge                                                                    |

One source of truth, edited by one person, kept short. Tool-specific files only
hold what is genuinely tool-specific.

## Quick start

```bash
npm ci
npx playwright install --with-deps

# install the Playwright CLI, then its skills for your agent
npm install -g @playwright/cli@latest
playwright-cli install --skills
# Claude Code can instead use the plugin:
#   /plugin marketplace add microsoft/playwright-cli
#   /plugin install playwright-cli

# generate the planner/generator/healer agents
npx playwright init-agents --loop=claude     # or --loop=vscode for Copilot, --loop=codex / --loop=opencode

npm test
npm run report
```

## The authoring loop

1. Ask the planner to explore the app and write a plan to `specs/`.
2. Review and edit the plan. (Cheapest place to fix scope.)
3. Ask the generator to turn the approved plan into specs + page-object methods.
4. Run the suite; let the healer repair locator/wait drift.
5. Review the diff like any PR. Agents accelerate authoring; humans own quality.

## Migrating a legacy suite

This skeleton doubles as the migration target for an existing E2E suite
(Selenium, Cypress, Protractor, WebdriverIO, TestCafe, ...). The procedure is
designed so an AI agent can prioritize the work and port it with minimal tokens:

1. **Inventory** the legacy tests into a backlog (`specs/_migration/inventory.md`).
2. **Map** legacy concepts to this repo's layers (`specs/_migration/mapping.md`).
3. **Port in feature batches** with planner -> generator -> healer, green-gated.
4. **Wire** auth/data/config/CI once, not per test.
5. **Verify**, then **retire** the legacy suite.

The full, prioritized playbook (with per-tool concept cheat sheets) is in
`docs/migration.md`. Self-review every PR against `docs/code-review.md`.

## Layout

See `AGENTS.md` section 4 and `docs/architecture.md`.


# Spectre PoC

A small Playwright + TypeScript proof of concept showing one clean pattern across four testing pillars: UI, API, accessibility, and security. It also ships the AI-assisted layer (CLAUDE.md, a review skill, a subagent, and hooks) so Claude Code enforces the same standards.

## Layout

```
spectre-poc/
├── playwright.config.ts        # one project per pillar (ui, api, a11y, security)
├── eslint.config.mjs           # flat config, typed rules, Playwright plugin
├── CLAUDE.md                   # conventions Claude Code always loads
├── src/
│   ├── pages/                  # BasePage, LoginPage, InventoryPage (POM)
│   ├── api/clients/            # UserApiClient (typed request wrapper)
│   ├── utils/                  # a11y (axe), security-headers
│   └── fixtures/               # custom fixtures: loginPage, inventoryPage, userApi
├── tests/
│   ├── ui/login.spec.ts        # POM + fixtures + web-first assertions
│   ├── api/users.spec.ts       # status + schema assertions
│   ├── a11y/login.a11y.spec.ts # axe-core WCAG scan
│   └── security/headers.spec.ts# baseline security header check
└── .claude/
    ├── settings.json           # permissions + hooks
    ├── skills/playwright-pr-review/SKILL.md
    ├── agents/flaky-investigator.md
    └── hooks/lint-changed.sh, block-test-only.sh
```

## Setup

```bash
npm install
npx playwright install
```

## Run

```bash
npm test                 # all pillars
npm run test:ui          # UI only
npm run test:api         # API only
npm run test:a11y        # accessibility only
npm run test:security    # security only
npm run test:smoke       # everything tagged @smoke
npm run report           # open the HTML report
```

## Targets and expected results

The PoC points at public demo endpoints so it runs with zero setup:

- UI, a11y, security: `https://www.saucedemo.com`
- API: `https://jsonplaceholder.typicode.com`

Override via `UI_BASE_URL` and `API_BASE_URL` (see `.env.example`).

Two results are intentional and instructive:

- The security header test is expected to report gaps against the demo site. That proves the check works. Point it at your own environment and the findings list should be empty.
- The a11y test only fails the build on critical or serious violations, so minor issues do not block. Adjust the threshold in `src/utils/a11y.ts`.

## Tags

Tests are tagged for CI filtering: `@smoke`, `@regression`, `@critical`, plus pillar tags `@api`, `@a11y`, `@security`. Filter with `--grep`, for example `npx playwright test --grep @critical`.

## Conventions

Page Object Model by default. Locators live in page objects as `private readonly`; assertions live in the tests. No hardcoded waits, web-first assertions only, ESLint clean, no `any`. See `CLAUDE.md` for the full list.
