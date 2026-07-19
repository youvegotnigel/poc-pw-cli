---
mode: agent
description: Port one batch of legacy E2E tests into this Playwright framework, green-gated
---

Migrate this batch of legacy tests: ${input:batch:Which legacy suite/feature batch?}

Follow [.github/skills/migration-batch/SKILL.md](../skills/migration-batch/SKILL.md)
and `docs/migration.md` exactly: inventory and mapping must exist before porting;
port one feature batch at a time; re-capture selectors from the live app instead
of translating legacy CSS/XPath; each batch ends with lint, typecheck, and the
ported tests green before the next batch starts.
