/**
 * Type definitions mirroring `docs.schema.yaml` — the full content model for a
 * topicmd project. These are purely declarative; loading and validation of the
 * raw YAML lives in the Zod schema loader (#4).
 *
 * Core hardcodes no dimension ids, profile ids, or topic types. Projects define
 * their own freely; these types describe the *shape*, not the values.
 */

/** Format block: which Markdown flavour the project uses. */
export interface FormatConfig {
  /** Primary content format. Markdown-first by design. */
  primary: 'markdown';
  /**
   * Opt-in format extensions. Declaring `mdx` activates the remark-mdx parser;
   * otherwise JSX is never parsed.
   */
  extensions?: string[];
}

/** Location of reusable, non-navigable fragment files. */
export interface FragmentsConfig {
  /** Path relative to repo root. Default: `fragments/`. */
  path: string;
}

/**
 * A configurable filter axis. Core knows only the concept "dimension with id,
 * label, values" — never the concrete ids.
 */
export interface Dimension {
  id: string;
  label: string;
  values: string[];
}

/**
 * A filter assignment over dimensions, keyed by dimension id. A single value or
 * a list of accepted values. Partial assignments are valid — unspecified
 * dimensions are unfiltered.
 */
export type DimensionFilters = Record<string, string | string[]>;

/** A named, possibly partial filter combination over dimensions. */
export interface Profile {
  id: string;
  label: string;
  filters: DimensionFilters;
}

/**
 * Structural contract a topic type must satisfy beyond frontmatter fields.
 * Extensible: further contract keys may be added as validators grow.
 */
export interface TopicContract {
  /**
   * Requires the presence of a structural element, e.g. `steps` validates that
   * an `## Steps` heading or an ordered list exists.
   */
  must_contain?: string;
}

/** Required/optional frontmatter fields and structural contract for a type. */
export interface TopicTypeDef {
  /** Frontmatter fields that must be present. */
  required: string[];
  /** Frontmatter fields that may be present. */
  optional?: string[];
  /** Optional structural contract. */
  contract?: TopicContract;
}

/** Locale variant strategy. Currently only filename-suffix variants. */
export type I18nStrategy = 'suffix';

/**
 * Language support as an orthogonal axis — never a filter dimension. Language
 * determines which *variant* of a topic is served, not which topics appear.
 */
export interface I18nConfig {
  /** Source / canonical language (e.g. `en`). */
  default: string;
  /** Additional supported locales (e.g. `[de, fr]`). */
  locales: string[];
  /** How locale variants are encoded. */
  strategy: I18nStrategy;
}

/**
 * The resolved content model for a project — the typed mirror of
 * `docs.schema.yaml` after defaults are applied by the loader (#4).
 *
 * `topic_types` is keyed by topic type id (e.g. `concept`, `task`).
 */
export interface DocsSchema {
  format: FormatConfig;
  fragments: FragmentsConfig;
  dimensions: Dimension[];
  profiles: Profile[];
  topic_types: Record<string, TopicTypeDef>;
  i18n: I18nConfig;
}
