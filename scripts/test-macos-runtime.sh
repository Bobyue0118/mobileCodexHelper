#!/usr/bin/env bash
set -euo pipefail

scripts=(
  "scripts/lib-mobile-codex.sh"
  "scripts/apply-upstream-overrides.sh"
  "scripts/check-mobile-codex-runtime.sh"
)

for script in "${scripts[@]}"; do
  [[ -f "$script" ]] || {
    echo "Missing required macOS script: $script" >&2
    exit 1
  }
  bash -n "$script"
done

echo "macOS runtime foundation scripts look valid"
