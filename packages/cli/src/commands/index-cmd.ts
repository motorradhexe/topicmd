/** `topicmd index` — generate docs.index.json. */
import { writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { indexProject, loadVariables, serializeIndex } from '@topicmd/core';
import { resolveConfig, type CommonOptions } from '../discover.js';

export interface IndexOptions extends CommonOptions {
  out?: string;
}

export interface IndexResult {
  outPath: string;
  json: string;
  topicCount: number;
}

/** Pure runner: build the index and return JSON + target path (no write). */
export function buildIndexResult(options: IndexOptions): IndexResult {
  const config = resolveConfig(options);
  const variables = config.varsPath ? loadVariables(config.varsPath) : {};
  const index = indexProject({
    rootDir: config.rootDir,
    schema: config.schema,
    contentDir: config.contentDir,
    variables,
  });
  const outPath = options.out
    ? isAbsolute(options.out)
      ? options.out
      : resolve(process.cwd(), options.out)
    : join(config.rootDir, 'docs.index.json');
  return { outPath, json: serializeIndex(index), topicCount: index.topics.length };
}

/** CLI action: write the index file. */
export function indexAction(options: IndexOptions): void {
  const { outPath, json, topicCount } = buildIndexResult(options);
  writeFileSync(outPath, json);
  console.log(`Wrote ${outPath} (${topicCount} topics)`);
}
