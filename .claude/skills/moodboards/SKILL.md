---
name: moodboards
description: Gather a moodboard of real references (logos, styles of an interface, icons…) from a few questions to the owner, sorted by family into numbered boards on one page to scroll, where the owner picks by clicking, before Claude Code draws its own proposals from the picks. Use it when the owner asks for a moodboard, references or inspiration, or before the styles or the logo of a mock-up.
---

# Moodboards

Goal: before drawing proposals, show the owner real references, sorted by family and numbered, and let them pick by number. The five styles drawn from the owner's picks went further than the ten imagined ones (2026-11-17).

The method is the same for every subject; what changes is in the file of the subject, read only for it:

- [subjects/logo.md](subjects/logo.md): a logo, a mark, an icon of the browser tab.
- [subjects/style.md](subjects/style.md): the look of an interface (colours, density, textures, the mood).

A new subject (the icons of a domain, an illustration…) gets its own file, on the model of these.

## 1. Ask

Ask the questions of the subject's file, **numbered, in plain text, the main one first**, a few at a time: the owner answers freely, often by voice dictation. Give with each question what you would answer, drawn from the project (its name, `specs.md`, the mock-up): **an unanswered question takes that answer.** Don't ask what the project already says.

## 2. Plan the boards

From the answers, **5 to 8 families, one board each, 24 references per board** (the page then holds about 150 to 200 of them, looked at in one go). Each board gets 2 or 3 searches, whose results are interleaved, so that a board is not one designer's series. A board may mix two halves (`parts`, 12 + 12) when two families are close (a letter alone, two letters together).

**Number the references once across the project**: read the `sources.md` of the earlier moodboards in `outputs/`, and start after their last number (R001 to R2xx for the styles, then R301 for the logo). « The R12 » never names two references.

Write the plan in `outputs/<YYYY-MM-DD>-<subject>-moodboard/plan.json` (its format is at the top of `scripts/build.py`). The searches are the ends of Dribbble's addresses (`https://dribbble.com/search/p-monogram`): short words joined by dashes, in English.

## 3. Build the page

```sh
python3 .claude/skills/moodboards/scripts/build.py outputs/<YYYY-MM-DD>-<subject>-moodboard/plan.json
```

It searches with Playwright (the one of the `html-mockups` skill, installed once outside the projects), keeps the results of each search, downloads one image per reference, and writes `refs.json`, `sources.md` (the source of each number) and the page `outputs/<YYYY-MM-DD>-<subject>-moodboard.html`. A click on a reference picks it, the picks show at the top of the page and copy in one click, and the browser keeps them across reloads.

- **Look at the page before handing it over** (a headless screenshot of the `html-mockups` skill, deleted after): a board full of the same series, of mock-ups where the mark is lost, of a brand off topic (`wordpress` in « WP »), gets other searches, or the word in `exclude`.
- **To add a board**, add it at the end of `plan.json` and run again: the boards already built keep their references and their numbers, the new one takes the next ones.
- **Walls**: a search that finds no image prints it (an account, an anti-robot puzzle). Never work around a wall, and never take images from a source that doesn't show them publicly: write down which source stopped the search, and ask the owner for those references (screenshots in `inputs/`).
- Dribbble is the only source of the script. The moodboard of the styles also drew from Behance, Interface In Game and product sites, gathered by hand: such a source is added to `search.cjs` the day a subject needs it often.

## 4. Hand it over

Give the page served from the root of the repository, on the port of the project (`docs/technical-choices.md`): `http://127.0.0.1:<port>/outputs/<YYYY-MM-DD>-<subject>-moodboard.html`. Never a `file://` path.

- Say what the boards hold (their families and numbers), and point at three or four references that fit the project, with why: a recommendation, not a choice made for the owner.
- Ask for the numbers picked, and **what pleases them in each** (the shape, the line, the idea, the colour): two picks of the same logo for two different reasons give two different proposals.
- The owner may ask for a board more: add it (step 3), and give the page again.

## 5. Draw from the picks

The references are **for inspiration only, never copied**: each proposal takes an idea of a pick (a letter made of blocks, a thread that draws the letter) and is drawn from scratch. Say for each proposal which picks it comes from.

- The images belong to their authors: the folder stays in `outputs/`, ignored by Git, and is never committed, nor shown in the mock-up.
- The numbers of the picks go into `roadmap.md` (the line of the step, as for the styles: « five drawn from a moodboard the owner picked (R030, R041…) »), so that the next session knows where the proposals come from.
- The folder is deleted once the step is done (`tidy-io-folders` skill).
