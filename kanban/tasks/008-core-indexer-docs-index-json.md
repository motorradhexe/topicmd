---
id: 8
title: 'Core: Indexer → docs.index.json'
status: backlog
priority: high
created: 2026-06-28T12:55:00.8720986+02:00
updated: 2026-06-28T13:48:23.676098729+02:00
tags:
    - core
depends_on:
    - 5
    - 6
    - 7
class: standard
---

## Ziel
docs.index.json generieren — primäres AI-Kontext-Artefakt.

## Scope / Akzeptanzkriterien
- topics/fragments, relationships (links, orphans, duplicates_suspected, fragment_usage).
- coverage.by_profile + gaps, terms, variables-Map.
- Deterministische, stabile Ausgabe (sortiert). Nicht versioniert (Design-Entscheidung 7).
- Tests gegen Fixtures (#3).

## Depends on
#5, #6, #7

## Out-of-scope
i18n-Coverage (#16) und Nav (#15) liefern Teilfelder separat zu; CLI (#9).
