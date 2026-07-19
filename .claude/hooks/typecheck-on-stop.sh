#!/usr/bin/env bash
# Stop: run the project type check once per turn, only when TypeScript files
# are modified. Exit 2 feeds the errors back to Claude to fix before stopping.
set -uo pipefail

input=$(cat)

# Guard against an infinite stop loop: if this hook already blocked once
# this turn, let Claude stop.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Nothing to check if no TypeScript files are modified.
if ! git status --porcelain 2>/dev/null | grep -qE '\.tsx?$'; then
  exit 0
fi

if ! out=$(npx tsc --noEmit 2>&1); then
  echo "Type check failed:" >&2
  echo "$out" | head -40 >&2
  exit 2
fi
exit 0
