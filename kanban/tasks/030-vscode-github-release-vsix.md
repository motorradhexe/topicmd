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

## Handoff (2026-06-29)
Release-Workflow ist fertig und committet (`vscode-release.yml`). Er ist jetzt
**komplett über die GitHub-UI auslösbar** (der Nutzer arbeitet nicht lokal):
- `workflow_dispatch`: Actions-Tab → „Run workflow" → erstellt einen Release
  `vscode-v<version>` (Version aus `packages/vscode/package.json`) mit angehängter
  `.vsix`. (Der „Run workflow"-Button erscheint, sobald die Workflow-Datei auf dem
  Default-Branch liegt — also nach Merge von PR #1.)
- Tag `vscode-v*` (z. B. via Releases-UI „Draft a new release" mit neuem Tag auf dem
  Branch) → Workflow baut + hängt die `.vsix` an.

Die gebaute `.vsix` (v0.1.0) wurde dem Nutzer zusätzlich direkt im Chat übergeben.
Sandbox-Hinweis: Tag-Push aus der Sandbox ist blockiert (git-Scope nur Branch,
HTTP 403); deshalb erfolgt das Auslösen durch den Nutzer in GitHub.
