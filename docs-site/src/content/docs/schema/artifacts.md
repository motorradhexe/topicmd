---
title: Variables, nav & index
description: docs.vars.yaml, nav manifests, and the generated docs.index.json.
---

## `docs.vars.yaml`

Project-wide substitution values, referenced in topics as `{{vars.key}}`:

```yaml
product_name: Alpha
company: Acme
support_email: support@example.com
```

Unknown references emit an `unknown-variable` warning; references resolving to a
non-scalar value emit `non-scalar-variable`.

## Navigation manifests — `nav/*.yaml`

Navigation is **decoupled from the content tree**: manifests reference topics by
path, and topics have no knowledge of their nav position. The same topic can
appear in multiple nav contexts without duplication.

```yaml
# nav/product-alpha.yaml
title: Alpha Documentation
sections:
  - Getting Started:
      - ./docs/concepts/what-is-alpha.md
      - ./docs/tasks/quickstart.md
  - Reference:
      - ./docs/reference/api.md
```

[`topicmd nav build`](../../cli/nav-build/) turns these into a base manifest, one
filtered manifest per profile, and a `profiles.json`.

## The index — `docs.index.json`

A generated, deterministic artifact (typically git-ignored). It is the primary
source of truth for tooling and AI context.

```json
{
  "topics": [],
  "fragments": [],
  "relationships": {
    "links": [],
    "orphans": [],
    "duplicates_suspected": [],
    "fragment_usage": {}
  },
  "coverage": {
    "by_profile": { "dev-beginner": { "concept": 3, "task": 2, "reference": 0 } },
    "gaps": [
      { "profile": "dev-beginner", "missing": "no reference topic for product=alpha, audience=developer, level=beginner" }
    ]
  },
  "i18n_coverage": { "de": "25%", "fr": "0%" },
  "stale_translations": [
    { "topic": "concepts/what-is-alpha", "locale": "de", "reason": "source updated after translation" }
  ],
  "variables": {},
  "diagnostics": []
}
```

| Key | Description |
| --- | --- |
| `topics` | Indexed topics with id, locale, path, frontmatter, and headings/links. |
| `fragments` | Known fragment files (never standalone navigable items). |
| `relationships.links` | Resolved `from → to` edges from `related` and Markdown links. |
| `relationships.orphans` | Canonical topics with no incoming or outgoing edges. |
| `relationships.duplicates_suspected` | Topics sharing a title (case-insensitive). |
| `relationships.fragment_usage` | Map of fragment id → topics that include it. |
| `coverage.by_profile` | Topic-type counts per profile. |
| `coverage.gaps` | Profile/type combinations with no matching content. |
| `i18n_coverage` | Per-locale coverage percentage. |
| `stale_translations` | Variants older than their source. |
| `variables` | Resolved `docs.vars.yaml` values. |
| `diagnostics` | Validation findings (so tooling needn't re-parse). |

Output is sorted deterministically, so identical inputs produce byte-identical
files.
