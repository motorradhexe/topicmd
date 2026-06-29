/**
 * Pure view-model for the Topics panel: turn a core `DocsIndex` + schema into a
 * flat, faceted list of topic cards. No VS Code or I/O dependencies, so it is
 * unit-testable. The panel manages topics by *meaning* (type, dimensions,
 * profiles, locale, tags) rather than by folder structure.
 */
import { matchesFilters, type DocsIndex, type DocsSchema } from '@topicmd/core';

export interface TopicCard {
  id: string;
  title: string;
  /** Root-relative path to the source file. */
  path: string;
  type: string;
  locale: string;
  isVariant: boolean;
  dimensions: Record<string, string[]>;
  tags: string[];
  related: string[];
  /** Ids of the profiles whose filters this topic satisfies. */
  profiles: string[];
  /** This canonical topic has no incoming/outgoing relationship links. */
  orphan: boolean;
  /** A required field (or topic_type) is missing for this topic. */
  missingFields: boolean;
  /** This variant is older than its source (stale translation). */
  stale: boolean;
  /** For canonical topics: locales that have no variant yet. */
  missingLocales: string[];
}

export interface DimensionFacet {
  id: string;
  label: string;
  values: string[];
}

export interface ProfileFacet {
  id: string;
  label: string;
}

export interface TopicsFacets {
  types: string[];
  dimensions: DimensionFacet[];
  profiles: ProfileFacet[];
  /** Source language first, then the configured locales. */
  locales: string[];
  /** Every tag used across topics, sorted. */
  tags: string[];
}

export interface TopicsModel {
  topics: TopicCard[];
  facets: TopicsFacets;
  i18n: { coverage: Record<string, string>; staleCount: number };
}

const MISSING_FIELD_CODES = new Set([
  'missing-required-field',
  'missing-topic-type',
  'unknown-topic-type',
]);

/** Build the Topics panel model from a core index and the schema. */
export function buildTopicsModel(index: DocsIndex, schema: DocsSchema): TopicsModel {
  const orphans = new Set(index.relationships.orphans);
  const stale = new Set(index.stale_translations.map((s) => `${s.topic}@${s.locale}`));

  const filesWithMissing = new Set(
    index.diagnostics
      .filter((d) => d.severity === 'error' && d.code && MISSING_FIELD_CODES.has(d.code) && d.file)
      .map((d) => d.file as string),
  );

  // Which locales exist per canonical id, so we can compute i18n gaps.
  const localesById = new Map<string, Set<string>>();
  for (const t of index.topics) {
    if (!localesById.has(t.id)) localesById.set(t.id, new Set());
    localesById.get(t.id)!.add(t.locale);
  }
  const allLocales = [schema.i18n.default, ...schema.i18n.locales];

  const topics: TopicCard[] = index.topics.map((t) => {
    const profiles = schema.profiles
      .filter((p) => matchesFilters(t.dimensions, p.filters))
      .map((p) => p.id);

    const missingLocales = t.isVariant
      ? []
      : allLocales.filter((loc) => loc !== t.locale && !localesById.get(t.id)?.has(loc));

    return {
      id: t.id,
      title: t.title || t.id,
      path: t.path,
      type: t.topic_type,
      locale: t.locale,
      isVariant: t.isVariant,
      dimensions: t.dimensions,
      tags: t.tags,
      related: t.related,
      profiles,
      orphan: !t.isVariant && orphans.has(t.id),
      missingFields: filesWithMissing.has(t.path),
      stale: stale.has(`${t.id}@${t.locale}`),
      missingLocales,
    };
  });

  topics.sort((a, b) => a.id.localeCompare(b.id) || a.locale.localeCompare(b.locale));

  const tags = [...new Set(index.topics.flatMap((t) => t.tags))].sort();

  return {
    topics,
    facets: {
      types: Object.keys(schema.topic_types).sort(),
      dimensions: schema.dimensions.map((d) => ({ id: d.id, label: d.label, values: d.values })),
      profiles: schema.profiles.map((p) => ({ id: p.id, label: p.label })),
      locales: allLocales,
      tags,
    },
    i18n: {
      coverage: index.i18n_coverage,
      staleCount: index.stale_translations.length,
    },
  };
}
