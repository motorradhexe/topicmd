---
title: Introduction
description: What topicmd is, the problem it solves, and its core philosophy.
---

**topicmd** is a docs-as-code toolchain that brings semantic structure, reusable
content, dynamic navigation profiles, i18n coverage tracking, and AI-assisted
topic management to Markdown-based documentation projects. MDX support is opt-in.

## Core philosophy

Documentation is not "code with text files" — it is **relationships with files**.
The file system provides physical storage. Semantic structure, relationships,
navigation, audience targeting, and language variants are separate concerns that
should be explicitly modelled, not inferred from folder layout.

## What topicmd does

- Validates topics against a project-defined content model (`docs.schema.yaml`).
- Generates a deterministic index (`docs.index.json`) describing every topic,
  fragment, relationship, coverage gap, and stale translation.
- Builds profile-aware navigation manifests from decoupled `nav/*.yaml` sources.
- Tracks i18n coverage and flags translations that drifted from their source.
- Scaffolds new topics with schema-valid frontmatter.

## What topicmd does **not** do

- No rendering or build pipeline, and no opinionated folder structure.
- No MDX component understanding — JSX regions are opaque passthroughs.
- No git operations and no framework-specific integration.
- No translation — only translation *coverage tracking* and gap reporting.

topicmd is framework-agnostic: it does not know or care whether Docusaurus,
Hugo, VitePress, Astro, or anything else renders the content. Its output is
static YAML/JSON; the renderer decides how to consume it.

## How it fits together

| Artifact | Role |
| --- | --- |
| `docs.schema.yaml` | The content model: dimensions, profiles, topic types, i18n. |
| Topics (`.md`, `.mdx` opt-in) | Navigable, indexed content units. |
| Fragments (`fragments/`) | Reusable snippets, included into topics, never navigable. |
| `docs.vars.yaml` | Project-wide variable substitution values. |
| `nav/*.yaml` | Navigation manifests, decoupled from the content tree. |
| `docs.index.json` | Generated artifact; the source of truth for tooling and AI. |

Continue to [Installation](../installation/) and the
[Quickstart](../quickstart/).
