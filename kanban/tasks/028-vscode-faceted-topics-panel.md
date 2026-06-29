---
id: 28
title: 'VSCode: Faceted Topics-Panel (Verwaltung ohne Ordnerbaum)'
status: done
priority: critical
created: 2026-06-29T07:00:00+02:00
updated: 2026-06-29T09:15:00+02:00
started: 2026-06-29T07:10:00+02:00
completed: 2026-06-29T09:15:00+02:00
tags:
    - vscode
    - feature
class: standard
---

## Ziel
Das Kernprodukt: ein Webview-Panel, das Topics **nach Bedeutung** verwaltet
(Typ, Dimensionen, Profile, Sprache, Tags) statt nach Verzeichnisbaum.

## Scope / Akzeptanzkriterien
- Eigener Activity-Bar-Container „topicmd" mit Webview-View „Topics".
- Flache, durchsuchbare Topic-Liste mit Filter-Chips: Typ, Dimension(+Werte),
  Profil, Sprache, Tag. Volltextsuche über Titel/Pfad.
- Pro Topic: Titel, Typ, Sprache, Dimensionen, Badges (orphan, fehlende Felder,
  veraltete Übersetzung). Klick öffnet die Datei im Editor.
- In-Memory-Index aus core (`indexProject`) — keine Abhängigkeit von einer
  vorher generierten `docs.index.json`.
- Reine Modell-Logik (`buildTopicsModel`) ist getestet.

## Out-of-scope
Bearbeitungs-Aktionen (#29), Release (#30).
