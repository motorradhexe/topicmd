/**
 * Fragment resolver: expands `<!-- @include: <target> -->` directives.
 *
 * Include targets are resolved relative to the directory of the file that
 * contains the directive (matching the authoring convention
 * `../../fragments/x.md`). Includes may nest; cycles and missing files are
 * reported as diagnostics rather than throwing.
 *
 * Fragments are not topics (design decision 2): they are inlined here and their
 * usage is recorded for the index (#8). This module does not aggregate the
 * index itself, nor substitute variables (#14).
 */
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve as resolvePath } from 'node:path';
import matter from 'gray-matter';
import type { Diagnostic } from '../types/index.js';
import { makeIncludeRegex } from '../parser/include.js';

export interface FragmentResolverOptions {
  /** Root used to compute relative paths in usage and diagnostics. */
  rootDir?: string;
  /** Safety limit on include nesting depth. Default 50. */
  maxDepth?: number;
  /** Injectable file reader (defaults to `fs.readFileSync`). Eases testing. */
  readFile?: (absPath: string) => string;
}

export interface FragmentResolution {
  /** Content with every resolvable include expanded in place. */
  content: string;
  /** Root-relative paths of fragments included (deduped, first-seen order). */
  fragments: string[];
  /** Missing-file and cycle findings. */
  diagnostics: Diagnostic[];
}

interface ResolverContext {
  readFile: (absPath: string) => string;
  rootDir?: string;
  maxDepth: number;
  fragments: Set<string>;
  diagnostics: Diagnostic[];
}

function toRelative(ctx: ResolverContext, absPath: string): string {
  return ctx.rootDir ? relative(ctx.rootDir, absPath) : absPath;
}

/**
 * Expand includes found in `content`, whose directives resolve relative to
 * `baseDir`. `stack` holds the absolute paths currently being expanded, for
 * cycle detection; `sourceRel` labels diagnostics.
 */
function expand(
  content: string,
  baseDir: string,
  sourceRel: string,
  stack: string[],
  ctx: ResolverContext,
): string {
  if (stack.length > ctx.maxDepth) {
    ctx.diagnostics.push({
      severity: 'error',
      code: 'fragment-max-depth',
      message: `Include nesting exceeds maxDepth (${ctx.maxDepth})`,
      file: sourceRel,
    });
    return content;
  }

  return content.replace(makeIncludeRegex(), (raw, rawTarget: string) => {
    const target = rawTarget.trim();
    const absTarget = resolvePath(baseDir, target);
    const relTarget = toRelative(ctx, absTarget);

    if (stack.includes(absTarget)) {
      ctx.diagnostics.push({
        severity: 'error',
        code: 'fragment-cycle',
        message: `Include cycle detected: ${relTarget} is already being included`,
        file: sourceRel,
      });
      return '';
    }

    let fragmentRaw: string;
    try {
      fragmentRaw = ctx.readFile(absTarget);
    } catch {
      ctx.diagnostics.push({
        severity: 'error',
        code: 'missing-fragment',
        message: `Included fragment not found: ${relTarget}`,
        file: sourceRel,
      });
      return '';
    }

    ctx.fragments.add(relTarget);

    // Fragments are content snippets; strip any frontmatter before inlining.
    const fragmentBody = matter(fragmentRaw).content;
    return expand(
      fragmentBody,
      dirname(absTarget),
      relTarget,
      [...stack, absTarget],
      ctx,
    );
  });
}

function makeContext(options: FragmentResolverOptions): ResolverContext {
  return {
    readFile: options.readFile ?? ((p) => readFileSync(p, 'utf8')),
    rootDir: options.rootDir,
    maxDepth: options.maxDepth ?? 50,
    fragments: new Set<string>(),
    diagnostics: [],
  };
}

/**
 * Resolve includes within an in-memory body.
 *
 * @param body the content to expand (frontmatter already stripped)
 * @param baseDir directory the directives resolve against (the including file's
 *   directory, absolute)
 * @param sourcePath path of the including file, for diagnostics (absolute or
 *   already relative)
 */
export function resolveFragments(
  body: string,
  baseDir: string,
  sourcePath: string,
  options: FragmentResolverOptions = {},
): FragmentResolution {
  const ctx = makeContext(options);
  const sourceRel = options.rootDir
    ? relative(options.rootDir, sourcePath)
    : sourcePath;
  const content = expand(body, baseDir, sourceRel, [sourcePath], ctx);
  return {
    content,
    fragments: [...ctx.fragments],
    diagnostics: ctx.diagnostics,
  };
}

/**
 * Read a topic file and resolve its fragment includes. Frontmatter is stripped
 * before expansion; only the body is returned (expanded).
 */
export function resolveFragmentsInFile(
  filePath: string,
  options: FragmentResolverOptions = {},
): FragmentResolution {
  const readFile = options.readFile ?? ((p) => readFileSync(p, 'utf8'));
  const body = matter(readFile(filePath)).content;
  return resolveFragments(body, dirname(filePath), filePath, options);
}
