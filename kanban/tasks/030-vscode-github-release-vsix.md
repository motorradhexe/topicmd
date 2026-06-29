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

## Handoff / Blocker (2026-06-29)
Release-Workflow ist fertig und committet (`vscode-release.yml`: erstellt bei Tag
`vscode-v*` einen GitHub-Release mit angehängter `.vsix`). **Blocker:** Der Tag
`vscode-v0.1.0` lässt sich aus der Sandbox nicht pushen — der git-Scope erlaubt nur
den Feature-Branch (Tag-Push → HTTP 403), und es gibt kein API-Tool zum Anlegen von
Tags/Releases. Die gebaute `.vsix` (v0.1.0) wurde dem Nutzer direkt übergeben.
**Zum Auslösen des Releases:** `git push origin vscode-v0.1.0` (Tag auf dem
Branch-Commit) — der Workflow baut und veröffentlicht dann den Release.
