---
name: update-game-data
description: Convert the game data of a new version of Path of Exile 2 (the tree export, RePoE) into the files of the website, check them on the corpus, and commit the new folder. Use it when a new version or patch of the game comes out, or when the owner asks to update the game data.
---

# Update the game data

Goal: the same procedure at each version of the game, so that nothing is forgotten (`docs/game-data.md`). Proper to Pathweaver: it doesn't go back to the template.

## 1. The sources

- **The tree export** of Grinding Gear Games: find the tag of the new version (`gh api repos/grindinggear/poe2-skilltree-export/tags --jq '.[].name'`), and set `TREE_TAG` in `web/scripts/game-data/sources.ts`.
- **RePoE** serves the latest version of the game only: read <https://repoe-fork.github.io/poe2/version.txt> and check that it is the new version (a late update of its volunteers delays the data: wait, or say so to the owner).
- **The version of the game** the page reads: `GAME_VERSION` in `web/src/lib/game-data/format.ts`, the name of the new folder and the version the warnings name.
- **Read the terms of each source again** (`docs/game-data.md`, Sources): a license added or changed, a source that stopped. Write the date of the check there.

## 2. The script

From `web/`, with ImageMagick 7 (`magick`) installed:

```sh
npm run game-data -- --cache <a folder of the scratchpad>
```

It writes `web/src/lib/game-data/<version>/`: `sources.json` (the versions read), `en/gems.json`, `en/ascendancies.json` and `portraits/`. It stops with the place of the value when a format changed (`ShapeError`): adapt the reading in `web/scripts/game-data/`, with its test, never by skipping the value. Give the same cache folder only for runs of one version: RePoE keeps the same names from one version to the next.

Then delete the folder of the previous version, in the same commit: the page reads one version, and every folder under `web/src/lib/game-data/` goes into the build. Git keeps the old one.

## 3. The checks

- **What the script prints**: the number of gems, of those without a description, of ascendancies and of portraits, against the previous version (`git diff --stat`, and the lines of `gems.json` that changed: one gem per line). A new ascendancy needs its portrait: open two or three of them.
- **The corpus**: `npm test -- game-data.corpus` (in `web/`) looks up every gem and ascendancy of `inputs/builds/`. An id that becomes unknown is listed by its file: a gem renamed or removed by the version (the page then shows it as unknown, `specs.md`, Unknown and invalid entries). Report the list to the owner, then update `MISSES` of the test with it.
- **The gems of two attributes**: count them (`attributes` of two in `gems.json`) against `specs.md` (Skills); a large change means RePoE changed its colours.
- The checks of `CLAUDE.md` (Development), the web ones at least.

## 4. Commit

On a branch `chore/game-data-<version>`: the new folder, the old one deleted, the sources set, `docs/game-data.md` (its date, the versions read), in one pull request, with what the checks found.
