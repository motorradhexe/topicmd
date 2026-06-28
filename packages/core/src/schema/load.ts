/**
 * Loading and validation of `docs.schema.yaml`. Produces a typed, normalized
 * `DocsSchema` (#2) or throws a `SchemaError` with actionable messages.
 */
import { readFileSync } from 'node:fs';
import { load as parseYaml, YAMLException } from 'js-yaml';
import { z } from 'zod';
import type { DocsSchema } from '../types/index.js';
import { docsSchemaZod } from './schema.js';

/** Thrown when a schema file cannot be read, parsed, or validated. */
export class SchemaError extends Error {
  /** One human-readable string per validation issue (empty for I/O errors). */
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    return `${path}: ${issue.message}`;
  });
}

/**
 * Parse and validate schema YAML from a string.
 *
 * @param yamlText raw `docs.schema.yaml` contents
 * @param source label used in error messages (e.g. the file path)
 */
export function parseSchema(yamlText: string, source = '<input>'): DocsSchema {
  let raw: unknown;
  try {
    raw = parseYaml(yamlText);
  } catch (err) {
    if (err instanceof YAMLException) {
      throw new SchemaError(`Invalid YAML in ${source}: ${err.message}`);
    }
    throw err;
  }

  const result = docsSchemaZod.safeParse(raw);
  if (!result.success) {
    const issues = formatIssues(result.error);
    throw new SchemaError(
      `Invalid schema in ${source}:\n  - ${issues.join('\n  - ')}`,
      issues,
    );
  }
  return result.data;
}

/** Read, parse, and validate a `docs.schema.yaml` file from disk. */
export function loadSchema(path: string): DocsSchema {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    throw new SchemaError(`Cannot read schema file: ${path}`);
  }
  return parseSchema(text, path);
}
