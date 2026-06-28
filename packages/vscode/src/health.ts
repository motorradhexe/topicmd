/**
 * Pure derivation of Topic-Health categories from a `DocsIndex`. No VS Code
 * dependency and no parsing — it only reads what `topicmd index` already wrote,
 * so it is fully unit-testable. The thin VS Code glue lives in extension.ts.
 */
import type { DocsIndex } from '@topicmd/core';

export interface HealthEntry {
  label: string;
  /** Secondary text (file, profile, reason). */
  detail?: string;
}

export interface HealthCategory {
  id: string;
  title: string;
  entries: HealthEntry[];
}

/** Codes that represent a missing required field on a topic. */
const MISSING_FIELD_CODES = new Set(['missing-required-field', 'missing-topic-type']);

/** Build the four health categories shown in the panel, purely from the index. */
export function collectHealth(index: DocsIndex): HealthCategory[] {
  const missingFields: HealthEntry[] = index.diagnostics
    .filter((d) => MISSING_FIELD_CODES.has(d.code))
    .map((d) => ({ label: d.message, detail: d.file }));

  const orphans: HealthEntry[] = index.relationships.orphans.map((id) => ({ label: id }));

  const gaps: HealthEntry[] = index.coverage.gaps.map((g) => ({
    label: g.missing,
    detail: g.profile,
  }));

  const stale: HealthEntry[] = index.stale_translations.map((s) => ({
    label: `${s.topic} [${s.locale}]`,
    detail: s.reason,
  }));

  return [
    { id: 'missing-fields', title: 'Missing fields', entries: missingFields },
    { id: 'orphans', title: 'Orphans', entries: orphans },
    { id: 'coverage-gaps', title: 'Coverage gaps', entries: gaps },
    { id: 'stale-translations', title: 'Stale translations', entries: stale },
  ];
}

/** Total number of health findings across all categories. */
export function totalFindings(categories: HealthCategory[]): number {
  return categories.reduce((sum, c) => sum + c.entries.length, 0);
}
