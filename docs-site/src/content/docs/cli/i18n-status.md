---
title: topicmd i18n status
description: Report locale coverage and stale translations, exiting non-zero on drift.
---

Report per-locale translation coverage and detect stale translations (locale
variants older than their source file).

## Synopsis

```text
topicmd i18n status [-s <schema>] [-r <root>] [-c <content>]
```

Only the [common options](../#common-options) apply.

## Behaviour

- **Coverage**: for each configured locale, the percentage of canonical topics
  that have a variant in that locale.
- **Stale translations**: a variant whose source file was modified after the
  variant (compared by file modification time).
- **Exit code:** `1` when any stale translation exists (so CI catches translation
  drift), otherwise `0`.

Language is orthogonal to dimensions — it is never a filter. See
[Core concepts](../../guide/concepts/#i18n).

## Example

```bash
$ topicmd i18n status -s examples/basic/docs.schema.yaml \
    -r examples/basic -c examples/basic/docs
i18n coverage (source language: en)
  de: 25%
  fr: 0%
Stale translations: 1
  docs/concepts/what-is-alpha [de]: source updated after translation
# exit code 1
```
