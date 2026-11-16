# Build files in the wild

What the `.build` files made by the tools do with the format, measured on 2026-11-16 on a corpus of 32 files: exports of Mobalytics (16), Maxroll (2) and poe.ninja (1), Path of Building converters (3), the example of the documentation and a completed copy of it (2), and files of unknown origin, written by hand or for tests (8). They come from public GitHub repositories; they belong to their authors, so they are kept out of Git, in `inputs/builds/` of the owner (with their sources), until their terms of reuse are checked. Read by the steps that touch the reading of a file, the levels or the merging.

Path of Exile 2 1.0 (2026-12-11) may change the format and will rename ids: measure again on files made after it.

## Reading

- Every file reads with `crates/build-file`, and 31 of 32 are written back with the same JSON. The last one holds `"author": null`, which the writing drops (see [backlog.md](backlog.md)).
- No file starts with a byte order mark. The layout varies: 15 files on one line, 13 indented with 2 spaces, 3 with 4, 1 with 1; two files break the lines of their texts with `\r\n`.
- `link`, documented by Grinding Gear Games, is in 18 files: the page of the guide (`https://mobalytics.gg/...`, `https://maxroll.gg/poe2/planner/...`).
- Fields the documentation doesn't name: `items` (two Path of Building converters, a list of the items), `x_meta`, `x_tool_version`, `x_order`, `x_slot`, `x_note` (one test file).

## Entries

- Almost every entry is an object: 3,552 passives against 53 written as an id alone, 964 supports against 13.
- `level_interval` is `[min, max]` almost always (2,535 entries), a single number 3 times (in a test file); it goes from 0 to 100.
- `weapon_set` is on 771 passives: 390 with 1, 380 with 2, 1 with 0.
- 1,127 entries have an `additional_text`, often with markup (`<b>{<m>{Allocation Step #1}}`).

## Three ways to use the levels

| Way | Who | Intervals | Meaning |
|---|---|---|---|
| From a level on | Mobalytics | `[10, 100]`, `[23, 100]`… | when to take a passive or a gem; never removed. One guide writes `[2, 100]` to `[100, 100]`: the order of the passives, one per level |
| Real windows | Maxroll, hand-made leveling guides | `[1, 5]`, `[6, 14]`, `[1, 64]` then `[65, 100]` | taken, then removed: gems swapped, the tree respecced at level 65 |
| None | poe.ninja, Path of Building converters | none, or `[0, 100]` everywhere | a snapshot of a character |

## Guides in several files

Mobalytics exports a guide as one file per range of levels or per variant, named `<range or variant> - <game version> <title>`, cut at 40 characters: `lvl 1-14 - 0.5.5 Fubgun Flameblast Oil G`.

- The 7 files of a guide share their `link`, their author and their ascendancy.
- Each file is a snapshot of the build at its range, not what it adds: the tree of `lvl 15-32` holds the 21 passives of `lvl 1-14` and 32 more; `lvl 52 Swap` removes 34 passives (a respec).
- The start level is only in the name, and not always as a range: `lvl 52 Swap`, `lvl 85`, `Endgame`.
- Other guides split into variants to choose from, not ranges: `Early`, `Live Gear`, `Uber Endgame`.

## Ids

Compared with the game data of 2026-11-16 (see [game-data.md](game-data.md)):

- Passives: 908 of 909 ids are in the passive tree exported by Grinding Gear Games; the last is a fake of a test file.
- Gems: 1,275 of 1,296 references are in the base items of the game. The game has gems in `Metadata/Items/Gem/` (595) and in `Metadata/Items/Gems/` (641), never in both: each gem has one id. The 21 misses are in a file written by hand and in test files, with the wrong folder or a gem that doesn't exist.
- Uniques: the 17 `unique_name` are names of uniques of the game.
- Ascendancies: the 7 used (`Ranger1`, `Mercenary3`…) are ascendancies of the game.
- Inventories: 16 ids, the same in every tool: `Weapon1`, `Weapon2`, `Offhand1`, `Offhand2`, `Helm1`, `BodyArmour1`, `Gloves1`, `Boots1`, `Belt1`, `Amulet1`, `Ring1`, `Ring2`, `Flask1`, `Flask2`, `Charm1`, `Trinket1`.

## Share links

The JSON without its spaces, compressed with deflate and written in base64url: 1,926 characters for the median file, 7,348 for the largest (44 KB); 17 files fit in 2,000 characters, 27 in 4,000, all in 8,000.
