---
id: 16
title: 'Core: i18n-Coverage + Stale-Translation-Tracking'
status: done
priority: high
created: 2026-06-28T13:47:32.358745515+02:00
updated: 2026-06-28T16:59:28.395699517+02:00
started: 2026-06-28T16:55:52.269292032+02:00
completed: 2026-06-28T16:59:28.396492094+02:00
tags:
    - core
depends_on:
    - 5
    - 8
class: standard
---

## Ziel
i18n als orthogonale Achse: Coverage je Locale berechnen und veraltete Übersetzungen erkennen.

## Scope / Akzeptanzkriterien
- Suffix-Strategie (`topic.md` kanonisch, `topic.de.md` Variante) erkennen.
- Coverage pro Locale (`i18n_coverage`, z.B. de: 87%).
- Stale-Detection: Quelle nach Übersetzung geändert → `stale_translations`.
- Sprache ist nie Filter-Dimension (Design-Entscheidung 6).
- Tests gegen Fixtures mit Varianten (#3).

## Depends on
#5 (Parser), #8 (Indexer)

## Out-of-scope
CLI `i18n status` (#17), tatsächliche Übersetzung.
