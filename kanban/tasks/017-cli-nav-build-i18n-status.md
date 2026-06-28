---
id: 17
title: 'CLI: nav build + i18n status'
status: backlog
priority: high
created: 2026-06-28T13:47:32.681904104+02:00
updated: 2026-06-28T13:47:32.681904104+02:00
tags:
    - cli
depends_on:
    - 15
    - 16
class: standard
---

## Ziel
Die verbleibenden zwei MVP-Kommandos auf Basis der Core-Module bereitstellen.

## Scope / Akzeptanzkriterien
- `topicmd nav build` → Basis- + Profil-Manifeste + `profiles.json`.
- `topicmd i18n status` → Coverage- und Stale-Report.
- Exit 1 bei Fehlern (CI-tauglich, Design-Entscheidung 9).

## Depends on
#15 (Nav-Builder), #16 (i18n-Tracking)

## Out-of-scope
validate/index/scaffold (#9).
