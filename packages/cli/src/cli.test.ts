import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSchema, parseTopic, validateTopic } from '@topicmd/core';
import { runValidate } from './commands/validate.js';
import { buildIndexResult, indexAction } from './commands/index-cmd.js';
import { scaffoldTopic } from './commands/scaffold.js';
import { buildProgram } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../examples/basic', import.meta.url),
);
const schemaPath = join(basicRoot, 'docs.schema.yaml');
const schema = loadSchema(schemaPath);

const originalCwd = process.cwd();
afterEach(() => process.chdir(originalCwd));

describe('runValidate', () => {
  it('passes (exit 0) when scanning only valid docs/ topics', () => {
    const res = runValidate({ schema: schemaPath, root: basicRoot, content: join(basicRoot, 'docs') });
    expect(res.exitCode).toBe(0);
    expect(res.lines.at(-1)).toMatch(/topics valid/);
  });

  it('fails (exit 1) when the invalid/ fixtures are included', () => {
    const res = runValidate({ schema: schemaPath, root: basicRoot, content: basicRoot });
    expect(res.exitCode).toBe(1);
    expect(res.lines.join('\n')).toMatch(/\[(missing-required-field|contract-violation|unknown-topic-type)\]/);
  });
});

describe('buildIndexResult', () => {
  it('produces stable JSON and a default out path under root', () => {
    const res = buildIndexResult({ schema: schemaPath, root: basicRoot, content: join(basicRoot, 'docs') });
    expect(res.outPath).toBe(join(basicRoot, 'docs.index.json'));
    expect(res.topicCount).toBe(5);
    const parsed = JSON.parse(res.json);
    expect(parsed.variables.product_name).toBe('Alpha');
  });
});

describe('scaffoldTopic', () => {
  it('scaffolds each known type so it re-parses and validates clean', () => {
    for (const type of Object.keys(schema.topic_types)) {
      const md = scaffoldTopic(type, schema, { title: 'Demo' });
      const topic = parseTopic({ path: `${type}/demo.md`, content: md });
      const errors = validateTopic(topic, schema).filter((d) => d.severity === 'error');
      expect(errors, `${type} should scaffold valid`).toEqual([]);
    }
  });

  it('adds a Steps section for the task contract', () => {
    expect(scaffoldTopic('task', schema, { title: 'X' })).toMatch(/## Steps/);
  });

  it('throws on an unknown type', () => {
    expect(() => scaffoldTopic('tutorial', schema)).toThrow(/Unknown topic_type/);
  });
});

describe('CLI error boundary', () => {
  it('reports a missing schema as exit 1 with a concise message (no stack trace)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const prevExit = process.exitCode;
    process.exitCode = 0;
    await buildProgram().parseAsync(
      ['validate', '--schema', join(basicRoot, 'does-not-exist.yaml')],
      { from: 'user' },
    );
    expect(process.exitCode).toBe(1);
    expect(errSpy.mock.calls.flat().join('\n')).toMatch(/^topicmd: /m);
    errSpy.mockRestore();
    process.exitCode = prevExit;
  });

  it('reports an unknown scaffold type as exit 1 instead of throwing', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const prevExit = process.exitCode;
    process.exitCode = 0;
    await buildProgram().parseAsync(['scaffold', 'tutorial', '--schema', schemaPath], {
      from: 'user',
    });
    expect(process.exitCode).toBe(1);
    expect(errSpy.mock.calls.flat().join('\n')).toMatch(/Unknown topic_type/);
    errSpy.mockRestore();
    logSpy.mockRestore();
    process.exitCode = prevExit;
  });
});

describe('indexAction writes a file', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'topicmd-cli-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('writes parseable JSON to --out', () => {
    const out = join(dir, 'idx.json');
    indexAction({ schema: schemaPath, root: basicRoot, content: join(basicRoot, 'docs'), out });
    const parsed = JSON.parse(readFileSync(out, 'utf8'));
    expect(parsed.topics).toHaveLength(5);
  });
});
