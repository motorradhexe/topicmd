import { describe, expectTypeOf, it } from 'vitest';
import type {
  DocsSchema,
  Topic,
  TopicFrontmatter,
  Profile,
  Diagnostic,
  ValidationResult,
} from '../index.js';

/**
 * These are compile-time contracts: the types are purely declarative, so the
 * "tests" assert shape and assignability rather than runtime behaviour. A type
 * regression breaks `tsc`/`vitest typecheck`, not an assertion at runtime.
 */
describe('@topicmd/core types', () => {
  it('models a full DocsSchema mirroring docs.schema.yaml', () => {
    const schema: DocsSchema = {
      format: { primary: 'markdown', extensions: ['mdx'] },
      fragments: { path: 'fragments/' },
      dimensions: [{ id: 'product', label: 'Product', values: ['alpha', 'beta'] }],
      profiles: [
        {
          id: 'dev-beginner',
          label: 'Developer – Getting Started',
          // partial filter + list value are both valid
          filters: { product: 'alpha', audience: ['developer'] },
        },
      ],
      topic_types: {
        concept: { required: ['title', 'description', 'topic_type'], optional: ['tags'] },
        task: { required: ['title', 'topic_type'], contract: { must_contain: 'steps' } },
      },
      i18n: { default: 'en', locales: ['de', 'fr'], strategy: 'suffix' },
    };

    expectTypeOf(schema.dimensions).items.toHaveProperty('values');
    expectTypeOf<Profile['filters']['x']>().toEqualTypeOf<string | string[] | undefined>();
    expectTypeOf<DocsSchema['i18n']['strategy']>().toEqualTypeOf<'suffix'>();
  });

  it('models topic frontmatter with known and project-specific fields', () => {
    const fm: TopicFrontmatter = {
      title: 'Authentication Guide',
      topic_type: 'task',
      dimensions: { product: ['alpha', 'beta'], audience: 'developer', level: 'advanced' },
      // open index signature allows project-defined fields
      owner: 'docs-team',
    };

    expectTypeOf(fm.title).toEqualTypeOf<string>();
    expectTypeOf(fm.dimensions).toEqualTypeOf<Record<string, string | string[]> | undefined>();
  });

  it('models a parsed Topic including locale-variant metadata', () => {
    const topic: Topic = {
      path: 'docs/concepts/what-is-alpha.de.md',
      id: 'concepts/what-is-alpha',
      locale: 'de',
      isVariant: true,
      frontmatter: { title: 'Was ist Alpha', topic_type: 'concept' },
      body: '# Was ist Alpha\n',
    };

    expectTypeOf(topic.isVariant).toEqualTypeOf<boolean>();
  });

  it('models validation results with severity-tagged diagnostics', () => {
    const diagnostic: Diagnostic = {
      severity: 'error',
      code: 'missing-required-field',
      message: 'Missing required field "title"',
      file: 'docs/tasks/quickstart.md',
      line: 1,
    };
    const result: ValidationResult = { ok: false, diagnostics: [diagnostic] };

    expectTypeOf(result.ok).toEqualTypeOf<boolean>();
    expectTypeOf(diagnostic.severity).toEqualTypeOf<'error' | 'warning' | 'info'>();
  });
});
