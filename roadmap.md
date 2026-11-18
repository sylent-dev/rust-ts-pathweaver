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
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, the inventory slots); the images of the game are the portraits of the ascendancies and the icons and frames of the passives (the owner, 2026-11-18). The layout first, in grey, then the look, one question per sub-step, each a pull request with a stop for the owner; a sub-step that brings up more decisions opens another rather than growing. The owner's screen: 2,560 × 1,440 pixels. 17 pull requests expected (13 at the start; 2l became three; then the rest of the page of a build cut into its components, drawn from top to bottom, one at a time, the second accent and the texture decided in the component where they show, and the motion with each, the owner, 2026-11-18).
  - [x] 2a to 2d: the page of a build in grey, then its styles (#7); the logo and the name (#8); the brand and the two bands at the top of the page (#10); the home page at the first visit (#11); the library (#12); the opening errors and the notices (#13); the fonts (#14).
  - [ ] 2f: the header of a build, alone (the owner, 2026-11-18: the page drawn from top to bottom, one component at a time, each decision taken in the component where it shows): its portrait, its name, « by author · ascendancy (class) », Copy link, Download .build and the warnings; commits: the portrait on the right, square, the full height of the band, to balance the tabs of the band above, then on the left after trying it; Copy link and Download .build taken off, their place to be found together (the owner, 2026-11-18); the class without brackets, in a darker grey; then the owner's next remark, one commit at most.
  - [ ] 2f2: the place of Copy link and Download .build, in the pull request of 2f; commits: nine variants on the header, three at a normal temperature, three high, three explosive (the owner, 2026-11-18); then a stop for the owner; the one kept, the others removed, and 2f and 2f2 written into `specs.md`.
  - [ ] 2g: the level band: the level and its arrows with the level each goes to; the track, its markers (the second accent decided on them, if any) and its cursor; what changes at the level; the shade of the band, and the motion of its hover and its cursor.
  - [ ] 2h: the tabs of a build, and their motion.
  - [ ] 2i: the passives with the icons and frames of the game (the owner, 2026-11-18, see [docs/game-data.md](docs/game-data.md)); commits: `tools/make-data.py` takes the sheets of icons and frames of the tree export, kept whole with their index; the tree drawn with them, each kind of passive (small, notable, keystone, jewel socket, ascendancy) taken and not taken, on Frost Night; then a stop for the owner.
  - [ ] 2i2: the tree at its real size: lit, faded and dimmed; the ring of what is new; the hover and the zoom, measured in frames per second; the legend, the buttons of the zoom, the switch of the weapon set and the box of the ascendancy.
  - [ ] 2j: the right column, from top to bottom: « New at N »; a row of a skill and the marks of its gems (kind and colour); the inventory, its slots, their hints, the « unknown » mark and the weapon set.
  - [ ] 2k: the other views of a build; commits: Skills, Tree, Inventory and About at 960 px; 1,920 px with the side panel; the variants of the level band; the boxes of Copy link and Download, and the box of what comes next (the community of version 2), which opens with the burst (the owner, 2026-11-18: the opening 9 · Burst of the menu of « +N ▾ », css/menu-reveal.css at commit 4d866fd), out of the link or out of the middle of the screen, its turn and its flash tuned to the size of the box, a plain fade when the system asks for less motion.
  - [ ] 2m: Merge and the phone; commits: Merge ready; Merge to fix; the phone pages.
  - [ ] 2m2: Frost and Ember derived from Frost Night once every part is drawn, rather than checked again at each sub-step (the owner, 2026-11-18); commits: Ember (amber on a neutral grey), checked on every section; Frost, the light one, in a pass of its own (the shadows, the texture, the grey portraits); then a stop for the owner.
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
  - 5b (Fable 5.2): the tree drawn in a canvas with the icons and frames of the game, moved and zoomed;
  - 5c (Opus 5.5): the level (lit, faded, dimmed), the ascendancy, the weapon sets, the hover, the points spent.
- [ ] **6. Inventory** (Opus 5.5): the slots laid out as in the game, their hints at the level, the uniques with their stats.
- [ ] **7. Merging a guide** (Opus 5.5): the merging in the core and its checks (overlap, gap, different guides), the screen of the start levels, completing a merged guide; downloading a build, with the help on where the game reads it.
- [ ] **8. Share link** (Opus 5.5): copying the link, opening it, its length, the damaged links.
- [ ] **9. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.

Then version 1.5 (the editor) and version 1.x (French), specified when their turn comes (see [specs.md](specs.md), Versions).
