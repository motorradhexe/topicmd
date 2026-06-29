/**
 * Frontmatter writer: re-serialize a topic file with edited frontmatter while
 * preserving the Markdown body. Used by tooling (e.g. the VS Code Topics panel)
 * to set dimensions/metadata through a UI instead of hand-editing YAML.
 *
 * This is the inverse of the read side in `parse.ts`. It is pure (no I/O) and
 * delegates YAML (de)serialization to gray-matter.
 */
import matter from 'gray-matter';

/** A patch over frontmatter fields. A value of `undefined` removes the key. */
export type FrontmatterPatch = Record<string, unknown>;

/**
 * Apply `patch` to the frontmatter of `source` and return the new file text.
 * Existing fields not named in the patch are kept; a key set to `undefined` is
 * removed. The body is preserved verbatim.
 */
export function updateFrontmatter(source: string, patch: FrontmatterPatch): string {
  let data: Record<string, unknown> = {};
  let body = source;
  try {
    const parsed = matter(source);
    data = (parsed.data ?? {}) as Record<string, unknown>;
    body = parsed.content;
  } catch {
    // Malformed YAML: treat as no existing frontmatter and keep the raw text as
    // the body, so we never throw away the author's content.
    data = {};
    body = source;
  }

  const next: Record<string, unknown> = { ...data };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }

  // matter.stringify writes `---\n<yaml>---\n` followed by the body.
  return matter.stringify(body, next);
}
