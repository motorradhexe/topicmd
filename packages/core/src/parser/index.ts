/** Public surface of the topic parser. */
export {
  parseTopic,
  parseTopicFile,
  deriveIdentity,
} from './parse.js';
export type {
  ParsedTopic,
  TopicHeading,
  TopicLink,
  IncludeDirective,
  TopicParserOptions,
} from './parse.js';
