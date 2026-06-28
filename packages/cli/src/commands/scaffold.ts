/** `topicmd scaffold <type>` — create a new topic with valid frontmatter. */
import { writeFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { scaffoldTopic } from '@topicmd/core';
import { resolveConfig, type CommonOptions } from '../discover.js';

// Re-exported so the scaffold logic has a single home in core (#12).
export { scaffoldTopic } from '@topicmd/core';

export interface ScaffoldOptions extends CommonOptions {
  title?: string;
  out?: string;
}

/** CLI action: print to stdout or write to --out. */
export function scaffoldAction(type: string, options: ScaffoldOptions): void {
  const config = resolveConfig(options);
  const markdown = scaffoldTopic(type, config.schema, { title: options.title });

  if (options.out) {
    const outPath = isAbsolute(options.out) ? options.out : resolve(process.cwd(), options.out);
    writeFileSync(outPath, markdown);
    console.log(`Wrote ${outPath}`);
  } else {
    console.log(markdown);
  }
}
