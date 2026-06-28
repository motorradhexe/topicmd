import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveFragments, resolveFragmentsInFile } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);

/** Build an injectable readFile over an in-memory `{ absPath: content }` map. */
function fakeFs(files: Record<string, string>) {
  return (absPath: string): string => {
    if (!(absPath in files)) throw new Error(`ENOENT: ${absPath}`);
    return files[absPath]!;
  };
}

describe('resolveFragments', () => {
  it('inlines a fragment in place', () => {
    const readFile = fakeFs({
      '/p/fragments/note.md': 'Shared note body.\n',
    });
    const res = resolveFragments(
      'Intro.\n\n<!-- @include: ./fragments/note.md -->\n\nOutro.\n',
      '/p',
      '/p/topic.md',
      { rootDir: '/p', readFile },
    );

    expect(res.content).toContain('Shared note body.');
    expect(res.content).not.toContain('@include');
    expect(res.fragments).toEqual(['fragments/note.md']);
    expect(res.diagnostics).toEqual([]);
  });

  it('resolves nested includes and records each fragment once', () => {
    const readFile = fakeFs({
      '/p/fragments/a.md': 'A then <!-- @include: ./b.md -->',
      '/p/fragments/b.md': 'B body',
    });
    const res = resolveFragments(
      '<!-- @include: ./fragments/a.md --> and <!-- @include: ./fragments/a.md -->',
      '/p',
      '/p/topic.md',
      { rootDir: '/p', readFile },
    );

    expect(res.content).toBe('A then B body and A then B body');
    expect(res.fragments).toEqual(['fragments/a.md', 'fragments/b.md']);
    expect(res.diagnostics).toEqual([]);
  });

  it('reports a missing fragment as a diagnostic', () => {
    const res = resolveFragments(
      '<!-- @include: ./missing.md -->',
      '/p',
      '/p/topic.md',
      { rootDir: '/p', readFile: fakeFs({}) },
    );

    expect(res.diagnostics).toHaveLength(1);
    expect(res.diagnostics[0]?.code).toBe('missing-fragment');
    expect(res.diagnostics[0]?.severity).toBe('error');
    expect(res.content).toBe('');
  });

  it('detects an include cycle', () => {
    const readFile = fakeFs({
      '/p/a.md': '<!-- @include: ./b.md -->',
      '/p/b.md': '<!-- @include: ./a.md -->',
    });
    const res = resolveFragments(
      '<!-- @include: ./a.md -->',
      '/p',
      '/p/topic.md',
      { rootDir: '/p', readFile },
    );

    expect(res.diagnostics.some((d) => d.code === 'fragment-cycle')).toBe(true);
  });

  it('strips frontmatter from an included fragment', () => {
    const readFile = fakeFs({
      '/p/f.md': '---\ntitle: ignore\n---\nVisible body\n',
    });
    const res = resolveFragments(
      '<!-- @include: ./f.md -->',
      '/p',
      '/p/topic.md',
      { rootDir: '/p', readFile },
    );

    expect(res.content.trim()).toBe('Visible body');
  });
});

describe('resolveFragmentsInFile (against the basic example fixture)', () => {
  it('expands the admin-prerequisites include in the concept topic', () => {
    const res = resolveFragmentsInFile(
      `${basicRoot}/docs/concepts/what-is-alpha.md`,
      { rootDir: basicRoot },
    );

    expect(res.diagnostics).toEqual([]);
    expect(res.content).toContain('administrator access');
    expect(res.content).not.toContain('@include');
    expect(res.fragments).toEqual(['fragments/prerequisites-admin.md']);
  });
});
