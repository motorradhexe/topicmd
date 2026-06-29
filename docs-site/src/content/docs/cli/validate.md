---
title: topicmd validate
description: Validate all topics against the schema, exiting non-zero on errors.
---

Validate every topic under the content directory against the schema: required
fields, dimension ids and values, and structural contracts.

## Synopsis

```text
topicmd validate [-s <schema>] [-r <root>] [-c <content>]
```

Only the [common options](../#common-options) apply.

## Behaviour

- Discovers all `.md`/`.mdx` files under `--content` (the `fragments/` directory
  is excluded), parses each, and validates it against the schema.
- Prints one line per diagnostic, then a summary line.
- **Exit code:** `1` if any diagnostic is an *error* (warnings alone keep it
  `0`); otherwise `0`.

## Examples

Valid project:

```bash
$ topicmd validate -s examples/basic/docs.schema.yaml \
    -r examples/basic -c examples/basic/docs
✓ 5 topics valid (0 warnings)
# exit code 0
```

With invalid fixtures included:

```bash
$ topicmd validate -s examples/basic/docs.schema.yaml -r examples/basic -c examples/basic
ERROR [missing-topic-type] README.md: Missing required field "topic_type"
ERROR [missing-required-field] invalid/missing-required-field.md: Missing required field "title" for topic_type "concept"
ERROR [contract-violation] invalid/task-without-steps.md: topic_type "task" must contain "steps" (an "## steps" heading or an ordered list)
ERROR [unknown-dimension-value] invalid/unknown-dimension-value.md: Dimension "product" has value "gamma" not in [alpha, beta]
ERROR [unknown-topic-type] invalid/unknown-topic-type.md: Unknown topic_type "tutorial" (not defined in schema)
✗ 7 errors, 0 warnings in 11 topics
# exit code 1
```

Each line is formatted as `SEVERITY [code] file: message`. See
[Diagnostics](../diagnostics/) for every code.
