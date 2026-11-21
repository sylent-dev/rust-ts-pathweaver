# Process

How Pathweaver goes from an idea to a website online, then keeps growing, with Claude Code. It follows the process of [rust-desktop-template](https://github.com/sylent-dev/rust-desktop-template/blob/main/process.md), adapted to a website whose core is Rust in WebAssembly and whose interface is SvelteKit: the release becomes the deployment on Cloudflare, as in [ts-astro-static-website-template](https://github.com/sylent-dev/ts-astro-static-website-template/blob/main/process.md). A lesson that applies to every project goes back to the templates.

The process is not a straight line. Its phases are **tools**, picked for each change according to what it needs: a fix goes straight to the build, a new screen goes through its wireframe and mock-up first. What is not being done lives in a **backlog** ([docs/backlog.md](docs/backlog.md)); what is chosen goes to the **roadmap**, one pull request per step. Each tool ends with something the owner validates, from the cheapest to the most expensive: changing a sentence in the specifications costs less than changing a wireframe, which costs less than changing code.

This file is a living document: after each cycle, update it with what worked and what didn't (see [Retrospective](#retrospective)).

## How it works

1. **Start a project** from a template, and size it with the owner: which tools this project uses, and how far (see [Size the project](#size-the-project)).
2. **The first cycle** takes the website to its first version online, through the tools it needs in order: specifications, structure, wireframes, mock-up and design system, build, deployment, retrospective.
3. **Then the loop**: with the owner, pick from the [backlog](#the-backlog) what comes next, write it in `roadmap.md` as steps, size each change and split it into sub-steps when it helps ([Size a change](#size-a-change)), and run only the tools it needs. A group of steps with a goal (« the editor », version 2) is a **cycle**: it ends with its version online and its retrospective.
4. **Outside the roadmap**, two kinds of work: an [urgent fix](#urgent-fixes) that can't wait, and an [exploration](#explorations) that tries an idea before deciding.

## Size the project

At the setup, Claude Code asks how large the project is and proposes the tools and their depth; the owner decides, and the choice is written in `roadmap.md`. A website with an interface always has its wireframe and its mock-up: they are never skipped, only made smaller.

| Project | Tools |
|---|---|
| A small tool (one page, a few controls) | Short specifications, one wireframe, a mock-up with two or three styles, a short design system, build, deployment. |
| An application of several screens (Pathweaver) | Every tool, in order, for the first cycle. |
| A website with a back-end (accounts, a database: Pathweaver's version 3) | Every tool, in order, with a probe of the riskiest unknown before the wireframe, and the limits of every service checked during the specifications. |

## Size a change

At the start of each step, Claude Code says which tools the change needs, and why, and how many pull requests it expects; the owner may add or remove one. The expected number of pull requests is written with the step in `roadmap.md`, so that the retrospective can compare it with what happened.

| Change | Tools |
|---|---|
| A fix with nothing visible, a dependency | Build. |
| A behavior with nothing visible (a file read, a rule of the core) | Specifications, build. |
| Anything visible (a text, a control, a notice, a color) | Mock-up, then build; the decision in `specs.md`. |
| A new screen or panel | Specifications, structure (where it fits among the others), wireframe, mock-up, build. |
| A touch to the browser (the storage of the library, the clipboard, the files dropped, a link opened) | Specifications, a probe, build, a guide of the test by hand. |
| A new application, a redesign | Every tool, in order. |

Only when it helps, a step is split into sub-steps, one pull request each, each one coherent and tested on its own: a step that needs several tools, or more than one review (for example 5a (the data of the tree and its graph), 5b (the tree drawn) and 5c (the level on the tree)). A small step stays whole, since each pull request also costs a review, the checks and an archive.
When a step turns out larger than sized, stop and size it again with the owner rather than stretching the pull request.

## The backlog

`docs/backlog.md` holds everything noted and not being done: an evolving list, read when the next work is chosen, not at every session (`roadmap.md` stays short).

- **What goes in**: the touches set aside during a step (polish), the edge cases that need thought, the features for later, the large works, and what waits on someone else (a version of the game, the data of Grinding Gear Games).
- **One entry per item**: what it is in one sentence, its kind (polish, edge case, feature, large work, waiting), what it depends on, and the date it was noted. Claude Code adds an entry as soon as an idea comes up outside the current step, rather than keeping it only in its memory.
- **From the backlog to the roadmap**: when the roadmap has no step left, or at the end of a cycle, Claude Code proposes the next items with their cost and dependencies; the owner picks; the chosen items leave the backlog and become steps of `roadmap.md`.
- **Polish**: after a version online, a series of small touches from the backlog, deployed together, is often worth doing before anything new.
- At each retrospective, the backlog is sorted: what is done or no longer wanted leaves it.

## Urgent fixes

A fix that can't wait (a page that no longer opens, a security alert, a build read wrong) jumps the roadmap:

1. Branch `fix/<short-description>` from `main`, even while a step is in progress (in a worktree if the owner is testing the step in the main folder).
2. The fix, the test that would have caught it, the code review, a pull request opened at once, and its deployment.
3. Once merged, one line in `roadmap.md`, under the step in progress, and the step goes on (rebased on `main`).

## Explorations

An idea that needs trying before deciding (a library, a way to draw the tree, a faster algorithm) is an exploration, not a step. It happens at any time: during a step, when a choice needs trying before it is made (on sylent.art, whether a 3D scene runs on a phone, during the mock-up); or between steps, from an idea of the backlog.

1. A branch `explore/<short-description>`, or a program in the scratchpad: nothing of it is merged as it is.
2. Bounded twice: the owner and Claude Code agree on what it must answer, with a measure when there is one (« does the whole tree move at 60 frames a second on a phone? »), and on how long it may take (one session, two at most). When the time is up, it stops and the decision is taken with what is known: a question still open is an answer too.
3. It ends with its result written down: during a step, the decision goes back to the step (and to `docs/`); otherwise a decision in `docs/technical-choices.md` (kept or set aside, and why), an entry of the backlog, or a step of the roadmap that rebuilds it properly. The branch is then deleted, or kept with a line in the backlog that says why.

The **probe** is the smallest exploration: before the wireframe of a new screen, the riskiest unknown of its design (the speed of a canvas, an API of the browser, what a service allows) is tried in half an hour by a throwaway program, in a worktree or the scratchpad, never pushed. On rust-exile-market, it settled what the design could rely on before a single block was drawn.

## The tools

Each tool has a **done when**: a list of facts anyone can check, not an impression. When one of them can't be met (no Mac to try a step on Safari), the owner decides to go on anyway, and the gap is written in `roadmap.md` or in the backlog, never left unsaid.

| Tool | Use it when | Output | Done when |
|---|---|---|---|
| [Start a project](#start-a-project) | Once, at the start | Repository from the template, its settings, its license, the size of the project | `main` is protected, the crates and the package have their name, the license is the owner's choice, the size of the project is written in `roadmap.md`, and the CI is green on the setup pull request. |
| [Specifications](#specifications) | The application does something new | `specs.md`, the data sources | Every open question is answered; the version has its success criteria; every screen it touches has its acceptance scenarios; the [web conventions](#web-conventions) are answered; the owner has merged them. |
| [Structure](#structure) | The screens, their panels or their links change | The structure in Excalidraw, written in `specs.md` | The owner has moved the cards and chosen a lead; the parking area is empty (every item placed or sent to the backlog); the chosen lead is in `specs.md`. |
| [Wireframes](#wireframes) | A screen or a panel | `docs/wireframes/*.excalidraw` | The owner has approved every screen at its smallest width and at the widths where the layout changes, and on the phone where it is shown, with its empty, loading and error states. |
| [Mock-up](#mock-up) | Any visible change | `docs/mockups/*.html` | Every scenario and state of the specifications is shown at the smallest width and at the owner's, and on the phone where it is shown; no open decision is left on the page; the owner has chosen. |
| [Design system](#design-system) | At the end of a mock-up, a new token | Visual style section of `specs.md` | Every color, size, font and icon of the mock-up is a named token; the mock-up uses only these tokens; the fonts and images have their license. |
| [Build](#build) | Always | One pull request per step | The checks and the CI are green; the acceptance scenarios of the step pass as tests, or are a guide of the test by hand when they need the browser; the review notes the owner chose are applied; `specs.md` matches the behavior; the owner has tried it in their browser; the step's box of `roadmap.md` is checked and the pull request merged. |
| [Deployment](#deployment) | The end of a cycle, a fix | The website online, a version tag | The version follows the rules of [Deployment](#deployment); the website answers at its domain with the version merged; the owner has opened a build there, in each browser they have and on their phone; the README says what the website is and which services it calls. |
| [Retrospective](#retrospective) | The end of a cycle, or a tool that went badly | Changes to this file, the templates and the backlog | The success criteria of the version are checked one by one; the planned and actual pull requests are compared; the backlog is sorted; each lesson of `docs/lessons.md` is sorted where it applies (this file, `CLAUDE.md`, the skills, the agents, the templates) or dropped. |

## Start a project

1. Create the repository from the template of its kind (see its README, **Start a new project**). Pathweaver was made from rust-project-template (now [rust-cli-template](https://github.com/sylent-dev/rust-cli-template)), then brought up to [rust-desktop-template](https://github.com/sylent-dev/rust-desktop-template), the freshest after the retrospective of rust-exile-market.
2. Apply the pull request settings: squash merging only, branches deleted once merged.
3. Protect `main` with a ruleset. On a free GitHub account, rulesets only apply to **public** repositories: make the repository public, or keep it private and accept that `main` is not protected.
4. **Choose the license with the owner**, before any code is published: the template writes `MIT OR Apache-2.0`, the default of the Rust ecosystem, which lets anyone ship a closed fork; the GPL 3.0 (or the AGPL 3.0 for a website, whose users never receive the code) makes a published fork give its code back. On rust-exile-market, the default stayed until the owner chose the GPL just before the first release: the code published meanwhile stays under the first license.
5. Size the project with the owner ([Size the project](#size-the-project)), and write the tools kept in `roadmap.md`, with the steps of the first cycle.
6. First pull request: rename the crates and the package (`Cargo.toml`, `Cargo.lock`, `web/package.json`), adapt the README, apply the license, choose a port of its own for the mock-up server (`docs/technical-choices.md`).
7. Open Claude Code in the project folder. Its memory is stored per project: a new session doesn't remember a conversation held in another project. To carry context over, paste a summary of it.
8. Check the connectors: the template turns off the claude.ai connectors (`disableClaudeAiConnectors` in `.claude/settings.json`), whose instructions and tools would be sent with every message. If the project needs one (Claude Docs, Gmail…), remove the setting; `/mcp` lists the servers that are on, and `/context` what fills the context. In the same file, `skillOverrides` hides from the model the skills the project doesn't use (still available with `/<name>`): adjust the list to the project, or use `/skills`.

## Specifications

Goal: agree on **what** the application does before deciding **how**. For a change after the first cycle, only the sections it touches.

1. Describe the idea in a few sentences, then let Claude Code ask its questions, in batches of a few at a time. The usual ones:
   - Who uses it, on which devices (a computer next to the game, a phone), in which languages?
   - What is in version 1, and what comes later? What must be easy to add later?
   - Which screens and panels, what does each show, and what does the user do in them?
   - Is it used alone, or next to another program (the game, a guide in another tab)? Does it read files, the clipboard, links?
   - At which widths is it used? What does the phone show?
   - Where does the data come from? What does it keep in the browser? Which services does it call?
   - When is this version a success? Two or three facts the owner can check once it is online (« I open a guide of three files and see my next ten levels », « a share link opens the build on my phone »).
2. **Check the data sources early**: documentation, rate limits, terms of use, licenses of the images. Read the source code of a service when its limits aren't documented. Record the limits and every risk the owner accepts, with its date, in a note of `docs/` (e.g. `docs/game-data.md`) linked from `roadmap.md`.
3. Write `specs.md`: behavior only (what the user sees, what each control does, edge cases, what is kept in the browser, error handling), the success criteria of the version, the answers to the [web conventions](#web-conventions), and the requirements that aren't features (the smallest width, the speed on a given volume of data, the weight of the page, if they matter).
4. Give each screen its **acceptance scenarios**: a starting state, what the user or the browser does, and what the page must show, including the errors.

   ```text
   A guide of three files dropped     → three builds open, the first one shown at its first level
   A file that isn't JSON dropped     → a notice names the file and the line of the error, the others open
   A share link cut by a chat         → « This link is damaged » under the app bar, the home page below
   ```

   They are what the owner validates, and each one becomes a test of the build (a test of the core, or of the state a component shows, apart from the page), or a step of a guide of the test by hand when it needs a real browser or a real service: the specifications and the tests then say the same thing.
5. Write the technical choices with their reasons (and the alternatives rejected) in `docs/technical-choices.md`, then the steps in `roadmap.md`, each small enough for one pull request. `roadmap.md` is read at every session: keep it short, with links to the notes of `docs/`.
6. Open the pull request; the owner reads the files on GitHub (**Files changed**) or in VS Code.

### Web conventions

What users expect of any web application. The specifications answer each point once, in `specs.md`, and a later change only says when it departs from them:

- **Width**: the smallest width designed for, the widths where the layout changes, what the phone shows, and what is cut first (with `…`) when the page is narrow.
- **Addresses**: what each screen's address is, what a shared link opens, what a damaged or old link shows; the back button of the browser goes back to the screen before.
- **Keyboard**: the main actions reachable by keyboard, a visible focus; Escape closes a dialog; the shortcuts of each system (Ctrl, or Cmd on macOS).
- **Language**: English first; every text in the translation files, never in the code; the numbers and dates written per language; the longest language drawn in the wireframes and the mock-up when there is another.
- **Theme**: dark, light, or following the system, decided once; colors that keep their meaning in each theme.
- **Feedback**: every wait longer than a moment shows itself, every error says what happened and what to do, and nothing the user typed is lost when the tab closes.
- **Storage**: what is kept in the browser (the library), what happens when the browser refuses to keep it (private browsing, a full quota), and that nothing leaves the browser without the user's action.
- **Browsers**: the browsers and versions supported (Firefox, Chromium, Safari), and what a browser without WebAssembly shows.

## Structure

Goal: agree on how the screens, their panels and their links fit together, and how one leads to the other, before drawing them.

1. Claude Code draws the structure in Excalidraw (`excalidraw-wireframes` skill): one card per screen, panel or dialog, the current state and **two leads** side by side, a parking area for the items not placed yet and the open questions, so that the owner moves the cards by hand.
2. The owner moves the cards, compares the leads, and chooses; Claude Code redraws the chosen lead, completed, and writes it in `specs.md`.

## Wireframes

Goal: agree on the **layout**, without colors or code, in a format the owner can edit.

The `excalidraw-wireframes` skill (`.claude/skills/`) carries out this phase: its Python helpers write the file and preview it.

1. Claude Code generates an Excalidraw file in `docs/wireframes/` (a script writes the JSON with the helpers of the skill): grayscale with one accent for what must stand out first, sample data computed from real files, one frame per screen, width or state, **one group per block** so that a block moves in one click (double-click a block to edit one of its elements, **Ctrl+Shift+G** to ungroup it).
2. It checks the result with an SVG preview before handing it over.
3. The owner edits it in VS Code with the **Excalidraw** extension (`pomdtr.excalidraw-editor`), or on excalidraw.com (**Open**, then **Save to…**).
4. Iterate: the owner draws their version, Claude Code rearranges it and fills the gaps, the owner draws the next version, and so on. Claude Code commits the owner's version before changing it, so that every iteration stays in the history. The open layout decisions are drawn as variants side by side, never asked as questions in the console; the variants set aside go to `docs/wireframes/archive.excalidraw`.
5. Once the main frames are agreed, Claude Code draws the rest: other kinds of content, empty, loading and waiting states, errors, the other language.
6. Claude Code writes the agreed layout in `specs.md`.

New frames always go at the top of the canvas, above the ones the owner has seen: the file opens at its top, so the owner finds them without scrolling.

Start with the narrowest layout the application supports (for Pathweaver, half of a 1920-pixel screen, then the phone page): it forces to choose the essential, and the wider layouts then only rearrange the same blocks. Draw the panels and dialogs that open over the content too.

Working with the file:

- The VS Code extension does **not** save by itself, unlike excalidraw.com: press **Ctrl+S** before asking Claude Code to read the file.
- The extension keeps the drawing in memory and doesn't reload the file when it changes on disk. Before Claude Code rewrites the file, save and close its tab; afterwards, reopen it, and never save the old tab over the new file.

## Mock-up

Goal: choose the style with real content, every scenario and every state, before writing the application.

The `html-mockups` skill (`.claude/skills/`) carries out this phase, from a starting page with the style and decision tabs, and a headless screenshot script.

1. An HTML page in `docs/mockups/`, built from the approved wireframe and split into small files (the shared styles and scripts, one style sheet and one script per block, one script per section): every frame of the wireframe becomes a window at its real width, with sample data close to real ones.
2. **Several styles on the same page, 3 or 4**, each with its own colors, fonts, shapes and density, switched with **tabs at the top of the page**. The address keeps the chosen style (e.g. `?theme=slate`) to share it. Each style only sets tokens (CSS variables); the components use them all, so that a style is cheap to add or tweak.
   - The styles explore **new directions** for this application, its users and its subject. [design-journal.md](design-journal.md) records the past experiences: it may inspire one of the styles, never all of them, and nothing in it is a default.
3. The owner picks a style, or mixes two; iterate on it alone, one change at a time (e.g. the main color, then the logo, then the font).
   - **Each open decision gets its own control** on the page, so that the owner compares on screen; once decided, it is removed and the choice is kept: tabs for a few distinct variants (e.g. two button styles, three header variants, five offsets), lists that apply at once for values that combine (e.g. a font per role), sliders for values tuned by eye (e.g. a width, an angle). The address keeps the choices, so that the owner can send them back, an important element is shown alone and in real conditions, and the proposals are numbered once across every series.
   - **Pixel alignments are tuned by eye on the owner's real screen**, with a tab of offsets: the display scale differs from the headless screenshots, which only give the direction.
   - From then on, **the mock-up is the reference** of the interface; the wireframe only fixed the first layout.
4. The mock-up shows what the application will draw: what Svelte draws in the page, and what the canvas of the tree can draw at its speed. A page that changes with the width is shown at its smallest width and at the owner's (asked once, written in `docs/technical-choices.md`), and on the phone where it is shown.
5. Serve the repository root without cache, on the port of the project (`docs/technical-choices.md`), so that the page reaches the files of the repository, even in a sandboxed browser (Flatpak, Snap) that only receives the HTML file, and a reload never mixes old and new files (see the `html-mockups` skill). Open `http://127.0.0.1:<port>/docs/mockups/<file>.html`, and reload after each change. Two projects on the same port took each other's server over.
6. Claude Code checks its own changes with headless screenshots, kept in its scratchpad, before asking for a review, and exports one large PNG per style to `outputs/` to compare them at a glance. A test that needs extra code runs on a copy of the page, never on the file the owner has open. The screenshots use **Playwright** and its own Chromium, installed once outside the projects (see the `html-mockups` skill): it sees the page once its scripts have settled, reports the errors of the browser console, and works even when Claude Code runs in a sandbox that doesn't see the browsers of the system (VS Code as a Flatpak). The same script checks the application itself, served by `npm run dev`.

## Design system

Goal: write down the visual choices once, so that the application and its future screens stay consistent.

Write them in the visual style section of `specs.md` (or in `docs/design-system.md` when they grow), as named tokens:

- **Colors**: background, bands or panels, borders, text, weak text, the main action, warning, error, success; the colors of the domain (the kinds of gems, of passives). Each color carries a meaning; a meaning is never carried by color alone (a word or a shape goes with it); each theme of the application has its value.
- **Sizes**, in CSS pixels: the smallest width, the spacing scale, the radius, the heights of a row and of a button, the widths at which the layout changes, and what is cut first (with `…`) when the page is narrow.
- **Typography**: the font per role (text, numbers that line up, titles), its size and weight, the number formatting per language; every font served by the website itself, under a license that allows it (e.g. SIL Open Font License, with its notice).
- **Icons and images**: drawn as SVG or canvas shapes of Pathweaver's own, or bundled as files, where they come from, their license (with a notice for those that aren't under the project license). The portraits of the ascendancies are the only images of the game ([docs/game-data.md](docs/game-data.md)).
- **Shapes and motion**: what is flat, rounded or outlined, the hover effects, the durations and their curves.
- **Tone of the messages**: formal or informal address in each language, length, how errors are worded.

The mock-up is then updated to use exactly these tokens, and the application implements them in one place (a style sheet of CSS variables, read by the canvas too), so that changing a color or a size happens once. At the end of the phase, add an entry to [design-journal.md](design-journal.md), and to the one of the templates: the choices kept, the ones rejected, and why.

## Build

For each step of `roadmap.md`, in order:

1. Branch `<type>/<short-description>` from `main`. If the owner isn't testing anything, work in the main folder so that they can follow the changes in VS Code; otherwise, in a Git worktree outside the project.
2. Code, with the tests; then the checks of the Development section of `CLAUDE.md` (formatting, Clippy on both targets, the tests, and in `web/` the lint, the type check, the tests and the build).
3. Run the `code-reviewer` subagent: its notes, in French, go to `outputs/`. Claude Code summarizes them; the owner chooses which to apply.
4. Commit (Conventional Commits), push, open the pull request; it checks the step's box in `roadmap.md`.
5. The CI passes; the owner reviews and squash merges; `git pull` on `main`.
6. When a step changes the behavior, update `specs.md` and `roadmap.md` in the same pull request.

Steps that touch the browser (the files dropped, the clipboard, the storage of the library, the links) are verified on the owner's machine, in each browser they have and on their phone, as early as possible in the roadmap. When a bug reaches the owner that a test could have caught, the fix adds the test.

What the tests cover, at least:

- Every acceptance scenario of `specs.md` touched by the step: its rules in the core, as Rust tests without a browser; what a component shows or what a click changes, as tests of the interface (`npm test`).
- The [web conventions](#web-conventions) that the step touches: a value kept in the browser read back, a value that can't be read taking its default, every message present in every language.
- What needs a real browser or a real service (a file dropped from the desktop, the clipboard, the quota of the storage, a phone): a guide of the test by hand in `docs/tests/` (`hand-test-guides` skill), run again before each deployment of a version.
- A visual change: a few screenshots of the window concerned, compared with the mock-up, then deleted.
- A requirement of speed written in `specs.md` (the tree drawn, the merge of a guide) is measured on its volume of data before the step is done, not after the deployment.

## Deployment

1. The website on Cloudflare at its domain (step 3 of `roadmap.md` sets it up), the README (what the website is, what it keeps in the browser, what it calls on the network and its risks).
2. Choose the version ([Semantic Versioning](https://semver.org/)): **patch** for fixes only; **minor** for a new screen, control or feature that changes nothing existing; **major** (or minor before 1.0) for a breaking change: a share link or a library kept in the browser that an older version wrote and this one can't read, an address removed. The `!` commits of the cycle (Conventional Commits) point to the breaking changes. The version tag (`vX.Y.Z`) names the commit of `main` deployed; it builds nothing on its own.
3. Before the first version online, a **quality review of the whole repository, area by area** (a step of `roadmap.md`): `code-reviewer` in its area mode, one pass per area at once (each crate of the core, the bridge, the interface), each told what the others read and given the results of the checks run once before them, against SOLID, DRY and KISS, a design pattern only where it removes a real difficulty. Its findings are split into pull requests: the fixes of behavior first, then the tests, then what needs a mock-up, the moves last. On rust-exile-market it found what the reviews of the branches couldn't (a rule that held on one path of three, tests that no longer tested what their name said) and was worth four pull requests; after the first version, one at each large step rather than one at the end.
4. Before each version: the security audit (`security-auditor`), the Dependabot pull requests reviewed (`dependency-reviewer`), the guides of `docs/tests/` run again, then the tag.
5. Open the website at its domain, in each browser the owner has and on their phone: a build opens, a share link opens it again, the library keeps it. The website online is what the users get, not the server of the owner's machine.
6. Commitments to third parties (e.g. the credit and the terms of the data of the game, [docs/game-data.md](docs/game-data.md)).

A version that went wrong is fixed by the next patch version, deployed at once; a share link already sent keeps opening.

## Retrospective

Often, like the refactoring, rather than one big one at the end: the first right after the first version online, while the lessons are fresh and the users' reports take time to come; the next after the polish that follows, with those reports; then at the end of each cycle, or after any tool that went badly:

1. Check the success criteria of the version, one by one: met, not met (and why), or not measurable yet (and when it will be). A criterion not met becomes a backlog entry, or is dropped on purpose.
2. Compare the pull requests expected for each step with those it took: what took longer than expected? What had to be redone? What did the owner like most? Did the models named for the steps hold (`roadmap.md`)?
3. Sort the lessons of `docs/lessons.md` one by one with the owner, by batches of about fifteen, the decision written on each line: into this file, `CLAUDE.md`, a skill or an agent of this project, into the templates (each one the lesson holds for), or dropped.
4. Sort the backlog: the leftovers and the ideas of the cycle go in, what is done or no longer wanted goes out.
5. Read Claude Code's memory of the project: a rule or a preference that holds for the whole project moves to `CLAUDE.md` or this file, where the next sessions and the templates find it.
6. Update this file, and the templates (`CLAUDE.md`, `README.md`, the skills) when the lesson applies to every project: a lesson about the process goes to [Lessons learned](#lessons-learned), a trap of a tool or of the environment to [Known pitfalls](#known-pitfalls).

## Lessons learned

The lessons about the process, from the previous projects: each one changed a rule of this file.

| Project | Lesson |
|---|---|
| rust-exile-market | Coded mock-ups were never exactly what the owner wanted: start with editable wireframes. |
| rust-exile-market | Read the terms of use of every data source during the specifications: a forbidden API changes the scope of version 1. |
| rust-exile-market | The owner draws, Claude Code rearranges and completes: the wireframe iterations made the interface personal. |
| rust-exile-market | Mock-ups got much better once the layout was settled: one question per phase (layout, then style). |
| rust-exile-market | Three styles on one page with tabs made the choice easy; the main color stays white so that colors keep their meaning (item rarities). |
| rust-exile-market | One tab group per open decision, removed once decided, turned about a hundred small decisions into quick on-screen comparisons. |
| rust-exile-market | Pixel offsets measured on headless screenshots were wrong on the owner's scaled screen: tune them by eye with a tab of values. |
| rust-exile-market | The wireframe and mock-up phases worked so well that they became the `excalidraw-wireframes` and `html-mockups` skills, with their scripts. |
| rust-exile-market | A probe of half an hour (an X11 window over the fullscreen game) settled what the design could rely on before the wireframe: the riskiest unknown is tried first. |
| rust-exile-market | The license was left at the template's default until just before the first release, when the owner wanted the GPL: it is chosen when the project starts. |
| rust-exile-market | The first quality review of the whole repository, area by area, found what the reviews of the branches couldn't, and was worth four pull requests: it is a step before the first release. |
| rust-exile-market | A retrospective right after the first release, while the lessons were fresh, gave the template to another project at once: retrospectives often, rather than one at the end. |
| sylent.art | The structure of the content came after the build, and the addresses changed twice: sketch the structure in Excalidraw during the specifications, cards moved by hand. |
| sylent.art | Bold variants showed the owner what they wanted: they couldn't have said « sober or spectacular » before seeing them. |
| sylent.art | The checks born from a bug kept it from coming back: when a bug reaches the owner, the fix adds the test. |
| sylent.art | A worktree outside the folder open in VS Code is invisible to the owner: work on the branch in the main folder while they test nothing there. |
| sylent.art | Open a pull request only once the owner has seen the result (the review applied, the drawing looked at). |
| sylent.art | The classification of the offers ran as a mini-cycle of its own (specifications, then wireframe and mock-up, then build): the unit of the process is the change, not the project. |
| sylent.art | Ideas kept only in Claude Code's memory are easily lost between sessions, and some wait on other people: a backlog holds them, and the roadmap only what is chosen. |
| stepwise | Twenty fixed boards of fonts couldn't show the combinations: one list per role at the top of the page, applied at once and kept in the address, made the mock-up something the owner tunes themselves. |
| stepwise | Two series of proposals, one numbered and one lettered, led to a misunderstanding on "the B" and a whole iteration lost: number the proposals once, across every series. |
| stepwise | Fable 5.2 on the parser, the checker, the interpreter and the bridge, whose design lasts; Opus 5.5 on the others; at the start of each step, a short form asks the owner to switch with `/model`. First compared by two reviews of step 4a: the same `code-reviewer` launched twice in parallel, one per model (the `model` of the subagent set at launch), each in its own file; the owner wants to keep it for critical code or tasks. To judge at the retrospective. |
| pathweaver | Made from rust-project-template, it missed 75 of the 99 lessons that the retrospective of rust-exile-market had put into rust-desktop-template: after a retrospective, its lessons go into every template, and a project compares itself with the freshest. |

## Known pitfalls

The traps of the tools and of the environment met on the previous projects, with their fix. They don't change the process; they save a session.

| Project | Pitfall and fix |
|---|---|
| rust-exile-market | A Flatpak browser only receives the opened file: serve the repository with a local server. |
| rust-exile-market | In the VS Code Flatpak, `~/.cargo/bin` is not on the `PATH` of the terminal: prepend it. |
| rust-exile-market | On a free GitHub account, rulesets only protect public repositories. |
| rust-exile-market | The VS Code Excalidraw extension neither autosaves nor reloads a file changed on disk: save, close, reopen. |
| sylent.art | Two mock-up servers of two projects on the same port broke the owner's page: one port per project, a server without cache. |
| stepwise | Claude Code in VS Code installed as a Flatpak couldn't see Firefox, so the drawings of a mock-up were checked without their page; Playwright and its own Chromium now take the screenshots and report the errors of the browser console. |
