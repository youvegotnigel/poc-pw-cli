#!/usr/bin/env bash
# PreToolUse (Bash): stop commits that still contain focused tests.
set -euo pipefail

cmd=$(jq -r '.tool_input.command // empty')

if echo "$cmd" | grep -qE 'git commit'; then
  if git diff --cached -U0 -- '*.spec.ts' '*.test.ts' \
       | grep -nE '(test|it|describe)\.only\(|\bfdescribe\(|\bfit\(' >/dev/null; then
    echo "Blocked: remove test.only / fdescribe / fit before committing." >&2
    exit 2
  fi
fi
exit 0
