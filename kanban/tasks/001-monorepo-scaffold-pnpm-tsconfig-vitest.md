---
id: 1
title: 'Monorepo scaffold: pnpm, tsconfig, vitest'
status: in-progress
priority: high
created: 2026-06-28T12:54:59.4228667+02:00
updated: 2026-06-28T13:48:21.726827331+02:00
started: 2026-06-28T13:35:44.091206495+02:00
tags:
    - foundation
claimed_by: kelp-hail
claimed_at: 2026-06-28T13:48:21.72692074+02:00
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
