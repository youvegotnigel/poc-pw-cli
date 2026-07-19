---
mode: agent
description: Debug a failing Playwright test using this repo's evidence-first procedure
---

Debug this failing test: ${input:failure:Paste the failing test name or run output}

Follow the procedure in [.github/skills/test-debug/SKILL.md](../skills/test-debug/SKILL.md)
exactly: reproduce the failure locally with a trace, read the trace/error context
before theorizing, verify the current selector against a live snapshot
(playwright-cli skill), fix the root cause — never bump retries, add a hard wait,
or patch blind. Finish by proving the fix with 3 consecutive green runs plus
`npm run lint && npm run typecheck`.
