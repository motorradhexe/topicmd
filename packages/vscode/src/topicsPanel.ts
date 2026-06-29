/**
 * The Topics panel: a Webview view that manages topics by meaning (type,
 * dimensions, profiles, locale, tags) instead of by folder structure. The host
 * side here builds an in-memory index from the workspace, ships a view-model to
 * the webview, and handles the management actions (open, edit metadata, create,
 * create translation) by writing files through core helpers.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as vscode from 'vscode';
import {
  indexProject,
  loadSchema,
  loadVariables,
  parseTopic,
  scaffoldTopic,
  updateFrontmatter,
  type DocsSchema,
} from '@topicmd/core';
import { buildTopicsModel, type TopicsModel } from './topicsModel.js';

const SCHEMA_FILE = 'docs.schema.yaml';

type LoadResult =
  | { ok: true; model: TopicsModel; schema: DocsSchema }
  | { ok: false; message: string };

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return [value];
  return [];
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

function nonce(): string {
  let s = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export class TopicsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'topicmdTopics';
  private view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly workspaceRoot: string | undefined,
  ) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    view.webview.html = this.html(view.webview);
    view.webview.onDidReceiveMessage((msg) => void this.onMessage(msg));
    view.onDidChangeVisibility(() => {
      if (view.visible) this.refresh();
    });
    this.refresh();
  }

  refresh(): void {
    if (!this.view) return;
    const result = this.load();
    this.view.webview.postMessage(
      result.ok
        ? { type: 'model', model: result.model }
        : { type: 'error', message: result.message },
    );
  }

  private load(): LoadResult {
    if (!this.workspaceRoot) {
      return { ok: false, message: 'Open a workspace folder to manage topics.' };
    }
    const schemaPath = join(this.workspaceRoot, SCHEMA_FILE);
    if (!existsSync(schemaPath)) {
      return { ok: false, message: `No ${SCHEMA_FILE} found in the workspace root.` };
    }
    try {
      const schema = loadSchema(schemaPath);
      const varsPath = join(this.workspaceRoot, 'docs.vars.yaml');
      const index = indexProject({
        rootDir: this.workspaceRoot,
        schema,
        contentDir: this.workspaceRoot,
        variables: existsSync(varsPath) ? loadVariables(varsPath) : {},
      });
      return { ok: true, model: buildTopicsModel(index, schema), schema };
    } catch (err) {
      return { ok: false, message: `Could not load project: ${(err as Error).message}` };
    }
  }

  private abs(relPath: string): string {
    return join(this.workspaceRoot!, relPath);
  }

  private async open(relPath: string): Promise<void> {
    await vscode.window.showTextDocument(vscode.Uri.file(this.abs(relPath)));
  }

  private async onMessage(msg: { type: string; [k: string]: unknown }): Promise<void> {
    switch (msg.type) {
      case 'ready':
      case 'refresh':
        return this.refresh();
      case 'open':
        return this.open(String(msg.path));
      case 'editMeta':
        return this.editMeta(String(msg.path));
      case 'create':
        return this.createTopic();
      case 'createVariant':
        return this.createVariant(String(msg.path), String(msg.locale));
    }
  }

  private async editMeta(relPath: string): Promise<void> {
    const loaded = this.load();
    if (!loaded.ok) return;
    const { schema } = loaded;
    const absPath = this.abs(relPath);
    const content = readFileSync(absPath, 'utf8');
    const fm = parseTopic({ path: relPath, content }).frontmatter;

    type EditPick = vscode.QuickPickItem &
      ({ action: 'dim'; id: string } | { action: 'tags' } | { action: 'title' });
    const items: EditPick[] = [
      ...schema.dimensions.map(
        (d): EditPick => ({
          label: `$(symbol-enum) ${d.label}`,
          description: d.id,
          action: 'dim',
          id: d.id,
        }),
      ),
      { label: '$(tag) Tags', action: 'tags' },
      { label: '$(pencil) Title', action: 'title' },
    ];
    const chosen = await vscode.window.showQuickPick(items, {
      placeHolder: `Edit metadata of ${relPath}`,
    });
    if (!chosen) return;

    if (chosen.action === 'title') {
      const title = await vscode.window.showInputBox({
        prompt: 'Title',
        value: typeof fm.title === 'string' ? fm.title : '',
      });
      if (title === undefined) return;
      writeFileSync(absPath, updateFrontmatter(content, { title }));
    } else if (chosen.action === 'tags') {
      const tags = await vscode.window.showInputBox({
        prompt: 'Tags (comma-separated)',
        value: toArray(fm.tags).join(', '),
      });
      if (tags === undefined) return;
      const list = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      writeFileSync(absPath, updateFrontmatter(content, { tags: list.length ? list : undefined }));
    } else {
      const dim = schema.dimensions.find((d) => d.id === chosen.id);
      if (!dim) return;
      const current = new Set(toArray((fm.dimensions ?? {})[chosen.id]));
      const picks = await vscode.window.showQuickPick(
        dim.values.map((v) => ({ label: v, picked: current.has(v) })),
        { canPickMany: true, placeHolder: `Values for ${dim.label}` },
      );
      if (!picks) return;
      const nextDims: Record<string, unknown> = { ...(fm.dimensions ?? {}) };
      if (picks.length === 0) delete nextDims[chosen.id];
      else nextDims[chosen.id] = picks.map((p) => p.label);
      writeFileSync(
        absPath,
        updateFrontmatter(content, {
          dimensions: Object.keys(nextDims).length ? nextDims : undefined,
        }),
      );
    }
    this.refresh();
  }

  async createTopic(): Promise<void> {
    const loaded = this.load();
    if (!loaded.ok) {
      void vscode.window.showErrorMessage(`topicmd: ${loaded.message}`);
      return;
    }
    const { schema } = loaded;
    const type = await vscode.window.showQuickPick(Object.keys(schema.topic_types).sort(), {
      placeHolder: 'Topic type',
    });
    if (!type) return;
    const title = await vscode.window.showInputBox({ prompt: `Title for the new ${type}` });
    if (!title) return;
    const relPath = await vscode.window.showInputBox({
      prompt: 'File path (relative to the workspace root)',
      value: `docs/${slugify(title)}.md`,
    });
    if (!relPath) return;
    const absPath = this.abs(relPath);
    if (existsSync(absPath)) {
      void vscode.window.showErrorMessage(`topicmd: ${relPath} already exists.`);
      return;
    }
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, scaffoldTopic(type, schema, { title }));
    await this.open(relPath);
    this.refresh();
  }

  private async createVariant(relPath: string, locale: string): Promise<void> {
    const variantRel = relPath.replace(/\.(md|mdx)$/i, `.${locale}.$1`);
    const variantAbs = this.abs(variantRel);
    if (!existsSync(variantAbs)) {
      // Seed the translation with the source content so the translator edits in place.
      writeFileSync(variantAbs, readFileSync(this.abs(relPath), 'utf8'));
    }
    await this.open(variantRel);
    this.refresh();
  }

  private html(webview: vscode.Webview): string {
    const n = nonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js'),
    );
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${n}'`,
      `font-src ${webview.cspSource}`,
    ].join('; ');
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${STYLES}</style>
  </head>
  <body>
    <div id="app"></div>
    <script nonce="${n}" src="${scriptUri}"></script>
  </body>
</html>`;
  }
}

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); padding: 8px; margin: 0; }
  .toolbar { display: flex; gap: 6px; margin-bottom: 8px; position: sticky; top: 0; background: var(--vscode-sideBar-background); padding-bottom: 6px; z-index: 1; }
  #search { flex: 1; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, transparent); padding: 4px 6px; border-radius: 3px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; }
  button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .facets { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .facet-group { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
  .facet-label { font-size: 0.85em; opacity: 0.7; width: 70px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.03em; }
  .chip { font-size: 0.85em; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--vscode-contrastBorder, var(--vscode-input-border, #8884)); cursor: pointer; background: transparent; color: var(--vscode-foreground); }
  .chip.active { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-color: transparent; }
  .count { opacity: 0.6; font-size: 0.85em; margin: 4px 0 6px; }
  .topic { padding: 6px 4px; border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, #8882); }
  .topic-title { cursor: pointer; font-weight: 600; }
  .topic-title:hover { text-decoration: underline; color: var(--vscode-textLink-foreground); }
  .meta { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-top: 3px; }
  .badge { font-size: 0.75em; padding: 0 6px; border-radius: 8px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .badge.warn { background: var(--vscode-inputValidation-warningBackground, #5a4a00); color: var(--vscode-foreground); }
  .badge.err { background: var(--vscode-inputValidation-errorBackground, #5a1d1d); color: var(--vscode-foreground); }
  .dim { font-size: 0.75em; opacity: 0.8; }
  .actions { display: flex; gap: 8px; margin-top: 3px; }
  .action { font-size: 0.8em; color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; }
  .action:hover { text-decoration: underline; }
  .empty, .error { opacity: 0.7; padding: 12px 4px; }
  .error { color: var(--vscode-errorForeground); }
  .path { font-size: 0.75em; opacity: 0.6; }
  details.gaps { margin: 2px 0 8px; font-size: 0.85em; }
  details.gaps summary { cursor: pointer; opacity: 0.8; }
  details.gaps .gap { opacity: 0.8; padding: 2px 0 2px 12px; }
`;
