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
- [ ] **2. Mock-up** (Opus 5.5): phases 4 and 5 of [process.md](process.md), from the approved wireframes, with Pathweaver's own marks and shapes (the kinds of gems, the inventory slots); the images of the game are the portraits of the ascendancies and the icons and frames of the passives (the owner, 2026-11-18). The layout first, in grey, then the look, one question per sub-step, each a pull request with a stop for the owner; a sub-step that brings up more decisions opens another rather than growing. The owner's screen: 2,560 × 1,440 pixels. 25 pull requests expected (13 at the start; 2l became three; then the rest of the page of a build cut into its components, drawn from top to bottom, one at a time, the second accent and the texture decided in the component where they show, and the motion with each, the owner, 2026-11-18; the level band became four, 2g, 2g2, 2g3 and 2g4; the tree three more, 2i2, 2i3 and 2i4, the owner, 2026-11-20; the right column five, 2j, 2j2, 2j3, 2j4 and 2j5, the owner, 2026-11-20; the other views six, 2k to 2k6, 2k5 and 2k6 in one pull request, and 2kb in the pull request of 2k, the owner, 2026-11-20; 2k2b in the pull request of 2k2, and 2k2c in that of 2k3, 2k3b in that of 2k4, the owner, 2026-11-21: 29 in all; 2m2, Frost and Ember, set aside until after version 1, 2n2 in the pull request of 2n, 2n3 a pull request of its own for the review of the style sheets, and 2n4 in its pull request, the owner, 2026-11-21: 29 in all; 2n3 split in two, 2n3b with 2n4, the owner, 2026-11-21: 30 in all).
  - [x] 2a to 2n2: the page of a build in grey, then its styles (#7); the logo and the name (#8); the brand and the two bands at the top of the page (#10); the home page at the first visit (#11); the library (#12); the opening errors and the notices (#13); the fonts (#14); the header of a build and its file to download (#15); the level band (#16); its cases and its motion (#17); the window of what changes, the marks of the gems and of the notes (#18); the tabs of a build (#19); the passives with the icons and frames of the game, the weapon sets and the controls over the tree (#20); the ascendancy at the centre of the tree (#21); the tree at its real size and the hover of a passive (#22); the motion of the controls over the tree (#23); « New at N » (#24); a row of a skill and the hover of a gem (#25); the inventory and the mark of an unknown id (#26); the overflow of the right column (#27); the note of an author on hover of its mark (#28); the Skills tab, the cards on hover and the mark of a gem of two attributes (#29); the Inventory tab and the switch of the weapon set (#30); the About tab and the mark of a free text (#31); the page of a build at 1,920 px (#32); a snapshot in the page, the ends of the track, the boxes of Download .build and of What's next, the merging set aside as **Merge .build** (#33); the phone page (#34); Frost Night alone, its tokens sorted and its style sheets checked (#35).
  - [ ] 2n3: one style sheet per component, so that each copies into its Svelte component (the review of 2n2, 2, 3 and 4; Svelte keeps the styles of a component, its classes and its `@keyframes`, to its own markup), split from 2n3 to keep it to half an hour; commits: the archive of 2n and 2n2, this split and the section of the changes of 2n2 removed; the graph paper a class each block sets on itself, the motions shared in `css/motion.css`; the rules that reach into another component moved into it, the right column; the same, the Inventory tab, the cards on hover, the home page and the library; each commit the same to the pixel, then a stop.
  - [ ] 2n3b, in a pull request of its own: the rest of the review of 2n2 (6, 7, 8 and the focus ring of 12); commits: the rules that undo others removed; the styles of the page of the mock-up out of the components into `css/sections.css`, the page at 1,920 px a container query of each component from 1,600 px (the owner, 2026-11-21); a ring of focus for every control; the values repeated made tokens (the curve with a bounce, the durations); each commit the same to the pixel, then a stop.
  - [ ] 2n4, in the pull request of 2n3b: the design system; commits: the tokens in `specs.md` (The style), the named colours of the author's markup tuned on Frost Night; the rule « every colour through a token » in `docs/code-quality.md` and the entry of `design-journal.md`.
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
- [ ] **7. Downloading a build** (Opus 5.5): the file written as it was read, with the help on where the game reads it (the merging of a guide set aside until after version 1, the owner, 2026-11-21).
- [ ] **8. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.

Then, first, **Merge .build** ([docs/backlog.md](docs/backlog.md)); version 2, **The Editor Update**, and version 3, **The Community Update** with French, specified when their turn comes (see [specs.md](specs.md), Versions).
