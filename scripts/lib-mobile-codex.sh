#!/usr/bin/env bash

workspace_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1
  pwd
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

  command -v node
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
