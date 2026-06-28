---
id: 3
title: examples/basic/ Fixtures anlegen
status: backlog
priority: high
created: 2026-06-28T12:54:59.8610341+02:00
updated: 2026-06-28T13:48:22.291490248+02:00
tags:
    - foundation
depends_on:
    - 1
class: standard
---

## Ziel
Minimal lauffähiges Beispielprojekt als Test-Fixture für alle Core-Module.

## Scope / Akzeptanzkriterien
- docs.schema.yaml (Dimensionen, Profile, topic_types, i18n), docs.vars.yaml.
- Beispiel-Topics (concept/task/reference) inkl. Frontmatter mit Dimensionen.
- Fragmente (fragments/), Locale-Varianten (z.B. .de.md) inkl. einer Lücke (fr fehlt).
- nav/*.yaml mit Sections. Bewusste Fehlerfälle für Validator-Tests.

## Depends on
#1 (hängt NICHT an #2 — kann parallel zu Typen entstehen, entblockt Core-Tests).

## Out-of-scope
Core-Logik.
