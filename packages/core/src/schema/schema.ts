/**
 * Zod schemas mirroring `docs.schema.yaml`. The inferred output type is
 * structurally the resolved `DocsSchema` (#2). Defaults (e.g. fragments path)
 * are applied here so downstream code always sees a normalized schema.
 *
 * Cross-field rules (profile filters reference existing dimensions/values,
 * i18n default not also a locale) live in the `superRefine` block.
 */
import { z } from 'zod';

const formatSchema = z.object({
  primary: z.literal('markdown'),
  extensions: z.array(z.string()).optional(),
});

const fragmentsSchema = z.object({
  path: z.string(),
});

const dimensionSchema = z.object({
  id: z.string(),
  label: z.string(),
  values: z.array(z.string()).min(1),
});

const dimensionFiltersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

const profileSchema = z.object({
  id: z.string(),
  label: z.string(),
  filters: dimensionFiltersSchema,
});

const topicContractSchema = z.object({
  must_contain: z.string().optional(),
});

const topicTypeSchema = z.object({
  required: z.array(z.string()),
  optional: z.array(z.string()).optional(),
  contract: topicContractSchema.optional(),
});

const i18nSchema = z.object({
  default: z.string(),
  locales: z.array(z.string()),
  strategy: z.literal('suffix'),
});

/**
 * The full schema. `fragments` and `profiles` carry defaults so the parsed
 * result is always complete.
 */
export const docsSchemaZod = z
  .object({
    format: formatSchema,
    fragments: fragmentsSchema.default({ path: 'fragments/' }),
    dimensions: z.array(dimensionSchema),
    profiles: z.array(profileSchema).default([]),
    topic_types: z.record(z.string(), topicTypeSchema),
    i18n: i18nSchema,
  })
  .superRefine((schema, ctx) => {
    const dimensionsById = new Map(schema.dimensions.map((d) => [d.id, d]));

    // Duplicate dimension ids are ambiguous.
    const seen = new Set<string>();
    schema.dimensions.forEach((d, index) => {
      if (seen.has(d.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate dimension id "${d.id}"`,
          path: ['dimensions', index, 'id'],
        });
      }
      seen.add(d.id);
    });

    // Profile filters must reference existing dimensions and declared values.
    schema.profiles.forEach((profile, pIndex) => {
      for (const [dimId, value] of Object.entries(profile.filters)) {
        const dimension = dimensionsById.get(dimId);
        if (!dimension) {
          ctx.addIssue({
            code: 'custom',
            message: `Profile "${profile.id}" filters unknown dimension "${dimId}"`,
            path: ['profiles', pIndex, 'filters', dimId],
          });
          continue;
        }
        const values = Array.isArray(value) ? value : [value];
        for (const v of values) {
          if (!dimension.values.includes(v)) {
            ctx.addIssue({
              code: 'custom',
              message: `Profile "${profile.id}" filter "${dimId}" uses value "${v}" not in [${dimension.values.join(', ')}]`,
              path: ['profiles', pIndex, 'filters', dimId],
            });
          }
        }
      }
    });

    // Language is orthogonal: the default (source) language is not a variant.
    if (schema.i18n.locales.includes(schema.i18n.default)) {
      ctx.addIssue({
        code: 'custom',
        message: `i18n.default "${schema.i18n.default}" must not also appear in locales`,
        path: ['i18n', 'locales'],
      });
    }
  });
