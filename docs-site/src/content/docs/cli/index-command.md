---
title: topicmd index
description: Generate the deterministic docs.index.json artifact.
---

Discover, parse, and index the project into `docs.index.json` — the primary
artifact for tooling and AI context.

## Synopsis

```text
topicmd index [-s <schema>] [-r <root>] [-c <content>] [-o <path>]
```

## Options

In addition to the [common options](../#common-options):

| Option | Default | Description |
| --- | --- | --- |
| `-o, --out <path>` | `<root>/docs.index.json` | Output path for the index file. |

## Behaviour

- Builds the index from the discovered topics, the schema, and (if present)
  `docs.vars.yaml` in the project root.
- Output is **deterministic**: every array is sorted and all object keys are
  sorted recursively, so identical inputs produce byte-identical output (ideal
  for diffing and caching).
- `docs.index.json` is a generated artifact and is typically git-ignored.

## Example

```bash
$ topicmd index -s examples/basic/docs.schema.yaml \
    -r examples/basic -c examples/basic/docs
Wrote examples/basic/docs.index.json (5 topics)
```

For the shape of the generated file, see
[Variables, nav & index](../../schema/artifacts/).
