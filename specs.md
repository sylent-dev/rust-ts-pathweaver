# Specifications

A first draft, written with the skeleton on 2026-11-16: the purpose and the versions are decided, the features of version 1 are to be specified in step 0 of [roadmap.md](roadmap.md), with the open questions below.

## Purpose

Path of Exile 2 reads `.build` files in its Build Planner since version 0.5: a JSON file that lists the passives, the skill gems and their supports, and hints on the inventory slots, each for a range of levels of the character. Guide sites and tools (poe.ninja, Maxroll, Mobalytics, Path of Building converters) export them; the only way to see what a file holds, before putting it in the game folder, is to read its JSON.

Pathweaver (the build viewer and planner of Path of Exile 2: the subtitle that goes with the name everywhere, so that it is found by those who search for a build planner) shows a `.build` file as a player reads a build: its passive tree, its skills and its gear, at each level of the character. Later, it edits them, then hosts them for everyone to share.

## Design principles

- **The `.build` file is the native format.** Not an export of a format of our own: a file opens whatever tool made it, and is written back without losing a field another tool put in it.
- **Level by level.** A build is a progression: the interface follows a level of the character, not separate profiles.
- **Everything runs in the browser** in versions 1 and 1.5: no account, no server, a static website.
- **The rules in Rust, once.** The reading, the checks and the passive tree are in the core, so that the same code checks a file in the browser and, in version 2, on the server.

## Versions

| Version | Content |
|---|---|
| 1 | The viewer: drop or choose a file, see its tree, skills and inventory at each level, share it by a link that holds the build. |
| 1.5 | The editor: allocate passives on the tree, choose gems, write the hints, export the `.build` file. |
| 2 | The platform: accounts, published builds, search, versions of a build and what changed between two. Hosted on Cloudflare (Workers, D1, R2). |
| 3 | The price of a build, with the prices of Exile Market. |

## Features of version 1

To specify in step 0. Open questions:

- How the level is chosen (a slider from 1 to 100, the ranges of the file, both), and what the tree shows of the passives taken before and after it.
- What a passive, a gem or a slot shows on hover: the stats of the game, the `additional_text` of the file in the markup of the game.
- How a file that refers to ids the game data doesn't know (another version of the game) is shown: its entries listed apart, with a warning.
- The share link: the build compressed in the fragment of the address, with a size limit to measure.
- The languages of the interface: English first, French?
- The game data (passive tree, gems, uniques): their sources, their licenses and how they are updated at each version of the game (see the `docs/game-data.md` of Exile Market).

## The `.build` format

Version 1 of the format, experimental, documented by Grinding Gear Games at <https://www.pathofexile.com/developer/docs/game>; read by `crates/build-file`. Path of Exile 2 leaves early access with its version 1.0 on 2026-12-11: the format may change then.
