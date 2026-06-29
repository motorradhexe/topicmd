---
id: 29
title: 'VSCode: Topic-Aktionen (Metadaten setzen, anlegen, i18n, Beziehungen)'
status: done
priority: high
created: 2026-06-29T07:00:00+02:00
updated: 2026-06-29T09:15:00+02:00
started: 2026-06-29T08:30:00+02:00
completed: 2026-06-29T09:15:00+02:00
tags:
    - vscode
    - feature
depends_on:
    - 28
class: standard
---

## Ziel
Topics direkt aus dem Panel verwalten — ohne YAML von Hand.

## Scope / Akzeptanzkriterien
- **Dimensionen/Metadaten setzen**: Dimension wählen → Mehrfachauswahl der Werte
  (vorbelegt) → Frontmatter wird geschrieben. Tags editierbar.
- **Geführtes Anlegen**: Typ + Titel + Zielpfad → gültige Datei wird angelegt und
  geöffnet.
- **Beziehungen**: verwandte Topics anzeigen/öffnen; zwischen Sprachvarianten springen.
- **i18n-Lücken**: fehlende Sprachvarianten sehen und direkt anlegen.
- Core: reiner `updateFrontmatter`-Helfer (mit Test), wiederverwendbar.

## Depends on
#28 (Panel/Model)
