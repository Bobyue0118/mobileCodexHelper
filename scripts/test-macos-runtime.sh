#!/usr/bin/env bash
set -euo pipefail

scripts=(
  "scripts/lib-mobile-codex.sh"
  "scripts/apply-upstream-overrides.sh"
  "scripts/check-mobile-codex-runtime.sh"
  "scripts/start-mobile-codex.sh"
  "scripts/stop-mobile-codex.sh"
  "scripts/start-mobile-codex-stack.sh"
  "scripts/stop-mobile-codex-stack.sh"
  "scripts/enable-mobile-codex-remote.sh"
  "scripts/install-mobile-codex-launchd.sh"
  "scripts/uninstall-mobile-codex-launchd.sh"
)

for script in "${scripts[@]}"; do
  [[ -f "$script" ]] || {
    echo "Missing required macOS script: $script" >&2
    exit 1
  }
  bash -n "$script"
done

repo_root="$(pwd)"
path_report="$(bash -lc "cd /tmp && source \"$repo_root/scripts/lib-mobile-codex.sh\" && printf 'workspace=%s\nruntime=%s\ndatabase=%s\n' \"\$(workspace_dir)\" \"\$(runtime_dir)\" \"\$(database_path)\"")"

[[ "$path_report" == *"workspace=$repo_root"* ]] || {
  echo "workspace_dir did not stay anchored to the repo root" >&2
  exit 1
}

[[ "$path_report" == *"runtime=$repo_root/.runtime"* ]] || {
  echo "runtime_dir did not resolve under the repo root" >&2
  exit 1
}

[[ "$path_report" == *"database=$repo_root/.runtime/auth/auth.db"* ]] || {
  echo "database_path did not resolve under the repo runtime directory" >&2
  exit 1
}

echo "all macOS runtime scripts look valid"
