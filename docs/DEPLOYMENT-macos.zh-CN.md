# macOS 部署说明

这份文档对应的是 macOS 手机优先工作流。
Codex 只在 Mac 上运行，iPhone 通过私有网页查看会话、继续发消息，并在本地 Owner Admin 面板里完成新设备审批。

## 需要的软件

- 建议在执行 `npm install` 前准备好 Node.js 22 LTS
- Git
- Tailscale，用于随时随地的私有远程访问
- Mac 上已经安装并能正常使用的 Codex

## 快速开始

1. 把上游 `claudecodeui v1.25.2` 放到 `vendor/claudecodeui-1.25.2`
2. 运行 `./scripts/apply-upstream-overrides.sh`
3. 运行 `./scripts/check-mobile-codex-runtime.sh`
4. 进入 `vendor/claudecodeui-1.25.2` 并执行 `npm install`
5. 运行 `./scripts/start-mobile-codex.sh`
6. 在 Mac 浏览器打开 `http://127.0.0.1:3001`，注册你的账号
7. 运行 `./scripts/enable-mobile-codex-remote.sh`
8. 在本地页面打开 Owner Admin 面板，批准 iPhone，然后继续用手机控制 Codex

## 说明

- 不装 Tailscale 也可以做本地测试，但不能实现随时随地的私有远程访问。
- `./scripts/check-mobile-codex-runtime.sh` 会打印上游目录、实际 Node 路径、Tailscale 路径，以及工作区内的数据库路径。
- `./scripts/start-mobile-codex.sh` 会把应用固定绑定到 `127.0.0.1:3001`，并把认证数据写到 `.runtime/auth/auth.db`。
- 如果你希望服务自动随登录启动，可以运行 `./scripts/install-mobile-codex-launchd.sh` 安装当前用户的 `launchd` agent。
