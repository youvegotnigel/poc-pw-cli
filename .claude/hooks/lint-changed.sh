#!/usr/bin/env bash
# PostToolUse (Edit|Write): eslint --fix the TypeScript file Claude just edited.
# Whole-project type checking runs once per turn in typecheck-on-stop.sh instead
# of after every edit, so multi-file refactors aren't blocked mid-flight.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty')

case "$file" in
  *.ts|*.tsx)
    if ! npx eslint --fix "$file"; then
      echo "ESLint failed on $file. Fix the reported issues." >&2
      exit 2
    fi
    ;;
esac
exit 0
