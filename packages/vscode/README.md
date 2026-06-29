# topicmd for VS Code

Editor integration for [topicmd](https://motorradhexe.github.io/topicmd/), the
docs-as-code toolchain for semantic structure, reusable content, navigation
profiles, and i18n coverage on Markdown documentation projects.

The extension is a thin layer over `@topicmd/core` — the same engine the
`topicmd` CLI uses — so what you see in the editor matches what CI validates.

## Features

### Topic Health panel

An Explorer view backed by `docs.index.json` that surfaces, at a glance:

- **Missing fields** — required frontmatter fields a topic type doesn't satisfy
- **Orphans** — canonical topics with no incoming or outgoing relationships
- **Coverage gaps** — profile/topic-type combinations with no matching content
- **Stale translations** — locale variants older than their source

Run `topicmd index` (or the CLI in watch) to produce/update `docs.index.json`;
the panel refreshes automatically when it changes.

### Frontmatter intelligence

Schema-driven completion and inline diagnostics for Markdown frontmatter:

- completion for `topic_type` values and for dimension values inside a
  `dimensions:` block
- diagnostics for unknown dimensions/values and missing required fields

Driven by `docs.schema.yaml` in the workspace root.

### Quick Scaffold

The **topicmd: New Topic…** command creates a new topic from a topic type with
valid frontmatter — the same logic as `topicmd scaffold`.

## Commands

| Command | Title |
| --- | --- |
| `topicmd.refreshHealth` | topicmd: Refresh Topic Health |
| `topicmd.scaffoldTopic` | topicmd: New Topic… |

## Requirements

- A topicmd project: a `docs.schema.yaml` in the workspace root.
- For the Topic Health panel, a generated `docs.index.json` (`topicmd index`).

## License

MIT
