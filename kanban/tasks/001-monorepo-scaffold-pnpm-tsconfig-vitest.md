---
id: 1
title: 'Monorepo scaffold: pnpm, tsconfig, vitest'
status: done
priority: high
created: 2026-06-28T12:54:59.4228667+02:00
updated: 2026-06-28T13:53:43.253736881+02:00
started: 2026-06-28T13:35:44.091206495+02:00
completed: 2026-06-28T13:53:43.254551064+02:00
tags:
    - foundation
class: standard
---

## Ziel
Monorepo-Fundament: pnpm-Workspace, TypeScript (strict), vitest, ESLint+Prettier.

## Scope / Akzeptanzkriterien
- pnpm-Workspace (packages/*, examples/*), Root-tsconfig (strict, project references).
- vitest (node) über packages/*; ESLint (typescript-eslint flat) + Prettier.
- Paket-Skelette @topicmd/core und @topicmd/cli (Platzhalter-src + Smoke-Test).
- packages/vscode als minimaler Platzhalter (package.json+tsconfig), NICHT im tsc-Build-Graph.
- `pnpm build/test/typecheck/lint` laufen grün durch.

## Out-of-scope
Typdefinitionen (#2), Fixtures (#3), echte Lib-Deps (zod/remark/commander → #4/#5/#9).

[[2026-06-28]] Sun 13:52
Scaffold implementiert: pnpm-Workspace (core/cli/+vscode-Platzhalter), tsconfig (strict, project refs), vitest, ESLint+Prettier. Alle Checks grün: build, typecheck, test (1), lint, format. CLI-Platzhalter läuft (topicmd 0.0.0). Bereit für Merge.
