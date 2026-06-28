---
title: CLI reference
description: The topicmd command-line interface — common options and command index.
---

The `topicmd` CLI is a thin layer over `@topicmd/core`. Every command exits
non-zero on failure, so all of them slot into CI without extra configuration.

```text
topicmd <command> [options]
```

## Commands

| Command | Purpose |
| --- | --- |
| [`validate`](./validate/) | Validate all topics against the schema; exit 1 on errors. |
| [`index`](./index-command/) | Generate `docs.index.json`. |
| [`scaffold <type>`](./scaffold/) | Create a new topic with valid frontmatter. |
| [`nav build`](./nav-build/) | Generate base + per-profile nav manifests and `profiles.json`. |
| [`i18n status`](./i18n-status/) | Report locale coverage and stale translations. |

## Common options

These options are accepted by every command:

| Option | Default | Description |
| --- | --- | --- |
| `-s, --schema <path>` | `docs.schema.yaml` | Path to the schema file. |
| `-r, --root <dir>` | the schema's directory | Project root. |
| `-c, --content <dir>` | the root | Directory scanned for topics. |

Paths given to `--root`/`--content`/`--out` may be absolute or relative to the
current working directory.

## Error handling and exit codes

- On success a command exits `0`.
- On a usage or validation problem it exits `1`.
- Operational failures (a missing schema file, an I/O error, an unknown scaffold
  type, …) print a single concise `topicmd: <message>` line to stderr and exit
  `1` — never a raw stack trace.

```bash
$ topicmd validate -s /nope.yaml
topicmd: Cannot read schema file: /nope.yaml
# exit code 1
```

See [Diagnostics](./diagnostics/) for the full list of validation codes.
