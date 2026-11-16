# Code quality

How the code of Pathweaver is written: the Rust of the core and of the bridge, the TypeScript and the Svelte of the interface. `CLAUDE.md` holds the conventions of the project (files, language, commits, checks); this file holds the rules of the code itself.

Read it at the start of each step that changes code; `code-reviewer` reviews against it. A rule is followed, or the pull request says why not. Clippy (pedantic, and the lints of the core that never panics), `rustfmt`, ESLint, Prettier and `svelte-check` already enforce their own rules: they aren't repeated here. Most examples come from rust-exile-market, where this file was learned; replace them with Pathweaver's own as they come.

## Names

The name comes first: a reader who sees only the name should know what the thing is for.

- A name says what a thing is or does, in the words of the domain (the field of the application, the services it reads), not how it is computed: `affix_limits`, not `counts`; `copied_lines`, not `list`.
- A module or a type is named by what it gives, not by its place next to another one: no module `other_…`, `misc`, `utils` nor `common` (the module that tells the lines in doubt is `doubts`, not `other_readings`). `other` stays the word for the second of a pair (`other_fit`, `other_room`).
- A name that needs its doc comment to be understood is renamed.
- Whole words. No abbreviation but those of the domain, of Rust and of the web: `id`, `ui`, `ctx`, `i18n`, `wasm`, `json`. A single letter only for an index or a closure parameter of a line or two.
- One notion, one word, across the whole code. Two notions never share a word: when one word means two things, one of them is renamed.
- Types are nouns (`ModifierTiers`). A function that computes a value is named by what it returns (`trade_tiers`, `possible`); a function that acts, by a verb (`save`, `send_copy`).
- A predicate reads as a question: `is_`, `has_`, `can_`, `may_`, or a verb in the third person (`rolls_on`, `holds`). A boolean field or variable too: `is_fractured`, not `flag`.
- Conversions follow the Rust API guidelines: `as_` borrows for free, `to_` costs, `into_` consumes, `from` builds. Constructors: `new`, `with_…`, `of(…)`.
- The path of a module is part of the name: `price::estimate`, not `price::price_estimate`.
- A number with a unit says it: a `Duration`, or a suffix (`_ms`, `_pixels`, `_points`). A level is a level of the character, `1..=100`: a bound of a range of levels says whether it is included.
- A test is named by the behavior it pins, as a sentence: `a_sanctified_item_gets_no_tier_from_its_values`.
- A name the code has outgrown is renamed in the change that outgrew it.

## Functions

- One function does one thing, at one level of detail, and reads from top to bottom. Past about 50 lines or three levels of nesting, look for the part that deserves a name.
- The case that stops returns early (`let … else`, `?`), so the main path isn't nested.
- At most four parameters, `self` included: Clippy counts them (`clippy.toml`).
- Two parameters of the same type side by side become a struct or an enum when a call can swap them unseen: literals (`f(true, false)`, `f(3, 7)`), or values without a name of their own at the call. Two values named at the call (`english`, `french`) may stay.
- No boolean parameter that switches what a function does: two functions, or an enum named by its cases.
- The decision apart from the wiring: the rule in a pure function of the core, without WebAssembly, the browser or I/O, and tested by `cargo test`; the bridge and the component that call it stay thin.

## Types

- Invalid states can't be written: an enum, not two fields always set together or always opposite, not flags that cross.
- `match` on the enums of the project are exhaustive: no `_ =>` that would swallow a new variant. Adding a variant must point to every place to update.
- A rule on the meaning of a value is decided where its domain type is still known, with an exhaustive `match` that names each variant, never on the strings or the ids it was flattened into: a predicate that reads strings a type knew lets through the very case it was meant to catch.
- A newtype when two values of one type can be mixed up (the index of a line and the index of a candidate; the id of a passive and the id of a gem; pixels and points), or when a value carries an invariant checked once, where it is built.
- `Option` and `Result`, never a sentinel (`-1`, `""`, `NaN`).
- The smallest visibility: private, then `pub(super)`, then `pub`. In a binary crate, `pub` reaches the crate only, as `pub(crate)` would: one spelling, `pub`. A `pub` field only on a plain data type.

## Ownership and borrowing

- Borrow by default: `&str`, `&[T]` and `&T` parameters, `impl Iterator` returns. Own (`String`, `Vec`) only what outlives its source or crosses the bridge.
- A `clone()` is a choice: to cross the bridge, to keep a value past its source, or a cheap copy (`Copy`, `Arc`). Never to quiet the borrow checker: then the structure is wrong, and a struct split in two lets its fields be borrowed apart.
- `Cow` when a value is mostly borrowed and sometimes built.

## The core and the bridge

- The core never panics (`CLAUDE.md`, Development): no `unwrap`, `expect`, indexing, `panic!` or unchecked arithmetic outside the tests. A value that can't be missing is reached by `get`, `checked_…` or a pattern, and its absence returns an error or a default named in `specs.md`: a panic would abort the WebAssembly module and the page.
- The crates of the core know nothing of JavaScript: no `wasm-bindgen`, `js-sys` nor `web-sys` in them. The bridge (`crates/wasm`) only converts: a type of its own for each thing that crosses, with its TypeScript type generated by `tsify`, and under each exported function a function in plain Rust that `cargo test` calls (`docs/technical-choices.md`, Bridge). A rule found in the bridge moves to the core.
- What crosses the bridge is a value, not a handle: the interface receives what it shows, already computed for the level, rather than calling the core once per passive or per gem.
- The core is single-threaded, as WebAssembly in the page is: no `Mutex` nor thread for it, and a long computation (the merging of a guide, the tree of a level) is measured before anything moves it to a worker.

## TypeScript and Svelte

- TypeScript strict, without `any` nor `as` but where a type of the outside world (a file dropped, the storage of the browser) is narrowed once by a check; the types of the core come from the bridge, never written again by hand.
- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`), never the older syntax. A `$derived` before an `$effect`: an effect only for what leaves Svelte (the canvas, the storage, the address).
- A component draws one block of the mock-up and is named by it (`LevelBand.svelte`, `SkillList.svelte`); past about 200 lines, or when it holds a rule, look for the part that deserves a component or a module of its own.
- The state of the application (the open builds, the level, the library) lives in modules of `web/src/lib/` (`.svelte.ts` when it uses runes), tested by Vitest without a page; a component reads it and calls its functions.
- A rule of the game or of the format lives in the core, never in the interface: the interface shows what the core computed.
- Every text comes from the Fluent files of `web/locales/`, never from the code, and the markup is accessible: a button is a `<button>`, an image has its text, the main actions reach the keyboard.
- A failure of the page (a module that can't load, a message missing, the storage refused) is shown or logged, never a blank page.

## Modules

- One file, one responsibility, named by it. A file that holds two subjects that change for different reasons is split: the data kept by hand apart from the code that reads it, the rules apart from the drawing.
- Past about 800 lines of code (tests aside), a file is looked at for its parts, and so is a struct that gathers unrelated state. The length is a sign; the responsibilities decide.
- The tests of a module past a few hundred lines go to its `tests.rs` (`CLAUDE.md`).
- The dependencies go one way: the core knows neither WebAssembly nor the interface; the bridge reads the core; the interface reads the bridge.
- Reviewing one rule takes reading its file and its tests, not a whole area.

## Rules of the domain

- One rule in one place: a rule of the domain or of an external service (a threshold, a bound, a list of words) is written once and called by every use. Each copy is a place where the application can drift.
- The words of the domain read from outside data, in each language, live in one file of their own; the texts of the interface in `web/locales/`, never in the code.
- A number of the rules gets a named constant, with a comment that says where it comes from (a measure, the external service, the mock-up).
- A rule that reads the data (a heuristic, a threshold) is measured before it is decided (`CLAUDE.md`, Code review).

## Dependencies

- Before turning off the default features of a crate (`default-features = false`), read what each one does, and keep the ones the application needs, with a check of the CI when nothing else would fail: on rust-exile-market, it silently dropped the `clipboard` feature of eframe, so that "Copied" showed while nothing reached the system. A copy is tested by pasting it into another application.
- A new crate or npm package is weighed against the few lines it saves: what it weighs in the WebAssembly module or the page, whether it is maintained, and its license. The interface keeps to the packages of `docs/technical-choices.md` (Front-end tooling) unless a pull request says why.

## Errors

- A `Result` carries its context: what was being done, on what.
- No `unwrap` nor `expect` outside the tests, in the core and the bridge (The core and the bridge); an invariant is written so that the compiler sees it, or its breach returns an error.
- An error is caught where its information still is (the status and the message of a response), not flattened into one variant.
- The world is expected to be wrong at times (a `.build` file of a tool, a link cut by a chat, the storage of the browser): it is handled gently, and what can be read is shown with a warning rather than refused whole (`specs.md`, Unknown and invalid entries). A broken invariant is a bug: it shows, as an error, never as a panic.

## Comments

- Each module, type, function and constant has a doc comment that says what it is for, in one sentence, before how; but `main`, the tests (their name is their sentence) and the methods of a trait `impl`, which their module and their trait document. A field or a variant has one when its name and its type don't say it all.
- A comment in a body says why, never what the code already says.
- A comment that no longer matches the code is a bug, fixed in the same change.
- The code says the rule of today. The source of a fact stays next to it (what was measured, where and when), since it tells when to check again; the story of the decisions (what was tried, who chose, what changed) lives in `docs/`.

## Patterns

- Simple first (KISS): a function before a trait, an enum before a trait object, a struct literal before a builder.
- A pattern only once its value is diagnosed, and that value written in the pull request:
  - a trait at a seam a test must replace (the network, the storage of the browser, the clock);
  - an enum for a closed set of cases;
  - a newtype for an invariant;
  - a builder for a value of many optional parts (the data of the tests);
  - a typestate where an order matters and a mistake would be costly.
- Never a layer that adds without giving: no trait with one implementation and no test double, no generic used with one type.
- SOLID, read for Rust: one responsibility per module and per type; a new case added by a new variant or a new `impl`, the exhaustive `match` naming every place to update; small traits; a trait at a seam, not everywhere.
- When a second fix lands on the same case, look for the rule that makes the case impossible rather than a third condition.

## Tests

- A test reads as an example of its rule: its name says the behavior, its body the case, built by a small helper rather than fifty lines of set-up.
- Each rule is tested on data written by hand, in the `tests.rs` of its file. The tests on real outside data (a `.build` file of a tool, a table generated from the data of the game) are kept for what a new version of that data changes, in a file of their own next to them: the ones to look at, and to record again, when the data change, while the `tests.rs` must still pass as they are. What the tests of several files share (the builders of their data, the readers of a result) lives in the `fixtures.rs` of their module.
- The expected value of a test is written from what the function says it does (its doc comment, `specs.md`), then the test is run: a difference is a finding, the comment or the code is wrong, and the owner decides which.
- An assertion compares the whole value (a list, a section, a struct); a part (`contains`, `starts_with`) only when the rest doesn't matter. An expected exception is a named list, compared whole, never a condition that lets a case through.
- Several cases of one behavior may share a test; two behaviors are two tests.
- A rule that orders or chooses gets a case where the rule and its nearest wrong neighbour disagree: for a `find` over one of two lists, the other list; for two sort keys, each alone and both swapped. Data that give the same answer to both (values already sorted, which a stable sort hides) pin nothing.
- A rule read through a bound or a set taken from the data (the longest entry, the origins a value can have) is tested with the size of the real data and with more than two values of the set.
- What stays on the far side of a test seam is kept as small as possible and tested through a real local server (HTTP) rather than a fake that hands over values already read. A rule kept by the absence of a feature (no cookie sent back) gets a test of the behavior and a check of the feature tree (`cargo tree -e features`).
- A measure quoted in a comment or a document is committed with the code that produces it, as an ignored test with its recorded numbers. Before turning a property a review proposes into an assertion, read the notes of the feature: the property may be false on purpose.
- At the end of a series of test steps, read the written rules (`specs.md`, the notes of `docs/`) one sentence at a time, and ask which test fails if that sentence stops being true: a rule is pinned by one test that fails without it, not by two that surround it.
- Mutations are no part of the usual flow, which the code review and the CI guard. A series is run only on the owner's go, asked beforehand with what it would bring on this code, how many mutations and about how long: it takes time and slows the step. A mutation is one small wrong change of the code, the nearest wrong neighbour of a rule (a `>=` for a `==`, the other list), which a test of the file must catch. One that survives is a question, not yet a missing test: first ask which result it changes that anything reads (the code it touches may do nothing, and is then removed), run it on the real data (a probe in a worktree apart), then hand it to the code review without the author's opinion. A series runs in a worktree apart, never in the project folder, so that no mutation can be left in the code, and each run of the tests is bounded in time and in memory, since a mutation can make a loop endless.

## Refactoring

- At the start of a refactoring step, read the whole code of its area and propose a numbered plan of improvements, one commit each, beyond what the line of the step names (a word shared by two notions, a boolean parameter, a long function, a clone that only quiets the borrow checker): the line says the least to do; the owner accepts the plan.
- No change of behavior, but the small fixes of the last rule, each in its commit: the tests stay the same, checked after each commit, not only at the end, so that a difference names its commit. Where a refactored tool writes files (a generator), run it after each commit and compare its files and what it prints with those of `main`, byte for byte. A tool that can't be run (it reads an external service) is changed only by moves the compiler checks, and the pull request says so. A test whose assertion changes is named in the pull request, with the reason.
- Where the code has a hot path (a loop run millions of times), time it before and after each commit, not only compare what it gives: a call the compiler no longer inlines slows it unseen. A proposal of a review on a hot path is measured like any other change, and the measure of what was tried and left is written next to the code (a doc comment), so that nobody tries again.
- When a refactoring hands functions a wider value (parameters grouped into one struct), list what each one now receives, and pin by a test what it must not read: the compiler only tells a field that is missing.
- Before moving code, check it is tested; a path without a test gets one first, or, where only the network or the system reaches it, it is changed only by steps the compiler checks, and the pull request says so.
- The moves first, in commits of their own: `git diff --color-moved=dimmed-zebra --color-moved-ws=allow-indentation-change` shows them unchanged, but for paths, `use` lines, visibility and the line breaks `rustfmt` puts again, the same tokens. Then one commit per improvement.
- A move of more than a few items is done by a script, not by hand: it cuts each file into its top-level items and copies each one, as it is, to the file a plan names, and can be run again from the commit before, so that a change of the plan costs a minute; a second script checks that every line of the old files is in the new ones. Then `cargo doc --document-private-items` finds the doc links the move left without target.
- Before splitting or moving a file, search the tests for an `include_str!` of its path.
- Each small refactoring seen on the way, in the files the commit already touches, is done in the same pull request. Work that needs a commit of its own and that the line of the step doesn't name is extra work: finish the commit under way, then tell the owner what it is and its cost, and the owner decides (`CLAUDE.md`, Specifications and roadmap). A small fix of the behavior seen on the way, with its test, goes in a commit of its own, named in the pull request as its change of behavior and checked by its review; one that needs a decision or a mock-up goes to `docs/backlog.md`.
