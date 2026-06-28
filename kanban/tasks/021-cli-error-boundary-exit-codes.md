---
id: 21
title: 'CLI: zentrale Fehlergrenze + konsistente Exit-Codes'
status: todo
priority: medium
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T18:30:00+02:00
tags:
    - cli
depends_on:
    - 20
class: standard
---

## Ziel
Keine rohen Stacktraces; jeder Command setzt bei Fehler Exit-Code 1.

## Scope / Akzeptanzkriterien
- `runAction(fn)`-Wrapper in `packages/cli/src/index.ts`; alle `.action()` umhüllt.
- `SchemaError` und I/O-Fehler (ENOENT etc.) sauber auf stderr; `process.exitCode = 1`.
- Unbekannter Scaffold-Typ → klare CLI-Meldung statt Exception.
- Test: fehlende/ungültige Schema-Datei → Exit 1, kein Stacktrace.

## Depends on
#20 (gemeinsame discover/Config-Pfade)
