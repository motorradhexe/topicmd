---
id: 18
title: 'CI: GitHub Actions — typecheck, lint, test, validate auf PR'
status: done
priority: medium
created: 2026-06-28T13:47:33.032568675+02:00
updated: 2026-06-28T17:06:56.651978514+02:00
started: 2026-06-28T17:04:35.098541228+02:00
completed: 2026-06-28T17:06:56.65328463+02:00
tags:
    - ci
depends_on:
    - 9
class: standard
---

## Ziel
PR-Pipeline, die die Qualität der Toolchain absichert.

## Scope / Akzeptanzkriterien
- Workflow auf push/pull_request: pnpm install, typecheck, lint, test.
- `topicmd validate` gegen examples/basic ausführen (Exit 1 bricht Build).
- pnpm-Cache.

## Depends on
#9 (CLI validate)

## Out-of-scope
GitHub-Pages-Docs (#13).
