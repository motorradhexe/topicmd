---
id: 30
title: 'VSCode: echter GitHub-Release mit .vsix'
status: review
priority: high
created: 2026-06-29T07:00:00+02:00
updated: 2026-06-29T09:16:00+02:00
started: 2026-06-29T09:15:00+02:00
tags:
    - vscode
    - release
depends_on:
    - 28
    - 29
class: standard
---

## Ziel
Eine installierbare `.vsix` als GitHub-Release bereitstellen.

## Scope / Akzeptanzkriterien
- `vscode-release.yml` erstellt bei Tag `vscode-v*` einen GitHub-Release mit
  angehängter `.vsix` (permissions: contents: write).
- Tag `vscode-v0.1.0` gepusht → Release erscheint unter „Releases", `.vsix`
  installierbar via „Install from VSIX".
- Kein Marketplace-Publish (braucht Publisher-Konto + VSCE_PAT).

## Depends on
#28, #29
