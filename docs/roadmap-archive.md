# Roadmap archive

The detail of the steps of [roadmap.md](../roadmap.md) once done, moved here in the first commit of the next step, so that the roadmap stays short.

## Version 1: the viewer

- [x] **Skeleton** (e45eff5, before the pull requests): the workspace (`crates/build-file`, `crates/wasm`, `web/`) on the model of Stepwise, the reading of a `.build` file without loss, a first page that summarizes a dropped file, the CI.
- [x] **0. Specifications** (#2; #3 replaced « no image of the game » by the portraits of the ascendancies, and moved the choice of the tree data to step 5): version 1 in [specs.md](../specs.md), the game data in [game-data.md](game-data.md), the steps of the roadmap.
- [x] **1. Wireframes** (Opus 5.5, #4): the page of a build (header, level slider, skills, tree, inventory, warnings), the list of open builds, the merging screen, the home page with the library, the phone page; at the width of half a 1920-pixel screen and wider (phase 3 of [process.md](../process.md)). Then #5 and #6 carried the rules, agents and skills of the latest templates.
- [ ] **2. Mock-up** (Opus 5.5), the sub-steps done:
  - [x] 2a: the page of a build in HTML, in grey (960 px, Overview), with real data; commits: the archive, this split and the server of the mock-up; the sample data computed from the corpus, the tree of 0.5.2 and the portraits; the skeleton of the page, the app bar, the header, the level band and the tabs; the Overview (the tree in a canvas, « New at N », the skills, the inventory).
  - [x] 2b: the styles on that page, in the pull request of 2a: 29 proposals, from ten (four sober, three bold, three wild) and five drawn from a moodboard the owner picked (R030, R041, R008, R089, R201), to twelve mixes of the three the owner kept, then 28 · Frost Night and 29 · Ember. Decided (2026-11-17): Frost and Frost Night stay, with Ember on trial; graph paper behind every block, the tree and the row of its tabs included; no borders, the blocks told apart by their colours. Left open, with their controls kept on the page: the style, the colour, size and opacity of the texture, the second accent (its colour, what it marks), the darker bands and the full-height tabs; each is settled by the sub-step of its part.
