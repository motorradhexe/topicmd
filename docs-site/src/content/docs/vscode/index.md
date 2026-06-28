---
title: VS Code extension
description: Topic Health panel, frontmatter intelligence, and Quick Scaffold for the editor.
---

The **topicmd** VS Code extension is editor integration over the same
`@topicmd/core` engine the CLI uses, so what you see in the editor matches what
CI validates.

## Installation

The extension is packaged as a `.vsix` (Marketplace publishing is not yet
enabled). To build and install it from the monorepo:

```bash
pnpm --filter topicmd-vscode package
# → packages/vscode/topicmd-vscode-<version>.vsix
```

Then in VS Code: **Extensions → ··· → Install from VSIX…** and pick the file, or:

```bash
code --install-extension packages/vscode/topicmd-vscode-<version>.vsix
```

A signed build is also produced by the **Package VS Code extension** GitHub
Actions workflow and uploaded as a build artifact.

## Features

### Topic Health panel

An Explorer view backed by `docs.index.json` that groups findings into:

- **Missing fields** — required frontmatter a topic type doesn't satisfy
- **Orphans** — canonical topics with no relationships
- **Coverage gaps** — profile/topic-type combinations with no content
- **Stale translations** — variants older than their source

The panel refreshes automatically when `docs.index.json` changes (bursty rewrites
are coalesced). Run [`topicmd index`](../cli/index-command/) to produce it.

### Frontmatter intelligence

Schema-driven completion and inline diagnostics for Markdown frontmatter:

- completion for `topic_type` values and for dimension values inside a
  `dimensions:` block
- diagnostics for unknown dimensions/values and missing required fields

Re-validation is debounced, so it runs once editing settles rather than on every
keystroke. Driven by `docs.schema.yaml` in the workspace root.

### Quick Scaffold

The **topicmd: New Topic…** command creates a new topic from a topic type with
valid frontmatter — the same logic as [`topicmd scaffold`](../cli/scaffold/).

## Contributed commands

| Command | Title |
| --- | --- |
| `topicmd.refreshHealth` | topicmd: Refresh Topic Health |
| `topicmd.scaffoldTopic` | topicmd: New Topic… |

## Requirements

- A `docs.schema.yaml` in the workspace root (enables frontmatter intelligence
  and scaffolding).
- A generated `docs.index.json` for the Topic Health panel.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| "no docs.index.json found" | Run `topicmd index` to generate it. |
| Frontmatter intelligence inactive | No `docs.schema.yaml` in the workspace root, or it failed to load. |
| Health panel looks stale | It updates on index writes; trigger **topicmd: Refresh Topic Health**. |
