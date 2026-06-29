import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { indexProject, loadSchema, loadVariables } from '@topicmd/core';
import { buildTopicsModel } from './topicsModel.js';

const basicRoot = fileURLToPath(new URL('../../../examples/basic', import.meta.url));
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);
const index = indexProject({
  rootDir: basicRoot,
  schema,
  contentDir: `${basicRoot}/docs`,
  variables: loadVariables(`${basicRoot}/docs.vars.yaml`),
});
const model = buildTopicsModel(index, schema);

describe('buildTopicsModel', () => {
  it('exposes facets derived from the schema', () => {
    expect(model.facets.types).toEqual(['concept', 'reference', 'task']);
    expect(model.facets.dimensions.find((d) => d.id === 'product')?.values).toEqual([
      'alpha',
      'beta',
    ]);
    expect(model.facets.profiles.map((p) => p.id)).toContain('dev-beginner');
    expect(model.facets.locales).toEqual(['en', 'de', 'fr']);
  });

  it('lists every topic including the locale variant', () => {
    const ids = model.topics.map((t) => `${t.id}@${t.locale}`);
    expect(ids).toContain('docs/concepts/what-is-alpha@en');
    expect(ids).toContain('docs/concepts/what-is-alpha@de');
    expect(model.topics).toHaveLength(5);
  });

  it('computes matching profiles for a topic', () => {
    const canonical = model.topics.find(
      (t) => t.id === 'docs/concepts/what-is-alpha' && !t.isVariant,
    );
    expect(canonical?.profiles).toContain('dev-beginner');
  });

  it('flags orphans and i18n gaps', () => {
    const canonical = model.topics.find(
      (t) => t.id === 'docs/concepts/what-is-alpha' && !t.isVariant,
    );
    // de variant exists, fr is missing.
    expect(canonical?.missingLocales).toEqual(['fr']);

    const orphanIds = model.topics.filter((t) => t.orphan).map((t) => t.id);
    expect(orphanIds).toContain('docs/reference/api');
  });

  it('marks the stale German variant', () => {
    const variant = model.topics.find(
      (t) => t.id === 'docs/concepts/what-is-alpha' && t.locale === 'de',
    );
    expect(variant?.stale).toBe(true);
  });
});
