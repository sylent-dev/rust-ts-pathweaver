# Game data

Where the names and the stats of the game come from, their terms, and how they follow the versions of the game. Checked on 2026-11-16; read by the steps that load game data (4, 5, 6).

## Sources

| Data | Source | Format | Terms |
|---|---|---|---|
| Passive tree: nodes, positions, links, stats, classes and ascendancies | [grindinggear/poe2-skilltree-export](https://github.com/grindinggear/poe2-skilltree-export), published by Grinding Gear Games; the only game data they export officially (see their [Data Exports](https://www.pathofexile.com/developer/docs/data)) | `data.json` (5 MB, 5,153 nodes) and `assets/`; a Git tag per version of the game (`0.4.0`, `0.5.2`) | No license file: made for tool developers, the data stay those of Grinding Gear Games |
| Gems (names, tags, descriptions), uniques, base items, ascendancies | [RePoE](https://github.com/repoe-fork/repoe), the community export of the files of the game, hosted at <https://repoe-fork.github.io/poe2/> (`skill_gems.json`, `base_items.json`, `uniques.json`, `ascendancies.json`…) | JSON, regenerated after each patch (last update on 2026-11-16) | The code is MIT; the data are those of Grinding Gear Games. « The file formats are not final » |

Measured on the corpus (see [build-files-in-the-wild.md](build-files-in-the-wild.md)): every passive, gem, unique and ascendancy id written by a tool is found in these two sources.

The inventory slots aren't in either source: they are a short fixed list (`Weapon1`, `Offhand1`, `Helm1`, `Ring2`, `Flask1`, `Charm1`, `Trinket1`…, the ids of the `Inventories` table of the game), laid out by Pathweaver itself, and their names are texts of the interface.

Rejected:

- **Path of Building (PoE2)**: MIT, complete, but its data are Lua files made for its own calculations.
- **poe2db.tw**: a website without an API, its texts under CC BY-NC-SA 3.0.
- **Extracting the files of the game ourselves** (PyPoE, poe-dat-viewer): what RePoE already does, kept as the way out if RePoE stops.

## How Pathweaver uses them

- The data are converted at build time by a script of the repository into compact files of the website, one folder per version of the game and per language (`en` only in version 1). The browser loads them from Pathweaver, never from GitHub or RePoE: the website keeps working if a source moves or stops.
- Only what Pathweaver shows is kept: the size counts, the passive tree alone weighs 5 MB raw.
- The version of the game of the data is shown in the warnings panel, so that an unknown id can be read as « made for another version ».
- At each version of the game: run the script on the new version, check the corpus, commit the new folder. Path of Exile 2 1.0 (2026-12-11) changes a lot: whether the passive tree is first built on the data of 0.5 or of 1.0 is decided at step 5, from how the steps before it went.
- **The portraits of the classes and ascendancies are the only images of the game** (decided by the owner on 2026-11-16, replacing « no image of the game » of the same day): they are cut from the `assets/background-<class>.webp` of the tree export (one sprite of 3,000 × 3,000 pixels per class: the class and each ascendancy, a round portrait of 1,500 pixels, placed by its `.json`), made small at build time, and bundled with the data of each version of the game, since 1.0 may change them. The other images of the tree export and the art referenced by RePoE aren't used: the shapes, marks and icons are Pathweaver's own, made with the mock-up. Other images (gems, uniques) are decided case by case, when a step needs them.

## French

To check when French is added (version 1.x): which of the two sources carries the French texts of the game, and whether the names of `unique_name` must stay in English in the files.

## Risks accepted

Accepted by the owner on 2026-11-16, with the specifications of version 1:

- **No written policy of Grinding Gear Games for third-party tools.** Their [terms of use](https://www.pathofexile.com/legal/terms-of-use-and-privacy-policy) license the use of the website and the game, not the reuse of its data; the tree export exists for tool developers, and poe.ninja, Path of Building and Maxroll show the same names and stats. Pathweaver uses texts and positions, and the portraits of the classes and ascendancies only (accepted by the owner on 2026-11-16, knowing that no policy allows it: guide sites and databases use far more of the art of the game, and Grinding Gear Games lets them); it states in its README and its pages that it isn't affiliated with Grinding Gear Games, and removes what they would ask to remove.
- **RePoE is run by volunteers.** A late or broken update delays the data of a new version; the way out is to extract the files ourselves.
- **The format of the data may change** at any version, for both sources: the conversion script fails loudly rather than producing incomplete data.
