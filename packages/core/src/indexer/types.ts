/**
 * Types for `docs.index.json` — the generated, primary AI-context artifact
 * (design decision 7). Not versioned in git.
 *
 * The indexer (#8) fills topics, fragments, relationships, coverage, terms, and
 * variables. The `i18n_coverage` and `stale_translations` fields are populated
 * separately by the i18n tracker (#16), and `diagnostics` by validation, when
 * the index is built from disk (`indexProject`); the indexer leaves them at
 * their empty defaults so the shape is always complete.
 */
import type { Diagnostic } from '../types/index.js';

export interface IndexedTopic {
  id: string;
  path: string;
  topic_type: string;
  title: string;
  locale: string;
  isVariant: boolean;
  dimensions: Record<string, string[]>;
  tags: string[];
  related: string[];
}

export interface IndexedFragment {
  id: string;
  path: string;
}

/** A directed relationship between two topics (by id). */
export interface IndexLink {
  from: string;
  to: string;
}

/** A set of canonical topics suspected to be duplicates (same title). */
export interface DuplicateGroup {
  title: string;
  topics: string[];
}

export interface IndexRelationships {
  links: IndexLink[];
  /** Canonical topic ids not connected to any other topic via links. */
  orphans: string[];
  duplicates_suspected: DuplicateGroup[];
  /** fragment id → ids of topics that include it. */
  fragment_usage: Record<string, string[]>;
}

/** A profile/topic-type combination that has no matching topic. */
export interface CoverageGap {
  profile: string;
  missing: string;
}

export interface IndexCoverage {
  /** profile id → topic_type → count of matching canonical topics. */
  by_profile: Record<string, Record<string, number>>;
  gaps: CoverageGap[];
}

/** A translation that is stale relative to its source (filled by #16). */
export interface StaleTranslation {
  topic: string;
  locale: string;
  reason: string;
}

export interface DocsIndex {
  topics: IndexedTopic[];
  fragments: IndexedFragment[];
  relationships: IndexRelationships;
  coverage: IndexCoverage;
  /** locale → coverage percentage; filled by the i18n tracker (#16). */
  i18n_coverage: Record<string, string>;
  /** filled by the i18n tracker (#16). */
  stale_translations: StaleTranslation[];
  /** Glossary terms; no term source is modelled yet, so currently empty. */
  terms: string[];
  variables: Record<string, unknown>;
  /**
   * Validation findings, filled by `indexProject` (which already parses every
   * topic). Empty for the pure `buildIndex`. Lets tooling (e.g. the VS Code
   * health panel, #10) surface missing fields without re-parsing.
   */
  diagnostics: Diagnostic[];
}
