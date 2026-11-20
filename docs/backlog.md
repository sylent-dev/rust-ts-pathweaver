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
- **The 22 passives `isBlighted` of the tree export** (noted 2026-11-20 at step 2i2; depends on: 5a, the data of the tree): no link reaches them; five are the « Sinister Jewel Sockets » in a column left of the centre, the others notables (Bastion of Light, Kaom's Blessing…). The mock-up draws them as they are; before 5a, read how the game and Path of Building treat them, and decide whether the tree shows them.
- **The weapon set of a new passive, in the editor** (a rule, noted on 2026-11-19 at step 2i; depends on: the editor of version 1.5): a control of three visible modes, **Shared · I · II**, says where the next passive goes, never a « no set selected » that would mean shared without saying it. Path of Building has the same three modes (`allocMode` 0, 1 and 2 in `PassiveTreeView.lua`, changed with the wheel). In version 1, the same control only picks what is shown strong, with « Both » besides.
- **The passives of a line of « New at N » lit on the tree** (interface, the owner, 2026-11-20; depends on the tree of step 5): the pointer on « + 2 passives » makes their rings beat on the tree, as the line of a gem lights its gem in its row (2j2), since the lines of « New at N » are no longer links.

## Images

- **Icons of the gems and the uniques from the game** (noted 2026-11-16): the portraits of the ascendancies and the icons of the passives are the only images of the game so far; whether the gems and the uniques get theirs is decided when a step needs it.
- **The art behind the groups of the passive tree** (noted 2026-11-18, with the icons of the passives at 2h2): `mastery-effect-active.webp` and `mastery-effect-disabled.webp` of the tree export, 640 KB, the large drawings of the 365 masteries; once the tree with its icons has been seen.


## Inventory

- **Prefix or suffix, for each line of a hint** (an idea of the owner, 2026-11-20 at step 2j3; after the release of 1.0, whose modifiers may change; depends on: the inventory of step 6): the `.build` file doesn't say it (a hint has seven fields; 3 hints of 326 say « prefix » in their own words), but RePoE's `mods.json` gives each modifier its kind (2,767 prefixes, 2,458 suffixes), its text with its ranges (« +(10-19) to maximum Life ») and the kinds of items it can roll on: each line of the author (« +41 to maximum Life ») read against the modifiers of its base. A rule that reads the data: measured first on the 555 numbered lines of the corpus (a value out of every range, a craft or a corruption; a modifier of two lines; a line that isn't a stat; a free text), then its display drawn in the mock-up (a mark P or S, or two groups, as the game shows them with Alt). Craft of Exile isn't needed: it reads the same game data.

## Merging a guide

- **Offer to merge the files of a guide** (an idea of Claude Code, taken by the owner on 2026-11-18 at step 2e2; for step 7, which it depends on): when several open builds share their `link` and their ascendancy, a line under the band of the open builds offers « 3 builds of the same guide · Merge », which opens the merging screen with them ticked. Merge… stays in the menu « +N ▾ », where it is hidden for a feature that sets Pathweaver apart.

## Method and skills

- **The mock-up skill in reference files** (an idea of the owner, 2026-11-17; once the general look is chosen): `html-mockups` keeps `SKILL.md` short and points to files read only when needed, the way the skill already keeps `assets/` and `scripts/`. A `textures.md` (patterns as CSS masks, coloured by their layer; two layers shifted, turned, drifting, faded; a swatch of every pattern; tried in the mock-up, commit `a819b7b`, with the generator `docs/mockups/pathweaver/tools/make-patterns.py`), then `process.md` (Mock-up) and a pull request on each template (`ts-astro-static-website-template`, `rust-desktop-template`, `rust-cli-template`). Rather than a skill of its own, whose description would go with every message. The moodboard became the `moodboards` skill (2026-11-17), hidden from the model, which `html-mockups` points to.

- **Where the state of the interface lives** (a rule of Claude Code, taken by the owner on 2026-11-19, after three bugs of the mock-up: « +N ▾ » opened in every band at once, « 3 changes » showed it, a window cut by a short frame; for the first sub-step of step 4, on Fable 5.2): what belongs to one component stays in it (a window open, a hover, a drag); what is shared has one source (the level of the build shown, the build current); « one window or menu open at a time » is one value, which one is open, never a boolean per window, so that two can't be open by construction. Written into `docs/technical-choices.md` at step 4, and into the checks of the `code-reviewer` agent; after a change of the events, a script tries every instance (its own popup only, Esc, a click outside, the other popup closing it).

## Later versions

- **The side panel of the open builds** (layout, set aside by the owner on 2026-11-17 at step 2e2; depends on the band of the open builds): from about 1,400 pixels, the open builds in a panel on the left, with their full names, **+ Open files or JSON**, **Merge…** and **Home**, in place of the band of their tabs (the frames of `docs/wireframes/pathweaver.excalidraw`). Version 1 keeps the band at every width: a second layout to draw, code and test by hand at two widths.
- **The price of a build** (an idea of the owner, 2026-11-20 at step 2j3, set aside for much later): what the items of a build cost, through a price tool such as Rust Exile Market, for instance by Ctrl+C on a hovered item copying it in the text format of the game. A hint is the model of an item, not an item: a unique has ranges, not rolled values; a rare is the stats its author aims for, without item level or rarity, sometimes out of every range. So the price is that of « an item like the one the guide asks for », which the other tool must know. The advanced copy (prefix, suffix, tier) depends on the backlog entry of the inventory; a Ctrl+C on a hover needs a line in the card to be found, and a button on a touch screen. The format is read from the game itself.
- **Comparing two builds**: what one takes that the other doesn't (version 2 compares the versions of a build).
- **Sign in with a Path of Exile account** (OAuth of Grinding Gear Games) for version 2: verified authors, fewer fake accounts for the votes.
- **A short link** (version 2; the share link left version 1, the owner, 2026-11-18): the build stored by the server, the link only its key (`…/b/x7k2q`), to paste in a chat. A link that holds the build was measured on the corpus at 1,936 characters for the median build and 7,348 for the longest, 1,562 and 3,142 without the notes of the author (a Discord message stops at 2,000). Depends on: the server and the database of version 2.
