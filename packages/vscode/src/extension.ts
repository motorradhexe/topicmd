/**
 * topicmd VS Code extension entry. Contributes a "Topic Health" tree view that
 * reads `docs.index.json` from the workspace and renders orphans, missing
 * fields, coverage gaps, and stale translations. All derivation is delegated to
 * the pure `collectHealth` (health.ts); this file is only VS Code glue.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as vscode from 'vscode';
import type { DocsIndex } from '@topicmd/core';
import { collectHealth, type HealthCategory, type HealthEntry } from './health.js';

type TreeNode =
  | { kind: 'category'; category: HealthCategory }
  | { kind: 'entry'; entry: HealthEntry };

const INDEX_FILE = 'docs.index.json';

class TopicHealthProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly emitter = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  constructor(private readonly workspaceRoot: string | undefined) {}

  refresh(): void {
    this.emitter.fire(undefined);
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    if (node.kind === 'category') {
      const item = new vscode.TreeItem(
        `${node.category.title} (${node.category.entries.length})`,
        node.category.entries.length > 0
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
      );
      item.contextValue = node.category.id;
      return item;
    }
    const item = new vscode.TreeItem(node.entry.label, vscode.TreeItemCollapsibleState.None);
    item.description = node.entry.detail;
    item.tooltip = node.entry.detail;
    return item;
  }

  getChildren(node?: TreeNode): TreeNode[] {
    if (!node) {
      const index = this.loadIndex();
      if (!index) return [];
      return collectHealth(index).map((category) => ({ kind: 'category', category }));
    }
    if (node.kind === 'category') {
      return node.category.entries.map((entry) => ({ kind: 'entry', entry }));
    }
    return [];
  }

  private loadIndex(): DocsIndex | undefined {
    if (!this.workspaceRoot) return undefined;
    const path = join(this.workspaceRoot, INDEX_FILE);
    if (!existsSync(path)) {
      void vscode.window.showInformationMessage(
        `topicmd: no ${INDEX_FILE} found. Run "topicmd index" first.`,
      );
      return undefined;
    }
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as DocsIndex;
    } catch {
      void vscode.window.showErrorMessage(`topicmd: failed to read ${INDEX_FILE}.`);
      return undefined;
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const provider = new TopicHealthProvider(workspaceRoot);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('topicmdHealth', provider),
    vscode.commands.registerCommand('topicmd.refreshHealth', () => provider.refresh()),
  );

  // Auto-refresh when the index changes.
  const watcher = vscode.workspace.createFileSystemWatcher(`**/${INDEX_FILE}`);
  watcher.onDidChange(() => provider.refresh());
  watcher.onDidCreate(() => provider.refresh());
  watcher.onDidDelete(() => provider.refresh());
  context.subscriptions.push(watcher);
}

export function deactivate(): void {
  // Nothing to clean up beyond context.subscriptions.
}
