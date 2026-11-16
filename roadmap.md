# Roadmap

Implementation steps of the features described in [specs.md](specs.md). Each step is delivered in its own pull request, which checks its box.

## Reference

Read only by the steps that need them:

- [Technical choices](docs/technical-choices.md): the libraries, the services and the main designs, with their reasons.
- [Process](process.md): the phases of a project, from the specifications to the build.

## Steps

- [x] **Skeleton**: the workspace (`crates/build-file`, `crates/wasm`, `web/`) on the model of Stepwise, the reading of a `.build` file without loss, a first page that summarizes a dropped file, the CI.
- [ ] **0. Specifications**: answer the open questions of [specs.md](specs.md), check the sources of the game data and their terms (`docs/game-data.md`), then write the steps of version 1 here.
- [ ] **1. Wireframes**, then **2. Mock-up** (phases 3 and 4 of [process.md](process.md)).
- [ ] **3. Deployment**: the static website on Cloudflare, at its domain of `sylent.tools`.

The steps after them (the passive tree, the skills, the inventory, the share link) are written at step 0.
