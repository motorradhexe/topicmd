import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '@topicmd/core';
import { computeDiagnostics, detectContext, getCompletions } from './frontmatter.js';

const basicRoot = fileURLToPath(new URL('../../../examples/basic', import.meta.url));
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);

describe('getCompletions', () => {
  it('suggests topic types on a topic_type line', () => {
    const lines = ['---', 'topic_type: ', '---'];
    expect(detectContext(schema, lines, 1)?.kind).toBe('topic_type');
    expect(getCompletions(schema, lines, 1)).toEqual(['concept', 'reference', 'task']);
  });

  it('suggests dimension values inside the dimensions block', () => {
    const lines = ['---', 'topic_type: concept', 'dimensions:', '  product: ', '---'];
    const ctx = detectContext(schema, lines, 3);
    expect(ctx).toEqual({ kind: 'dimension-value', dimensionId: 'product' });
    expect(getCompletions(schema, lines, 3)).toEqual(['alpha', 'beta']);
  });

  it('returns nothing outside a completable context', () => {
    const lines = ['---', 'title: Hello', '---', '', '# Body'];
    expect(getCompletions(schema, lines, 1)).toEqual([]);
    expect(getCompletions(schema, lines, 4)).toEqual([]);
  });

  it('does not treat a top-level dimension-named key as a dimension value', () => {
    // `product:` at indent 0 is not inside a dimensions block.
    const lines = ['---', 'product: ', '---'];
    expect(detectContext(schema, lines, 1)).toBeNull();
  });
});

describe('computeDiagnostics', () => {
  it('flags an unknown dimension value on its line', () => {
    const text = [
      '---',
      'title: X',
      'topic_type: concept',
      'description: d',
      'dimensions:',
      '  product: gamma',
      '---',
      '',
    ].join('\n');
    const diags = computeDiagnostics(schema, text);
    const dim = diags.find((d) => d.code === 'unknown-dimension-value');
    expect(dim).toBeDefined();
    expect(diags[diags.indexOf(dim!)]!.line).toBe(5); // the `  product: gamma` line
  });

  it('flags a missing required field', () => {
    const text = ['---', 'topic_type: concept', '---', '', '# Body'].join('\n');
    const diags = computeDiagnostics(schema, text);
    expect(diags.some((d) => d.code === 'missing-required-field')).toBe(true);
  });

  it('does not emit body-contract diagnostics (frontmatter only)', () => {
    // A valid task frontmatter with no Steps body: contract-violation is excluded.
    const text = ['---', 'title: T', 'topic_type: task', '---', '', '# T'].join('\n');
    const diags = computeDiagnostics(schema, text);
    expect(diags.every((d) => d.code !== 'contract-violation')).toBe(true);
  });

  it('returns nothing for content without frontmatter', () => {
    expect(computeDiagnostics(schema, '# Just a heading\n')).toEqual([]);
  });
});
