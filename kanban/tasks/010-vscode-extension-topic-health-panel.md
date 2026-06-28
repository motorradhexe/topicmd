---
id: 10
title: 'VSCode Extension: Topic Health Panel'
status: done
priority: low
created: 2026-06-28T12:55:01.2498363+02:00
updated: 2026-06-28T17:21:35.199842393+02:00
started: 2026-06-28T17:13:22.788353418+02:00
completed: 2026-06-28T17:21:35.200784982+02:00
tags:
    - vscode
depends_on:
    - 8
class: standard
---

## Ziel
VSCode: Topic-Health-Panel auf Basis von docs.index.json.

## Scope / Akzeptanzkriterien
- Panel zeigt Orphans, fehlende Felder, Coverage-Gaps, Stale-Translations.
- Liest den Index (kein eigenes Parsing).

## Depends on
#8

## Out-of-scope
Frontmatter-Intelligence (#11), Scaffold (#12).
