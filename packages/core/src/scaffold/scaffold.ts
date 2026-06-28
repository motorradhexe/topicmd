/**
 * Topic scaffolding: build Markdown for a new topic whose frontmatter satisfies
 * a topic type's required fields. Pure and shared by the CLI `scaffold` command
 * (#9) and the VS Code Quick Scaffold (#12).
 */
import type { DocsSchema } from '../types/index.js';

/** Placeholder value for a required field, with sensible special cases. */
function placeholderFor(field: string, title: string, type: string): string {
  switch (field) {
    case 'title':
      return JSON.stringify(title);
    case 'topic_type':
      return type;
    case 'description':
      return JSON.stringify('TODO: write a description');
    case 'version':
      return JSON.stringify('TODO');
    default:
      return JSON.stringify('TODO');
  }
}

export interface ScaffoldTopicOptions {
  title?: string;
}

/**
 * Build markdown for a new topic of `type` whose frontmatter satisfies the
 * schema's required fields. Throws if the type is unknown.
 */
export function scaffoldTopic(
  type: string,
  schema: DocsSchema,
  options: ScaffoldTopicOptions = {},
): string {
  const typeDef = schema.topic_types[type];
  if (!typeDef) {
    const known = Object.keys(schema.topic_types).sort().join(', ');
    throw new Error(`Unknown topic_type "${type}". Known types: ${known}`);
  }
  const title = options.title ?? 'Untitled';

  // topic_type always first, then the remaining required fields in order.
  const ordered = ['topic_type', ...typeDef.required.filter((f) => f !== 'topic_type')];
  const seen = new Set<string>();
  const frontmatter = ordered
    .filter((f) => !seen.has(f) && (seen.add(f), true))
    .map((field) => `${field}: ${placeholderFor(field, title, type)}`);

  const body: string[] = [`# ${title}`, ''];
  if (typeDef.contract?.must_contain) {
    const token = typeDef.contract.must_contain;
    const heading = token.charAt(0).toUpperCase() + token.slice(1);
    body.push(`## ${heading}`, '', '1. First step', '2. Second step', '');
  } else {
    body.push('TODO: write the topic body.', '');
  }

  return ['---', ...frontmatter, '---', '', ...body].join('\n');
}
