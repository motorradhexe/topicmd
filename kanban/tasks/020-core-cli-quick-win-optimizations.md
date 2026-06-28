---
id: 20
title: 'Core/CLI: Quick-Win-Optimierungen (Dedup, engines, Regex, Map)'
status: todo
priority: medium
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T18:30:00+02:00
tags:
    - core
    - cli
    - refactor
class: standard
---

## Ziel
Risikoarme Optimierungen ohne Verhaltensänderung; ein einziger Discovery-Pfad.

## Scope / Akzeptanzkriterien
- A1: `walkMarkdown` in `packages/core/src/indexer/build.ts` exportieren und
  `discoverTopics({ rootDir, schema, contentDir })` extrahieren; `indexProject` nutzt es.
  CLI `parseTopics` (`packages/cli/src/discover.ts`) nutzt `discoverTopics`; lokales
  `walkMarkdown` entfernt.
- A2: `engines.node` in Root-`package.json` auf `>=22` (pnpm 11 / node:sqlite).
- A3: `INCLUDE_RE` einmal definieren (Factory wegen `/g`-state), in `parser/parse.ts`
  und `fragments/resolve.ts` wiederverwenden.
- A4: Dimension-`byId`-Map in `validator/validate.ts` einmal pro Lauf bauen.
- Tests grün; `discoverTopics`-Äquivalenz am `examples/basic`-Fixture getestet.

## Out-of-scope
Async-Indexing, Suffix-Index für `resolveRelated`.
