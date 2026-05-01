# cursor-IDLE

一个基于 **VS Code 扩展能力** 模仿 Cursor 的轻量 IDE（IDLE）实现方案。

## 目标

- 使用 VS Code 的 Extension API 快速实现 AI 原生开发体验。
- 提供类似 Cursor 的核心能力：
  - 侧边栏 AI Chat
  - 内联代码生成/修改（Inline Edit）
  - 选中代码解释、重构、修复
  - 基于工作区上下文的问答
  - 命令面板快捷调用

## 架构设计

```text
cursor-idle/
├─ extension/                   # VS Code 扩展主工程
│  ├─ src/
│  │  ├─ extension.ts           # 插件入口，注册命令与 Provider
│  │  ├─ chat/
│  │  │  ├─ chatViewProvider.ts # Webview 聊天面板
│  │  │  └─ promptBuilder.ts    # Prompt 组装
│  │  ├─ inline/
│  │  │  ├─ inlineEdit.ts       # 内联编辑逻辑
│  │  │  └─ codeAction.ts       # 右键/灯泡动作
│  │  ├─ context/
│  │  │  ├─ workspaceIndex.ts   # 文件索引与检索
│  │  │  └─ symbols.ts          # 符号抽取
│  │  └─ llm/
│  │     ├─ provider.ts         # 模型调用抽象层
│  │     └─ openaiProvider.ts   # OpenAI 实现
│  ├─ package.json              # 扩展声明（commands/views/configuration）
│  └─ tsconfig.json
└─ server/                      # (可选) 本地代理服务，统一管理 key / 日志 / 限流
```

## 核心功能分解

### 1) AI Chat（侧边栏）

- `WebviewViewProvider` 实现聊天 UI。
- 与扩展端通过 `postMessage` 通信。
- Chat 能力包含：
  - 当前文件上下文注入
  - 选中代码片段注入
  - 最近修改文件摘要注入

### 2) Inline Edit（编辑器内联修改）

- 注册命令：
  - `cursorIdle.inlineEdit`
  - `cursorIdle.fixWithAI`
  - `cursorIdle.explainSelection`
- 流程：
  1. 收集选中代码 + 上下文
  2. 发送到 LLM
  3. 解析返回 patch
  4. `TextEditorEdit` 应用变更

### 3) Code Action（右键 AI 操作）

- `CodeActionProvider` 为选中区域提供：
  - Explain
  - Refactor
  - Optimize
  - Generate Tests
- 通过统一 command handler 调用 LLM。

### 4) Workspace Context（工作区上下文）

- 首版可用 `ripgrep` + 文件片段拼接实现简单检索。
- 进阶可加入：
  - Embedding 向量索引（SQLite/本地向量库）
  - 增量索引（监听文件变更）

## 最小可运行版本（MVP）实施步骤

1. `yo code` 创建 TypeScript 扩展模板。
2. 在 `package.json` 注册命令与侧边栏 view。
3. 实现 `ChatViewProvider`（先做纯文本对话）。
4. 接入一个 LLM Provider（OpenAI 或兼容 API）。
5. 增加 `inlineEdit` 命令（仅处理选中代码）。
6. 增加 `CodeActionProvider` 触发 Explain/Fix。
7. 增加配置项：`apiBase`, `apiKey`, `model`, `temperature`。
8. 打包测试：`vsce package` + 本地安装 `.vsix`。

## package.json 关键点示例

```json
{
  "activationEvents": [
    "onCommand:cursorIdle.openChat",
    "onCommand:cursorIdle.inlineEdit",
    "onView:cursorIdle.chatView"
  ],
  "contributes": {
    "commands": [
      { "command": "cursorIdle.openChat", "title": "Cursor IDLE: Open Chat" },
      { "command": "cursorIdle.inlineEdit", "title": "Cursor IDLE: Inline Edit" }
    ],
    "viewsContainers": {
      "activitybar": [
        { "id": "cursorIdle", "title": "Cursor IDLE", "icon": "media/icon.svg" }
      ]
    },
    "views": {
      "cursorIdle": [
        { "id": "cursorIdle.chatView", "name": "AI Chat" }
      ]
    },
    "configuration": {
      "title": "Cursor IDLE",
      "properties": {
        "cursorIdle.apiKey": {
          "type": "string",
          "default": "",
          "description": "LLM API Key"
        }
      }
    }
  }
}
```

## extension.ts 示例骨架

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cursorIdle.openChat', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.cursorIdle');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cursorIdle.inlineEdit', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showInformationMessage('请先选择一段代码。');
        return;
      }
      // TODO: 调用 LLM 并应用结果
      vscode.window.showInformationMessage('Inline Edit MVP: 已捕获选中代码。');
    })
  );
}

export function deactivate() {}
```

## 关键体验细节（像 Cursor 的感觉）

- 响应速度：优先流式输出（Streaming）并尽早渲染。
- 可控改动：展示 diff 预览，允许 Accept / Reject。
- 上下文透明：让用户知道本次请求引用了哪些文件。
- 低打扰：默认快捷键 + 右键菜单，不强侵入编辑流程。

## 后续增强路线

- 多文件 Agent（自动规划并执行跨文件修改）
- Terminal Agent（执行命令并回填结果）
- 语义搜索与记忆（项目长期上下文）
- 团队级策略（Prompt 模板、代码规范守卫）

---

如果你愿意，我下一步可以直接给你：
1) 一份可运行的 `package.json` 完整配置；
2) `extension.ts + chatViewProvider.ts` 的最小实现代码；
3) 一键启动调试步骤（F5 启动 Extension Development Host）。
