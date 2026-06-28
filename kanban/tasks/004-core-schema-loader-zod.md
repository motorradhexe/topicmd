---
id: 4
title: 'Core: Schema Loader (Zod)'
status: backlog
priority: high
created: 2026-06-28T12:55:00.1040965+02:00
updated: 2026-06-28T13:48:22.579345723+02:00
tags:
    - core
depends_on:
    - 2
class: standard
---

## Ziel
docs.schema.yaml mit Zod laden und validieren.

## Scope / Akzeptanzkriterien
- Zod-Schema für format/fragments/dimensions/profiles/topic_types/i18n.
- Aussagekräftige Fehler bei ungültigem Schema; geparste, typisierte Rückgabe (DocsSchema, #2).
- Profile-Filter referenzieren nur existierende Dimensionen/Values.
- Tests gegen Fixtures (#3).

## Depends on
#2

## Out-of-scope
Topic-Validierung (#7).
