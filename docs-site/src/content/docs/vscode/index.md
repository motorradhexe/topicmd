---
title: VS Code extension
description: Manage topics by meaning in a faceted Topics panel, plus frontmatter intelligence and scaffolding.
---

The **topicmd** VS Code extension is the primary way to work with a topicmd
project. Its centerpiece is the **Topics panel**: a flat, faceted view that lets
you manage documentation **by meaning — type, dimensions, profiles, language,
tags — instead of by folder tree**. It is built on the same `@topicmd/core`
engine the CLI uses, so what you see in the editor matches what CI validates.

## Installation

Install the packaged `.vsix` (Marketplace publishing is not enabled yet):

- Download `topicmd-vscode-<version>.vsix` from the project's
  [GitHub Releases](https://github.com/motorradhexe/topicmd/releases), then in
  VS Code: **Extensions → ··· → Install from VSIX…**.
- Or from the command line: `code --install-extension topicmd-vscode-<version>.vsix`.

Open the **topicmd** icon in the Activity Bar to reveal the Topics panel.

## Topics panel

A searchable, flat list of every topic — no folder tree. Filter with chips that
combine across groups (AND) and within a group (OR):

- **Type** — concept, task, reference, … (your schema's topic types)
- **Dimension** — one chip group per dimension, with its values
- **Profile** — topics matching each profile's filters
- **Language** — source language and each locale variant
- **Tag** — every tag in use
- **Status** — orphan, missing fields, stale translation, missing translation

Each topic shows its type, language, dimension assignments, and status badges.
A free-text search box filters by title or path.

### Manage topics in place

From each topic's actions you can:

- **Open** the topic, or jump to a **related** topic.
- **Edit metadata** — set a dimension's values, tags, or the title through guided
  pickers, written back to frontmatter (no hand-edited YAML). Uses core's
  `updateFrontmatter`.
- **Create a translation** — for a canonical topic with a missing locale, seed a
  `topic.<locale>.md` variant in place.

Create a brand-new topic with the **+ New Topic** action in the panel title bar
(guided: type → title → path), which writes a schema-valid file.

### Integrated health

The panel folds in project health (no separate view): the **Health** row shows
counts of orphans, missing fields, and stale translations — click one to filter
the list to it — and a **Coverage gaps** disclosure lists profile/topic-type
combinations that have no content. The panel rebuilds in-process from the
workspace, so it needs **no** pre-generated `docs.index.json` and refreshes as
you edit.

## Frontmatter intelligence

Schema-driven completion and inline diagnostics for Markdown frontmatter:

- completion for `topic_type` values and for dimension values inside a
  `dimensions:` block
- diagnostics for unknown dimensions/values and missing required fields

Re-validation is debounced, so it runs once editing settles rather than on every
keystroke. Driven by `docs.schema.yaml` in the workspace root.

## Quick Scaffold

The **topicmd: Scaffold Topic (preview in editor)** command opens an unsaved
buffer with schema-valid frontmatter — the same logic as
[`topicmd scaffold`](../cli/scaffold/). (Use **+ New Topic** in the panel to
create a saved file instead.)

## Contributed commands

| Command | Title |
| --- | --- |
| `topicmd.newTopic` | topicmd: New Topic… |
| `topicmd.refreshTopics` | topicmd: Refresh Topics |
| `topicmd.scaffoldTopic` | topicmd: Scaffold Topic (preview in editor) |

## Requirements

- A `docs.schema.yaml` in the workspace root. The Topics panel and frontmatter
  intelligence are driven by it.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Topics panel shows an error | No `docs.schema.yaml` in the workspace root, or it failed to load. |
| A change isn't reflected | The panel coalesces edits; use **Refresh Topics** in the title bar. |
| Frontmatter intelligence inactive | No `docs.schema.yaml` in the workspace root, or it failed to load. |
