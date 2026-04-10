# mobileCodexHelper

[中文](README.md) | [English](README.en.md)

Turn the Codex sessions running on your Mac into a private, iPhone-friendly web control panel.

The goal of this fork is simple:

- Codex keeps running on the Mac
- the iPhone uses a private web UI to view projects, sessions, messages, and history
- the iPhone can send follow-up prompts and let the Mac continue the work
- first-time devices must be approved from the Mac locally

## How this fork differs from the original Windows-first version

| Topic | Original Windows-first path | This fork's macOS mobile-first path |
| --- | --- | --- |
| Main platform | Windows PC | macOS + iPhone |
| Main control surface | Windows desktop tool, portable EXE, PowerShell | local browser UI, Owner Admin panel, Bash scripts |
| Local service management | `start-mobile-codex-stack.ps1`, nginx, desktop UI | `start-mobile-codex.sh`, optional `launchd`, local browser |
| Remote phone access | enabled from the desktop tool | `./scripts/enable-mobile-codex-remote.sh` + Tailscale Serve |
| First-device approval | approved from the Windows desktop tool | approved from the local Owner Admin panel on the Mac |
| Best for | people who want a Windows portable workflow | people who want Codex on a Mac and control from an iPhone |

If you want the original Windows route, use:

- Windows English deployment: `docs/DEPLOYMENT.md`
- Windows 中文部署：`docs/DEPLOYMENT.zh-CN.md`

If you want the Mac + iPhone workflow, keep reading this README.

## The 3 things beginners should remember first

1. The Mac uses `http://127.0.0.1:3001`
2. The iPhone uses a Tailscale URL like `https://<your-machine>.ts.net`
3. The iPhone must not use `127.0.0.1`, and the first login may require approval on the Mac

## Who this is for

- you already use Codex successfully on a Mac
- you want to view history and continue sessions from an iPhone
- you want private-by-default access through Tailscale
- you are setting up a single-user workflow, not a shared service

## What it is not

- not a multi-user SaaS
- not a public internet deployment target
- not a full remote desktop or full remote IDE

## Workflow at a glance

```text
iPhone Safari
   ↓
Tailscale private HTTPS URL
   ↓
Mac local web service (127.0.0.1:3001)
   ↓
Codex sessions running on the Mac

Mac local browser
   ↓
The same local web service
   ↓
Owner Admin panel for approving new devices
```

## Interface preview

The screenshot below comes from the original Windows control-console preview.
The main change in this fork is not a brand-new UI, but the completed macOS + iPhone workflow around it.

![Mobile Codex control console preview](docs/assets/mobile-codex-control-console.png)

## Detailed beginner setup

### Step 0: Prepare these first

- a Mac where Codex already works
- Git
- Node.js 22 LTS
- Tailscale
- an iPhone
- upstream `claudecodeui v1.25.2`

The upstream directory must be placed at:

```text
vendor/claudecodeui-1.25.2
```

### Step 1: Apply the upstream patch layer

Run from the repo root:

```bash
./scripts/apply-upstream-overrides.sh
./scripts/check-mobile-codex-runtime.sh
cd vendor/claudecodeui-1.25.2
npm install
cd ../..
```

What to check:

- `UpstreamExists=true`
- `UpstreamPath` points to `vendor/claudecodeui-1.25.2`
- `Node=` has a value
- if Tailscale is installed already, `Tailscale=` should also have a value

### Step 2: Start the local Mac service

Run:

```bash
./scripts/start-mobile-codex.sh
```

Then open this in a browser on the Mac:

```text
http://127.0.0.1:3001
```

On first use:

1. register your account
2. log in
3. confirm the local page works
4. find the Owner Admin panel entry

The Owner Admin panel is where you approve first-time devices.

### Step 3: Enable the private iPhone URL

Make sure:

- Tailscale is installed and logged in on the Mac
- Tailscale is installed and logged in on the iPhone
- both devices are in the same tailnet

Then run on the Mac:

```bash
./scripts/enable-mobile-codex-remote.sh
```

You should get output like:

```text
Private remote URL: https://your-mac-name.example.ts.net
```

That `Private remote URL` is the real iPhone address.

Do not use these on the iPhone:

- `http://127.0.0.1:3001`
- the one-time Tailscale admin/login URL shown while enabling Serve

### Step 4: Log in from the iPhone for the first time

On the iPhone:

1. open Safari
2. open the `Private remote URL`
3. log in with the account you created on the Mac

Two normal outcomes:

- it opens directly because the device is already trusted
- it waits for approval because this is a new device

If it waits for approval, go back to the Mac:

1. open `http://127.0.0.1:3001`
2. open the Owner Admin panel
3. find the pending iPhone
4. approve it

After approval, the iPhone should continue automatically.

### Step 5: Daily usage after setup

On the Mac:

```bash
./scripts/start-mobile-codex.sh
```

On the iPhone:

1. open the same Tailscale private URL
2. browse session history
3. reopen an existing session or start a new one
4. send prompts and let the Mac continue the Codex work

When you are done, stop the local service on the Mac:

```bash
./scripts/stop-mobile-codex.sh
```

### Step 6: Optional auto-start on login

Install the per-user `launchd` agent:

```bash
./scripts/install-mobile-codex-launchd.sh
```

Remove it later if you do not want auto-start:

```bash
./scripts/uninstall-mobile-codex-launchd.sh
```

## The 5 most common beginner mistakes

### 1. Using the wrong address on the iPhone

The iPhone should use:

```text
https://<your-machine>.ts.net
```

Not:

```text
http://127.0.0.1:3001
```

### 2. Trying to log in on the iPhone before creating the account on the Mac

Create the account locally on the Mac first. Then use that same account on the iPhone.

### 3. Forgetting first-device approval

If the iPhone waits for approval, do not assume the password is wrong first.
Check the Owner Admin panel on the Mac.

### 4. Wrong upstream folder or version

The expected path is:

```text
vendor/claudecodeui-1.25.2
```

### 5. Tailscale is not logged in on both devices

Both the Mac and the iPhone must be logged into the same tailnet.

## Common commands

### Check the runtime

```bash
./scripts/check-mobile-codex-runtime.sh
```

### Apply upstream overrides

```bash
./scripts/apply-upstream-overrides.sh
```

### Start the local service

```bash
./scripts/start-mobile-codex.sh
```

### Stop the local service

```bash
./scripts/stop-mobile-codex.sh
```

### Enable the private iPhone URL

```bash
./scripts/enable-mobile-codex-remote.sh
```

### Install auto-start

```bash
./scripts/install-mobile-codex-launchd.sh
```

### Remove auto-start

```bash
./scripts/uninstall-mobile-codex-launchd.sh
```

## More documentation

- macOS English deployment: [`docs/DEPLOYMENT-macos.md`](docs/DEPLOYMENT-macos.md)
- macOS 中文部署：[`docs/DEPLOYMENT-macos.zh-CN.md`](docs/DEPLOYMENT-macos.zh-CN.md)
- Windows English deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- Windows 中文部署：[`docs/DEPLOYMENT.zh-CN.md`](docs/DEPLOYMENT.zh-CN.md)
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Security policy: [`SECURITY.md`](SECURITY.md)

## Upstream and license

This project builds on upstream `siteboon/claudecodeui`. Please keep:

- upstream attribution
- the included license
- a clear description of local modifications
