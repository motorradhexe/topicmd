---
title: Core concepts
description: Topics, fragments, variables, dimensions, profiles, i18n, and the index.
---

## Topics

A **topic** is a navigable, indexed content unit: a Markdown file (`.mdx` opt-in)
with YAML frontmatter. Each topic has a stable `id` derived from its path
(without extension and locale suffix), so the canonical file and its locale
variants share one id.

## Fragments

A **fragment** is a reusable Markdown snippet that lives under a dedicated path
(default `fragments/`). Fragments are **never** navigable and never appear as
standalone items in the index — the index only records which topics include them.

Include a fragment with an HTML comment (invisible to renderers):

```markdown
<!-- @include: ../../fragments/prerequisites-admin.md -->
```

## Variables

Project-wide values live in `docs.vars.yaml` and are referenced as
`{{vars.key}}`:

```markdown
Welcome to {{vars.product_name}}.
```

## Dimensions

**Dimensions** are configurable filter axes — core knows only the concept of "a
dimension with an id, label, and values". A project defines its own:

```yaml
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
  - id: audience
    label: Role
    values: [developer, admin]
```

Topics declare dimension assignments in frontmatter; ids and values are validated
against the schema.

## Profiles

A **profile** is a named, *partial* filter combination over dimensions.
Unspecified dimensions are unfiltered, and a topic with no assignment for a
dimension is agnostic to it. Profiles never duplicate content — the same topic
can satisfy many profiles.

```yaml
profiles:
  - id: dev-beginner
    label: "Developer – Getting Started"
    filters:
      product: alpha
      audience: developer
```

## i18n

Language is **orthogonal** to dimensions — it determines which *variant* of a
topic is served, never which topics appear. Locale variants use a filename
suffix; the canonical file is the source language:

```text
concepts/what-is-alpha.md       ← canonical (source language)
concepts/what-is-alpha.de.md    ← German variant
concepts/what-is-alpha.fr.md    ← missing → coverage gap
```

## The index

`docs.index.json` is the generated, deterministic artifact that ties it all
together: topics, fragments, relationships, coverage per profile, gaps,
validation diagnostics, i18n coverage, and stale translations. It is the source
of truth for tooling and AI context, and is not versioned in git. See
[Variables, nav & index](../../schema/artifacts/).
