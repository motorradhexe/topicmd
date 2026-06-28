---
id: 22
title: 'VSCode: Diagnostics + Health-Watcher debouncen'
status: todo
priority: low
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T18:30:00+02:00
tags:
    - vscode
    - perf
class: standard
---

## Ziel
Keine Parse/Validate-Last bei jedem Tastendruck.

## Scope / Akzeptanzkriterien
- `intelligence.ts`: `onDidChangeTextDocument` → Debounce (~300 ms) je `document.uri`;
  Open/Initial sofort.
- `extension.ts`: `docs.index.json`-Watcher koaleszieren (~1 s).
- Bestehende vscode-Tests bleiben grün.
