# Backlog

Ideas, polish and edge cases found along the way that the current step doesn't need. The owner decides when an entry becomes a step of [roadmap.md](../roadmap.md).

## Reading the files

- **A `null` field is dropped on writing.** `"author": null` (one file of the corpus) is read as no author and not written back; keep it as it was read, as the other fields.
- **A gem in the wrong folder.** An id such as `Metadata/Items/Gems/SkillGemShieldWall` that exists in the other folder (`Gem/`) could show « did you mean… » in the warnings, once the editor can fix it.
- **The meaning of a single-number `level_interval`.** Read as « from that level to 100 » until checked in the game.

## The level band

Set aside at the wireframes (2026-11-16, see `docs/wireframes/archive.excalidraw`), for when the use asks for them:

- **The markers as buttons**: a row of the levels of the markers under the track, to jump to any of them in one click; ten of them sliding with the level when there are more.
- **What comes next, named**: « Next · 65: + 2 supports on Spark » beside ▶, or on hovering a marker of the track.

## Passive tree

- **The order of allocation**: number the passives on the tree (1, 2, 3…) for leveling, as Maxroll does and as some authors write in their hints.
- **Search in the tree**: light the passives whose name or stats match a text (« life », « crit »), as Path of Building does.
- **The passives as a list**, beside the canvas: for screen readers, and to copy them.

## Later versions

- **Comparing two builds**: what one takes that the other doesn't (version 2 compares the versions of a build).
- **Sign in with a Path of Exile account** (OAuth of Grinding Gear Games) for version 2: verified authors, fewer fake accounts for the votes.
- **A short link** for the builds too long for a message, stored by the server of version 2.
