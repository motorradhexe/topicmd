/**
 * Profile-aware nav generation. Produces a filtered nav manifest per profile
 * (static, framework-agnostic) and a `profiles.json` for optional client-side
 * switching. No rendering, no file writing (that is the CLI's job, #17).
 */
import { dump } from 'js-yaml';
import type { DocsSchema } from '../types/index.js';
import type { DocsIndex } from '../indexer/index.js';
import { matchesFilters } from './match.js';
import { isTopicNode, navManifestToObject, type NavManifest, type NavNode } from './manifest.js';

function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}

/**
 * Filter a manifest to the topics whose dimensions satisfy `filters`. Sections
 * left empty after filtering are dropped. Entries that don't resolve to a known
 * topic are passed through unchanged (the nav references something the index
 * doesn't know about — not ours to silently drop).
 */
export function filterNav(
  manifest: NavManifest,
  index: DocsIndex,
  filters: Record<string, string | string[]>,
): NavManifest {
  const byPath = new Map(index.topics.map((t) => [t.path, t]));

  const filterNode = (node: NavNode): NavNode | null => {
    if (isTopicNode(node)) {
      const topic = byPath.get(normalizePath(node.topic));
      if (!topic) return node; // unknown → pass through
      return matchesFilters(topic.dimensions, filters) ? node : null;
    }
    const children = node.children
      .map(filterNode)
      .filter((n): n is NavNode => n !== null);
    return children.length > 0 ? { section: node.section, children } : null;
  };

  const sections = manifest.sections
    .map(filterNode)
    .filter((n): n is NavNode => n !== null);
  return { title: manifest.title, sections };
}

/** Build one filtered manifest per profile defined in the schema. */
export function generateProfileNavs(
  manifest: NavManifest,
  index: DocsIndex,
  schema: DocsSchema,
): Record<string, NavManifest> {
  const out: Record<string, NavManifest> = {};
  for (const profile of schema.profiles) {
    out[profile.id] = filterNav(manifest, index, profile.filters);
  }
  return out;
}

export interface ProfileEntry {
  id: string;
  label: string;
  filters: Record<string, string | string[]>;
}

export interface ProfilesManifest {
  default_locale: string;
  profiles: ProfileEntry[];
}

/** Build the `profiles.json` payload from the schema. */
export function buildProfilesManifest(schema: DocsSchema): ProfilesManifest {
  return {
    default_locale: schema.i18n.default,
    profiles: schema.profiles.map((p) => ({
      id: p.id,
      label: p.label,
      filters: p.filters,
    })),
  };
}

/** Serialize `profiles.json` (newline-terminated). */
export function serializeProfiles(schema: DocsSchema): string {
  return `${JSON.stringify(buildProfilesManifest(schema), null, 2)}\n`;
}

/** Serialize a nav manifest back to YAML (input-compatible shape). */
export function serializeNavManifest(manifest: NavManifest): string {
  return dump(navManifestToObject(manifest));
}
