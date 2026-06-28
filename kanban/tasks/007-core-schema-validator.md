---
id: 7
title: 'Core: Schema Validator'
status: backlog
priority: high
created: 2026-06-28T12:55:00.6814107+02:00
updated: 2026-06-28T13:48:23.38558373+02:00
tags:
    - core
depends_on:
    - 4
    - 5
class: standard
---

## Ziel
Topics gegen Schema validieren (Contracts, Dimensionen, Profile).

## Scope / Akzeptanzkriterien
- required/optional-Felder je topic_type; Contracts (z.B. task must_contain steps).
- Dimensionswerte im Frontmatter gegen Schema prüfen.
- ValidationResult mit Fehlern/Warnungen; Exit-tauglich für CLI.
- Tests gegen Fixtures inkl. bewusster Fehlerfälle (#3).

## Depends on
#4, #5

## Out-of-scope
CLI-Wiring (#9).
