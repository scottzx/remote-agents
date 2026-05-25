# Remote Agents 🚀

随时随地，通过浏览器远程访问你的 AI 智能体和开发工作台。

[![NPM Version](https://img.shields.io/npm/v/@scottzx/remote-agents?color=blue&logo=npm)](https://www.npmjs.com/package/@scottzx/remote-agents)
[![Platform Support](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-brightgreen)](https://github.com/scottzx/remote-agents)
[![License](https://img.shields.io/github/license/scottzx/remote-agents)](LICENSE)

`Remote Agents` 是一个为现代开发者与 AI 协同设计的**轻量级、安全、免配置的远程 Web 工作台**。无论你是在咖啡馆用平板、在交通工具上用手机，还是在另一台电脑前，只需一个浏览器，就能瞬间连回你的专属开发环境，继续对话、编辑代码、管理文件、执行命令，体验如同亲临现场。

---

## 🌟 核心能力与架构优势

- ⚡ **零延迟 Web 终端 (ttyd + tmux 深度融合)**：
  - 基于 `xterm.js` 与高性能 WebSocket，继承 `ttyd` 的极致响应速度。
  - **终端会话自动持久化**：内置 `tmux` 状态管理，即便意外断网、浏览器刷新，所有终端进程与会话状态均毫秒级还原，绝不断线。
- 📂 **全功能 Web 文件浏览器 & 编辑器**：
  - **极速浏览**：左侧树形目录 + 核心区平铺视图，支持文件极速检索与类型筛选。
  - **全能预览**：内置文本、图片浏览器，**新近支持 HTML & PDF 文件的原生高清渲染与 16:9 新窗口/标签页全屏预览**。
  - **在线编辑**：零配置的高亮语法编辑器，支持文件直接重命名、保存与下载。
- 📁 **动态多工作区管理**：
  - 支持创建、切换与删除多个工作区。
  - **系统级 Folder Picker 融合**：深度集成浏览器原生文件/文件夹选择 API，直接导入本地任意开发文件夹。
  - 工作区切换时，**终端会话与文件浏览器上下文瞬间并行秒级同步**。
- 🎙️ **原生 Speech-to-Text 语音输入**：
  - 内置 Web Speech 原生语音识别，支持中英文快捷听写，打造“声控智能体”的流畅交互。
- 🔒 **全自动 SSL/TLS 证书网络安全**：
  - **自签名证书闪电生成**：通过 `--ssl` 启动，系统在没有证书时会自动生成高强度 ECDSA P-256 自签名证书，有效期达 10 年，适配所有局域网 IP。
  - **Tailscale 自动绿锁**：自动识别并匹配 Tailscale 的 Let's Encrypt 官方证书，为跨设备连接提供真正的浏览器绿色安全标志 🔒。
- 🤖 **CC-Connect 多渠道 AI 消息桥接**：
  - 深度集成 [cc-connect](https://github.com/scottzx/cc-connect) 模块，支持将工作区动态注册为项目。
  - 通过反向代理，实现与飞书、Telegram、Discord、Slack 等主流平台的无缝双向消息通信。
  - 智能体与远程控制台主题、语言等配置多维无缝同步。

---

## 📆 近一周 Git 更新亮点 (Weekly Features)

本周项目经历了重大重构和体验升级，以下是最新加入的核心功能：

1. **📄 HTML/PDF 高清预览**：文件管理系统新增 HTML 和 PDF 文件预览支持，且支持新开独立窗口/标签页以 16:9 黄金比例全屏浏览。
2. **🎙️ 原生语音输入与兼容优化**：全新集成 Speech-to-Text 功能并提供多语言切换。同时编写了兼容性指南，明确了 macOS Safari 本地离线引擎的秒级响应优势及 Chrome/Edge 依赖 Google 云端识别易在内网报 `network` 错误的原理。
3. **🔒 零配置安全证书与 Tailscale 融合**：新增 `--ssl` 证书自动生成器，支持零配置生成 ECDSA P-256 10 年期证书；新增 Tailscale 官方证书的自动扫描与发现逻辑，实现真正的跨设备“绿色安全绿锁”访问。
4. **📱 移动端终端快捷键与交互大优化**：
   - 彻底移除了臃肿的终端顶部栏，将 tmux 鼠标滚动/选择模式切换按钮移入顶部全局工作区标题栏。
   - 优化了手机端 Quick Keys 虚拟键盘布局，折叠了子命令菜单，并整合了方向键和退格键，新增 direct `claude` 极速命令。
   - 手机端切换侧边栏会话时，侧边栏支持自动优雅收起，最大化终端可视面积。
5. **⚙️ 快速工作区 Folder Picker**：抛弃了陈旧的文本路径输入框，在新建工作区时直接唤起操作系统原生的 Folder Picker 文件夹选择器。
6. **🚀 并行加载与启动优化**：优化了组件的并发初始化逻辑，工作区与终端会话实现并行异步加载，大幅缩短首屏白屏时间，并支持智能记忆/默认工作区选择。
7. **🤖 CC-Connect 跨域/反向代理升级**：支持工作区动态项目注册和 API POST 请求语言/主题同步，极大提升了 iframe 嵌入的整体感。
8. **📦 自动化 NPM 发布与 Node 24 适配**：推出了 multi-platform release CI/CD 自动化构建与统一的 NPM 包装包 `@scottzx/remote-agents`。适配了最新的 Node 24 运行环境，并优化了 Github Actions 上的 Yarn 3 缓存。

---

## 🚀 安装指南 (Installation)

### 方法一：通过 NPM 安装 (最简便 ⚡ 推荐)

我们提供了预编译的 NPM 包包装器，会自动检测您的系统架构并从 GitHub 镜像高速下载最匹配的平台二进制程序。

```bash
# 全局安装 (自动包含 remote-agents 守护进程、ttyd 静态后端和 Web 前端)
npm install -g @scottzx/remote-agents

# 也可以直接免安装直接通过 npx 运行：
npx @scottzx/remote-agents [参数]
```

> **系统要求**：Node.js >= 22 (完美兼容 Node 24)
> **支持架构**：macOS (Darwin x64/arm64), Linux (x64/arm64), Windows (x64/arm64)

### 方法二：手动下载预编译二进制

您也可以直接访问 [GitHub Releases 页面](https://github.com/scottzx/remote-agents/releases) 下载适合您系统架构的静态二进制包，解压后即可开箱即用。

### 方法三：使用 Docker 部署

```bash
docker run -d \
  -p 8080:8080 \
  -v /path/to/your/workspaces:/workspace \
  --name remote-agents \
  scottzx/remote-agents:latest
```

### 方法四：从源码编译构建

如果您需要进行本地开发调试，请确保本地已启用 Yarn 3：

1. **编译 C 终端后端 (ttyd)**：
   ```bash
   git clone --recursive https://github.com/scottzx/remote-agents.git
   cd remote-agents
   mkdir build && cd build
   cmake ..
   make  # 产出 ttyd 二进制文件
   ```
2. **构建前端静态资源**：
   ```bash
   cd ../html
   corepack enable  # 确保启用 Yarn 3.6.3 
   yarn install     # 安装依赖
   yarn build       # 编译打包，并调用 gulp 生成嵌入式 html.h 文件
   ```
3. **编译 Go 守护进程**：
   ```bash
   cd ../agent
   go build -o remote-agents ./cmd/agent/main.go
   ```

---

## 🛠️ 使用与命令行参数

启动服务非常简单，直接在终端中运行 `remote-agents` 即可：

```bash
# 启动服务，默认监听 8080 端口，工作目录为用户根目录 (~)
remote-agents

# 指定监听地址与暴露的工作目录
remote-agents -listen 0.0.0.0:9000 -workdir /Users/scott/Projects
```

服务启动后，在本地或局域网浏览器中打开 `http://localhost:8080` (或对应的监听端口) 即可进入您的云端工作台！

### 完整命令行 flags 参数说明

| 命令行参数 | 参数类型 | 默认值 | 详细功能说明 |
| :--- | :---: | :---: | :--- |
| `-listen` | `string` | `":8080"` | 服务对外监听的地址与端口 (例: `0.0.0.0:8080` / `:9000`) |
| `-workdir` | `string` | `"~"` | 工作台默认暴露的文件系统根目录。非在此目录下的文件不可被访问 |
| `-tmux-session` | `string` | `"remote-agents"` | 默认绑定的 tmux 会话名称，用于实现 Web 终端断线重连与持久化运行 |
| `-ssl` | `bool` | `false` | 是否开启 HTTPS 协议。若为 true 且无证书，系统会自动生成 10 年期自签名证书 |
| `-ssl-cert` | `string` | `""` | 外部指定的高级 SSL/TLS 证书路径 (PEM 格式) |
| `-ssl-key` | `string` | `""` | 外部指定的高级 SSL/TLS 证书私钥路径 (PEM 格式) |
| `-no-ttyd` | `bool` | `false` | 跳过由 Go 守护进程自动拉起 ttyd 进程的步骤 (用于开发调试) |
| `-ttyd-bin` | `string` | `"./ttyd"` | 外部指定的 `ttyd` 二进制执行程序文件路径 |
| `-ttyd-addr` | `string` | `"127.0.0.1:7681"`| 内置 ttyd 与 Go 守护进程的本地通信回环地址 |
| `-restart-delay`| `duration` | `"3s"` | 当 ttyd 意外退出后，守护进程尝试自动重新拉起的等待间隔 |
| `-max-restarts` | `int` | `5` | 最大连续异常重启 ttyd 进程的上限次数，防止循环崩溃锁死 |

---

## 💡 高级配置与技术指南

### 1. 开启局域网/互联网 HTTPS 权威绿锁 (Tailscale Let's Encrypt 方案)

由于浏览器对高级 API (如麦克风权限、Service Worker 缓存、剪贴板等) 强制要求 **安全上下文** (即必须是 `localhost` 或 `HTTPS`)，因此在局域网内使用手机或平板访问时，必须配置 SSL。

最完美的免费方案是结合 **Tailscale** 自动获取官方 Let's Encrypt 证书：

1. **启用 HTTPS**：在 Tailscale Admin Console Settings 中激活 **HTTPS Certificates**。
2. **下载证书**：在宿主机终端中执行：
   ```bash
   tailscale cert <您的Tailscale节点域名.ts.net>
   ```
3. **一键适配**：将生成的 `.crt` 和 `.key` 文件移入 `~/.remote-agents/certs/` 目录下。
4. **启动服务**：直接运行：
   ```bash
   remote-agents --ssl
   ```
   *Go 守护进程会自动扫描并匹配 Tailscale 官方证书，全球任何设备访问您的节点域名时都将呈现安全的绿锁标识 🔒！*
   *(更多细节请查阅：[Tailscale 证书配置指南](docs/tips/ssl-certificate-guide.md))*

### 2. 语音识别 (Speech-to-Text) 浏览器兼容性避坑

语音输入对多媒体输入权限及底层的语音解析引擎有较高要求：

- **桌面端推荐使用 Safari**：Safari (macOS) 的语音识别完美对接系统本地离线听写模块，**无任何网络限制，秒级瞬时解析**，且中文普通话极其精准。
- **Chrome / Edge 的 Network 报错**：由于 Chrome/Edge 的 Web Speech 强依赖于 Google 云端服务器解析，若国内网络未配置全局系统代理，会报 `Speech recognition error: network`。
- **移动端 (手机/平板)**：强制要求使用 HTTPS 协议，否则网页端无法申请麦克风录音权限。
- *(更多细节请查阅：[语音识别与麦克风权限兼容性指南](docs/tips/voice-recognition.md))*

---

## 📄 许可证 (License)

本项目基于 [MIT License](LICENSE) 协议开源。

---

**致谢与关联项目**：
- 终端底层核心能力基于优秀的开源项目 [ttyd](https://github.com/tsl0922/ttyd) 构建，衷心感谢其作者的杰出贡献。
- 跨渠道 AI 消息桥接与智能体集成方案由子模块 [cc-connect](https://github.com/scottzx/cc-connect) 驱动。
