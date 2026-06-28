/**
 * @topicmd/core — public entry.
 *
 * Exposes the declarative type surface (#2) and the schema loader (#4). Further
 * runtime exports land in later tasks: topic parser (#5), fragment resolver
 * (#6), validator (#7), indexer (#8), etc.
 */
export const VERSION = '0.0.0';

export { loadSchema, parseSchema, SchemaError, docsSchemaZod } from './schema/index.js';

export type {
  FormatConfig,
  FragmentsConfig,
  Dimension,
  DimensionFilters,
  Profile,
  TopicContract,
  TopicTypeDef,
  I18nStrategy,
  I18nConfig,
  DocsSchema,
  DimensionAssignment,
  TopicFrontmatter,
  Topic,
  Fragment,
  DiagnosticSeverity,
  Diagnostic,
  ValidationResult,
} from './types/index.js';
