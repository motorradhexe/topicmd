/**
 * @topicmd/core — public entry.
 *
 * Exposes the declarative type surface (#2), the schema loader (#4), the topic
 * parser (#5), the fragment resolver (#6), the validator (#7), and the indexer
 * (#8).
 */
export const VERSION = '0.0.0';

export { validateTopic, validateTopics } from './validator/index.js';

export {
  buildIndex,
  indexProject,
  discoverTopics,
  walkMarkdown,
  serializeIndex,
} from './indexer/index.js';
export type {
  DocsIndex,
  IndexedTopic,
  IndexedFragment,
  IndexLink,
  DuplicateGroup,
  IndexRelationships,
  CoverageGap,
  IndexCoverage,
  StaleTranslation,
  BuildIndexInput,
  IndexProjectOptions,
  DiscoverTopicsOptions,
} from './indexer/index.js';

export { loadSchema, parseSchema, SchemaError, docsSchemaZod } from './schema/index.js';

export { scaffoldTopic } from './scaffold/index.js';
export type { ScaffoldTopicOptions } from './scaffold/index.js';

export { buildI18nReport } from './i18n/index.js';
export type { I18nReport, I18nOptions } from './i18n/index.js';

export {
  matchesFilters,
  parseNavManifest,
  loadNavManifest,
  navManifestToObject,
  isTopicNode,
  filterNav,
  generateProfileNavs,
  buildProfilesManifest,
  serializeProfiles,
  serializeNavManifest,
} from './nav/index.js';
export type {
  NavManifest,
  NavNode,
  NavTopicNode,
  NavSectionNode,
  ProfilesManifest,
  ProfileEntry,
} from './nav/index.js';

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

export { loadVariables, resolveVariables } from './variables/index.js';
export type {
  VariableResolution,
  ResolveVariablesOptions,
} from './variables/index.js';

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
