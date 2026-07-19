---
mode: agent
description: Draft a paste-ready PR description from the actual branch diff
---

Write the PR description for the current branch.

Follow [.github/skills/pr-description/SKILL.md](../skills/pr-description/SKILL.md):
derive content from the real diff (`git diff <base>...HEAD`), never from memory;
state what changed, why, and how it was verified; flag anything
`docs/code-review.md` would question.
