import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '../schema/index.js';
import { indexProject } from '../indexer/index.js';
import {
  buildProfilesManifest,
  filterNav,
  generateProfileNavs,
  isTopicNode,
  loadNavManifest,
  matchesFilters,
  navManifestToObject,
  parseNavManifest,
  serializeNavManifest,
  type NavManifest,
  type NavNode,
} from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);
const index = indexProject({ rootDir: basicRoot, schema, contentDir: `${basicRoot}/docs` });
const manifest = loadNavManifest(`${basicRoot}/nav/product-alpha.yaml`);

/** Collect topic paths reachable in a manifest (recursively). */
function topicPaths(m: NavManifest): string[] {
  const out: string[] = [];
  const walk = (node: NavNode): void => {
    if (isTopicNode(node)) out.push(node.topic);
    else node.children.forEach(walk);
  };
  m.sections.forEach(walk);
  return out;
}

function sectionTitles(m: NavManifest): string[] {
  return m.sections.filter((n): n is Extract<NavNode, { section: string }> => !isTopicNode(n))
    .map((s) => s.section);
}

describe('matchesFilters', () => {
  it('treats undeclared dimensions as agnostic', () => {
    expect(matchesFilters({ product: 'alpha' }, { level: 'beginner' })).toBe(true);
  });
  it('rejects a declared dimension that misses the filter value', () => {
    expect(matchesFilters({ level: 'advanced' }, { level: 'beginner' })).toBe(false);
  });
  it('matches when an array dimension overlaps the filter', () => {
    expect(matchesFilters({ product: ['alpha', 'beta'] }, { product: 'beta' })).toBe(true);
  });
});

describe('parseNavManifest', () => {
  it('parses title and nested sections', () => {
    expect(manifest.title).toBe('Alpha Documentation');
    expect(sectionTitles(manifest)).toEqual(['Getting Started', 'Guides', 'Reference']);
    expect(topicPaths(manifest)).toContain('./docs/tasks/authentication.md');
  });

  it('round-trips: serialize then parse yields the same manifest', () => {
    expect(parseNavManifest(serializeNavManifest(manifest))).toEqual(manifest);
  });
});

describe('filterNav', () => {
  it('drops topics that fail the dev-beginner filter and prunes empty sections', () => {
    const filtered = filterNav(manifest, index, {
      product: 'alpha',
      audience: 'developer',
      level: 'beginner',
    });
    // Guides holds only the advanced authentication topic → section removed.
    expect(sectionTitles(filtered)).toEqual(['Getting Started', 'Reference']);
    expect(topicPaths(filtered)).toEqual([
      './docs/concepts/what-is-alpha.md',
      './docs/tasks/quickstart.md',
      './docs/reference/api.md',
    ]);
  });

  it('keeps only admin-visible topics for the admin filter', () => {
    const filtered = filterNav(manifest, index, { audience: 'admin' });
    expect(topicPaths(filtered)).toEqual(['./docs/concepts/what-is-alpha.md']);
    expect(sectionTitles(filtered)).toEqual(['Getting Started']);
  });
});

describe('generateProfileNavs + serialization', () => {
  it('produces one manifest per schema profile', () => {
    const navs = generateProfileNavs(manifest, index, schema);
    expect(Object.keys(navs).sort()).toEqual(['admin-all', 'dev-beginner']);
  });

  it('serializes a manifest back to parseable YAML', () => {
    const filtered = filterNav(manifest, index, { audience: 'admin' });
    const yaml = serializeNavManifest(filtered);
    expect(parseNavManifest(yaml)).toEqual(filtered);
  });

  it('builds a profiles manifest from the schema', () => {
    const profiles = buildProfilesManifest(schema);
    expect(profiles.default_locale).toBe('en');
    expect(profiles.profiles.map((p) => p.id)).toEqual(['dev-beginner', 'admin-all']);
    expect(profiles.profiles[1]?.filters).toEqual({ audience: 'admin' });
  });
});

describe('navManifestToObject', () => {
  it('reproduces the input shape', () => {
    const obj = navManifestToObject(manifest);
    expect(obj.title).toBe('Alpha Documentation');
    expect(obj.sections).toHaveLength(3);
  });
});
