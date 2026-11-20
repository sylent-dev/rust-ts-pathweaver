# Roadmap

Implementation steps of the features described in [specs.md](specs.md). Each step is delivered in its own pull request, which checks its box, and names the model that carries it out: Opus 5.5, or Fable 5.2 for the hardest steps (twice its price).

## Reference

Read only by the steps that need them:

- [Technical choices](docs/technical-choices.md): the libraries, the services and the main designs, with their reasons.
- [Game data](docs/game-data.md): the sources of the names and stats of the game, their terms, the risks accepted.
- [Build files in the wild](docs/build-files-in-the-wild.md): what the files of the tools do with the format, measured on a corpus.
- [Backlog](docs/backlog.md): ideas and edge cases for later; the owner decides when one becomes a step.
- [Process](process.md): the phases of a project, from the specifications to the build.
- [Roadmap archive](docs/roadmap-archive.md): the detail of the steps done.

## Steps

- [x] **Skeleton**: the workspace, the reading of a `.build` file, a first page, the CI (e45eff5).
- [x] **0. Specifications** (#2, #3).

### Version 1: the viewer

- [x] **1. Wireframes** (#4).
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, the inventory slots); the images of the game are the portraits of the ascendancies and the icons and frames of the passives (the owner, 2026-11-18). The layout first, in grey, then the look, one question per sub-step, each a pull request with a stop for the owner; a sub-step that brings up more decisions opens another rather than growing. The owner's screen: 2,560 × 1,440 pixels. 24 pull requests expected (13 at the start; 2l became three; then the rest of the page of a build cut into its components, drawn from top to bottom, one at a time, the second accent and the texture decided in the component where they show, and the motion with each, the owner, 2026-11-18; the level band became four, 2g, 2g2, 2g3 and 2g4; the tree three more, 2i2, 2i3 and 2i4, the owner, 2026-11-20; the right column four, 2j, 2j2, 2j3 and 2j4, the owner, 2026-11-20).
  - [x] 2a to 2j2: the page of a build in grey, then its styles (#7); the logo and the name (#8); the brand and the two bands at the top of the page (#10); the home page at the first visit (#11); the library (#12); the opening errors and the notices (#13); the fonts (#14); the header of a build and its file to download (#15); the level band (#16); its cases and its motion (#17); the window of what changes, the marks of the gems and of the notes (#18); the tabs of a build (#19); the passives with the icons and frames of the game, the weapon sets and the controls over the tree (#20); the ascendancy at the centre of the tree (#21); the tree at its real size and the hover of a passive (#22); the motion of the controls over the tree (#23); « New at N » (#24); a row of a skill and the hover of a gem (#25).
  - [x] 2j3: the inventory, in the right column of the Overview; commits: the archive of 2j2 and this split; twelve variants of the inventory, three at each of four temperatures, with square corners on every box and the real images of the items, from RePoE (the owner, 2026-11-20) (its slots and their hints, the « unknown » mark, a place for `Trinket1`, written by 7 entries of the corpus and missing from the grey drawing, the switch of the weapon set in the language of Set I and Set II under the tree), then a stop; the variant kept, with a list per open decision, the others removed; the hover or the click of a slot (the card of its hint and, when it names one, the unique with its kind and its stats, by `tools/make-data.py`: its stats from Path of Building, which RePoE doesn't have, the owner, 2026-11-20), then `specs.md`. Left out: the Inventory tab (2k), the overflow of the column (2j4). No hand test: the mock-up.
  - [x] 2j3b: the mark of an id the game data don't know (a gem, a unique, a slot), in the pull request of 2j3 (the owner, 2026-11-20: the amber « ? » and its dashed outline were never chosen); commits: twelve variants, three at each of four temperatures (normal, high, explosive, fun), each on an inventory, its list and the rows of a skill, then a stop; the variant kept, the others removed, then `specs.md`; the card of an unknown gem (the owner, 2026-11-20: « we'd like to know why »). Left out: the warnings panel (2k), the card of an unknown passive. No hand test: the mock-up.
  - [ ] 2j4: the overflow of the right column (9 skills at the median of the corpus at their highest level, 14 at most: the inventory pushed out of a column of 668 px); commits: variants (a column that scrolls, the skills folded after a few rows with « and N more »…), then a stop; the variant kept, then `specs.md`.
  - [ ] 2k: the other views of a build; commits: Skills, Tree, Inventory and About at 960 px; 1,920 px with the side panel; the variants of the level band; the box of Download, and the box of what comes next (the community of version 2), which opens with the burst (the owner, 2026-11-18: the opening 9 · Burst of the menu of « +N ▾ », css/menu-reveal.css at commit 4d866fd), out of the link or out of the middle of the screen, its turn and its flash tuned to the size of the box, a plain fade when the system asks for less motion.
  - [ ] 2m: Merge and the phone; commits: Merge ready; Merge to fix; the phone page.
  - [ ] 2m2: Frost and Ember derived from Frost Night once every part is drawn, rather than checked again at each sub-step (the owner, 2026-11-18); commits: Ember (amber on a neutral grey), checked on every section; Frost, the light one, in a pass of its own (the shadows, the texture, the grey portraits); then a stop for the owner.
  - [ ] 2n: the design system; commits: the tokens in `specs.md` and the mock-up as the single reference; the styles set aside removed and the entry of `design-journal.md`.
- [ ] **3. Deployment** (Opus 5.5): the static website on Cloudflare, at its domain of `sylent.tools`.
- [ ] **4. Skills** (Opus 5.5), with what every part uses, likely split into sub-steps at its start:
  - first, on Fable 5.2 (the owner, 2026-11-19): the shared state and the events of the interface, which the others build on: the level shared by the band, the tabs and the tree; the window of what changes and the menus, one open at a time; the keys anywhere on the page; the drag of the cursor; several builds open (the rule of [docs/backlog.md](docs/backlog.md), Method and skills, written into `docs/technical-choices.md` then);
  - opening several builds (drop, **Choose files**, pasted JSON), the list of open builds, the errors of a file;
  - the header of a build, with `link` as a field of `Build`;
  - the game data: the conversion script (RePoE), the files of the website per version and language, the lookup of an id;
  - the levels in the core (which entries apply, the markers, what changes at a marker) and the slider;
  - the markup of the author's texts; the unknown and invalid entries and the warnings panel;
  - the skills and their supports at the level.
- [ ] **5. Passive tree**, on the data of 0.5 or of 1.0 (2026-12-11), chosen at its start:
  - 5a (Fable 5.2): the data of the tree exported by Grinding Gear Games, converted, and its graph in a crate of the core;
  - 5b (Fable 5.2): the tree drawn in a canvas with the icons and frames of the game, moved and zoomed;
  - 5c (Opus 5.5): the level (lit, faded, dimmed), the ascendancy, the weapon sets, the hover, the points spent.
- [ ] **6. Inventory** (Opus 5.5): the slots laid out as in the game, their hints at the level, the uniques with their stats.
- [ ] **7. Merging a guide** (Opus 5.5): the merging in the core and its checks (overlap, gap, different guides), the screen of the start levels, completing a merged guide; downloading a build, with the help on where the game reads it.
- [ ] **8. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.

Then version 1.5 (the editor) and version 1.x (French), specified when their turn comes (see [specs.md](specs.md), Versions).
