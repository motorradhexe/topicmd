---
title: topicmd scaffold
description: Create a new topic with schema-valid frontmatter for a given type.
---

Generate Markdown for a new topic whose frontmatter satisfies a topic type's
required fields. If the type declares a `must_contain` contract (e.g. `steps`),
the body is scaffolded to satisfy it.

## Synopsis

```text
topicmd scaffold <type> [-t <title>] [-o <path>] [-s <schema>] [-r <root>] [-c <content>]
```

## Arguments & options

| Argument / option | Default | Description |
| --- | --- | --- |
| `<type>` | — | Topic type to scaffold (e.g. `concept`, `task`, `reference`). |
| `-t, --title <title>` | `Untitled` | Title for the new topic. |
| `-o, --out <path>` | stdout | Write to a file instead of printing. |

Plus the [common options](../#common-options) (the schema is needed to know the
type's required fields).

## Behaviour

- Emits `topic_type` first, then the remaining required fields, then a body.
- An unknown type is reported as an error and exits `1`:

  ```bash
  $ topicmd scaffold tutorial -s examples/basic/docs.schema.yaml
  topicmd: Unknown topic_type "tutorial". Known types: concept, reference, task
  # exit code 1
  ```

## Example

```bash
$ topicmd scaffold task --title "Reset your password" -s examples/basic/docs.schema.yaml
---
topic_type: task
title: "Reset your password"
---

# Reset your password

## Steps

1. First step
2. Second step
```
