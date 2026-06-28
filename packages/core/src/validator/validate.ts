/**
 * Topic validator: checks parsed topics (#5) against the loaded schema (#4).
 *
 * Rules:
 * - `topic_type` must be present and defined in the schema.
 * - every `required` field for the type must be present (non-empty).
 * - frontmatter dimension ids and values must be declared in the schema.
 * - structural contracts (e.g. `must_contain: steps`) must hold.
 * - fields outside `required ∪ optional` produce a warning (not an error).
 *
 * Produces a `ValidationResult` (#2): `ok` is false iff any diagnostic is an
 * error, which drives the CLI exit code (#9). This module does no CLI wiring.
 */
import type {
  Diagnostic,
  DocsSchema,
  TopicTypeDef,
  ValidationResult,
} from '../types/index.js';
import type { ParsedTopic } from '../parser/index.js';

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** True if the topic satisfies a `must_contain` token. */
function satisfiesMustContain(topic: ParsedTopic, token: string): boolean {
  const want = token.trim().toLowerCase();
  const hasHeading = topic.headings.some(
    (h) => h.depth === 2 && h.text.trim().toLowerCase() === want,
  );
  if (hasHeading) return true;
  // `steps` is also satisfied by an ordered list (per the schema contract).
  return want === 'steps' && topic.hasOrderedList;
}

function validateFields(
  topic: ParsedTopic,
  typeDef: TopicTypeDef,
  push: (d: Omit<Diagnostic, 'file'>) => void,
): void {
  for (const field of typeDef.required) {
    if (!isPresent(topic.frontmatter[field])) {
      push({
        severity: 'error',
        code: 'missing-required-field',
        message: `Missing required field "${field}" for topic_type "${topic.frontmatter.topic_type}"`,
      });
    }
  }

  const allowed = new Set([...typeDef.required, ...(typeDef.optional ?? [])]);
  for (const field of Object.keys(topic.frontmatter)) {
    if (!allowed.has(field)) {
      push({
        severity: 'warning',
        code: 'unknown-field',
        message: `Field "${field}" is not declared for topic_type "${topic.frontmatter.topic_type}"`,
      });
    }
  }
}

function validateDimensions(
  topic: ParsedTopic,
  schema: DocsSchema,
  push: (d: Omit<Diagnostic, 'file'>) => void,
): void {
  const dims = topic.frontmatter.dimensions;
  if (!dims) return;
  const byId = new Map(schema.dimensions.map((d) => [d.id, d]));

  for (const [dimId, raw] of Object.entries(dims)) {
    const dimension = byId.get(dimId);
    if (!dimension) {
      push({
        severity: 'error',
        code: 'unknown-dimension-id',
        message: `Unknown dimension "${dimId}" in frontmatter`,
      });
      continue;
    }
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (!dimension.values.includes(value)) {
        push({
          severity: 'error',
          code: 'unknown-dimension-value',
          message: `Dimension "${dimId}" has value "${value}" not in [${dimension.values.join(', ')}]`,
        });
      }
    }
  }
}

/** Validate a single parsed topic against the schema. */
export function validateTopic(
  topic: ParsedTopic,
  schema: DocsSchema,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const push = (d: Omit<Diagnostic, 'file'>): void => {
    diagnostics.push({ ...d, file: topic.path });
  };

  const topicType = topic.frontmatter.topic_type;
  if (!isPresent(topicType)) {
    push({
      severity: 'error',
      code: 'missing-topic-type',
      message: 'Missing required field "topic_type"',
    });
    // Dimensions are still checkable without a known type.
    validateDimensions(topic, schema, push);
    return diagnostics;
  }

  const typeDef = schema.topic_types[topicType];
  if (!typeDef) {
    push({
      severity: 'error',
      code: 'unknown-topic-type',
      message: `Unknown topic_type "${topicType}" (not defined in schema)`,
    });
    validateDimensions(topic, schema, push);
    return diagnostics;
  }

  validateFields(topic, typeDef, push);
  validateDimensions(topic, schema, push);

  if (typeDef.contract?.must_contain) {
    const token = typeDef.contract.must_contain;
    if (!satisfiesMustContain(topic, token)) {
      push({
        severity: 'error',
        code: 'contract-violation',
        message: `topic_type "${topicType}" must contain "${token}" (an "## ${token}" heading${
          token.toLowerCase() === 'steps' ? ' or an ordered list' : ''
        })`,
      });
    }
  }

  return diagnostics;
}

/** Validate many topics and aggregate into a single result. */
export function validateTopics(
  topics: ParsedTopic[],
  schema: DocsSchema,
): ValidationResult {
  const diagnostics = topics.flatMap((t) => validateTopic(t, schema));
  return {
    ok: !diagnostics.some((d) => d.severity === 'error'),
    diagnostics,
  };
}
