# macOS Deployment Guide

This guide is for the macOS mobile-first workflow.
The Mac remains the only machine that runs Codex. Your iPhone uses a private web UI to view sessions, send prompts, and approve new devices through the local Owner Admin panel.

## Required software

- Node.js 22 LTS recommended before `npm install`
- Git
- Tailscale for private remote access from anywhere
- Codex already installed and working on the Mac

## Quick start

1. Place upstream `claudecodeui v1.25.2` in `vendor/claudecodeui-1.25.2`
2. Run `./scripts/apply-upstream-overrides.sh`
3. Run `./scripts/check-mobile-codex-runtime.sh`
4. Go to `vendor/claudecodeui-1.25.2` and run `npm install`
5. Run `./scripts/start-mobile-codex.sh`
6. Open `http://127.0.0.1:3001` in a Mac browser and register your account
7. Run `./scripts/enable-mobile-codex-remote.sh`
8. Open the Owner Admin panel from the local app, approve the iPhone, and keep using Codex from the phone

## Notes

- Local-only testing works without Tailscale. Remote phone access does not.
- `./scripts/check-mobile-codex-runtime.sh` prints the upstream path, resolved Node path, Tailscale path, and workspace-local database path.
- `./scripts/start-mobile-codex.sh` keeps the app bound to `127.0.0.1:3001` and stores auth data under `.runtime/auth/auth.db`.
- `./scripts/install-mobile-codex-launchd.sh` installs a per-user `launchd` agent if you want the Mac service to start automatically.
