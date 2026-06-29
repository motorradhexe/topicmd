---
title: Quickstart
description: Run every topicmd command against the bundled example project.
---

A complete, runnable project lives in `examples/basic/`. The commands below run
each CLI subcommand against it. They assume the alias from
[Installation](../installation/):

```bash
CLI="node packages/cli/dist/index.js"
ROOT=examples/basic
```

## Validate

```bash
$CLI validate --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs
```

```text
✓ 5 topics valid (0 warnings)
```

Validation exits non-zero on errors, so it slots into CI directly. See
[`validate`](../../cli/validate/).

## Generate the index

```bash
$CLI index --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs
```

```text
Wrote examples/basic/docs.index.json (5 topics)
```

`docs.index.json` is the primary artifact for tooling and AI context. See
[`index`](../../cli/index-command/).

## Scaffold a topic

```bash
$CLI scaffold task --title "Reset your password" --schema $ROOT/docs.schema.yaml
```

```text
---
topic_type: task
title: "Reset your password"
---

# Reset your password

## Steps

1. First step
2. Second step
```

See [`scaffold`](../../cli/scaffold/).

## Build navigation

```bash
$CLI nav build --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs
```

```text
Wrote 7 files to examples/basic/build/nav
```

This emits the base manifest, one filtered manifest per profile, and
`profiles.json`. See [`nav build`](../../cli/nav-build/).

## Check i18n status

```bash
$CLI i18n status --schema $ROOT/docs.schema.yaml --root $ROOT --content $ROOT/docs
```

```text
i18n coverage (source language: en)
  de: 25%
  fr: 0%
Stale translations: 1
  docs/concepts/what-is-alpha [de]: source updated after translation
```

Exits non-zero when stale translations exist. See
[`i18n status`](../../cli/i18n-status/).
