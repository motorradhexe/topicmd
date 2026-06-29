---
id: 31
title: 'VSCode: Health-Panel ins Topics-Panel integrieren'
status: done
priority: high
created: 2026-06-29T10:00:00+02:00
updated: 2026-06-29T09:27:00+02:00
started: 2026-06-29T09:18:00+02:00
completed: 2026-06-29T09:27:00+02:00
tags:
    - vscode
    - refactor
depends_on:
    - 28
class: standard
---

## Ziel
Eine konsolidierte Ansicht: das separate Topic-Health-Tree-View entfällt, seine
Inhalte leben im Topics-Panel.

## Scope / Akzeptanzkriterien
- Separates `topicmdHealth`-TreeView + `TopicHealthProvider` + `refreshHealth`
  entfernt (inkl. Manifest, Commands, Menü, Index-Watcher).
- Topics-Modell liefert eine Health-Zusammenfassung (orphans, missing fields,
  stale, coverage gaps); Modell-Test erweitert.
- Panel zeigt eine kompakte Health-Leiste: Zähler als klickbare Status-Filter
  + Liste der Coverage-Gaps.
- `health.ts`/`health.test.ts` entfernt (Logik in `topicsModel` aufgegangen).

## Depends on
#28 (Topics-Panel)
