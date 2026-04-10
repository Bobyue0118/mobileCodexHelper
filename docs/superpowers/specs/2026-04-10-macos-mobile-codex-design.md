# macOS Mobile Codex Control Design

**Date:** 2026-04-10

**Status:** Approved in chat, awaiting final spec review before implementation planning

## Goal

Adapt this repo from its current Windows-first operational model into a macOS-hosted, mobile-first Codex control surface where:

- Codex runs on the Mac
- the iPhone is the primary control UI
- remote access happens through a private Tailscale URL
- new iPhones require explicit approval before they become trusted

The intended day-to-day workflow is that the user manages Codex sessions from the iPhone, while the Mac stays in the background as the execution host and source of truth for session history.

## Current Repo Context

The repo already contains the core web-control concept:

- a patched `claudecodeui` layer under [upstream-overrides/claudecodeui-1.25.2](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2)
- Codex session discovery and resume support in [upstream-overrides/claudecodeui-1.25.2/server/openai-codex.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/openai-codex.js)
- project and session browsing in [upstream-overrides/claudecodeui-1.25.2/server/projects.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/projects.js)
- login and trusted-device persistence in [upstream-overrides/claudecodeui-1.25.2/server/routes/auth.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/routes/auth.js) and [upstream-overrides/claudecodeui-1.25.2/server/database/db.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/database/db.js)

The repo is still operationally Windows-first:

- PowerShell scripts under [scripts](/Users/bobyue/Documents/GitHub/mobileCodexHelper/scripts)
- a Windows desktop helper in [mobile_codex_control.py](/Users/bobyue/Documents/GitHub/mobileCodexHelper/mobile_codex_control.py)
- Windows/nginx deployment assumptions in [README.md](/Users/bobyue/Documents/GitHub/mobileCodexHelper/README.md) and [docs/DEPLOYMENT.md](/Users/bobyue/Documents/GitHub/mobileCodexHelper/docs/DEPLOYMENT.md)

The macOS work should preserve the existing trust model and Codex web-control behavior, while removing the Windows helper as a runtime dependency.

## User-Approved Product Direction

The user approved the following decisions:

- use the repo's server-managed Codex session model, not remote control of an existing desktop app window
- make the iPhone the primary control surface
- require remote access from anywhere through a private tunnel such as Tailscale
- keep feature scope similar to the existing repo
- prefer browser-based approval on the Mac over a desktop helper or CLI-only approval flow

## Non-Goals

This design does not attempt to:

- remote-control a native Codex desktop app window on macOS
- expose a raw shell or PTY to the iPhone
- support multi-user collaboration
- expose the app directly to the public internet
- preserve the Windows desktop helper UX on macOS

## Recommended Architecture

### Runtime Shape

The recommended macOS runtime shape is:

```text
iPhone browser
   ↓
Tailscale private HTTPS
   ↓
localhost-only mobile Codex web app on the Mac
   ↓
Mac-hosted Codex sessions and workspace state
```

The patched app remains bound to `127.0.0.1:3001` on the Mac. Tailscale exposes that local service privately to the iPhone. The Mac remains the only execution environment for Codex.

### Why This Architecture

This is the smallest viable adaptation that satisfies the user's actual goal:

- mobile-first Codex control from iPhone
- no dependency on remote desktop
- no dependency on a native macOS control app
- private remote access with a narrower attack surface

Compared with porting the Windows helper or keeping a local reverse proxy layer, this path has fewer moving parts and a smaller macOS-specific support burden.

## Functional Scope

### Required Phone Capabilities

The iPhone web UI must support the normal Codex workflow end to end:

- register and log in
- wait for first-device approval when the iPhone is not yet trusted
- browse workspaces/projects
- browse sessions inside a project
- open complete session history
- start a new Codex session in a selected workspace
- resume an existing Codex session
- send follow-up prompts and stream output live
- interrupt an in-progress Codex run
- rename sessions
- switch between sessions
- create a new workspace under a configured safe root
- import an existing workspace from a configured safe root

### Explicitly Excluded Phone Capabilities

The phone UI should not expose:

- general-purpose shell access
- non-Codex providers in hardened mode
- arbitrary filesystem traversal outside a configured safe root

This preserves the repo's "view and chat-control" model while still making the phone the primary interface for Codex work.

## Security Model

### Core Trust Rules

The macOS port keeps these rules:

1. the app binds only to localhost on the Mac
2. remote access happens only through Tailscale
3. the system is single-user
4. unknown devices cannot log in until explicitly approved
5. Codex execution stays on the Mac

### Trusted Device Flow

The existing trust tables already support:

- approved device persistence
- pending approval requests
- approval status polling
- device revocation

The missing piece is not the data model but the admin surface that makes approval usable without the Windows helper.

## macOS Admin Surface

### Purpose

The macOS port needs a browser-based local admin page served by the app itself. This replaces the Windows desktop helper for the critical ownership and approval workflows.

### Required Admin Functions

The Mac-local admin page should provide:

- app/service status
- current local URL
- current Tailscale/private access URL
- pending device approval requests
- trusted device list
- approve action for pending devices
- reject action for pending devices
- revoke action for approved devices
- visibility into the configured workspace root

### Access Rules

The admin page should only be usable from the Mac-local session. It is not intended to be a remote self-approval page for new devices.

At a minimum, the implementation should ensure:

- approval actions require an authenticated owner session
- phone-originated unauthenticated users cannot approve themselves
- the page is reachable from localhost for the owner during setup and administration

## Workspace Safety Model

### Safe Root

Workspace creation and import should be limited to a configured `WORKSPACES_ROOT` on the Mac.

This root serves two purposes:

- it defines the area the phone UI is allowed to manage
- it avoids exposing arbitrary absolute path selection from the iPhone

### Allowed Operations

Within `WORKSPACES_ROOT`, the phone may:

- create a new folder-backed workspace
- clone a repository into a new folder
- add an existing folder as a managed workspace

Outside `WORKSPACES_ROOT`, these operations must be rejected.

## System Components

### 1. Patched App Runtime

The upstream override layer remains the main application. The macOS adaptation should continue to use the patched app as the single control plane for:

- auth
- trusted devices
- projects/workspaces
- Codex session execution and streaming

### 2. macOS Runtime Scripts

New macOS scripts should replace the Windows-first operational scripts. They should cover:

- applying upstream overrides
- checking runtime requirements
- starting the app service
- stopping the app service
- discovering or enabling the Tailscale private URL
- optionally installing and removing a `launchd` agent

### 3. Local Admin UI

The admin UI is a thin operational layer, not a new product surface. Its job is to expose existing trust and status data that already lives in the server/database layer, plus any new service state needed for macOS operation.

## Main User Flows

### First-Time Setup On Mac

1. Install dependencies on macOS.
2. Download upstream `claudecodeui` into `vendor/claudecodeui-1.25.2`.
3. Apply this repo's overrides.
4. Start the localhost app service on the Mac.
5. Open the local web UI on the Mac and register the single user account.
6. Sign into Tailscale on the Mac and confirm a private remote URL exists.

### First iPhone Login

1. The iPhone opens the private Tailscale URL.
2. The user attempts login.
3. The server detects that the device is not yet trusted.
4. The phone enters waiting-for-approval state.
5. The Mac admin page shows the pending request with device metadata.
6. The user approves the request on the Mac.
7. The iPhone auto-retries and completes login.

### Normal Mobile Workflow

1. Open the private URL from the iPhone.
2. Browse or create/import a workspace under the safe root.
3. Start a new Codex session or resume an existing one.
4. Send prompts and observe streaming output.
5. Interrupt if needed.
6. Reopen the same session later from the phone or from the Mac-hosted web UI.

## Error Handling

The macOS adaptation should make operational failures explicit in both docs and UI:

- if upstream source is missing, the scripts should fail with a direct path-specific message
- if `codex` is not installed or not on `PATH`, the UI should surface that clearly
- if Tailscale is unavailable, local access should still work and remote setup should show a targeted error
- if a workspace path is outside `WORKSPACES_ROOT`, the request should fail with a clear boundary message
- if a device request has already been resolved, approval polling should return the current status cleanly

## Testing Strategy

### Local Verification

The local macOS verification baseline is:

1. local browser can open `http://127.0.0.1:3001`
2. first account registration succeeds
3. project list loads
4. a Codex session can be started locally
5. session history persists and can be reopened

### Remote Verification

The remote mobile verification baseline is:

1. Tailscale exposes a private URL to the same localhost app
2. a new iPhone enters pending approval state on first login
3. the Mac admin page can approve that device
4. the iPhone finishes login after approval
5. the iPhone can create or import a workspace under the safe root
6. the iPhone can start a new Codex session
7. the iPhone can resume a previous session
8. the iPhone can interrupt a running Codex request

## Rollout Strategy

The work should be done in small phases:

1. add macOS runtime and setup path
2. expose local admin/approval APIs and UI
3. enforce workspace-root boundaries for phone-managed creation/import
4. update docs for macOS setup and mobile-first use
5. verify the full Tailscale-backed iPhone flow

This ordering delivers usable value early while keeping the diff scoped to the approved product direction.

## Files Likely To Change In Implementation

The design suggests likely changes in:

- [README.md](/Users/bobyue/Documents/GitHub/mobileCodexHelper/README.md)
- [docs/DEPLOYMENT.md](/Users/bobyue/Documents/GitHub/mobileCodexHelper/docs/DEPLOYMENT.md)
- [upstream-overrides/claudecodeui-1.25.2/server/routes/auth.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/routes/auth.js)
- [upstream-overrides/claudecodeui-1.25.2/server/database/db.js](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/server/database/db.js)
- frontend files under [upstream-overrides/claudecodeui-1.25.2/src](/Users/bobyue/Documents/GitHub/mobileCodexHelper/upstream-overrides/claudecodeui-1.25.2/src)
- new macOS scripts under [scripts](/Users/bobyue/Documents/GitHub/mobileCodexHelper/scripts)

The design intentionally does not require a native macOS desktop control app.

## Acceptance Criteria

This design is successful when all of the following are true:

- the repo supports a documented macOS setup path without the Windows helper
- the Mac-hosted app can be reached privately from the iPhone through Tailscale
- first-time iPhone approval can be completed from a browser on the Mac
- the iPhone can manage Codex sessions as the primary day-to-day interface
- session history created from the iPhone remains available on the Mac-hosted system
- workspace creation/import from the iPhone is restricted to a configured safe root
