/**
 * VS Code glue for frontmatter intelligence: a completion provider and a
 * diagnostics updater, both driven by the pure helpers in frontmatter.ts.
 */
import * as vscode from 'vscode';
import type { DocsSchema } from '@topicmd/core';
import { computeDiagnostics, getCompletions, type FrontmatterDiagnostic } from './frontmatter.js';
import { keyedDebounce } from './debounce.js';

/** Idle delay before re-validating a buffer after edits. */
const DIAGNOSTICS_DEBOUNCE_MS = 300;

const LANGUAGES = ['markdown', 'mdx'];

function toVsSeverity(severity: FrontmatterDiagnostic['severity']): vscode.DiagnosticSeverity {
  if (severity === 'error') return vscode.DiagnosticSeverity.Error;
  if (severity === 'warning') return vscode.DiagnosticSeverity.Warning;
  return vscode.DiagnosticSeverity.Information;
}

/** Register schema-driven completion and diagnostics for Markdown buffers. */
export function registerFrontmatterIntelligence(
  context: vscode.ExtensionContext,
  schema: DocsSchema,
): void {
  const completion = vscode.languages.registerCompletionItemProvider(
    LANGUAGES.map((language) => ({ language })),
    {
      provideCompletionItems(document, position) {
        const lines = document.getText().split(/\r?\n/);
        return getCompletions(schema, lines, position.line).map(
          (value) => new vscode.CompletionItem(value, vscode.CompletionItemKind.Value),
        );
      },
    },
    ':',
    ' ',
  );

  const collection = vscode.languages.createDiagnosticCollection('topicmd');

  const refresh = (document: vscode.TextDocument): void => {
    if (!LANGUAGES.includes(document.languageId)) return;
    const diagnostics = computeDiagnostics(schema, document.getText()).map((d) => {
      const range = new vscode.Range(d.line, 0, d.line, Number.MAX_SAFE_INTEGER);
      const diagnostic = new vscode.Diagnostic(range, d.message, toVsSeverity(d.severity));
      diagnostic.code = d.code;
      diagnostic.source = 'topicmd';
      return diagnostic;
    });
    collection.set(document.uri, diagnostics);
  };

  // Re-validation on every keystroke is wasteful (a full parse + validate per
  // change); debounce edits per document. Opens and the initial scan run eagerly.
  const debounced = keyedDebounce(refresh, DIAGNOSTICS_DEBOUNCE_MS);

  context.subscriptions.push(
    completion,
    collection,
    { dispose: () => debounced.cancelAll() },
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) =>
      debounced.run(e.document.uri.toString(), e.document),
    ),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      debounced.cancel(doc.uri.toString());
      collection.delete(doc.uri);
    }),
  );
  vscode.workspace.textDocuments.forEach(refresh);
}
