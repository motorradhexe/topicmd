/**
 * VS Code glue for Quick Scaffold (#12): a command that picks a topic type,
 * prompts for a title, and opens a new editor with schema-valid frontmatter.
 * The markdown is produced by core's `scaffoldTopic` — the same logic the CLI
 * `scaffold` command uses.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as vscode from 'vscode';
import { loadSchema, scaffoldTopic } from '@topicmd/core';

/** Register the `topicmd.scaffoldTopic` command. */
export function registerScaffoldCommand(
  context: vscode.ExtensionContext,
  workspaceRoot: string | undefined,
): void {
  const command = vscode.commands.registerCommand('topicmd.scaffoldTopic', async () => {
    if (!workspaceRoot) {
      void vscode.window.showErrorMessage('topicmd: open a workspace folder first.');
      return;
    }
    const schemaPath = join(workspaceRoot, 'docs.schema.yaml');
    if (!existsSync(schemaPath)) {
      void vscode.window.showErrorMessage('topicmd: no docs.schema.yaml found in the workspace.');
      return;
    }

    let schema;
    try {
      schema = loadSchema(schemaPath);
    } catch (err) {
      void vscode.window.showErrorMessage(
        `topicmd: could not load docs.schema.yaml — ${(err as Error).message}`,
      );
      return;
    }

    const type = await vscode.window.showQuickPick(Object.keys(schema.topic_types).sort(), {
      placeHolder: 'Topic type',
    });
    if (!type) return;

    const title = await vscode.window.showInputBox({
      prompt: `Title for the new ${type}`,
      value: 'Untitled',
    });
    if (title === undefined) return;

    const markdown = scaffoldTopic(type, schema, { title });
    const document = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: markdown,
    });
    await vscode.window.showTextDocument(document);
  });

  context.subscriptions.push(command);
}
