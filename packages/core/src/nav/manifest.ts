/**
 * Nav manifest model and parser. Navigation is decoupled from the content tree
 * (design decision 3): manifests reference topics by path; topics never know
 * their nav position.
 *
 * Input shape (`nav/*.yaml`):
 *   title: ...
 *   sections:
 *     - Section Title:
 *         - ./docs/a.md
 *         - Subsection:
 *             - ./docs/b.md
 */
import { readFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';

/** A leaf entry: a topic referenced by its path, exactly as written. */
export interface NavTopicNode {
  topic: string;
}

/** A grouping with a title and (possibly nested) children. */
export interface NavSectionNode {
  section: string;
  children: NavNode[];
}

export type NavNode = NavTopicNode | NavSectionNode;

export interface NavManifest {
  title: string;
  sections: NavNode[];
}

export function isTopicNode(node: NavNode): node is NavTopicNode {
  return 'topic' in node;
}

function parseNode(raw: unknown): NavNode {
  if (typeof raw === 'string') return { topic: raw };
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const entries = Object.entries(raw as Record<string, unknown>);
    if (entries.length === 1) {
      const [section, children] = entries[0]!;
      const list = Array.isArray(children) ? children : [];
      return { section, children: list.map(parseNode) };
    }
  }
  throw new Error(`Invalid nav node: ${JSON.stringify(raw)}`);
}

/** Parse a nav manifest from YAML text. */
export function parseNavManifest(yamlText: string): NavManifest {
  const raw = parseYaml(yamlText) as { title?: unknown; sections?: unknown } | null;
  const title = typeof raw?.title === 'string' ? raw.title : '';
  const sections = Array.isArray(raw?.sections) ? raw.sections.map(parseNode) : [];
  return { title, sections };
}

/** Read and parse a nav manifest file. */
export function loadNavManifest(path: string): NavManifest {
  return parseNavManifest(readFileSync(path, 'utf8'));
}

function nodeToObject(node: NavNode): unknown {
  return isTopicNode(node)
    ? node.topic
    : { [node.section]: node.children.map(nodeToObject) };
}

/** Convert a manifest back to the plain input shape (for YAML/JSON output). */
export function navManifestToObject(manifest: NavManifest): {
  title: string;
  sections: unknown[];
} {
  return { title: manifest.title, sections: manifest.sections.map(nodeToObject) };
}
