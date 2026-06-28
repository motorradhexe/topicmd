/**
 * Type definitions for content units: topics and fragments.
 *
 * Purely declarative. Parsing (#5) and fragment resolution (#6) produce these
 * shapes; this module only describes them.
 */

/**
 * A dimension assignment in topic frontmatter, keyed by dimension id. A single
 * value or a list of values. Dimension ids and values are validated against the
 * schema (#7) — core hardcodes none of them.
 */
export type DimensionAssignment = Record<string, string | string[]>;

/**
 * Topic frontmatter. The known fields below are the conventional ones; any
 * topic type may require or allow additional project-specific fields, so an
 * open index signature is permitted. Per-type required/optional enforcement is
 * the validator's job (#7), not the type system's.
 */
export interface TopicFrontmatter {
  title: string;
  /** Topic type id — must match a key in `DocsSchema.topic_types`. */
  topic_type: string;
  description?: string;
  dimensions?: DimensionAssignment;
  /** Ids/paths of related topics. */
  related?: string[];
  tags?: string[];
  /** Required by some types (e.g. `reference`). */
  version?: string;
  /** Project-specific fields defined by topic types. */
  [key: string]: unknown;
}

/**
 * A parsed, navigable content unit. The canonical (source-language) file and
 * each locale variant parse to their own `Topic`; they share an `id`.
 */
export interface Topic {
  /** Repo-relative path to the source file. */
  path: string;
  /**
   * Stable identifier, derived from the path without extension and locale
   * suffix (e.g. `concepts/what-is-alpha`). Shared across locale variants.
   */
  id: string;
  /** Locale of this file. Canonical files use `DocsSchema.i18n.default`. */
  locale: string;
  /** True when this file is a locale variant (suffixed), not the canonical. */
  isVariant: boolean;
  frontmatter: TopicFrontmatter;
  /** Markdown body with frontmatter stripped. */
  body: string;
}

/**
 * A reusable content snippet. Fragments are never navigable and never appear as
 * standalone items in the index; the index tracks which topics include them.
 */
export interface Fragment {
  /** Repo-relative path to the fragment file. */
  path: string;
  /** Stable identifier, typically the path relative to the fragments root. */
  id: string;
  /** Markdown body with frontmatter stripped, if any. */
  body: string;
}
