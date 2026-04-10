#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

workspace="$(workspace_dir)"
source_root="$workspace/upstream-overrides/claudecodeui-1.25.2"
target_root="$(resolve_upstream_dir)"

require_path "$source_root" "Override source not found"
require_path "$target_root" "Upstream checkout not found"

copied=0
while IFS= read -r source_file; do
  relative_path="${source_file#$source_root/}"
  destination="$target_root/$relative_path"
  mkdir -p "$(dirname "$destination")"
  cp "$source_file" "$destination"
  copied=$((copied + 1))
done < <(find "$source_root" -type f | sort)

echo "Applied $copied override files to $target_root"
