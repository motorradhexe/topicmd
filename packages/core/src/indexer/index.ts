/** Public surface of the indexer. */
export {
  buildIndex,
  indexProject,
  serializeIndex,
  loadVariables,
} from './build.js';
export type { BuildIndexInput, IndexProjectOptions } from './build.js';
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
