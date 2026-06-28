/**
 * Project-wide variables: load `docs.vars.yaml` and substitute `{{vars.*}}`
 * placeholders in topic/fragment content.
 *
 * Placeholders use dot notation for nested keys: `{{vars.product.name}}`. An
 * unknown variable is reported as a diagnostic (never silently ignored) and the
 * placeholder is left intact so the problem is visible in the output.
 */
import { readFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';
import type { Diagnostic } from '../types/index.js';

/** Matches `{{vars.<dotted.path>}}` with optional surrounding whitespace. */
const VAR_RE = /\{\{\s*vars\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)\s*\}\}/g;

/** Load and return the `vars` map from a `docs.vars.yaml` file. */
export function loadVariables(path: string): Record<string, unknown> {
  const raw = parseYaml(readFileSync(path, 'utf8')) as
    | { vars?: Record<string, unknown> }
    | null;
  return raw?.vars ?? {};
}

function getByPath(variables: Record<string, unknown>, path: string): unknown {
  let current: unknown = variables;
  for (const key of path.split('.')) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export interface ResolveVariablesOptions {
  /** File path recorded on diagnostics, for reporting. */
  file?: string;
}

export interface VariableResolution {
  content: string;
  diagnostics: Diagnostic[];
}

/**
 * Substitute every `{{vars.*}}` placeholder in `content`. Unknown variables and
 * non-scalar values produce diagnostics and leave the placeholder unchanged.
 */
export function resolveVariables(
  content: string,
  variables: Record<string, unknown>,
  options: ResolveVariablesOptions = {},
): VariableResolution {
  const diagnostics: Diagnostic[] = [];
  const resolved = content.replace(VAR_RE, (raw, path: string) => {
    const value = getByPath(variables, path);
    if (value === undefined) {
      diagnostics.push({
        severity: 'error',
        code: 'unknown-variable',
        message: `Unknown variable "vars.${path}"`,
        file: options.file,
      });
      return raw;
    }
    if (value === null || typeof value === 'object') {
      diagnostics.push({
        severity: 'error',
        code: 'non-scalar-variable',
        message: `Variable "vars.${path}" is not a scalar value`,
        file: options.file,
      });
      return raw;
    }
    return String(value);
  });
  return { content: resolved, diagnostics };
}
