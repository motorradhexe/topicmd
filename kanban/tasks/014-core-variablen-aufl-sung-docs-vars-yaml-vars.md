---
id: 14
title: 'Core: Variablen-Auflösung (docs.vars.yaml, {{vars.*}})'
status: done
priority: high
created: 2026-06-28T13:47:31.608680318+02:00
updated: 2026-06-28T16:51:41.55960623+02:00
started: 2026-06-28T16:48:00.516368797+02:00
completed: 2026-06-28T16:51:41.560822175+02:00
tags:
    - core
depends_on:
    - 5
class: standard
---

## Ziel
Projektweite Variablen aus `docs.vars.yaml` laden und `{{vars.*}}`-Platzhalter in Topics/Fragmenten auflösen.

## Scope / Akzeptanzkriterien
- Loader für `docs.vars.yaml` (js-yaml).
- Substitution von `{{vars.<pfad>}}` (verschachtelte Keys via Punktnotation).
- Unbekannte Variable → erfasste Diagnose (nicht still ignorieren).
- Variablen-Map wird für den Index (Feld `variables`) bereitgestellt.
- Tests gegen examples/basic Fixtures (#3).

## Depends on
#5 (Topic-Parser)

## Out-of-scope
Index-Aggregation (#8), CLI.
