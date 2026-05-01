import * as vscode from 'vscode';
import { ChatViewProvider } from './chat/chatViewProvider';
import { inlineEdit } from './inline/inlineEdit';

export function activate(context: vscode.ExtensionContext): void {
  const chatProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cursorIdle.chatView', chatProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cursorIdle.openChat', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.cursorIdle');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cursorIdle.inlineEdit', inlineEdit)
  );
}

export function deactivate(): void {}
