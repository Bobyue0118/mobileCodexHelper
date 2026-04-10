#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

tailscale_bin="$(resolve_tailscale || true)"
if [[ -z "$tailscale_bin" || ! -x "$tailscale_bin" ]]; then
  echo "Tailscale CLI not found. Install Tailscale or set MOBILE_CODEX_TAILSCALE=/path/to/tailscale" >&2
  exit 1
fi

if ! curl -sf http://127.0.0.1:3001/health >/dev/null 2>&1; then
  echo "Local mobile Codex app is not reachable at http://127.0.0.1:3001/health" >&2
  exit 1
fi

if ! status_json="$("$tailscale_bin" status --json 2>&1)"; then
  echo "Failed to read Tailscale status: $status_json" >&2
  exit 1
fi

backend_state="$(python3 - <<'PY' "$status_json"
import json, sys
payload = json.loads(sys.argv[1])
print(payload.get("BackendState", "Unknown"))
PY
)"

if [[ "$backend_state" != "Running" ]]; then
  auth_url="$(python3 - <<'PY' "$status_json"
import json, sys
payload = json.loads(sys.argv[1])
print(payload.get("AuthURL", ""))
PY
)"
  if [[ -n "$auth_url" ]]; then
    echo "Tailscale login required: $auth_url"
    exit 1
  fi
  echo "Tailscale is not running"
  exit 1
fi

"$tailscale_bin" serve --bg http://127.0.0.1:3001

dns_name="$(python3 - <<'PY' "$status_json"
import json, sys
payload = json.loads(sys.argv[1])
print((payload.get("Self", {}) or {}).get("DNSName", "").rstrip("."))
PY
)"

if [[ -z "$dns_name" ]]; then
  echo "Tailscale is running, but no device DNS name is available yet" >&2
  exit 1
fi

echo "Private remote URL: https://$dns_name"
