import * as vscode from 'vscode';

export async function inlineEdit(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found.');
    return;
  }

  const selected = editor.document.getText(editor.selection);
  if (!selected.trim()) {
    vscode.window.showInformationMessage('请先选择要修改的代码片段。');
    return;
  }

  const replacement = `/* AI suggestion (MVP placeholder) */\n${selected}`;
  await editor.edit((builder) => {
    builder.replace(editor.selection, replacement);
  });

  vscode.window.showInformationMessage('Inline Edit 已应用（MVP 占位实现）。');
}
