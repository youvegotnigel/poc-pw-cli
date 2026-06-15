# GitHub Copilot instructions

Copilot reads `AGENTS.md` natively and also reads this file. Treat `AGENTS.md`
in the repo root as the source of truth for stack, commands, architecture, and
conventions. This file only adds Copilot-specific guidance.

## Behavior

- Prefer completions that match the Page Object Model already present in
  `src/pages/`. When completing a spec, call existing page-object methods rather
  than generating raw `page.locator(...)` chains.
- For new page interactions, suggest a method on the relevant page object class,
  not inline locators in the spec.
- Use web-first assertions (`await expect(...)`). Do not suggest
  `expect(await ...).toBe(true)` patterns or `waitForTimeout`.
- Respect strict TypeScript. Do not suggest `any` or non-null assertions to clear
  type errors.
- When migrating a legacy suite, follow `docs/migration.md` in order: build the
  inventory and mapping first, port one feature at a time, and re-capture stable
  selectors from the live app rather than translating legacy CSS/XPath verbatim.
- Before a change is complete, check it against `docs/code-review.md`.

## Scoped instructions (optional)

You can add path-scoped rules under `.github/instructions/*.instructions.md`
with frontmatter, for example:

```
---
applyTo: "tests/**/*.spec.ts"
---
Specs contain flows only. No locators, no waits, no logic. Call page objects.
```

Keep these scoped files small and non-duplicative with AGENTS.md.
