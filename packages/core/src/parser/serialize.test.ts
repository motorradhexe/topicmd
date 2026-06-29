import { describe, expect, it } from 'vitest';
import { parseTopic } from './parse.js';
import { updateFrontmatter } from './serialize.js';

const source = ['---', 'title: Quickstart', 'topic_type: task', '---', '', '# Quickstart', ''].join(
  '\n',
);

describe('updateFrontmatter', () => {
  it('sets a new field and preserves the body', () => {
    const next = updateFrontmatter(source, { dimensions: { product: ['alpha'] } });
    const topic = parseTopic({ path: 'x.md', content: next });
    expect(topic.frontmatter.title).toBe('Quickstart');
    expect(topic.frontmatter.dimensions).toEqual({ product: ['alpha'] });
    expect(topic.body.trim()).toBe('# Quickstart');
  });

  it('overwrites an existing field', () => {
    const next = updateFrontmatter(source, { title: 'Renamed' });
    expect(parseTopic({ path: 'x.md', content: next }).frontmatter.title).toBe('Renamed');
  });

  it('removes a field when the patch value is undefined', () => {
    const withTags = updateFrontmatter(source, { tags: ['a', 'b'] });
    const without = updateFrontmatter(withTags, { tags: undefined });
    expect(parseTopic({ path: 'x.md', content: without }).frontmatter.tags).toBeUndefined();
  });

  it('round-trips through the parser without losing data', () => {
    const next = updateFrontmatter(source, { version: '2.0', tags: ['auth'] });
    const fm = parseTopic({ path: 'x.md', content: next }).frontmatter;
    expect(fm.topic_type).toBe('task');
    expect(fm.version).toBe('2.0');
    expect(fm.tags).toEqual(['auth']);
  });
});
