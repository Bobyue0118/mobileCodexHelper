# mobileCodexHelper

[中文](README.md) | [English](README.en.md)

把 Mac 上本地运行的 Codex 会话，变成一个可以被 iPhone 私有访问和继续控制的网页面板。

这个 fork 的目标不是做“远程桌面”，而是把你的日常 Codex 工作方式变成：

- Codex 始终跑在 Mac 上
- iPhone 通过私有网页查看项目、会话、消息和历史
- iPhone 可以继续发 prompt，让 Mac 上的 Codex 接着执行
- 新设备第一次登录必须在 Mac 本地批准

## 这个 fork 和原始 Windows 支持版有什么不同

| 对比项 | 原始 Windows 优先路线 | 这个 fork 的 macOS 手机优先路线 |
| --- | --- | --- |
| 主要平台 | Windows PC | macOS + iPhone |
| 核心入口 | Windows 桌面控制工具、便携版 EXE、PowerShell | 本地网页、Owner Admin 面板、Bash 脚本 |
| 本地服务管理 | `start-mobile-codex-stack.ps1`、nginx、桌面工具 | `start-mobile-codex.sh`、可选 `launchd`、本地浏览器 |
| 手机远程入口 | 桌面工具里开启手机访问 | `./scripts/enable-mobile-codex-remote.sh` + Tailscale Serve |
| 新设备批准 | Windows 桌面工具审批 | Mac 本地网页里的 Owner Admin 面板审批 |
| 推荐对象 | 想要 Windows 便携打包版的人 | 想在 Mac 上跑 Codex，并从 iPhone 随时继续控制的人 |

如果你要的是原来的 Windows 工作方式，请看：

- Windows 中文部署：`docs/DEPLOYMENT.zh-CN.md`
- Windows English deployment: `docs/DEPLOYMENT.md`

如果你要的是“Mac 上跑 Codex，iPhone 远程控制”，继续读这份 README。

## 新手先记住 3 件事

1. Mac 自己访问的地址是 `http://127.0.0.1:3001`
2. iPhone 访问的地址是 Tailscale 提供的 `https://<你的机器名>.ts.net`
3. iPhone 不能使用 `127.0.0.1:3001`，第一次登录新设备通常还要回到 Mac 上批准

## 它适合什么人

- 你已经能在 Mac 上正常使用 Codex
- 你希望在手机上查看历史、继续发消息、恢复会话
- 你接受默认走 Tailscale 私网，而不是直接暴露公网
- 你是单用户使用，不是多人共享服务

## 它不适合什么人

- 想做多人协作 SaaS
- 想把高权限 Codex 服务直接暴露到公网
- 想要完整远程桌面或完整远程 IDE

## 工作方式一图看懂

```text
iPhone Safari
   ↓
Tailscale 私有 HTTPS 地址
   ↓
Mac 本地网页服务（127.0.0.1:3001）
   ↓
Mac 上正在运行的 Codex 会话

Mac 本地浏览器
   ↓
同一个本地网页服务
   ↓
Owner Admin 面板（审批新设备）
```

## 界面预览

下面这张图来自原始 Windows 控制台预览。
这个 fork 的重点变化不是换掉核心界面，而是把 macOS + iPhone 的工作流补齐。

![移动 Codex 控制台预览](docs/assets/mobile-codex-control-console.png)

## 新手详细上手

### 第 0 步：你需要先准备好这些东西

- 一台已经能正常运行 Codex 的 Mac
- Git
- Node.js 22 LTS
- Tailscale
- 一台 iPhone
- 上游 `claudecodeui v1.25.2`

上游目录必须放在这里：

```text
vendor/claudecodeui-1.25.2
```

如果目录名不对，后面的脚本会直接找不到它。

### 第 1 步：把上游补丁应用好

在仓库根目录运行：

```bash
./scripts/apply-upstream-overrides.sh
./scripts/check-mobile-codex-runtime.sh
cd vendor/claudecodeui-1.25.2
npm install
cd ../..
```

你应该重点确认：

- `UpstreamExists=true`
- `UpstreamPath` 指向 `vendor/claudecodeui-1.25.2`
- `Node=` 有值
- 如果已经安装 Tailscale，`Tailscale=` 也应该有值

说明：

- `apply-upstream-overrides.sh` 会把本仓库里的覆盖文件应用到上游目录
- `check-mobile-codex-runtime.sh` 会告诉你脚本实际找到的 Node、Tailscale、数据库路径
- `npm install` 必须在 `vendor/claudecodeui-1.25.2` 目录里执行

### 第 2 步：启动 Mac 本地服务

运行：

```bash
./scripts/start-mobile-codex.sh
```

然后在 Mac 浏览器打开：

```text
http://127.0.0.1:3001
```

第一次使用时，你应该：

1. 注册账号
2. 登录
3. 确认本地页面已经正常打开
4. 找到 Owner Admin 面板入口

Owner Admin 面板的作用是：

- 查看当前本地服务状态
- 看待批准设备
- 批准 iPhone 这类新设备

### 第 3 步：给 iPhone 打开私有访问入口

先确保：

- Mac 上已经安装并登录 Tailscale
- iPhone 上也安装并登录了同一个 Tailnet

然后在 Mac 上运行：

```bash
./scripts/enable-mobile-codex-remote.sh
```

你会看到类似输出：

```text
Private remote URL: https://your-mac-name.example.ts.net
```

真正给 iPhone 用的是这一行里的 `Private remote URL`。

不要把下面这些地址拿去给 iPhone：

- `http://127.0.0.1:3001`
- Tailscale 的一次性网页登录地址

### 第 4 步：第一次让 iPhone 登录

在 iPhone 上：

1. 打开 Safari
2. 访问刚才的 `Private remote URL`
3. 使用你在 Mac 本地页面里刚注册的账号登录

可能出现两种情况：

- 直接进入页面：说明这台设备已经被信任
- 显示等待批准：这是正常的首次设备审批流程

如果 iPhone 显示等待批准，就回到 Mac：

1. 打开本地页面 `http://127.0.0.1:3001`
2. 进入 Owner Admin 面板
3. 找到待批准的 iPhone
4. 点击批准

批准后，iPhone 会自动继续登录。

### 第 5 步：以后每天怎么用

每天使用通常只需要：

在 Mac 上：

```bash
./scripts/start-mobile-codex.sh
```

在 iPhone 上：

1. 打开之前的 Tailscale 私有地址
2. 查看会话历史
3. 打开已有 session，或者新建 session
4. 继续发 prompt，让 Mac 上的 Codex 接着跑

结束时，在 Mac 上停止服务：

```bash
./scripts/stop-mobile-codex.sh
```

### 第 6 步：如果你希望 Mac 登录后自动启动

安装当前用户的 `launchd` agent：

```bash
./scripts/install-mobile-codex-launchd.sh
```

如果以后不想自动启动了：

```bash
./scripts/uninstall-mobile-codex-launchd.sh
```

## 新手最容易踩的 5 个坑

### 1. 把错误的地址发给 iPhone

iPhone 用的是：

```text
https://<你的机器名>.ts.net
```

不是：

```text
http://127.0.0.1:3001
```

### 2. 没有先在 Mac 本地注册账号

第一次账号注册应该先在 Mac 本地页面完成，再让 iPhone 用这个账号登录。

### 3. 忘了批准第一次登录的新设备

如果 iPhone 一直卡在等待批准，不要先怀疑密码。
先去 Mac 本地页面里的 Owner Admin 面板看待审批设备。

### 4. 上游目录不对

目录必须是：

```text
vendor/claudecodeui-1.25.2
```

不是别的版本，也不是别的目录名。

### 5. Tailscale 没有在两台设备上同时登录

Mac 和 iPhone 必须同时登录同一个 Tailnet。
否则 iPhone 打不开私有 URL，即使本地 `127.0.0.1:3001` 在 Mac 上是正常的。

## 常用命令

### 检查运行环境

```bash
./scripts/check-mobile-codex-runtime.sh
```

### 应用上游覆盖文件

```bash
./scripts/apply-upstream-overrides.sh
```

### 启动本地服务

```bash
./scripts/start-mobile-codex.sh
```

### 停止本地服务

```bash
./scripts/stop-mobile-codex.sh
```

### 开启 iPhone 私有访问入口

```bash
./scripts/enable-mobile-codex-remote.sh
```

### 安装自动启动

```bash
./scripts/install-mobile-codex-launchd.sh
```

### 卸载自动启动

```bash
./scripts/uninstall-mobile-codex-launchd.sh
```

## 更详细的文档

- macOS 中文部署：[`docs/DEPLOYMENT-macos.zh-CN.md`](docs/DEPLOYMENT-macos.zh-CN.md)
- macOS English deployment: [`docs/DEPLOYMENT-macos.md`](docs/DEPLOYMENT-macos.md)
- Windows 中文部署：[`docs/DEPLOYMENT.zh-CN.md`](docs/DEPLOYMENT.zh-CN.md)
- Windows English deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- 中文架构说明：[`docs/ARCHITECTURE.zh-CN.md`](docs/ARCHITECTURE.zh-CN.md)
- 安全策略：[`SECURITY.zh-CN.md`](SECURITY.zh-CN.md)

## 上游与许可证

本项目基于上游 `siteboon/claudecodeui` 工作，请保留：

- 上游归属说明
- 本仓库中的许可证
- 对上游改动的说明
