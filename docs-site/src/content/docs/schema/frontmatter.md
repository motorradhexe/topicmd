---
title: Topic frontmatter
description: The frontmatter fields topicmd understands, and how dimensions are declared.
---

Topic frontmatter is YAML at the top of a topic file. The conventional fields are
below; any topic type may require or allow additional project-specific fields.
Per-type enforcement is the validator's job — see [Diagnostics](../../cli/diagnostics/).

```yaml
---
title: "Authentication Guide"
topic_type: task
description: "How to authenticate against the Alpha API."
dimensions:
  product: [alpha, beta]
  audience: developer
  level: advanced
related:
  - concepts/what-is-alpha
tags: [auth, security]
---
```

## Conventional fields

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Usually required by every type. |
| `topic_type` | string | Must match a key in `topic_types`. Always required. |
| `description` | string | Required by some types (e.g. `concept`). |
| `dimensions` | map | Dimension assignments (see below). |
| `related` | string[] | Ids/paths of related topics; used to derive relationship links. |
| `tags` | string[] | Free-form tags. |
| `version` | string | Required by some types (e.g. `reference`). |

Any field outside a type's `required ∪ optional` set produces an `unknown-field`
warning (not an error).

## Dimension assignments

Under `dimensions`, each key is a dimension id and each value is a single value
or a list:

```yaml
dimensions:
  product: [alpha, beta]   # applies to both products
  audience: developer      # single value
```

- Unknown dimension ids → `unknown-dimension-id` (error).
- Values outside the dimension's declared `values` → `unknown-dimension-value`
  (error).
- A topic that omits a dimension is **agnostic** to it and matches every profile
  for that axis.

## Locale variants

A variant is the same topic in another language, named with a locale suffix:

```text
concepts/what-is-alpha.md       # canonical (source language)
concepts/what-is-alpha.de.md    # de variant — shares the id concepts/what-is-alpha
```

Variants share the canonical `id`; language never affects which topics exist,
only which variant is served.
