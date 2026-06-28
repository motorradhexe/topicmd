---
id: 7
title: 'Core: Schema Validator'
status: done
priority: high
created: 2026-06-28T12:55:00.6814107+02:00
updated: 2026-06-28T15:35:42.176229841+02:00
started: 2026-06-28T15:33:10.429952586+02:00
completed: 2026-06-28T15:35:42.176939852+02:00
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
