# Lessons

What working on the project taught: a correction of the owner, or a practice that proved useful. One line per lesson, written when it happens: its date, the lesson, and where it may go (this project, the templates, a skill, an agent). Read only by the retrospectives (process.md, Retrospective), which sort each one into `process.md`, `CLAUDE.md`, the skills, the agents or the templates, or drop it, and write the decision on its line.

<!-- - YYYY-MM-DD: the lesson. Where it may go. -->

- 2026-11-16: draw the open layout decisions as variants in the wireframe, never as questions in the console: the owner asked why a drawing phase got ASCII options, and chose at once from the frames. `excalidraw-wireframes` skill.
- 2026-11-16: work in the main project directory; a worktree the owner hasn't asked for is a folder they don't see in their editor. Templates (`CLAUDE.md`, Git workflow), whose rule asks for a worktree by default. **Applied:** `CLAUDE.md` (Git workflow), as in `rust-desktop-template`.
- 2026-11-16: draw the new wireframe frames at the top of the canvas: the owner reloads the file and lands at its top, so frames added at the bottom go unseen. **Applied:** `excalidraw-wireframes` skill and `process.md` (Wireframes).
- 2026-11-16: keep the discarded variants of a wireframe in `docs/wireframes/archive.excalidraw` instead of deleting them: the owner goes back to them to explain an idea. `excalidraw-wireframes` skill.
- 2026-11-16: at the start of a session, fetch and compare the local `main` with `origin/main` before reading `roadmap.md`: the local `main` was one pull request behind, and the roadmap read first was stale. Templates (`CLAUDE.md`, Specifications and roadmap). **Applied:** `CLAUDE.md` (Specifications and roadmap).
- 2026-11-16: the lessons sorted at the retrospective of rust-exile-market went into `rust-desktop-template`, not into `rust-project-template` this project was made from: 75 of its 99 lessons were missing here. After a retrospective, carry its lessons into every template, and compare a new project with the freshest one. Templates (`process.md`, Retrospective). **Applied:** `CLAUDE.md` (Lessons).
- 2026-11-16: a wireframe gets one accent colour, only for what must stand out first: the owner wanted the cursor of the level band to pop, which grayscale could only hint at with a dark fill. **Applied:** `excalidraw-wireframes` skill (`ACCENT`).
- 2026-11-16: compute the sample data of a wireframe from the real file, never type plausible values: the level band was drawn with 19 invented markers, while the sample has 99 (a passive at almost every level) and 15 for the skills and the gear, which changed the design. `excalidraw-wireframes` skill (already a lesson of rust-exile-market, 2026-11-01).
