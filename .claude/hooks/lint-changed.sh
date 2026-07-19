#!/usr/bin/env bash
# PostToolUse: lint and type-check the file Claude just edited.
# Reads the hook JSON from stdin and acts only on TypeScript files.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty')

case "$file" in
  *.ts)
    if ! npx eslint --fix "$file"; then
      echo "ESLint failed on $file. Fix the reported issues." >&2
      exit 2
    fi
    if ! npx tsc --noEmit; then
      echo "Type check failed. Resolve the TypeScript errors." >&2
      exit 2
    fi
    ;;
esac
exit 0
