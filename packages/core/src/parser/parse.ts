/**
 * Topic parser: frontmatter via gray-matter, body AST via unified + remark.
 *
 * MDX is opt-in (`options.mdx`): only then is `remark-mdx` applied, which makes
 * `remark` tolerate JSX as opaque regions. JSX is never interpreted, validated,
 * or understood — it is a passthrough.
 *
 * This module only parses and extracts structure (frontmatter, headings, links,
 * include directives). It does not resolve fragments (#6), substitute variables
 * (#14), or validate (#7).
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import matter from 'gray-matter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Root } from 'mdast';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Topic, TopicFrontmatter } from '../types/index.js';
import { makeIncludeRegex } from './include.js';

/** A heading extracted from the body, used for structural contracts (#7). */
export interface TopicHeading {
  /** Heading level: 1 for `#`, 2 for `##`, … */
  depth: number;
  /** Plain-text content of the heading. */
  text: string;
}

/** A markdown link extracted from the body, used for relationship tracking. */
export interface TopicLink {
  url: string;
  /** Plain-text link label. */
  text: string;
}

/** A fragment include directive: `<!-- @include: <target> -->`. */
export interface IncludeDirective {
  /** The include target path, exactly as written. */
  target: string;
  /** The full raw comment, useful for source replacement later (#6). */
  raw: string;
}

/** A parsed topic: the `Topic` (#2) plus extracted structural metadata. */
export interface ParsedTopic extends Topic {
  headings: TopicHeading[];
  links: TopicLink[];
  includes: IncludeDirective[];
  /** True if the body contains at least one ordered list (for `steps`). */
  hasOrderedList: boolean;
}

export interface TopicParserOptions {
  /** Enable MDX parsing. Derive from `schema.format.extensions` containing `mdx`. */
  mdx?: boolean;
  /** Source language. Defaults to `en`. A file in this language is canonical. */
  defaultLocale?: string;
  /** Known locales; used to detect a `.<locale>` suffix in the filename. */
  locales?: string[];
}

interface DerivedIdentity {
  id: string;
  locale: string;
  isVariant: boolean;
}

/**
 * Derive `{ id, locale, isVariant }` from a topic path using the suffix
 * convention: `concepts/x.md` is canonical, `concepts/x.de.md` is the `de`
 * variant of the same `id`.
 */
export function deriveIdentity(
  path: string,
  defaultLocale = 'en',
  locales: string[] = [],
): DerivedIdentity {
  // Strip a single known extension (.md / .mdx).
  const withoutExt = path.replace(/\.(md|mdx)$/i, '');
  // A trailing `.<locale>` segment marks a variant.
  const match = /\.([^.\\/]+)$/.exec(withoutExt);
  if (match && locales.includes(match[1]!)) {
    return {
      id: withoutExt.slice(0, -(match[1]!.length + 1)),
      locale: match[1]!,
      isVariant: true,
    };
  }
  return { id: withoutExt, locale: defaultLocale, isVariant: false };
}

/**
 * Split frontmatter from body defensively. `gray-matter` can throw on malformed
 * YAML and may return non-object `data`; rather than crash, fall back to empty
 * frontmatter and let the validator (#7) report the resulting missing fields.
 */
function splitFrontmatter(content: string): { frontmatter: TopicFrontmatter; body: string } {
  let data: unknown;
  let body: string;
  try {
    const parsed = matter(content);
    data = parsed.data;
    body = parsed.content;
  } catch {
    return { frontmatter: {} as TopicFrontmatter, body: content };
  }
  const isPlainObject = !!data && typeof data === 'object' && !Array.isArray(data);
  return {
    frontmatter: (isPlainObject ? data : {}) as TopicFrontmatter,
    body,
  };
}

function buildProcessor(mdx: boolean) {
  const processor = unified().use(remarkParse);
  if (mdx) processor.use(remarkMdx);
  return processor;
}

function extractIncludes(raw: string): IncludeDirective[] {
  const includes: IncludeDirective[] = [];
  for (const m of raw.matchAll(makeIncludeRegex())) {
    includes.push({ target: m[1]!.trim(), raw: m[0] });
  }
  return includes;
}

function extractFromTree(tree: Root): {
  headings: TopicHeading[];
  links: TopicLink[];
  hasOrderedList: boolean;
} {
  const headings: TopicHeading[] = [];
  const links: TopicLink[] = [];
  let hasOrderedList = false;

  visit(tree, (node) => {
    if (node.type === 'heading') {
      headings.push({ depth: node.depth, text: mdastToString(node) });
    } else if (node.type === 'link') {
      links.push({ url: node.url, text: mdastToString(node) });
    } else if (node.type === 'list' && node.ordered === true) {
      hasOrderedList = true;
    }
  });

  return { headings, links, hasOrderedList };
}

/**
 * Parse a topic from its path and raw contents.
 *
 * @param source `path` is used to derive id/locale; `content` is the raw file
 *   text including frontmatter.
 */
export function parseTopic(
  source: { path: string; content: string },
  options: TopicParserOptions = {},
): ParsedTopic {
  const { mdx = false, defaultLocale = 'en', locales = [] } = options;

  const { frontmatter, body } = splitFrontmatter(source.content);

  const tree = buildProcessor(mdx).parse(body) as Root;
  const { headings, links, hasOrderedList } = extractFromTree(tree);
  const includes = extractIncludes(body);

  const { id, locale, isVariant } = deriveIdentity(
    source.path,
    defaultLocale,
    locales,
  );

  return {
    path: source.path,
    id,
    locale,
    isVariant,
    frontmatter,
    body,
    headings,
    links,
    includes,
    hasOrderedList,
  };
}

/**
 * Read and parse a topic file from disk.
 *
 * @param filePath absolute or cwd-relative path to the topic file
 * @param options parser options; `rootDir` makes the stored `path`/`id`
 *   relative to a content root (defaults to the path as given)
 */
export function parseTopicFile(
  filePath: string,
  options: TopicParserOptions & { rootDir?: string } = {},
): ParsedTopic {
  const content = readFileSync(filePath, 'utf8');
  const path = options.rootDir ? relative(options.rootDir, filePath) : filePath;
  return parseTopic({ path, content }, options);
}
