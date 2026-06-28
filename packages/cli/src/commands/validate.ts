/** `topicmd validate` — validate topics against the schema; exit 1 on errors. */
import { validateTopics, type Diagnostic } from '@topicmd/core';
import { parseTopics, resolveConfig, type CommonOptions } from '../discover.js';

export interface ValidateResult {
  exitCode: number;
  lines: string[];
}

function formatDiagnostic(d: Diagnostic): string {
  const where = d.file ? ` ${d.file}` : '';
  return `${d.severity.toUpperCase()} [${d.code}]${where}: ${d.message}`;
}

/** Pure runner: returns an exit code and the output lines (for testing). */
export function runValidate(options: CommonOptions): ValidateResult {
  const config = resolveConfig(options);
  const topics = parseTopics(config);
  const result = validateTopics(topics, config.schema);

  const lines = result.diagnostics.map(formatDiagnostic);
  const errors = result.diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = result.diagnostics.length - errors;

  if (result.ok) {
    lines.push(`✓ ${topics.length} topics valid (${warnings} warnings)`);
  } else {
    lines.push(`✗ ${errors} errors, ${warnings} warnings in ${topics.length} topics`);
  }

  return { exitCode: result.ok ? 0 : 1, lines };
}

/** CLI action: print and set the process exit code. */
export function validateAction(options: CommonOptions): void {
  const { exitCode, lines } = runValidate(options);
  const sink = exitCode === 0 ? console.log : console.error;
  for (const line of lines) sink(line);
  process.exitCode = exitCode;
}
