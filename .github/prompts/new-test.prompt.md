---
mode: agent
description: Generate a new Playwright test the repo way — plan, verified selectors, POM spec, proven deterministic
---

Write a new Playwright test for: ${input:scenario:What flow or behavior should be covered?}

Follow the workflow in [.github/skills/new-test/SKILL.md](../skills/new-test/SKILL.md)
exactly. In particular:

1. Check `specs/` for an existing plan; write one and get it approved before any code.
2. Read `docs/architecture.md`, `docs/conventions.md`, and `docs/app-reference.md`
   (the verified selector table may already cover what you need).
3. Verify every new locator against a live snapshot with the playwright-cli skill —
   never invent a selector.
4. Page interactions go in `src/pages/` page objects; the spec in `tests/` holds
   flows and web-first assertions only.
5. Prove it: `npx playwright test <file> --repeat-each=3`, then
   `npm run lint && npm run typecheck`.
