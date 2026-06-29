---
title: topicmd nav build
description: Generate base and per-profile navigation manifests plus profiles.json.
---

Generate static navigation output from decoupled `nav/*.yaml` sources: the base
manifest, one filtered manifest per profile, and a `profiles.json`.

## Synopsis

```text
topicmd nav build [--nav-dir <dir>] [-o <dir>] [-s <schema>] [-r <root>] [-c <content>]
```

## Options

In addition to the [common options](../#common-options):

| Option | Default | Description |
| --- | --- | --- |
| `--nav-dir <dir>` | `<root>/nav` | Directory of `nav/*.yaml` source manifests. |
| `-o, --out <dir>` | `<root>/build/nav` | Output directory. |

## Behaviour

- Indexes the project (so nav entries can be filtered by topic dimensions).
- Writes `profiles.json` plus, for each source manifest `name.yaml`:
  - `name.yaml` — the base manifest,
  - `name.<profile-id>.yaml` — the manifest filtered to each profile.
- A topic agnostic to a profile's filtered dimensions still appears in that
  profile (partial filters; see [Core concepts](../../guide/concepts/#profiles)).
- Output is static and framework-agnostic — the renderer decides how to consume
  it. No server is required.

## Example

```bash
$ topicmd nav build -s examples/basic/docs.schema.yaml \
    -r examples/basic -c examples/basic/docs -o examples/basic/build/nav
Wrote 7 files to examples/basic/build/nav
```

With two source manifests (`product-alpha.yaml`, `admin.yaml`) and two profiles
(`dev-beginner`, `admin-all`), the output is:

```text
profiles.json
product-alpha.yaml
product-alpha.dev-beginner.yaml
product-alpha.admin-all.yaml
admin.yaml
admin.dev-beginner.yaml
admin.admin-all.yaml
```
