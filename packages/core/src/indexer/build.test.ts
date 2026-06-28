import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '../schema/index.js';
import { indexProject, loadVariables, serializeIndex } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);

function buildFixtureIndex() {
  return indexProject({
    rootDir: basicRoot,
    schema,
    contentDir: `${basicRoot}/docs`,
    variables: loadVariables(`${basicRoot}/docs.vars.yaml`),
  });
}

describe('indexProject (basic example fixture)', () => {
  const index = buildFixtureIndex();

  it('indexes all topics including the locale variant', () => {
    const ids = index.topics.map((t) => `${t.id}@${t.locale}`);
    expect(ids).toContain('docs/concepts/what-is-alpha@en');
    expect(ids).toContain('docs/concepts/what-is-alpha@de');
    expect(index.topics).toHaveLength(5);
  });

  it('excludes the fragments dir from topics even when scanning the root', () => {
    const rootIndex = indexProject({ rootDir: basicRoot, schema, contentDir: basicRoot });
    const ids = rootIndex.topics.map((t) => t.id);
    expect(ids).not.toContain('fragments/prerequisites-admin');
  });

  it('lists fragments and records usage by topic id', () => {
    expect(index.fragments.map((f) => f.id)).toEqual([
      'fragments/prerequisites-admin.md',
    ]);
    expect(index.relationships.fragment_usage).toEqual({
      'fragments/prerequisites-admin.md': ['docs/concepts/what-is-alpha'],
    });
  });

  it('derives links from related references', () => {
    expect(index.relationships.links).toContainEqual({
      from: 'docs/concepts/what-is-alpha',
      to: 'docs/tasks/quickstart',
    });
  });

  it('flags unconnected canonical topics as orphans', () => {
    expect(index.relationships.orphans).toEqual([
      'docs/reference/api',
      'docs/tasks/authentication',
    ]);
  });

  it('has no suspected duplicates (titles are unique)', () => {
    expect(index.relationships.duplicates_suspected).toEqual([]);
  });

  it('computes coverage by profile', () => {
    expect(index.coverage.by_profile['dev-beginner']).toEqual({
      concept: 1,
      task: 1,
      reference: 1,
    });
    expect(index.coverage.by_profile['admin-all']).toEqual({
      concept: 1,
      task: 0,
      reference: 0,
    });
  });

  it('reports gaps for empty profile/type combinations', () => {
    expect(index.coverage.gaps).toEqual([
      { profile: 'admin-all', missing: 'no reference topic for audience=admin' },
      { profile: 'admin-all', missing: 'no task topic for audience=admin' },
    ]);
  });

  it('includes the variables map and leaves i18n fields to #16', () => {
    expect(index.variables).toEqual({
      company: 'Acme Corp',
      product_name: 'Alpha',
      support_email: 'support@example.com',
    });
    expect(index.i18n_coverage).toEqual({});
    expect(index.stale_translations).toEqual([]);
    expect(index.terms).toEqual([]);
  });

  it('serializes deterministically (stable across builds)', () => {
    expect(serializeIndex(index)).toBe(serializeIndex(buildFixtureIndex()));
    expect(serializeIndex(index).endsWith('\n')).toBe(true);
  });
});
