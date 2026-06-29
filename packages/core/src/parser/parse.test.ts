import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { deriveIdentity, parseTopic, parseTopicFile } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);

describe('deriveIdentity', () => {
  it('treats a plain .md file as canonical', () => {
    expect(deriveIdentity('concepts/what-is-alpha.md', 'en', ['de', 'fr'])).toEqual({
      id: 'concepts/what-is-alpha',
      locale: 'en',
      isVariant: false,
    });
  });

  it('detects a locale suffix as a variant', () => {
    expect(deriveIdentity('concepts/what-is-alpha.de.md', 'en', ['de', 'fr'])).toEqual({
      id: 'concepts/what-is-alpha',
      locale: 'de',
      isVariant: true,
    });
  });

  it('does not treat an unknown suffix as a locale', () => {
    expect(deriveIdentity('reference/api.v2.md', 'en', ['de', 'fr'])).toEqual({
      id: 'reference/api.v2',
      locale: 'en',
      isVariant: false,
    });
  });
});

describe('parseTopic', () => {
  it('separates frontmatter from body', () => {
    const topic = parseTopic({
      path: 'tasks/quickstart.md',
      content: '---\ntitle: Quickstart\ntopic_type: task\n---\n\n# Quickstart\n',
    });
    expect(topic.frontmatter.title).toBe('Quickstart');
    expect(topic.frontmatter.topic_type).toBe('task');
    expect(topic.body.trim()).toBe('# Quickstart');
  });

  it('extracts headings, links, includes and ordered lists', () => {
    const topic = parseTopic({
      path: 'x.md',
      content: [
        '---',
        'title: X',
        '---',
        '',
        '# Title',
        '',
        '## Steps',
        '',
        '<!-- @include: ../../fragments/prerequisites-admin.md -->',
        '',
        '1. First',
        '2. Second',
        '',
        'See [the API](./reference/api.md).',
      ].join('\n'),
    });

    expect(topic.headings).toEqual([
      { depth: 1, text: 'Title' },
      { depth: 2, text: 'Steps' },
    ]);
    expect(topic.hasOrderedList).toBe(true);
    expect(topic.links).toEqual([{ url: './reference/api.md', text: 'the API' }]);
    expect(topic.includes).toEqual([
      {
        target: '../../fragments/prerequisites-admin.md',
        raw: '<!-- @include: ../../fragments/prerequisites-admin.md -->',
      },
    ]);
  });

  it('falls back to empty frontmatter on malformed YAML (no throw)', () => {
    const topic = parseTopic({
      path: 'broken.md',
      content: '---\ntitle: "unterminated\ntopic_type: task\n---\n\n# Body\n',
    });
    // Malformed YAML must not crash; frontmatter is dropped and the raw text is
    // kept as the body so nothing is silently lost.
    expect(topic.frontmatter).toEqual({});
    expect(topic.body).toContain('# Body');
  });

  it('falls back to empty frontmatter when frontmatter is a non-object scalar', () => {
    const topic = parseTopic({
      path: 'scalar.md',
      content: '---\njust a bare string\n---\n\n# Body\n',
    });
    expect(topic.frontmatter).toEqual({});
  });

  it('parses JSX as opaque text when MDX is disabled (no throw)', () => {
    const topic = parseTopic({
      path: 'x.md',
      content: '# Title\n\n<Note>hi</Note>\n',
    });
    expect(topic.headings[0]?.text).toBe('Title');
  });

  it('tolerates JSX when MDX is enabled', () => {
    const topic = parseTopic(
      { path: 'x.mdx', content: '# Title\n\n<Note>hi</Note>\n' },
      { mdx: true },
    );
    expect(topic.headings[0]?.text).toBe('Title');
  });
});

describe('parseTopicFile (against the basic example fixture)', () => {
  const opts = { rootDir: basicRoot, defaultLocale: 'en', locales: ['de', 'fr'] };

  it('parses the canonical concept and finds its include', () => {
    const topic = parseTopicFile(
      `${basicRoot}/docs/concepts/what-is-alpha.md`,
      opts,
    );
    expect(topic.id).toBe('docs/concepts/what-is-alpha');
    expect(topic.locale).toBe('en');
    expect(topic.isVariant).toBe(false);
    expect(topic.frontmatter.topic_type).toBe('concept');
    expect(topic.includes.map((i) => i.target)).toContain(
      '../../fragments/prerequisites-admin.md',
    );
  });

  it('parses the German variant with shared id', () => {
    const topic = parseTopicFile(
      `${basicRoot}/docs/concepts/what-is-alpha.de.md`,
      opts,
    );
    expect(topic.id).toBe('docs/concepts/what-is-alpha');
    expect(topic.locale).toBe('de');
    expect(topic.isVariant).toBe(true);
  });

  it('detects the Steps heading on the quickstart task', () => {
    const topic = parseTopicFile(`${basicRoot}/docs/tasks/quickstart.md`, opts);
    expect(topic.headings.some((h) => h.depth === 2 && h.text === 'Steps')).toBe(
      true,
    );
    expect(topic.hasOrderedList).toBe(true);
  });
});
