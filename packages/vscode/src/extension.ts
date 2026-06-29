/**
 * topicmd VS Code extension entry. Its centerpiece is the faceted "Topics" panel
 * (topicsPanel.ts): tree-free topic management by meaning, with an integrated
 * health summary. It also contributes schema-driven frontmatter completion and
 * diagnostics (intelligence.ts) and a Quick Scaffold command (scaffoldCommand.ts).
 * All logic lives in the pure helpers / core; this file is only glue.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as vscode from 'vscode';
import { loadSchema } from '@topicmd/core';
import { registerFrontmatterIntelligence } from './intelligence.js';
import { registerScaffoldCommand } from './scaffoldCommand.js';
import { TopicsViewProvider } from './topicsPanel.js';
import { debounce } from './debounce.js';

/** Coalesce window for content edits that affect the Topics panel. */
const TOPICS_REFRESH_DEBOUNCE_MS = 600;

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  // Topics panel: faceted, tree-free topic management with integrated health.
  const topics = new TopicsViewProvider(context, workspaceRoot);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TopicsViewProvider.viewId, topics, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand('topicmd.refreshTopics', () => topics.refresh()),
    vscode.commands.registerCommand('topicmd.newTopic', () => void topics.createTopic()),
  );

  // Refresh the Topics panel when content or the schema changes (coalesced).
  const topicsRefresh = debounce(() => topics.refresh(), TOPICS_REFRESH_DEBOUNCE_MS);
  const contentWatcher = vscode.workspace.createFileSystemWatcher('**/*.{md,mdx,yaml,yml}');
  contentWatcher.onDidChange(() => topicsRefresh.run());
  contentWatcher.onDidCreate(() => topicsRefresh.run());
  contentWatcher.onDidDelete(() => topicsRefresh.run());
  context.subscriptions.push(contentWatcher, { dispose: () => topicsRefresh.cancel() });

  // Quick Scaffold (#12): create a new topic from a topic type.
  registerScaffoldCommand(context, workspaceRoot);

  // Frontmatter intelligence (#11): completion + diagnostics, when a schema exists.
  if (workspaceRoot) {
    const schemaPath = join(workspaceRoot, 'docs.schema.yaml');
    if (existsSync(schemaPath)) {
      try {
        registerFrontmatterIntelligence(context, loadSchema(schemaPath));
      } catch {
        void vscode.window.showWarningMessage(
          'topicmd: could not load docs.schema.yaml; frontmatter intelligence disabled.',
        );
      }
    }
  }
}

export function deactivate(): void {
  // Nothing to clean up beyond context.subscriptions.
}
