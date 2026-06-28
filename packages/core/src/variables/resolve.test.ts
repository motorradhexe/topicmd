import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadVariables, resolveVariables } from './index.js';

const basicRoot = fileURLToPath(
  new URL('../../../../examples/basic', import.meta.url),
);

describe('loadVariables', () => {
  it('reads the vars map from the fixture docs.vars.yaml', () => {
    expect(loadVariables(`${basicRoot}/docs.vars.yaml`)).toEqual({
      company: 'Acme Corp',
      product_name: 'Alpha',
      support_email: 'support@example.com',
    });
  });

  it('returns an empty map when vars is absent', () => {
    // Schema file has no top-level `vars:` key.
    expect(loadVariables(`${basicRoot}/docs.schema.yaml`)).toEqual({});
  });
});

describe('resolveVariables', () => {
  const vars = { product_name: 'Alpha', count: 3, nested: { key: 'deep' } };

  it('substitutes known scalar variables', () => {
    const res = resolveVariables('Use {{vars.product_name}} ({{ vars.count }}).', vars);
    expect(res.content).toBe('Use Alpha (3).');
    expect(res.diagnostics).toEqual([]);
  });

  it('resolves nested keys via dot notation', () => {
    const res = resolveVariables('{{vars.nested.key}}', vars);
    expect(res.content).toBe('deep');
  });

  it('reports an unknown variable and leaves the placeholder intact', () => {
    const res = resolveVariables('{{vars.missing}}', vars, { file: 'x.md' });
    expect(res.content).toBe('{{vars.missing}}');
    expect(res.diagnostics).toHaveLength(1);
    expect(res.diagnostics[0]).toMatchObject({
      code: 'unknown-variable',
      severity: 'error',
      file: 'x.md',
    });
  });

  it('reports a non-scalar variable', () => {
    const res = resolveVariables('{{vars.nested}}', vars);
    expect(res.diagnostics[0]?.code).toBe('non-scalar-variable');
    expect(res.content).toBe('{{vars.nested}}');
  });

  it('resolves variables in a real fixture topic', () => {
    const vars2 = loadVariables(`${basicRoot}/docs.vars.yaml`);
    const res = resolveVariables('# What is {{vars.product_name}}', vars2);
    expect(res.content).toBe('# What is Alpha');
    expect(res.diagnostics).toEqual([]);
  });
});
