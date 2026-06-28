---
id: 2
title: 'Core: TypeScript-Typdefinitionen (Topic, DocsSchema, ValidationResult)'
status: backlog
priority: high
created: 2026-06-28T12:54:59.6570411+02:00
updated: 2026-06-28T13:48:21.980125303+02:00
tags:
    - foundation
depends_on:
    - 1
class: standard
---

## Ziel
Zentrale TypeScript-Typen in @topicmd/core: Topic, DocsSchema, ValidationResult & Co.

## Scope / Akzeptanzkriterien
- Typen für Topic-Frontmatter, Dimensionen, Profile, Topic-Types, i18n-Config.
- DocsSchema-Typ (Spiegel von docs.schema.yaml), ValidationResult/Diagnose-Typen.
- Rein deklarativ (keine Runtime-Logik), strict-sauber.

## Depends on
#1

## Out-of-scope
Zod-Schemas/Loader (#4), Parser (#5).
