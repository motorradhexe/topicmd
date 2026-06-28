---
id: 6
title: 'Core: Fragment Resolver'
status: done
priority: high
created: 2026-06-28T12:55:00.4965204+02:00
updated: 2026-06-28T15:33:00.502197536+02:00
started: 2026-06-28T15:30:12.318889964+02:00
completed: 2026-06-28T15:33:00.503372399+02:00
tags:
    - core
depends_on:
    - 5
class: standard
---

## Ziel
Fragment-Includes auflösen: <!-- @include: ... -->.

## Scope / Akzeptanzkriterien
- Include-Direktiven erkennen und Pfade (relativ zu fragments/) auflösen.
- Zyklen-/Fehlende-Datei-Erkennung als Diagnose.
- Fragmente sind keine Topics (Design-Entscheidung 2) — Usage für Index erfassen.
- Tests gegen Fixtures (#3).

## Depends on
#5

## Out-of-scope
Index-Aggregation (#8).
