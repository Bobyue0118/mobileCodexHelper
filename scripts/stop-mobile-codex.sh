#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

if [[ ! -f "$(pid_file)" ]]; then
  echo "No PID file found"
  exit 0
fi

pid="$(cat "$(pid_file)")"
if kill -0 "$pid" >/dev/null 2>&1; then
  kill "$pid"

  for _ in {1..10}; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      rm -f "$(pid_file)"
      echo "Stopped mobile Codex app PID $pid"
      exit 0
    fi
    sleep 1
  done

  echo "Process $pid did not stop within 10s" >&2
  exit 1
else
  echo "Process $pid is not running"
fi

rm -f "$(pid_file)"
