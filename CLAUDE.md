# topicmd

A docs-as-code toolchain that brings semantic structure, reusable content, dynamic navigation profiles, i18n coverage tracking, and AI-assisted topic management to Markdown-based documentation projects. MDX support is opt-in.

## Core Philosophy

Documentation is not "code with text files" — it is **relationships with files**. The file system provides physical storage. Semantic structure, relationships, navigation, audience targeting, and language variants are separate concerns that should be explicitly modeled.

## Architecture

### Content Layer

| Artifact | Format | Purpose |
|---|---|---|
| Topics | `.md` (`.mdx` opt-in) | Navigable, indexed content units |
| Fragments | `.md` only | Reusable content snippets — not navigable, not standalone in index |
| Variables | `docs.vars.yaml` | Project-wide substitution values |

**Fragment include syntax** (Markdown comment, invisible to renderers):
```markdown
<!-- @include: ../../fragments/prerequisites-admin.md -->
```

**Variable syntax**:
```markdown
{{vars.product_name}}
```

**Locale variant naming** (suffix convention):
```
concepts/what-is-alpha.md       ← canonical (source language)
concepts/what-is-alpha.de.md    ← German variant
concepts/what-is-alpha.fr.md    ← missing → i18n coverage gap
```

---

### Schema Layer — `docs.schema.yaml`

Defines the full content model for a project. Lives in repo root.

```yaml
format:
  primary: markdown
  extensions: [mdx]             # opt-in: activates remark-mdx parser

fragments:
  path: fragments/              # relative to repo root

# Dimensions: configurable filter axes — no hardcoded fields.
# Each project defines its own. Core model knows only the concept "dimension".
dimensions:
  - id: product
    label: Product
    values: [alpha, beta]
  - id: audience
    label: Role
    values: [developer, admin]
  - id: level
    label: Experience
    values: [beginner, advanced]
  # Add any further dimensions freely:
  # - id: version
  #   label: Version
  #   values: [v2, v3]
  # - id: region
  #   label: Region
  #   values: [eu, us]

# Profiles: named filter combinations over dimensions.
# Partial filters are valid — unspecified dimensions are unfiltered.
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
      audience: admin           # partial: all products, all levels

# Topic types: define required/optional fields and structural contracts.
topic_types:
  concept:
    required: [title, description, topic_type]
    optional: [dimensions, related, tags]
  task:
    required: [title, topic_type]
    optional: [dimensions, tags]
    contract:
      must_contain: steps       # validates H2 "## Steps" or ordered list exists
  reference:
    required: [title, topic_type, version]
    optional: [dimensions, tags]

# i18n: language support as orthogonal axis — separate from dimensions.
# Language determines which variant of a topic is served, not which topics appear.
i18n:
  default: en
  locales: [de, fr]
  strategy: suffix              # canonical: topic.md, variants: topic.de.md
```

**Topic frontmatter** using dimensions:
```yaml
---
title: "Authentication Guide"
topic_type: task
dimensions:
  product: [alpha, beta]
  audience: developer
  level: advanced
---
```

Dimension IDs in frontmatter are validated against the schema automatically. Core never hardcodes which dimensions exist.

---

### Navigation Layer — `nav/*.yaml`

Navigation manifests are **decoupled from the content tree**. Topics don't know where they appear in navigation. The same topic can appear in multiple nav contexts without duplication.

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

**Profile-aware nav generation**: topicmd generates a filtered nav manifest per profile at build time. This produces static, framework-agnostic output. A `profiles.json` is also generated for optional client-side switching. No server required.

---

### Index Layer — `docs.index.json`

Generated artifact (not versioned in git — in `.gitignore`), updated per build/commit. This is the **primary AI context artifact** — all AI-assisted features consume the index, not raw files.

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
    "by_profile": {
      "dev-beginner": {
        "concept": 3,
        "task": 2,
        "reference": 0
      }
    },
    "gaps": [
      {
        "profile": "dev-beginner",
        "missing": "no reference topic for product=alpha, audience=developer, level=beginner"
      }
    ]
  },
  "i18n_coverage": {
    "de": "87%",
    "fr": "23%"
  },
  "stale_translations": [
    {
      "topic": "concepts/what-is-alpha",
      "locale": "de",
      "reason": "source updated after translation"
    }
  ],
  "terms": [],
  "variables": {}
}
```

---

## Development Workflow

**Always work through the kanban-md board.** This repo tracks all work as Markdown
task files under `kanban/` (config in `kanban/config.yml`, tasks in `kanban/tasks/`).
There is no untracked work: every change starts from a ticket.

- **Ticket-driven**: create or pick a task before coding. Flow:
  `backlog → todo → in-progress → review → done`. Set a task to `in-progress`
  (claim it) when you start, and to `review`/`done` when it's complete.
- **Commit convention**: alongside the substantive commits, mark board changes with
  `chore(board): task #NN done` so history stays in sync with the board.
- **Parallel agents are allowed** — multiple agents may work different tickets at the
  same time **as long as the task dependencies allow it** (no shared files, no ordering
  constraint between them). Tickets that depend on each other (`depends_on`) are
  serialized; independent tickets run in parallel. See the `kanban-based-development`
  convention for claims and handoffs.

---

## Package Structure (pnpm monorepo)

```
packages/
  core/     — parsing, schema loading, validation, indexing, profile resolution, i18n tracking
  cli/      — command-line interface (consumes core)
  vscode/   — VSCode extension (consumes core)
examples/
  basic/    — minimal working example: docs.schema.yaml, sample topics, fragments, nav, profiles
```

---

## Tech Stack

- **Language**: TypeScript throughout, strict mode
- **Parser**: unified + remark + gray-matter
- **MDX**: remark-mdx (loaded only when schema declares `extensions: [mdx]`)
- **Schema validation**: Zod (schema loading) + custom validators (topic contracts, dimension values, profile filters)
- **YAML**: js-yaml
- **CLI framework**: commander.js
- **Testing**: vitest
- **VSCode extension**: @vscode/vsce, standard VS Code extension API
- **License**: MIT

---

## CLI Commands (MVP)

```bash
topicmd validate              # validate all topics against schema, exit 1 on errors
topicmd index                 # generate docs.index.json
topicmd scaffold <type>       # create new topic with valid frontmatter for given type
topicmd nav build             # generate nav manifests (base + per profile)
topicmd i18n status           # show i18n coverage and stale translation report
```

---

## Key Design Decisions

1. **Markdown-first**: The tool is designed for `.md`. MDX is opt-in: `remark-mdx` tolerates JSX as opaque regions. JSX is never parsed, never validated, never understood.

2. **Fragments are not topics**: Fragments live in a dedicated path (default: `fragments/`). They never appear in navigation or the topic index as standalone items. The index tracks fragment usage (which topics include them).

3. **Navigation decoupled from content**: Nav manifests reference topics; topics have no knowledge of nav position. Reorganising navigation never requires moving or renaming files.

4. **Dimensions are configurable, not hardcoded**: Core has no knowledge of `product`, `audience`, or `level` as concepts. It only knows "dimension with id, label, values". Projects define their own dimensions freely in `docs.schema.yaml`.

5. **Profiles are filter combinations, not separate content trees**: A profile is a named set of partial filters over dimensions. Topics are not duplicated or copied per profile. The same topic can satisfy multiple profiles.

6. **i18n is orthogonal to dimensions**: Language determines which variant of a topic is served — not which topics appear. It is never a filter dimension. Locale variants use filename suffixes; the canonical file is always the source language.

7. **Index as first-class artifact**: `docs.index.json` is the primary output for tooling and AI context. It is the source of truth for what exists, how it relates, what is missing by profile, and where translations are stale. Not versioned in git.

8. **Zero framework assumptions**: topicmd does not know or care whether Docusaurus, Hugo, VitePress, Next.js, or anything else renders the content. Profile-aware nav output is static YAML/JSON; the renderer decides how to consume it.

9. **CI-friendly**: All CLI commands exit with code 1 on validation failure, enabling pipeline integration without additional configuration.

---

## What topicmd Does Not Do

- No rendering or build pipeline
- No opinionated folder structure (all paths configurable via schema)
- No MDX component understanding — JSX regions are opaque passthroughs
- No git operations
- No framework-specific integration
- No translation — only translation coverage tracking and gap reporting
