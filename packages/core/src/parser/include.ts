/**
 * Shared definition of the fragment include directive
 * `<!-- @include: path/to/fragment.md -->` — an HTML comment, invisible to
 * Markdown renderers.
 *
 * Exposed as a factory rather than a shared constant: the `g` flag carries
 * mutable `lastIndex` state, so each caller (`matchAll` in the parser,
 * `replace` in the fragment resolver) gets its own instance to avoid cross-talk.
 */
export function makeIncludeRegex(): RegExp {
  return /<!--\s*@include:\s*(.+?)\s*-->/g;
}
