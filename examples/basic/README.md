# topicmd basic example

A minimal, working topicmd project. It doubles as the canonical **test fixture**
for the core modules (schema loader, parser, fragment resolver, validator,
indexer, profile/nav builder, i18n tracker).

## Layout

```
docs.schema.yaml        content model: dimensions, profiles, topic_types, i18n
docs.vars.yaml          {{vars.*}} substitution values
docs/
  concepts/
    what-is-alpha.md        concept (canonical, en)
    what-is-alpha.de.md     German variant   (fr is intentionally missing)
  tasks/
    quickstart.md           task with "## Steps"
    authentication.md       task targeting product [alpha, beta]
  reference/
    api.md                  reference with required `version`
fragments/
  prerequisites-admin.md    included by the concept topics
nav/
  product-alpha.yaml        navigation manifest (sections)
  admin.yaml                second nav context reusing the same topics
invalid/                    intentional error cases for validator tests
```

## Intentional conditions (for tests)

- **i18n gap**: `what-is-alpha` has `de` but no `fr` variant → French coverage
  is incomplete.
- **Fragment usage**: `prerequisites-admin.md` is included by both
  `what-is-alpha.md` and `what-is-alpha.de.md` (never navigable itself).
- **Nav reuse**: `what-is-alpha.md` and `api.md` appear in two nav manifests
  without duplication.
- **`invalid/`** holds topics that must each produce a specific diagnostic:
  | File | Expected diagnostic |
  |---|---|
  | `missing-required-field.md` | `missing-required-field` (title, description) |
  | `unknown-dimension-value.md` | `unknown-dimension-value` (product: gamma) |
  | `task-without-steps.md` | `contract-violation` (must_contain: steps) |
  | `unknown-topic-type.md` | `unknown-topic-type` (tutorial) |
  | `reference-missing-version.md` | `missing-required-field` (version) |

The `invalid/` topics are excluded from the nav manifests, so a renderer never
sees them; tests load them directly to assert validator behaviour.
