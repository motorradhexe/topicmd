/** Public surface of the indexer. */
export {
  buildIndex,
  indexProject,
  discoverTopics,
  walkMarkdown,
  serializeIndex,
  loadVariables,
} from './build.js';
export type {
  BuildIndexInput,
  IndexProjectOptions,
  DiscoverTopicsOptions,
} from './build.js';
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
} from './types.js';
