#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib-mobile-codex.sh"

workspace="$(workspace_dir)"
launch_agent="$HOME/Library/LaunchAgents/com.mobilecodexhelper.agent.plist"
mkdir -p "$(dirname "$launch_agent")" "$(logs_dir)"

cat >"$launch_agent" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mobilecodexhelper.agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$workspace/scripts/start-mobile-codex.sh</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$(stdout_log)</string>
  <key>StandardErrorPath</key>
  <string>$(stderr_log)</string>
</dict>
</plist>
PLIST

launchctl unload "$launch_agent" >/dev/null 2>&1 || true
launchctl load "$launch_agent"
echo "Installed launch agent at $launch_agent"
