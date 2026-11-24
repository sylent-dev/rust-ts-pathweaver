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
- [ ] **4. Skills** (17 pull requests, 4e in three since 2026-11-23, 4f in three and 4g in three since 2026-11-24; Fable 5.2 for 4a and 4c, Opus 5.5 for the others, the owner, 2026-11-22; the levels of the core moved before the pages that open a build, which need them, at the review of 4a). 4a to 4f4 in [docs/roadmap-archive.md](docs/roadmap-archive.md) (#40 to #50). Critical code (`CLAUDE.md`, Code review: the review again after its fixes until no high or medium finding is left): 4b, 4c, 4g. Left out: the tree (5), the inventory (6), the download (7), the library and its list on the home page (8); the marks « new » on the tree and the inventory come with them. One new guide of the test by hand, `docs/tests/open-builds.md` (4e, 4f, 4g), with the steps of the level band (4h).
  - [x] 4e (Opus 5.5, #44, #46, #47): the home page in Svelte, in [docs/roadmap-archive.md](docs/roadmap-archive.md).
  - [x] 4f (Opus 5.5, #48 to #50): the page of a build, its tabs, its bands, the notice and What's next, in [docs/roadmap-archive.md](docs/roadmap-archive.md).
  - [ ] 4g (Opus 5.5): the markup of the author's texts, in three pull requests (Claude Code, 2026-11-24: the documentation of Grinding Gear Games, read on 2026-11-24, makes `s`, `m` and `l` sizes, small, medium and large, which the mock-up drew as plain text, and names five colours it doesn't know, `indigo`, `violet`, `bronze`, `silver` and `unique`, but not `purple`, `cyan` nor `magenta`: a change seen, so the mock-up first). Left out: the warnings of the About tab (4i), its file to download and where the game reads the builds (7), the notes in the cards on hover (4j, 5c, 6), which take its component.
    - [ ] 4g1, without code: the mock-up of the markup; commits: the archive of 4f3 and 4f4, this split; a section of the mock-up, a note of an author in `s`, `m` and `l` on a slider, and the colours of Grinding Gear Games as tokens at 4.5 to 1 on the band (`unique` the gold of a unique; `purple`, `cyan` and `magenta` removed, shown as plain text), then a stop; on the owner's approval, `specs.md` and the entry of the backlog closed. No hand test.
    - [ ] 4g2 (critical code): the parser in the core, the module `markup` of `crates/build-file`; commits: the tags, nested, a tag unknown or a brace left open as plain text, the line breaks, a nesting a million deep and a text of a megabyte without a stack overflow nor a time that grows as its square; its test on the corpus; the addresses as links and the guide (the `link` of the file, else the first address of the description); the description read through the bridge. No hand test.
    - [ ] 4g3: the About tab; commits: the component of an author's text, its sizes and colours, an `rgb` under 4.5 to 1 on its background lightened or darkened in a module of TypeScript (the background is a token of the style); the colophon (the portrait, the name, the author, the levels, the entries through the bridge); the description, its watermark and the link of the guide; the step of the guide of the test by hand. One hand test: a link of the description and the guide open in a new tab, their whole address in their tooltip.
  - [ ] 4h (Opus 5.5): the level band; commits (the caption and the label, moved from 4e1, with the first that shows them): the slider, its track and its markers; ◀ and ▶, the keys; the snapshot; the window of « N changes », its changes through the bridge (`Build::changes_by_level`, in the core since 4c), those of the level shown only, never the hundred at once: a file made to cost copies 2.7 million notes over its levels, about 100 MB (the third review of 4c, `changes/large_files.rs`). In the guide of the test by hand: ← in the field of the pasted JSON moves the caret; → and ← under the box of What's next, after a click on the text of a card too, in Firefox, leave the level as it is (moved from 4f4, which had no level to show); « N changes » open, the cursor dragged and released outside the band keeps the window, in Chromium and in Firefox (the click after a release was measured in Chromium only).
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
- [ ] **8. Library** (Opus 5.5): the open builds kept in the browser, the home page that lists them, **My library** and the link of the brand in the band of the site that lead to it (moved from 4f3), the browser that refuses to keep them and its notice.
- [ ] **9. Refactoring** (Opus 5.5): a pass on the code of steps 6 to 8, the core and the interface alike, as 4k, before the security audit of the version.

Then, first, **Merge .build** ([docs/backlog.md](docs/backlog.md)); version 2, **The Editor Update**, and version 3, **The Community Update** with French, specified when their turn comes (see [specs.md](specs.md), Versions).
