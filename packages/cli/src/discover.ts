/**
 * Shared CLI helpers: config resolution and topic discovery. Mirrors the
 * discovery `indexProject` performs in core, so `validate` and `index` see the
 * same set of topics.
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import {
  loadSchema,
  parseTopicFile,
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

/** Recursively collect *.md/*.mdx files under `dir`, excluding given paths. */
export function walkMarkdown(dir: string, excludeAbs: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (excludeAbs.some((ex) => path === ex || path.startsWith(ex + sep))) continue;
    if (entry.isDirectory()) out.push(...walkMarkdown(path, excludeAbs));
    else if (/\.(md|mdx)$/i.test(entry.name)) out.push(path);
  }
  return out;
}

/** Discover and parse all topics under the content dir (fragments excluded). */
export function parseTopics(config: ResolvedConfig): ParsedTopic[] {
  // resolve() normalizes away any trailing slash in fragments.path so the
  // walk's exclusion (startsWith(ex + sep)) matches correctly.
  const fragmentsAbs = resolve(config.rootDir, config.schema.fragments.path);
  const mdx = config.schema.format.extensions?.includes('mdx') ?? false;
  return walkMarkdown(config.contentDir, [fragmentsAbs]).map((file) =>
    parseTopicFile(file, {
      rootDir: config.rootDir,
      mdx,
      defaultLocale: config.schema.i18n.default,
      locales: config.schema.i18n.locales,
    }),
  );
}
