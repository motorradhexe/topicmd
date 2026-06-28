---
title: Diagnostics
description: Every diagnostic code topicmd can emit and what it means.
---

Diagnostics are emitted during validation, fragment resolution, and variable
substitution. Each has a `severity` (`error` or `warning`) and a stable `code`.
`validate` prints them as `SEVERITY [code] file: message`; the indexer also
records them under `diagnostics` in `docs.index.json`.

Only **errors** make `topicmd validate` exit non-zero; warnings do not.

## Validation diagnostics

| Code | Severity | Meaning |
| --- | --- | --- |
| `missing-topic-type` | error | The required `topic_type` field is absent. |
| `unknown-topic-type` | error | `topic_type` is not defined in the schema. |
| `missing-required-field` | error | A field required by the topic type is missing or empty. |
| `unknown-field` | warning | A frontmatter field is not in the type's `required ∪ optional`. |
| `unknown-dimension-id` | error | A frontmatter dimension id is not declared in the schema. |
| `unknown-dimension-value` | error | A dimension value is not in the dimension's allowed `values`. |
| `contract-violation` | error | The type's `must_contain` contract is unmet (e.g. a `task` lacking `## Steps` / an ordered list). |

## Fragment diagnostics

| Code | Severity | Meaning |
| --- | --- | --- |
| `missing-fragment` | error | An `@include` target file could not be read. |
| `fragment-cycle` | error | Includes form a cycle (a fragment includes itself, directly or transitively). |
| `fragment-max-depth` | error | Include nesting exceeds the configured `maxDepth` (default 50). |

## Variable diagnostics

| Code | Severity | Meaning |
| --- | --- | --- |
| `unknown-variable` | warning | A `{{vars.*}}` reference has no matching key in `docs.vars.yaml`. |
| `non-scalar-variable` | warning | A `{{vars.*}}` reference resolves to a non-scalar (object/array) value. |

## Schema errors

Schema problems are not per-topic diagnostics — they throw a `SchemaError` while
loading `docs.schema.yaml` (duplicate dimension ids, profile filters referencing
undeclared dimensions/values, or `i18n.default` appearing in `i18n.locales`). The
CLI reports these as a single `topicmd: <message>` line and exits `1`.
