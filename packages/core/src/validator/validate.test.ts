import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '../schema/index.js';
import { parseTopicFile } from '../parser/index.js';
import { validateTopic, validateTopics } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);
const parseOpts = { rootDir: basicRoot, defaultLocale: 'en', locales: ['de', 'fr'] };

function parse(rel: string) {
  return parseTopicFile(`${basicRoot}/${rel}`, parseOpts);
}

function codesFor(rel: string): string[] {
  return validateTopic(parse(rel), schema).map((d) => d.code);
}

describe('validateTopics — valid fixtures pass', () => {
  it('reports no errors for the docs/ topics', () => {
    const topics = [
      'docs/concepts/what-is-alpha.md',
      'docs/concepts/what-is-alpha.de.md',
      'docs/tasks/quickstart.md',
      'docs/tasks/authentication.md',
      'docs/reference/api.md',
    ].map(parse);

    const result = validateTopics(topics, schema);
    const errors = result.diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toEqual([]);
    expect(result.ok).toBe(true);
  });
});

describe('validateTopic — intentional error fixtures (invalid/)', () => {
  it('flags missing required fields (title, description)', () => {
    const diags = validateTopic(parse('invalid/missing-required-field.md'), schema);
    const missing = diags.filter((d) => d.code === 'missing-required-field');
    expect(missing.map((d) => d.message).join(' ')).toMatch(/title/);
    expect(missing.map((d) => d.message).join(' ')).toMatch(/description/);
  });

  it('flags an unknown dimension value', () => {
    expect(codesFor('invalid/unknown-dimension-value.md')).toContain(
      'unknown-dimension-value',
    );
  });

  it('flags a task without steps as a contract violation', () => {
    expect(codesFor('invalid/task-without-steps.md')).toContain(
      'contract-violation',
    );
  });

  it('flags an unknown topic_type', () => {
    expect(codesFor('invalid/unknown-topic-type.md')).toContain(
      'unknown-topic-type',
    );
  });

  it('flags a reference missing its version', () => {
    const diags = validateTopic(parse('invalid/reference-missing-version.md'), schema);
    expect(
      diags.some(
        (d) => d.code === 'missing-required-field' && /version/.test(d.message),
      ),
    ).toBe(true);
  });

  it('sets ok=false and tags diagnostics with the file path', () => {
    const result = validateTopics(
      [parse('invalid/unknown-topic-type.md')],
      schema,
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.file).toBe('invalid/unknown-topic-type.md');
  });
});
