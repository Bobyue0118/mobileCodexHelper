#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

workspace="$(workspace_dir)"
upstream_dir="$(resolve_upstream_dir)"
node_bin="$(resolve_node || true)"
tailscale_bin="$(resolve_tailscale || true)"
db_path="$(database_path)"

cat <<EOF
Workspace=$workspace
UpstreamExists=$([[ -d "$upstream_dir" ]] && echo true || echo false)
UpstreamPath=$upstream_dir
Node=${node_bin:-}
Tailscale=${tailscale_bin:-}
DatabasePath=$db_path
Python=$(command -v python3 || true)
EOF
