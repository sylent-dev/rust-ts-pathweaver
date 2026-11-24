# Roadmap

Implementation steps of the features described in [specs.md](specs.md). Each step is delivered in its own pull request, which checks its box, and names the model that carries it out: Opus 5.5, or Fable 5.2 for the hardest steps (twice its price).

## Reference

Read only by the steps that need them:

- [Technical choices](docs/technical-choices.md): the libraries, the services and the main designs, with their reasons.
- [Game data](docs/game-data.md): the sources of the names and stats of the game, their terms, the risks accepted.
- [Cloudflare usage](docs/cloudflare-usage.md): the host, its limits and terms, the token of the deployment, the risks accepted.
- [Build files in the wild](docs/build-files-in-the-wild.md): what the files of the tools do with the format, measured on a corpus.
- [Backlog](docs/backlog.md): ideas and edge cases for later; the owner decides when one becomes a step.
- [Process](process.md): the phases of a project, from the specifications to the build.
- [Roadmap archive](docs/roadmap-archive.md): the detail of the steps done.

## Steps

- [x] **Skeleton**: the workspace, the reading of a `.build` file, a first page, the CI (e45eff5).
- [x] **0. Specifications** (#2, #3).

### Version 1: the viewer

- [x] **1. Wireframes** (#4).
- [x] **2. Mock-up** (#7 to #37): the page of a build, the home page, the library and the phone page, in Frost Night, with its design system.
- [x] **3. Deployment** (#38): the static website on Cloudflare at `pathweaver.sylent.tools`, deployed at each merge.
- [ ] **4. Skills** (15 pull requests, 4e in three since 2026-11-23, 4f in three since 2026-11-24; Fable 5.2 for 4a and 4c, Opus 5.5 for the others, the owner, 2026-11-22; the levels of the core moved before the pages that open a build, which need them, at the review of 4a). 4a to 4e1 in [docs/roadmap-archive.md](docs/roadmap-archive.md) (#40 to #44). Critical code (`CLAUDE.md`, Code review: the review again after its fixes until no high or medium finding is left): 4b, 4c, 4g. Left out: the tree (5), the inventory (6), the download (7), the library and its list on the home page (8); the marks « new » on the tree and the inventory come with them. One new guide of the test by hand, `docs/tests/open-builds.md` (4e, 4f, 4g), with the steps of the level band (4h).
  - [x] 4e (Opus 5.5): the home page in Svelte, in three pull requests, one per sub-step (Claude Code, 2026-11-23: its line held four commits and five owed items, too much for one review). Between 4e and 4f, a build opened shows its name, its author, its ascendancy and its link, as today, until its page. Moved to 4f, where each is first read: the game data loaded once, the band of the site (the first visit has none) and the notice of the files refused while a build opens (between the two bands of the page of a build). Left out: the page of a build (4f), the library and its notice of private browsing (8).
    - [x] 4e1 (#44): the page and its base, in [docs/roadmap-archive.md](docs/roadmap-archive.md).
    - [x] 4e2 (#46): the first visit, in [docs/roadmap-archive.md](docs/roadmap-archive.md).
    - [x] 4e3 (#47): the zone that refuses and Paste JSON, in [docs/roadmap-archive.md](docs/roadmap-archive.md).
  - [ ] 4f (Opus 5.5): the page of a build, in three pull requests for four sub-steps (Claude Code, 2026-11-24: its line held seven works, moved in part from 4e). Decided at its start (Claude Code, 2026-11-24, left to it by the owner): the tabs of the view and those of the band of the open builds plain buttons, the one shown marked current, ← and → the level's wherever the focus is, as the owner decided on 2026-11-19 (a `role="tablist"` would give them to its tabs, and a tab clicked keeps the focus: the next → would change the tab, not the level; a tab of the band also holds its close button, which a tab of a tablist can't); the box of What's next without its rising passives until the tree (5b), whose sheet of icons comes with the data of the tree, those of 0.5 or of 1.0.
    - [ ] 4f1: the page and its tabs; commits: the archive of 4e3 and this split; the game data loaded once for the page, one promise kept in a module of `web/src/lib/page/`, since `loadGameData` loads them again at each call (owed since 4d, its review); the header (the portrait, the name, « by author · ascendancy class »); the row of the five tabs and its bar (`BuildTabPanel`), their panels empty, then `specs.md`. The list of the name, the author, the ascendancy and the link and the version of the core leave the page. Left out: « N warnings » of the header (4i), the file to download (7). No hand test: the browser mode of Vitest clicks the tabs.
    - [ ] 4f2: the band of the open builds; commits: its tabs (the portrait, the name over the ascendancy, the close button); **+**, which opens the choice of files of the system; « +N ▾ » and its menu, with its pop; the first visit given back once its builds are closed shows the drop zone, not the field of Paste JSON, which `+page.svelte` keeps open after a build pasted (the review of 4e3), and what opens a build without a click closes the window or the menu open ([docs/technical-choices.md](docs/technical-choices.md), State of the interface). Two hand tests: + and the chooser of the system; six builds in a window of 900 pixels.
    - [ ] 4f3, in one pull request with 4f4 and a stop between them: the band of the site and the notice; commits: the brand, **My library** and **Report a bug** in the band; the notice of the files refused while a build opens, between the two bands, read from the module of the messages of 4e3a; `specs.md`. One hand test: a .build and an image dropped together on the page of a build.
    - [ ] 4f4, on the owner's word after the stop: the box of What's next; commits: its link and its panel, × , Esc and a click outside; its two cards and their portraits, the motion and less motion; the guide of the test by hand. One hand test: the box opened and closed, with less motion. Left out: its rising passives (5b).
  - [ ] 4g (Opus 5.5): the markup of the author's texts; commits: its parser in the core, tested on the corpus; the addresses as links; its component, an `rgb` colour under 4.5 to 1 lightened or darkened; the About tab, the description and the link of the guide.
  - [ ] 4h (Opus 5.5): the level band; commits (the caption and the label, moved from 4e1, with the first that shows them): the slider, its track and its markers; ◀ and ▶, the keys; the snapshot; the window of « N changes », its changes through the bridge (`Build::changes_by_level`, in the core since 4c), those of the level shown only, never the hundred at once: a file made to cost copies 2.7 million notes over its levels, about 100 MB (the third review of 4c, `changes/large_files.rs`). In the guide of the test by hand: ← in the field of the pasted JSON moves the caret; « N changes » open, the cursor dragged and released outside the band keeps the window, in Chromium and in Firefox (the click after a release was measured in Chromium only).
  - [ ] 4i (Opus 5.5), small, may share the pull request of 4j with a stop: the warnings panel; commits: the unknown ids, the version of the game data, the invalid intervals through the bridge (`Build::invalid_intervals`, in the core since 4c). To decide with the owner at its start: a support whose valid interval never meets that of its skill is shown at no level and listed nowhere (the second review of 4c; none in the corpus).
  - [ ] 4j (Opus 5.5): the skills; commits: the gems at the level with their supports (the rule in the core: `Build::at_level` holds each gem once since 4c, and the rows are the entries of the file); their marks; the right column and the Skills tab, its wide layout; the cards on hover, with the icons of the gems added to the script of 4d.
  - [ ] 4k (Opus 5.5): a refactoring pass on the code of step 4, the core (`crates/`) and the interface (`web/`) alike, read for DRY, KISS and SOLID as `docs/code-quality.md` writes them (Refactoring: the `code-reviewer` agent on each area, a numbered plan the owner accepts, the moves first, one commit per improvement, the tests the same after each commit); no change of behavior. Its commits are listed once the plan is accepted.
- [ ] **5. Passive tree**, on the data of 0.5 or of 1.0 (2026-12-11), chosen at its start:
  - 5a (Fable 5.2): the data of the tree exported by Grinding Gear Games, converted, and its graph in a crate of the core;
  - 5b (Fable 5.2): the tree drawn in a canvas with the icons and frames of the game, moved and zoomed, and the passives rising behind the box of What's next (4f4) from its sheet of icons;
  - 5c (Opus 5.5): the level (lit, faded, dimmed), the ascendancy, the weapon sets, the hover, the points spent; the passives taken « of the ascendancy » as a group of their own in the changes of a level, which 4c groups by weapon set alone (`specs.md`, The level);
  - 5d (Opus 5.5): a refactoring pass on the code of step 5, the crate of the tree and its canvas, as 4k.
- [ ] **6. Inventory** (Opus 5.5): the slots laid out as in the game, their hints at the level, the uniques with their stats.
- [ ] **7. Downloading a build** (Opus 5.5): the file written as it was read, with the help on where the game reads it (the merging of a guide set aside until after version 1, the owner, 2026-11-21).
- [ ] **8. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, the browser that refuses to keep them.
- [ ] **9. Refactoring** (Opus 5.5): a pass on the code of steps 6 to 8, the core and the interface alike, as 4k, before the security audit of the version.

Then, first, **Merge .build** ([docs/backlog.md](docs/backlog.md)); version 2, **The Editor Update**, and version 3, **The Community Update** with French, specified when their turn comes (see [specs.md](specs.md), Versions).
