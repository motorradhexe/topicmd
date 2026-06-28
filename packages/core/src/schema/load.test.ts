import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema, parseSchema, SchemaError } from './index.js';

/** Path to the basic example fixture's docs.schema.yaml (#3). */
const fixtureSchemaPath = fileURLToPath(
  new URL('../../../../examples/basic/docs.schema.yaml', import.meta.url),
);

describe('loadSchema (against the basic example fixture)', () => {
  it('loads and normalizes the fixture schema', () => {
    const schema = loadSchema(fixtureSchemaPath);

    expect(schema.format.primary).toBe('markdown');
    expect(schema.fragments.path).toBe('fragments/');
    expect(schema.dimensions.map((d) => d.id)).toEqual([
      'product',
      'audience',
      'level',
    ]);
    expect(schema.profiles.map((p) => p.id)).toContain('dev-beginner');
    expect(Object.keys(schema.topic_types)).toEqual(
      expect.arrayContaining(['concept', 'task', 'reference']),
    );
    expect(schema.topic_types.task?.contract?.must_contain).toBe('steps');
    expect(schema.i18n).toEqual({
      default: 'en',
      locales: ['de', 'fr'],
      strategy: 'suffix',
    });
  });

  it('throws SchemaError for a missing file', () => {
    expect(() => loadSchema('/does/not/exist.yaml')).toThrow(SchemaError);
  });
});

describe('parseSchema', () => {
  const minimal = `
format:
  primary: markdown
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
topic_types:
  concept:
    required: [title]
i18n:
  default: en
  locales: [de]
  strategy: suffix
`;

  it('applies defaults for fragments and profiles', () => {
    const schema = parseSchema(minimal);
    expect(schema.fragments).toEqual({ path: 'fragments/' });
    expect(schema.profiles).toEqual([]);
  });

  it('rejects invalid YAML', () => {
    expect(() => parseSchema('format: : :\n  bad')).toThrow(SchemaError);
  });

  it('rejects a missing required block (i18n)', () => {
    const text = `
format:
  primary: markdown
dimensions:
  - id: product
    label: Product
    values: [alpha]
topic_types:
  concept:
    required: [title]
`;
    expect(() => parseSchema(text)).toThrow(/i18n/);
  });

  it('rejects a profile filtering an unknown dimension', () => {
    const text = `
format:
  primary: markdown
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
profiles:
  - id: bad
    label: Bad
    filters:
      region: eu
topic_types:
  concept:
    required: [title]
i18n:
  default: en
  locales: [de]
  strategy: suffix
`;
    expect(() => parseSchema(text)).toThrow(/unknown dimension "region"/);
  });

  it('rejects a profile filter value not declared on the dimension', () => {
    const text = `
format:
  primary: markdown
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
profiles:
  - id: bad
    label: Bad
    filters:
      product: gamma
topic_types:
  concept:
    required: [title]
i18n:
  default: en
  locales: [de]
  strategy: suffix
`;
    expect(() => parseSchema(text)).toThrow(/value "gamma"/);
  });

  it('rejects i18n.default also listed as a locale', () => {
    const text = `
format:
  primary: markdown
dimensions:
  - id: product
    label: Product
    values: [alpha]
topic_types:
  concept:
    required: [title]
i18n:
  default: en
  locales: [en, de]
  strategy: suffix
`;
    expect(() => parseSchema(text)).toThrow(/must not also appear in locales/);
  });
});
