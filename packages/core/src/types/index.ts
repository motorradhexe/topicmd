/**
 * Public type surface of @topicmd/core. Re-exports all declarative types.
 */
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
} from './schema.js';

export type {
  DimensionAssignment,
  TopicFrontmatter,
  Topic,
  Fragment,
} from './topic.js';

export type {
  DiagnosticSeverity,
  Diagnostic,
  ValidationResult,
} from './validation.js';
