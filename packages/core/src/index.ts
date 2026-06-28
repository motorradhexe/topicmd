/**
 * @topicmd/core — public entry.
 *
 * Exposes the declarative type surface (#2), the schema loader (#4), the topic
 * parser (#5), and the fragment resolver (#6). Further runtime exports land in
 * later tasks: validator (#7), indexer (#8), etc.
 */
export const VERSION = '0.0.0';

export { loadSchema, parseSchema, SchemaError, docsSchemaZod } from './schema/index.js';

export { parseTopic, parseTopicFile, deriveIdentity } from './parser/index.js';
export type {
  ParsedTopic,
  TopicHeading,
  TopicLink,
  IncludeDirective,
  TopicParserOptions,
} from './parser/index.js';

export { resolveFragments, resolveFragmentsInFile } from './fragments/index.js';
export type {
  FragmentResolution,
  FragmentResolverOptions,
} from './fragments/index.js';

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
