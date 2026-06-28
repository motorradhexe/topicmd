/**
 * Diagnostic and validation result types, shared by the schema loader (#4) and
 * the topic/contract validator (#7). Purely declarative.
 */

/** Severity of a diagnostic. Only `error` makes a `ValidationResult` fail. */
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/** A single validation finding, addressable for CI output and editor display. */
export interface Diagnostic {
  severity: DiagnosticSeverity;
  /**
   * Stable, machine-readable identifier for the rule that produced this finding
   * (e.g. `missing-required-field`, `unknown-dimension-value`). Useful for
   * filtering and suppression.
   */
  code: string;
  /** Human-readable description. */
  message: string;
  /** Repo-relative path of the file the finding relates to, if any. */
  file?: string;
  /** 1-based line number for editor integration, if known. */
  line?: number;
  /** 1-based column number for editor integration, if known. */
  column?: number;
}

/**
 * The outcome of a validation pass. `ok` is false when any diagnostic has
 * severity `error` — this drives the CLI exit code (1 on failure).
 */
export interface ValidationResult {
  ok: boolean;
  diagnostics: Diagnostic[];
}
