---
id: 25
title: 'VSCode: Extension release-fähig (ohne Marketplace-Publish)'
status: done
priority: medium
created: 2026-06-28T18:30:00+02:00
updated: 2026-06-28T20:03:00+02:00
started: 2026-06-28T19:58:00+02:00
completed: 2026-06-28T20:03:00+02:00
tags:
    - vscode
    - release
class: standard
---

## Ziel
Paketierbare `.vsix` erzeugen; Marketplace-Publish bewusst ausgeklammert.

## Scope / Akzeptanzkriterien
- `package.json`: publisher, categories, keywords, repository/bugs/homepage; `private`
  entfernt; Version `0.1.0`.
- `@vscode/vsce` devDependency; Scripts `vscode:prepublish`, `package`; esbuild `--minify`.
- `.vscodeignore`, Icon (128×128), `packages/vscode/README.md`.
- `.github/workflows/vscode-release.yml`: workflow_dispatch + Tag `vscode-v*`, `vsce package`,
  `.vsix` als Artefakt — **kein** publish.
- `.gitignore`: `*.vsix`.
- `pnpm --filter @topicmd/vscode package` erzeugt valide `.vsix` ohne Warnungen.

## Out-of-scope
`vsce publish` (braucht Publisher-Konto + VSCE_PAT vom Maintainer).
