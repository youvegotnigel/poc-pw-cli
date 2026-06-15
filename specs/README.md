# specs/ (human-readable test plans)

The planner agent writes Markdown test plans here, one per feature, e.g.
`checkout-plan.md`. A plan contains scenarios, preconditions, steps, expected
outcomes, and success/failure criteria.

Workflow:

1. Planner explores the live app and drafts a plan here.
2. A human reviews and edits the plan. This is the cheapest place to fix scope.
3. The generator reads the approved plan and produces specs under `tests/`.

Plans are version-controlled on purpose: they are the spec of record for what the
suite covers, and they make coverage reviewable by non-engineers.
