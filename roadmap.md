# Roadmap

Implementation steps of the features described in [specs.md](specs.md). Each step is delivered in its own pull request, which checks its box, and names the model that carries it out: Opus 5.5, or Fable 5.2 for the hardest steps (twice its price).

## Reference

Read only by the steps that need them:

- [Technical choices](docs/technical-choices.md): the libraries, the services and the main designs, with their reasons.
- [Game data](docs/game-data.md): the sources of the names and stats of the game, their terms, the risks accepted.
- [Build files in the wild](docs/build-files-in-the-wild.md): what the files of the tools do with the format, measured on a corpus.
- [Backlog](docs/backlog.md): ideas and edge cases for later; the owner decides when one becomes a step.
- [Process](process.md): the phases of a project, from the specifications to the build.

## Steps

- [x] **Skeleton**: the workspace (`crates/build-file`, `crates/wasm`, `web/`) on the model of Stepwise, the reading of a `.build` file without loss, a first page that summarizes a dropped file, the CI.
- [x] **0. Specifications**: version 1 in [specs.md](specs.md), the game data in [docs/game-data.md](docs/game-data.md), the steps below.

### Version 1: the viewer

- [x] **1. Wireframes** (Opus 5.5): the page of a build (header, level slider, skills, tree, inventory, warnings), the list of open builds, the merging screen, the home page with the library, the phone page; at the width of half a 1920-pixel screen and wider (phase 3 of [process.md](process.md)).
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, of passives, the inventory slots); the portraits of the ascendancies are the only images of the game.
- [ ] **3. Deployment** (Opus 5.5): the static website on Cloudflare, at its domain of `sylent.tools`.
- [ ] **4. Skills** (Opus 5.5), with what every part uses, likely split into sub-steps at its start:
  - opening several builds (drop, **Choose files**, pasted JSON), the list of open builds, the errors of a file;
  - the header of a build, with `link` as a field of `Build`;
  - the game data: the conversion script (RePoE), the files of the website per version and language, the lookup of an id;
  - the levels in the core (which entries apply, the markers, what changes at a marker) and the slider;
  - the markup of the author's texts; the unknown and invalid entries and the warnings panel;
  - the skills and their supports at the level.
- [ ] **5. Passive tree**, on the data of 0.5 or of 1.0 (2026-12-11), chosen at its start:
  - 5a (Fable 5.2): the data of the tree exported by Grinding Gear Games, converted, and its graph in a crate of the core;
  - 5b (Fable 5.2): the tree drawn in a canvas with Pathweaver's own shapes, moved and zoomed;
  - 5c (Opus 5.5): the level (lit, faded, dimmed), the ascendancy, the weapon sets, the hover, the points spent.
- [ ] **6. Inventory** (Opus 5.5): the slots laid out as in the game, their hints at the level, the uniques with their stats.
- [ ] **7. Merging a guide** (Opus 5.5): the merging in the core and its checks (overlap, gap, different guides), the screen of the start levels, completing a merged guide; downloading a build, with the help on where the game reads it.
- [ ] **8. Share link** (Opus 5.5): copying the link, opening it, its length, the damaged links.
- [ ] **9. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.

Then version 1.5 (the editor) and version 1.x (French), specified when their turn comes (see [specs.md](specs.md), Versions).
