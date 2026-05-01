import * as vscode from 'vscode';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Cursor IDLE</title></head>
<body>
  <h3>Cursor IDLE Chat (MVP)</h3>
  <p>聊天面板已加载。下一步可接入流式 LLM。</p>
</body>
</html>`;
  }
}
