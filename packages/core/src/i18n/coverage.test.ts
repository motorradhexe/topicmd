import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '../schema/index.js';
import { parseTopicFile, type ParsedTopic } from '../parser/index.js';
import { indexProject } from '../indexer/index.js';
import { buildI18nReport } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);

const topics: ParsedTopic[] = [
  'docs/concepts/what-is-alpha.md',
  'docs/concepts/what-is-alpha.de.md',
  'docs/tasks/quickstart.md',
  'docs/tasks/authentication.md',
  'docs/reference/api.md',
].map((rel) =>
  parseTopicFile(`${basicRoot}/${rel}`, {
    rootDir: basicRoot,
    defaultLocale: 'en',
    locales: ['de', 'fr'],
  }),
);

describe('buildI18nReport — coverage', () => {
  it('computes per-locale coverage (de partial, fr missing)', () => {
    const report = buildI18nReport(topics, schema, { getMtime: () => 0 });
    // 1 of 4 canonical topics translated to de; none to fr.
    expect(report.i18n_coverage).toEqual({ de: '25%', fr: '0%' });
  });
});

describe('buildI18nReport — stale detection', () => {
  it('flags a variant whose source was modified more recently', () => {
    const report = buildI18nReport(topics, schema, {
      getMtime: (t) =>
        t.id === 'docs/concepts/what-is-alpha' && !t.isVariant ? 100 : 10,
    });
    expect(report.stale_translations).toEqual([
      {
        topic: 'docs/concepts/what-is-alpha',
        locale: 'de',
        reason: 'source updated after translation',
      },
    ]);
  });

  it('does not flag a variant newer than its source', () => {
    const report = buildI18nReport(topics, schema, {
      getMtime: (t) => (t.isVariant ? 100 : 10),
    });
    expect(report.stale_translations).toEqual([]);
  });
});

describe('indexProject fills the i18n fields', () => {
  it('populates i18n_coverage from real files', () => {
    const index = indexProject({
      rootDir: basicRoot,
      schema,
      contentDir: `${basicRoot}/docs`,
    });
    expect(index.i18n_coverage).toEqual({ de: '25%', fr: '0%' });
    expect(Array.isArray(index.stale_translations)).toBe(true);
  });
});
