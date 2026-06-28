---
id: 24
title: 'CI: Test-Coverage ausgeben'
status: done
priority: low
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T19:57:00+02:00
started: 2026-06-28T19:56:00+02:00
completed: 2026-06-28T19:57:00+02:00
tags:
    - ci
depends_on:
    - 18
class: standard
---

## Ziel
Coverage im CI-Log sichtbar machen.

## Scope / Akzeptanzkriterien
- `@vitest/coverage-v8` als devDependency.
- `.github/workflows/ci.yml`: Schritt `vitest run --coverage` (Textreport).
- Kein externer Upload.

## Depends on
#18 (CI-Pipeline)
