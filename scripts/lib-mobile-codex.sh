#!/usr/bin/env bash

MOBILE_CODEX_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
MOBILE_CODEX_WORKSPACE_DIR="$(cd "$MOBILE_CODEX_LIB_DIR/.." >/dev/null 2>&1 && pwd)"

workspace_dir() {
  printf '%s\n' "$MOBILE_CODEX_WORKSPACE_DIR"
}

resolve_upstream_dir() {
  if [[ -n "${MOBILE_CODEX_UPSTREAM_DIR:-}" ]]; then
    printf '%s\n' "$MOBILE_CODEX_UPSTREAM_DIR"
    return 0
  fi

  printf '%s/vendor/claudecodeui-1.25.2\n' "$(workspace_dir)"
}

require_path() {
  local target="$1"
  local message="$2"

  [[ -e "$target" ]] || {
    echo "$message: $target" >&2
    exit 1
  }
}

resolve_node() {
  if [[ -n "${MOBILE_CODEX_NODE:-}" ]]; then
    printf '%s\n' "$MOBILE_CODEX_NODE"
    return 0
  fi

  local upstream_dir probe_target candidate current_node
  upstream_dir="$(resolve_upstream_dir)"
  if [[ -d "$upstream_dir/node_modules/better-sqlite3" ]]; then
    probe_target="$upstream_dir/node_modules/better-sqlite3"
  else
    probe_target=""
  fi

  current_node="$(command -v node 2>/dev/null || true)"
  if [[ -n "$current_node" ]]; then
    if [[ -z "$probe_target" ]] || "$current_node" -e 'const Database=require(process.argv[1]); const db=new Database(":memory:"); db.close();' "$probe_target" >/dev/null 2>&1; then
      printf '%s\n' "$current_node"
      return 0
    fi
  fi

  while IFS= read -r candidate; do
    [[ -n "$candidate" && -x "$candidate" ]] || continue
    if [[ -z "$probe_target" ]] || "$candidate" -e 'const Database=require(process.argv[1]); const db=new Database(":memory:"); db.close();' "$probe_target" >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done < <(find "$HOME/.nvm/versions/node" -mindepth 3 -maxdepth 3 -path '*/bin/node' -type f 2>/dev/null | sort -Vr)

  return 1
}

resolve_tailscale() {
  if [[ -n "${MOBILE_CODEX_TAILSCALE:-}" ]]; then
    printf '%s\n' "$MOBILE_CODEX_TAILSCALE"
    return 0
  fi

  command -v tailscale
}

logs_dir() {
  printf '%s/tmp/logs\n' "$(workspace_dir)"
}

runtime_dir() {
  printf '%s/.runtime\n' "$(workspace_dir)"
}

database_dir() {
  printf '%s/auth\n' "$(runtime_dir)"
}

database_path() {
  if [[ -n "${MOBILE_CODEX_DATABASE_PATH:-}" ]]; then
    printf '%s\n' "$MOBILE_CODEX_DATABASE_PATH"
    return 0
  fi

  printf '%s/auth.db\n' "$(database_dir)"
}

pid_file() {
  printf '%s/mobile-codex.pid\n' "$(runtime_dir)"
}

stdout_log() {
  printf '%s/mobile-codex-app.stdout.log\n' "$(logs_dir)"
}

stderr_log() {
  printf '%s/mobile-codex-app.stderr.log\n' "$(logs_dir)"
}
