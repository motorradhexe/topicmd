import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSchema } from '../schema/index.js';
import { parseTopic } from '../parser/index.js';
import { validateTopic } from '../validator/index.js';
import { scaffoldTopic } from './index.js';

const basicRoot = fileURLToPath(new URL('../../../../examples/basic', import.meta.url));
const schema = loadSchema(`${basicRoot}/docs.schema.yaml`);

describe('scaffoldTopic', () => {
  it('scaffolds every known type so it re-parses and validates clean', () => {
    for (const type of Object.keys(schema.topic_types)) {
      const md = scaffoldTopic(type, schema, { title: 'Demo' });
      const topic = parseTopic({ path: `${type}/demo.md`, content: md });
      const errors = validateTopic(topic, schema).filter((d) => d.severity === 'error');
      expect(errors, `${type} should scaffold valid`).toEqual([]);
    }
  });

  it('includes a Steps section for the task contract', () => {
    expect(scaffoldTopic('task', schema, { title: 'X' })).toMatch(/## Steps/);
  });

  it('defaults the title when none is given', () => {
    expect(scaffoldTopic('concept', schema)).toMatch(/# Untitled/);
  });

  it('throws on an unknown type with the known types listed', () => {
    expect(() => scaffoldTopic('tutorial', schema)).toThrow(/Unknown topic_type/);
  });
});
