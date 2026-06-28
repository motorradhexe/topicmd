# topicmd

A docs-as-code toolchain that brings **semantic structure, reusable content,
dynamic navigation profiles, i18n coverage tracking, and AI-assisted topic
management** to Markdown-based documentation projects. MDX support is opt-in.

## Core philosophy

Documentation is not "code with text files" — it is **relationships with
files**. The file system provides physical storage. Semantic structure,
relationships, navigation, audience targeting, and language variants are
separate concerns that should be explicitly modelled, not inferred from folder
layout.

## Features

- **Configurable dimensions, not hardcoded fields** — each project defines its
  own filter axes (e.g. product, audience, level) in `docs.schema.yaml`.
- **Profiles** — named, partial filter combinations over dimensions. The same
  topic satisfies many profiles without duplication.
- **Fragments** — reusable Markdown snippets included via
  `<!-- @include: ../fragments/x.md -->`; never navigable, usage tracked.
- **Variables** — project-wide `{{vars.*}}` substitution from `docs.vars.yaml`.
- **Navigation decoupled from content** — `nav/*.yaml` manifests reference
  topics by path; reorganising nav never moves files. Profile-aware nav and a
  `profiles.json` are generated for static, framework-agnostic output.
- **i18n as an orthogonal axis** — locale variants via filename suffix
  (`topic.de.md`); per-locale coverage and stale-translation reporting.
- **Index as the AI-context artifact** — `docs.index.json` captures what exists,
  how it relates, what's missing per profile, and where translations are stale.
- **CI-friendly** — every command exits non-zero on failure.

## Install

Requires Node ≥ 22 and pnpm.

```bash
pnpm install
pnpm build
```

This builds the `topicmd` CLI (`@topicmd/cli`). The examples below invoke it via
the built entry point; once published it is available as the `topicmd` bin.

## Quickstart

A complete, runnable project lives in [`examples/basic/`](examples/basic/). From
the repo root:

```bash
CLI="node packages/cli/dist/index.js"
ROOT=examples/basic

# Validate topics against the schema (exit 1 on errors)
$CLI validate --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs

# Generate the index artifact (docs.index.json)
$CLI index --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs

# Scaffold a new topic with schema-valid frontmatter
$CLI scaffold task --title "My Task" --schema $ROOT/docs.schema.yaml

# Build base + per-profile nav manifests and profiles.json
$CLI nav build --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs

# Report i18n coverage and stale translations (exit 1 if stale)
$CLI i18n status --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs
```

### CLI commands

| Command                   | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `topicmd validate`        | Validate all topics against the schema; exit 1 on errors.    |
| `topicmd index`           | Generate `docs.index.json`.                                  |
| `topicmd scaffold <type>` | Create a new topic with valid frontmatter.                   |
| `topicmd nav build`       | Generate base + per-profile nav manifests + `profiles.json`. |
| `topicmd i18n status`     | Show i18n coverage and stale-translation report.             |

Common options: `--schema <path>` (default `docs.schema.yaml`), `--root <dir>`
(defaults to the schema directory), `--content <dir>` (defaults to root).

## VS Code extension

`packages/vscode` provides editor integration over the same core:

- **Topic Health panel** (Explorer view) — surfaces orphans, missing fields,
  coverage gaps, and stale translations by reading `docs.index.json`.
- **Frontmatter intelligence** — completion for `topic_type` and dimension
  values from the schema, plus inline diagnostics for invalid dimensions and
  missing required fields.
- **Quick Scaffold** — the `topicmd: New Topic…` command creates a new topic
  with schema-valid frontmatter (same logic as `topicmd scaffold`).

Build the extension bundle with `pnpm --filter topicmd-vscode build`.

## Project layout

This is a pnpm monorepo:

| Package           | Role                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `packages/core`   | Parsing, schema loading, validation, indexing, profile/nav resolution, variables, i18n tracking. |
| `packages/cli`    | Command-line interface (consumes core).                                                          |
| `packages/vscode` | VS Code extension (consumes core).                                                               |
| `examples/basic`  | Minimal working example, also the canonical test fixture.                                        |

**Tech stack:** TypeScript (strict), unified + remark + gray-matter for parsing,
Zod for schema validation, js-yaml for YAML, commander for the CLI, vitest for
tests.

## Development

```bash
pnpm typecheck   # tsc -b across the workspace
pnpm lint        # eslint
pnpm test        # vitest
```

CI runs typecheck, lint, test, and `topicmd validate` against the example on
every push and pull request.

## Documentation

Full technical documentation — CLI reference (per command, with options, exit
codes, output, and diagnostic codes), schema reference, and the VS Code extension
reference — lives at **<https://motorradhexe.github.io/topicmd/>**.

The site is an [Astro Starlight](https://starlight.astro.build/) project under
[`docs-site/`](docs-site/), deployed to GitHub Pages by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) on changes to
`docs-site/`. Work on it locally with:

```bash
pnpm --filter docs-site dev       # local preview with hot reload
pnpm --filter docs-site build     # production build to docs-site/dist
```

## License

Released under the MIT License (as declared in each package's `package.json`).
