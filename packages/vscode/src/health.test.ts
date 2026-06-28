import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { indexProject, loadSchema, type DocsIndex } from '@topicmd/core';
import { collectHealth, totalFindings } from './health.js';

const basicRoot = fileURLToPath(new URL('../../../examples/basic', import.meta.url));
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);

function index(contentDir: string): DocsIndex {
  return indexProject({ rootDir: basicRoot, schema, contentDir });
}

describe('collectHealth', () => {
  it('returns the four health categories in a stable order', () => {
    const categories = collectHealth(index(`${basicRoot}/docs`));
    expect(categories.map((c) => c.id)).toEqual([
      'missing-fields',
      'orphans',
      'coverage-gaps',
      'stale-translations',
    ]);
  });

  it('reports orphans and coverage gaps from the clean docs/ index', () => {
    const categories = collectHealth(index(`${basicRoot}/docs`));
    const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
    expect(byId['orphans']?.entries.map((e) => e.label)).toEqual([
      'docs/reference/api',
      'docs/tasks/authentication',
    ]);
    expect(byId['missing-fields']?.entries).toEqual([]);
    expect(byId['coverage-gaps']!.entries.length).toBeGreaterThan(0);
  });

  it('surfaces missing-field diagnostics when invalid topics are indexed', () => {
    const categories = collectHealth(index(basicRoot));
    const missing = categories.find((c) => c.id === 'missing-fields')!;
    expect(missing.entries.length).toBeGreaterThan(0);
    expect(missing.entries.some((e) => /title|topic_type|version/.test(e.label))).toBe(true);
    expect(totalFindings(categories)).toBeGreaterThan(0);
  });

  it('reads only the index object (no fs/parsing) for a hand-built index', () => {
    const minimal = {
      relationships: { orphans: ['a/b'], duplicates_suspected: [], links: [], fragment_usage: {} },
      coverage: { by_profile: {}, gaps: [{ profile: 'p', missing: 'no task topic for x=y' }] },
      stale_translations: [{ topic: 't', locale: 'de', reason: 'source updated after translation' }],
      diagnostics: [
        { severity: 'error', code: 'missing-required-field', message: 'Missing required field "title"', file: 'x.md' },
      ],
    } as unknown as DocsIndex;

    const byId = Object.fromEntries(collectHealth(minimal).map((c) => [c.id, c]));
    expect(byId['orphans']?.entries[0]?.label).toBe('a/b');
    expect(byId['missing-fields']?.entries[0]?.detail).toBe('x.md');
    expect(byId['stale-translations']?.entries[0]?.label).toBe('t [de]');
  });
});
