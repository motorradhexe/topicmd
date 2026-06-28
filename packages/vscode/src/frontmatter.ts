/**
 * Pure frontmatter intelligence: schema-driven completions and validation
 * diagnostics for a Markdown buffer. No VS Code dependency, fully unit-testable;
 * the providers in intelligence.ts are thin glue.
 */
import { parseTopic, validateTopic, type Diagnostic, type DocsSchema } from '@topicmd/core';

export interface CompletionContext {
  kind: 'topic_type' | 'dimension-value';
  dimensionId?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Is `lineIndex` inside a `dimensions:` mapping block (by indentation)? */
function isUnderDimensions(lines: string[], lineIndex: number, indent: number): boolean {
  for (let i = lineIndex - 1; i >= 0; i--) {
    const line = lines[i] ?? '';
    if (line.trim() === '') continue;
    const lineIndent = line.length - line.trimStart().length;
    if (lineIndent >= indent) continue; // still inside a deeper/sibling entry
    return /^\s*dimensions:\s*$/.test(line);
  }
  return false;
}

/** Determine what, if anything, the cursor line should complete. */
export function detectContext(
  schema: DocsSchema,
  lines: string[],
  lineIndex: number,
): CompletionContext | null {
  const line = lines[lineIndex] ?? '';

  if (/^\s*topic_type:\s*\S*$/.test(line)) return { kind: 'topic_type' };

  const match = /^(\s*)([A-Za-z0-9_]+):\s*\S*$/.exec(line);
  if (match) {
    const indent = match[1]!.length;
    const dimensionId = match[2]!;
    if (
      indent > 0 &&
      isUnderDimensions(lines, lineIndex, indent) &&
      schema.dimensions.some((d) => d.id === dimensionId)
    ) {
      return { kind: 'dimension-value', dimensionId };
    }
  }
  return null;
}

/** Candidate completion values for the cursor line (empty if not applicable). */
export function getCompletions(schema: DocsSchema, lines: string[], lineIndex: number): string[] {
  const ctx = detectContext(schema, lines, lineIndex);
  if (!ctx) return [];
  if (ctx.kind === 'topic_type') return Object.keys(schema.topic_types).sort();
  const dimension = schema.dimensions.find((d) => d.id === ctx.dimensionId);
  return dimension ? [...dimension.values] : [];
}

/** Diagnostic codes relevant to frontmatter (excludes body contracts/warnings). */
const FRONTMATTER_CODES = new Set([
  'missing-required-field',
  'missing-topic-type',
  'unknown-topic-type',
  'unknown-dimension-id',
  'unknown-dimension-value',
]);

export interface FrontmatterDiagnostic {
  /** 0-based line to attach the diagnostic to. */
  line: number;
  message: string;
  code: string;
  severity: Diagnostic['severity'];
}

/** Find the line declaring the first quoted name in a message (else line 0). */
function locateLine(lines: string[], message: string): number {
  const quoted = /"([^"]+)"/.exec(message);
  if (quoted) {
    const re = new RegExp(`^\\s*${escapeRegExp(quoted[1]!)}\\s*:`);
    const idx = lines.findIndex((l) => re.test(l));
    if (idx >= 0) return idx;
  }
  return 0;
}

/**
 * Validate a buffer's frontmatter against the schema and return diagnostics
 * with a best-effort line for each. Reuses core's validator as the single rule
 * source. Returns `[]` for content with no/invalid frontmatter.
 */
export function computeDiagnostics(schema: DocsSchema, text: string): FrontmatterDiagnostic[] {
  let topic;
  try {
    topic = parseTopic({ path: 'buffer.md', content: text });
  } catch {
    return [];
  }
  if (typeof topic.frontmatter.topic_type === 'undefined' && Object.keys(topic.frontmatter).length === 0) {
    return []; // no frontmatter to judge
  }
  const lines = text.split(/\r?\n/);
  return validateTopic(topic, schema)
    .filter((d) => FRONTMATTER_CODES.has(d.code))
    .map((d) => ({
      line: locateLine(lines, d.message),
      message: d.message,
      code: d.code,
      severity: d.severity,
    }));
}
