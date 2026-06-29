/**
 * Shared CLI helpers: config resolution and topic discovery. Topic discovery is
 * delegated to core's `discoverTopics`, the single discovery path that
 * `indexProject` also uses, so `validate`, `index`, `nav`, and `i18n` always see
 * the same set of topics.
 */
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import {
  discoverTopics,
  loadSchema,
  type DocsSchema,
  type ParsedTopic,
} from '@topicmd/core';

export interface CommonOptions {
  schema?: string;
  root?: string;
  content?: string;
}

export interface ResolvedConfig {
  schemaPath: string;
  rootDir: string;
  contentDir: string;
  varsPath: string | undefined;
  schema: DocsSchema;
}

function abs(path: string, base: string): string {
  return isAbsolute(path) ? path : resolve(base, path);
}

/** Resolve schema/root/content paths and load the schema. */
export function resolveConfig(options: CommonOptions): ResolvedConfig {
  const cwd = process.cwd();
  const schemaPath = abs(options.schema ?? 'docs.schema.yaml', cwd);
  const rootDir = options.root ? abs(options.root, cwd) : dirname(schemaPath);
  const contentDir = options.content ? abs(options.content, cwd) : rootDir;
  const varsCandidate = join(rootDir, 'docs.vars.yaml');
  return {
    schemaPath,
    rootDir,
    contentDir,
    varsPath: existsSync(varsCandidate) ? varsCandidate : undefined,
    schema: loadSchema(schemaPath),
  };
}

/** Discover and parse all topics under the content dir (fragments excluded). */
export function parseTopics(config: ResolvedConfig): ParsedTopic[] {
  return discoverTopics({
    rootDir: config.rootDir,
    schema: config.schema,
    contentDir: config.contentDir,
  });
}
