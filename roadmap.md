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
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, of passives, the inventory slots); the portraits of the ascendancies are the only images of the game. The layout first, in grey, then the look, one question per sub-step, each a pull request with a stop for the owner; a sub-step that brings up more decisions opens another rather than growing. The owner's screen: 2,560 × 1,440 pixels. 13 pull requests expected.
  - [x] 2a, 2b: the page of a build in grey, then its styles (#7).
  - [ ] 2c: the logo, before the rest, to frame it (the owner, 2026-11-17); first a moodboard of real logos in `outputs/`, numbered by family, the owner picks by number (no commit: the images are others'). The mark is the one the owner drew in Inkscape (2026-11-17), after 42 marks of Claude Code and the name in fourteen fonts, none kept; the name keeps the font of the style until 2d. Commits: the archive of 2a and 2b; the 42 marks, set aside; the name in fourteen open fonts, set aside; the owner's mark built again in SVG, its weights and inks side by side at 128, 24 and 16 px on the three styles, then the one chosen and the favicon.
  - [ ] 2d: typography and colours; commits: a font per role (titles, text, numbers), beside the font of the name; the style kept among Frost, Frost Night and Ember; the second accent, its colour and what it marks; the texture, its colour, size and opacity.
  - [ ] 2e: the app bar, the first part, each piece with its variants and its states side by side (the owner wants the parts split as finely as possible, 2026-11-17); commits: the brand, mark and name, and their sizes; a build tab (portrait, name, close; current, hover, a long name; full height or not); the overflow « +1 » and its menu; the « + » button and the shade of the bar.
  - [ ] 2f: the header and the level band; commits: the portrait, the name and the author, the actions; the level, its number and its arrows; the track, its markers and its cursor; what changes at the level, and the shade of the band.
  - [ ] 2g: the tabs of a build and the right column; commits: the tabs; « New at N »; a row of a skill and its gems; the inventory, its slots, its hints and the weapon set.
  - [ ] 2h: the marks of the game, variants side by side; commits: the gems (kind and colour); the five shapes of passives; the inventory slots and the « unknown » mark.
  - [ ] 2i: the tree at its real size; commits: lit, faded and dimmed; the ring of what is new; the hover and the zoom, measured in frames per second. The legend, the buttons of the zoom and the box of the ascendancy come with it.
  - [ ] 2j: the motion, chosen by clicking; commits: the hover and the cursor of the level; the tabs and the boxes that open.
  - [ ] 2k: the other views of a build; commits: Skills, Tree, Inventory and About at 960 px; 1,920 px with the side panel; the variants of the level band; the boxes of Copy link and Download.
  - [ ] 2l: home and opening; commits: the first visit; the library; Paste JSON, the opening errors and the notices.
  - [ ] 2m: Merge and the phone; commits: Merge ready; Merge to fix; the phone pages.
  - [ ] 2n: the design system; commits: the tokens in `specs.md` and the mock-up as the single reference; the styles set aside removed and the entry of `design-journal.md`.
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
