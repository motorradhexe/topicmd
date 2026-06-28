import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseNavManifest } from '@topicmd/core';
import { navBuildAction, runNavBuild } from './commands/nav.js';
import { runI18nStatus } from './commands/i18n.js';

const basicRoot = fileURLToPath(new URL('../../../examples/basic', import.meta.url));
const schemaPath = join(basicRoot, 'docs.schema.yaml');
const common = { schema: schemaPath, root: basicRoot, content: join(basicRoot, 'docs') };

describe('runNavBuild', () => {
  const result = runNavBuild(common);
  const names = result.files.map((f) => f.path.replace(`${result.outDir}/`, '')).sort();

  it('emits profiles.json plus base and per-profile manifests for each nav source', () => {
    // Fixture has two nav sources: admin.yaml and product-alpha.yaml.
    expect(names).toEqual([
      'admin.admin-all.yaml',
      'admin.dev-beginner.yaml',
      'admin.yaml',
      'product-alpha.admin-all.yaml',
      'product-alpha.dev-beginner.yaml',
      'product-alpha.yaml',
      'profiles.json',
    ]);
  });

  it('profiles.json lists the schema profiles', () => {
    const profiles = JSON.parse(
      result.files.find((f) => f.path.endsWith('profiles.json'))!.content,
    );
    expect(profiles.profiles.map((p: { id: string }) => p.id)).toEqual([
      'dev-beginner',
      'admin-all',
    ]);
  });

  it('the product-alpha admin-all manifest is filtered (only what-is-alpha)', () => {
    const content = result.files.find((f) =>
      f.path.endsWith('product-alpha.admin-all.yaml'),
    )!.content;
    const manifest = parseNavManifest(content);
    const titles = manifest.sections.map((s) => ('section' in s ? s.section : s.topic));
    expect(titles).toEqual(['Getting Started']);
  });
});

describe('navBuildAction writes files', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'topicmd-nav-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('writes all generated files to --out', () => {
    navBuildAction({ ...common, out: dir });
    expect(existsSync(join(dir, 'profiles.json'))).toBe(true);
    expect(readdirSync(dir).length).toBe(7);
    JSON.parse(readFileSync(join(dir, 'profiles.json'), 'utf8'));
  });
});

describe('runI18nStatus', () => {
  it('reports de/fr coverage', () => {
    const res = runI18nStatus(common);
    const text = res.lines.join('\n');
    expect(text).toMatch(/de: 25%/);
    expect(text).toMatch(/fr: 0%/);
  });

  it('exit code is consistent with the stale report (mtime-independent)', () => {
    // Real mtimes vary by checkout, so assert internal consistency rather than
    // a fixed code; deterministic stale logic is covered in core (#16).
    const res = runI18nStatus(common);
    const hasStale = res.lines.some((l) => /^Stale translations: \d/.test(l));
    expect(res.exitCode).toBe(hasStale ? 1 : 0);
    expect(res.lines.some((l) => l.startsWith('Stale translations:'))).toBe(true);
  });
});
