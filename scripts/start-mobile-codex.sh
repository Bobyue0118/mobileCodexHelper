#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

upstream_dir="$(resolve_upstream_dir)"
node_bin="$(resolve_node || true)"
db_path="$(database_path)"

require_path "$upstream_dir" "Upstream checkout not found"
require_path "$node_bin" "Node executable not found"
mkdir -p "$(logs_dir)" "$(runtime_dir)" "$(database_dir)"
: >"$(stdout_log)"
: >"$(stderr_log)"

if [[ -f "$(pid_file)" ]]; then
  existing_pid="$(cat "$(pid_file)")"
  if kill -0 "$existing_pid" >/dev/null 2>&1; then
    echo "Mobile Codex app already running with PID $existing_pid"
    exit 0
  fi

  rm -f "$(pid_file)"
fi

(
  cd "$upstream_dir"
  export NODE_ENV=production
  export HOST=127.0.0.1
  export PORT=3001
  export DATABASE_PATH="$db_path"
  export CODEX_ONLY_HARDENED_MODE=true
  export VITE_CODEX_ONLY_HARDENED_MODE=true
  nohup "$node_bin" server/index.js >>"$(stdout_log)" 2>>"$(stderr_log)" &
  echo $! >"$(pid_file)"
)

pid="$(cat "$(pid_file)")"
for _ in {1..20}; do
  if ! kill -0 "$pid" >/dev/null 2>&1; then
    rm -f "$(pid_file)"
    echo "Mobile Codex app exited before becoming healthy. Check $(stderr_log)" >&2
    exit 1
  fi

  if curl -sf http://127.0.0.1:3001/health >/dev/null 2>&1; then
    echo "Started mobile Codex app with PID $pid"
    exit 0
  fi

  sleep 1
done

echo "Mobile Codex app is still starting, but /health did not respond within 20s. Check $(stdout_log) and $(stderr_log)" >&2
exit 1
