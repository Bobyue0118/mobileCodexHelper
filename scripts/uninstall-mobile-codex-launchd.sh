#!/usr/bin/env bash
set -euo pipefail

launch_agent="$HOME/Library/LaunchAgents/com.mobilecodexhelper.agent.plist"
launchctl unload "$launch_agent" >/dev/null 2>&1 || true
rm -f "$launch_agent"
echo "Removed launch agent $launch_agent"
