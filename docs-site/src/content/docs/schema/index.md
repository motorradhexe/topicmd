---
title: docs.schema.yaml
description: The full content model — format, fragments, dimensions, profiles, topic types, and i18n.
---

`docs.schema.yaml` lives in the repo root and defines the complete content model
for a project. It is validated on load; problems throw a `SchemaError`.

## Top-level shape

```yaml
format:
  primary: markdown
  extensions: [mdx]        # opt-in: activates the remark-mdx parser

fragments:
  path: fragments/         # relative to repo root

dimensions: [...]          # configurable filter axes
profiles: [...]            # named partial filter combinations
topic_types: {...}         # required/optional fields + contracts
i18n: {...}                # language configuration
```

## `format`

| Field | Default | Description |
| --- | --- | --- |
| `primary` | `markdown` | The primary content format. |
| `extensions` | `[]` | Extra extensions. Include `mdx` to activate `remark-mdx` (JSX is tolerated as opaque regions, never interpreted). |

## `fragments`

| Field | Default | Description |
| --- | --- | --- |
| `path` | `fragments/` | Directory (relative to root) holding reusable fragments. Excluded from topic discovery. |

## `dimensions`

A list of configurable filter axes. Core hardcodes none of them.

```yaml
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
  - id: audience
    label: Role
    values: [developer, admin]
```

| Field | Description |
| --- | --- |
| `id` | Unique dimension id (must be unique across the list). |
| `label` | Human-readable label. |
| `values` | Allowed values. Topic frontmatter is validated against these. |

## `profiles`

Named, **partial** filter combinations over dimensions. Unspecified dimensions
are unfiltered.

```yaml
profiles:
  - id: dev-beginner
    label: "Developer – Getting Started"
    filters:
      product: alpha
      audience: developer
      level: beginner
  - id: admin-all
    label: "Admin (all levels)"
    filters:
      audience: admin        # partial: all products, all levels
```

Every key in `filters` must reference a declared dimension, and every value must
be one of that dimension's `values`.

## `topic_types`

Each topic type declares its field and structural contracts.

```yaml
topic_types:
  concept:
    required: [title, description, topic_type]
    optional: [dimensions, related, tags]
  task:
    required: [title, topic_type]
    optional: [dimensions, tags]
    contract:
      must_contain: steps     # an "## Steps" heading or an ordered list
  reference:
    required: [title, topic_type, version]
    optional: [dimensions, tags]
```

| Field | Description |
| --- | --- |
| `required` | Fields that must be present and non-empty. |
| `optional` | Additionally allowed fields. Fields outside `required ∪ optional` produce an `unknown-field` warning. |
| `contract.must_contain` | A token the body must contain. `steps` is satisfied by an `## Steps` heading **or** an ordered list. |

## `i18n`

```yaml
i18n:
  default: en
  locales: [de, fr]
  strategy: suffix
```

| Field | Default | Description |
| --- | --- | --- |
| `default` | `en` | Source language. Canonical files are in this language. |
| `locales` | `[]` | Additional locales. `default` must **not** appear here. |
| `strategy` | `suffix` | Variant naming strategy: `topic.<locale>.md`. |

Continue to [Topic frontmatter](./frontmatter/) and
[Variables, nav & index](./artifacts/).
