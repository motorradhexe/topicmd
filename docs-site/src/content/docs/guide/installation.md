---
title: Installation
description: Requirements and how to build the topicmd CLI from the monorepo.
---

## Requirements

- **Node.js ≥ 22** (the pnpm 11 toolchain relies on `node:sqlite`).
- **pnpm** as the package manager.

## Build from the monorepo

topicmd is a pnpm monorepo. From the repo root:

```bash
pnpm install
pnpm build
```

This builds `@topicmd/core` and the `topicmd` CLI (`@topicmd/cli`). Until the CLI
is published to npm, invoke it through the built entry point:

```bash
node packages/cli/dist/index.js --help
```

The examples in this documentation use a shell alias for brevity:

```bash
CLI="node packages/cli/dist/index.js"
```

## Project layout

| Package | Role |
| --- | --- |
| `packages/core` | Parsing, schema loading, validation, indexing, profile/nav resolution, variables, i18n tracking. |
| `packages/cli` | Command-line interface (consumes core). |
| `packages/vscode` | VS Code extension (consumes core). |
| `examples/basic` | Minimal working example, also the canonical test fixture. |

Next: the [Quickstart](../quickstart/) runs every command against
`examples/basic`.
