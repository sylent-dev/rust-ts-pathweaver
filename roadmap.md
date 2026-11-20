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
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, the inventory slots); the images of the game are the portraits of the ascendancies and the icons and frames of the passives (the owner, 2026-11-18). The layout first, in grey, then the look, one question per sub-step, each a pull request with a stop for the owner; a sub-step that brings up more decisions opens another rather than growing. The owner's screen: 2,560 × 1,440 pixels. 25 pull requests expected (13 at the start; 2l became three; then the rest of the page of a build cut into its components, drawn from top to bottom, one at a time, the second accent and the texture decided in the component where they show, and the motion with each, the owner, 2026-11-18; the level band became four, 2g, 2g2, 2g3 and 2g4; the tree three more, 2i2, 2i3 and 2i4, the owner, 2026-11-20; the right column five, 2j, 2j2, 2j3, 2j4 and 2j5, the owner, 2026-11-20; the other views six, 2k to 2k6, 2k5 and 2k6 in one pull request, and 2kb in the pull request of 2k, the owner, 2026-11-20: 29 in all).
  - [x] 2a to 2j5: the page of a build in grey, then its styles (#7); the logo and the name (#8); the brand and the two bands at the top of the page (#10); the home page at the first visit (#11); the library (#12); the opening errors and the notices (#13); the fonts (#14); the header of a build and its file to download (#15); the level band (#16); its cases and its motion (#17); the window of what changes, the marks of the gems and of the notes (#18); the tabs of a build (#19); the passives with the icons and frames of the game, the weapon sets and the controls over the tree (#20); the ascendancy at the centre of the tree (#21); the tree at its real size and the hover of a passive (#22); the motion of the controls over the tree (#23); « New at N » (#24); a row of a skill and the hover of a gem (#25); the inventory and the mark of an unknown id (#26); the overflow of the right column (#27); the note of an author on hover of its mark (#28).
  - [x] 2k: the Skills tab at 960 px; commits: the archive of 2j5 and this split; twelve variants of the tab, three at each of four temperatures (normal, high, explosive, fun), at the level of the band, on the median of the corpus (9 skills) and its worst case (14), then a stop; the variant kept, the others removed; the card of a gem on it, then `specs.md`. The Tree tab is drawn already (2i, at 960 and 1,600 px). Grew on the way, asked by the owner (2026-11-20 and 21): the icons of the gems from RePoE (`tools/make-data.py`, `docs/game-data.md`); the card of a gem redrawn by the owner on `docs/wireframes/gem-card.excalidraw`, then every card on hover (gem, note, passive, slot) in one construction (`js/hover-card.js`), each staying open under the pointer; the levels of a support read within those of its skill. No hand test: the mock-up. Decided (the owner, 2026-11-21): K6, a small card per skill in three columns, the icon of a skill as its badge, its supports in its body, « NEW » at the right, a new skill tagged on the top edge of its card before its badge and its title swept by a light; the cards on hover, a head of 48 px with the title, its subtitle on one line and the icon of a gem at the right (a support's disc cut to a square; none for a note, a passive or an item), a body a step darker, the note in the shade of the head.
  - [x] 2kb: the mark of a gem shared half and half between two attributes (114 gems of the game, 23 builds of the corpus: grey as a gem without an attribute until then), in the pull request of 2k (the owner, 2026-11-20: the mark split in two colours, of three ways); commits: the two letters of such a gem in the data (`tools/make-data.py`) and its mark in two halves, left and right, on two builds of the corpus with such gems; `specs.md`. Left out: the one gem of three attributes, grey. No hand test: the mock-up.
  - [ ] 2k2: the Inventory tab at 960 px (the slots as in the game, beside them the hints at the level, then those to come); commits: the archive of 2k; twelve variants, then a stop; the variant kept, the others removed; the card of a slot or of a line on hover or click, then `specs.md`.
  - [ ] 2k3: the About tab at 960 px (the description with the markup of the game, the link to the guide, the file, the warnings, where ⚠ of the header leads); commits: the archive of 2k2; twelve variants, then a stop; the variant kept, the others removed, then `specs.md`.
  - [ ] 2k4: the page of a build at 1,920 px (the owner, 2026-11-20: 2,560 would overflow the page of the mock-up), without the side panel, set aside in [docs/backlog.md](docs/backlog.md); commits: the archive of 2k3; the Overview, Skills, Inventory and About at 1,920 px, with a few ways to use the width, then a stop; the ways kept, then `specs.md`.
  - [ ] 2k5 and 2k6, in one pull request with a stop between them; 2k5, the variants of the level band; commits: the archive of 2k4; a merged guide, the level below the start of a guide, a snapshot the same at every level, then a stop; `specs.md`. 2k6, the boxes; commits: the box of Download (where the game reads the file); the box of what comes next (the community of version 2), which opens with the burst (the owner, 2026-11-18: the opening 9 · Burst of the menu of « +N ▾ », css/menu-reveal.css at commit 4d866fd), out of the link or out of the middle of the screen, its turn and its flash tuned to the size of the box, a plain fade when the system asks for less motion; `specs.md`.
  - [ ] 2m: Merge and the phone; commits: Merge ready; Merge to fix; the phone page.
  - [ ] 2m2: Frost and Ember derived from Frost Night once every part is drawn, rather than checked again at each sub-step (the owner, 2026-11-18); commits: Ember (amber on a neutral grey), checked on every section; Frost, the light one, in a pass of its own (the shadows, the texture, the grey portraits, the named colours of the author's markup as tokens of each style, specs.md, The author's texts); then a stop for the owner.
  - [ ] 2n: the design system; commits: the tokens in `specs.md` and the mock-up as the single reference; the styles set aside removed and the entry of `design-journal.md`.
- [ ] **3. Deployment** (Opus 5.5): the static website on Cloudflare, at its domain of `sylent.tools`.
- [ ] **4. Skills** (Opus 5.5), with what every part uses, likely split into sub-steps at its start:
  - first, on Fable 5.2 (the owner, 2026-11-19): the shared state and the events of the interface, which the others build on: the level shared by the band, the tabs and the tree; the window of what changes and the menus, one open at a time; the keys anywhere on the page; the drag of the cursor; several builds open (the rule of [docs/backlog.md](docs/backlog.md), Method and skills, written into `docs/technical-choices.md` then);
  - opening several builds (drop, **Choose files**, pasted JSON), the list of open builds, the errors of a file;
  - the header of a build, with `link` as a field of `Build`;
  - the game data: the conversion script (RePoE), the files of the website per version and language, the lookup of an id;
  - the levels in the core (which entries apply, the markers, what changes at a marker) and the slider;
  - the markup of the author's texts, an `rgb` colour under a contrast of 4.5 to 1 lightened or darkened; the unknown and invalid entries and the warnings panel;
  - the skills and their supports at the level.
- [ ] **5. Passive tree**, on the data of 0.5 or of 1.0 (2026-12-11), chosen at its start:
  - 5a (Fable 5.2): the data of the tree exported by Grinding Gear Games, converted, and its graph in a crate of the core;
  - 5b (Fable 5.2): the tree drawn in a canvas with the icons and frames of the game, moved and zoomed;
  - 5c (Opus 5.5): the level (lit, faded, dimmed), the ascendancy, the weapon sets, the hover, the points spent.
- [ ] **6. Inventory** (Opus 5.5): the slots laid out as in the game, their hints at the level, the uniques with their stats.
- [ ] **7. Merging a guide** (Opus 5.5): the merging in the core and its checks (overlap, gap, different guides), the screen of the start levels, completing a merged guide; downloading a build, with the help on where the game reads it.
- [ ] **8. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.

Then version 1.5 (the editor) and version 1.x (French), specified when their turn comes (see [specs.md](specs.md), Versions).
