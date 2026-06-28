/**
 * i18n as an orthogonal axis (design decision 6): language selects which
 * variant of a topic is served, never which topics appear. It is never a filter
 * dimension.
 *
 * This module computes per-locale coverage and detects stale translations
 * (source modified after its variant). It uses the suffix strategy already
 * resolved by the parser: `topic.md` is canonical, `topic.de.md` is the `de`
 * variant of the same id.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { DocsSchema } from '../types/index.js';
import type { ParsedTopic } from '../parser/index.js';
import type { StaleTranslation } from '../indexer/types.js';

export interface I18nReport {
  /** locale → coverage percentage string, e.g. `de: "25%"`. */
  i18n_coverage: Record<string, string>;
  stale_translations: StaleTranslation[];
}

export interface I18nOptions {
  /**
   * Resolve a topic's last-modified time in ms. Defaults to the file's fs mtime
   * resolved under `rootDir`. Injectable for deterministic testing.
   */
  getMtime?: (topic: ParsedTopic) => number;
  /** Root the topic `path` is relative to (for the default fs mtime lookup). */
  rootDir?: string;
}

function percentage(have: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((have / total) * 100)}%`;
}

/** Compute i18n coverage and stale-translation findings for a set of topics. */
export function buildI18nReport(
  topics: ParsedTopic[],
  schema: DocsSchema,
  options: I18nOptions = {},
): I18nReport {
  const rootDir = options.rootDir ?? '.';
  const getMtime =
    options.getMtime ?? ((t: ParsedTopic): number => statSync(join(rootDir, t.path)).mtimeMs);

  const canonical = topics.filter((t) => !t.isVariant);
  const variants = topics.filter((t) => t.isVariant);

  // Coverage: share of canonical topics that have a variant in each locale.
  const i18n_coverage: Record<string, string> = {};
  for (const locale of [...schema.i18n.locales].sort()) {
    const have = canonical.filter((c) =>
      variants.some((v) => v.id === c.id && v.locale === locale),
    ).length;
    i18n_coverage[locale] = percentage(have, canonical.length);
  }

  // Stale: a variant whose canonical source was modified more recently.
  const canonicalById = new Map(canonical.map((c) => [c.id, c]));
  const stale_translations: StaleTranslation[] = [];
  for (const variant of variants) {
    const source = canonicalById.get(variant.id);
    if (!source) continue;
    if (getMtime(source) > getMtime(variant)) {
      stale_translations.push({
        topic: variant.id,
        locale: variant.locale,
        reason: 'source updated after translation',
      });
    }
  }
  stale_translations.sort(
    (a, b) => a.topic.localeCompare(b.topic) || a.locale.localeCompare(b.locale),
  );

  return { i18n_coverage, stale_translations };
}
