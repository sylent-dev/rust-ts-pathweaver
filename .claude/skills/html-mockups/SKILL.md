---
name: html-mockups
description: Build the interactive HTML mock-up of a user interface from its approved wireframe, in docs/mockups/, comparing 3 or 4 styles with tabs, then iterate with the owner one decision at a time (one tab group per open decision) until the mock-up becomes the visual reference, and write the design tokens. Use it after the wireframes are approved, when the owner asks for a mock-up, a style, a visual design, or to compare variants of a screen before coding it.
---

# HTML mock-ups

Goal: choose the style with real content, every scenario and every state, before writing the interface. The mock-up answers one question at a time: the layout is already settled by the wireframe (`excalidraw-wireframes` skill), so the discussion is only about the look.

## 1. Build the page

Before drawing the options of a design question:

- **Ask the owner for their own idea first**, or draw it alongside: theirs beat the three entries drawn for a bug report (an icon in the title bar rather than a link or a row in the settings).
- **Look at the real data** the window will show: the 771 items of a list had only 639 images (several shared one icon), which ruled out an icon alone before any option was drawn. For Pathweaver, the corpus of `inputs/builds/`.
- **Gather a moodboard of real references** before new styles or a logo: read `.claude/skills/moodboards/SKILL.md` (hidden from the model, to cost nothing at each message; the owner runs it with `/moodboards`), whose numbered boards the owner picks from.

Start from `assets/mockup-template.html` (read its comments), copied to `docs/mockups/<name>.html`:

- **Small files**, so that a change reads only what it needs: the page `docs/mockups/<name>.html` only loads, in order, the files of `docs/mockups/<name>/`: `css/` (the fonts, the tokens, the page, then one sheet per block of the interface), `js/` (the shared helpers and icons, one script per block, the sample data, the rendering last) and `sections/` (one script per section, each adding its windows to `SECTIONS`). Plain `<link>` and `<script>` tags, no modules, so that the files share their constants. The template is one file: split it as soon as the page has more than a few blocks.
- **Every frame of the wireframe becomes a window**, at its real width in CSS pixels, with sample data close to real ones (long names, large numbers, the other language). Add every scenario and state in `SECTIONS`: empty, loading, waiting, each error, each kind of content. **A new section goes at the top** of `SECTIONS`, so that the owner finds it at once; past ten sections, the page shows a table of contents under its header, one link per section.
- **3 or 4 styles on the same page**, switched with the tabs at the top; the address keeps the choice (`?theme=…`) to share it. Each style only sets **tokens** (CSS variables under `:root[data-theme="…"]`): fonts, colors, radius, spacing. The components use nothing else, so that a style is cheap to add or tweak.
- The styles explore **new directions** for this application, its users and its subject, from sober to spectacular: the owner decides by seeing, and a variant set aside is not wasted. If the project has a `design-journal.md`, it records past experiences: it may inspire one style, never all of them, and nothing in it is a default.
- **Only what the application will draw**: the page in HTML and CSS, which Svelte builds, and the passive tree in a Canvas 2D (`docs/technical-choices.md`), where an effect costs at each frame on 5,153 nodes: a glow, a blur or a gradient on the tree is tried on its real size before it is approved.
- **Fonts the website can serve** (e.g. SIL Open Font License, from Google Fonts), preloaded with `font-display: block`, so that the page and its screenshots only finish loading once the fonts are there.
- **Icons as SVG lines** in the text color, not text symbols (⚙, ⌕, ✓), which render small and off-center.
- **Every notice is drawn with its way out**: how it closes, for how long, what brings it back. A notice the user can't dismiss stays for as long as they ignore it: a dot on an icon and a line in the settings, left until the user updates, gave way to a bubble that closes for good and a discreet link where the version is written.
- **A motion is chosen by clicking it**, not by reading about it: draw each variant as a window that plays it on a click (180 ms with an overshoot, 220 ms smooth, 140 ms quick settled a sliding pill in one look), then write the duration and its curve in `specs.md` and the tokens.

Pitfalls met before:

- A class shared by two components (`top`, `online`) silently broke the layout twice: prefix the classes of the application (`app-`) and of the states (`is-`).
- A JavaScript function named like a browser global (`top`, `name`, `status`) breaks the page: give the components specific names.
- A `url()` in a style sheet is relative to the sheet, not to the page: from `docs/mockups/<name>/css/`, `assets/` is `../../../../assets/`.

## 2. Show it

Copy `assets/serve.py` to `docs/mockups/serve.py`, and serve the repository root with it, so that the page reaches `assets/` even in a sandboxed browser (Flatpak, Snap) that only receives the HTML file, and a reload never mixes old and new files (it sends `Cache-Control: no-store`). Use the port of the project, written in `docs/technical-choices.md` (8796 for Pathweaver): two projects on the same port took each other's server over. Keep the server running in the background:

```sh
python3 docs/mockups/serve.py <port>
```

Each time the mock-up changes, check that the page answers with the change, then give the owner `http://127.0.0.1:<port>/docs/mockups/<name>.html` with the section to look at; they reload after each change. If the page answers 404, check which project answers on the port before restarting.

Before asking for a review, check each change with a headless screenshot (`scripts/screenshot.sh <url> <output.png> [width] [height | full] [selector]`), kept in the scratchpad, and look at it, then delete it: the screenshots are for this check only, the owner looks at the mock-up itself. Capture only the window concerned, with a selector (`'#section-1 .page-slot:nth-child(4)'`), rather than the whole page. **Look at a page that changes with the width at its smallest width and at the owner's** (ask it once, and note it in `docs/technical-choices.md`): a sentence on three lines in the owner's wider window took four at the default width. To compare the styles at a glance, export one large PNG per style to `outputs/`, deleted once the style is chosen.

The script uses **Playwright** and its own Chromium when installed, otherwise Firefox (normal or Flatpak). Prefer Playwright: its Chromium is closer to the one of VS Code where the owner looks at the mock-up (Firefox draws the fonts a few pixels wider or narrower); it waits for the scripts to settle and prints the errors of the browser console (scripts, missing files) and fails on them; with a selector it captures that window only and lists its texts cut (wider than their box) or wrapped (on more lines than written), with their widths, the measures a screenshot doesn't give; `full` captures the whole page; `SCALE=1.5` takes the scale of a screen other than 100 %. It is also the only choice when Claude Code runs in a sandbox that doesn't see the browsers of the system, such as VS Code installed as a Flatpak. Install it once, outside the projects (about 150 MB):

```sh
mkdir -p ~/.local/share/mockup-tools && cd ~/.local/share/mockup-tools
npm init -y && npm install playwright && npx playwright install chromium
```

- A test that needs extra code (a delay, a simulated click) runs on a copy of the page (`docs/mockups/test-*.html`, deleted after), never on the file the owner has open: they reload it at any time. Stop the helper servers by their PID, never with `pkill -f` and a pattern that also matches the shell's own command.
- A headless browser renders without the GPU: a color or WebGL bug the owner reports doesn't show in a screenshot. Build a small test page of variants and ask the owner to name the wrong ones.
- `firefox --screenshot` shoots before the scripts settle: an animation is measured or shot with Playwright, driven by a small script of its own (see `scripts/screenshot.cjs`).

## 3. Iterate with the owner

1. The owner picks a style, or mixes two. Iterate on it alone, **one change at a time** (the main color, then the logo, then a font…).
2. **Give each open decision its own control** in `VARIANTS`, so that the owner compares on screen instead of imagining; once decided, remove it, keep the choice in the tokens, and write the decision in the design section of `specs.md` in the same commit, with the options set aside. About a hundred small decisions went this way on the first project, each in a minute. The control depends on the decision:
   - **A few distinct variants** (two button shapes, three header variants, five offsets…): a group of tabs, with the variants also side by side when the difference is fine.
   - **Values that combine** (a font per role, colors, sizes): one list per role (`select: true`, with the CSS `variable` it sets), which changes the page at once. The owner then tries every combination instead of waiting for a new board; a list "for everything" that the others follow until they are changed saves many clicks.
   - **Values tuned by eye** (a width, an angle, a darkness): a slider (`range`, with the CSS `variable` it sets), whose value shows beside it. The owner tunes it on their own screen, then sends back the address, which holds the values.
   - **The address keeps every choice**, so that the owner can reload the page or send the exact combination.
   - **An important element is shown alone and in real conditions**, with what surrounds it behind, both following the controls.
   - **Number the proposals once**, from 1 upward across every series: letters, or a numbering that starts again in each series, get mixed up ("the B" of which series?).
3. **Pixel alignments are tuned by eye on the owner's real screen**, with a tab of offsets (0, 0.5, 1, 1.5 px): the display scale of headless screenshots differs, so they only give the direction. Align icons on the lowercase letters next to them, not on the box of the text.
4. When the owner points at something, change only that, and say what changed. **When their words leave a visible detail open** (« the same color code as the others », while the new element has no rank to pick a color from), ask for that detail by name instead of picking one and taking a short « yes » for it: a red picked that way had to be undone.
5. From then on, **the mock-up is the single source of truth** of the interface: say so in `specs.md`; the wireframe only fixed the first layout and isn't kept up to date.

## 4. Sounds

When the interface makes sounds, the owner chooses them by ear on the mock-up, in the same rhythm: one kind of sound at a time (a success, a failure, a bump…), many candidates, a recommendation.

- **Each kind of sound is a group of tabs that plays its sound when a tab is chosen**: the owner hears it at once, without a second click. With many candidates, a tab shows the number of its sound alone, and a list in the section names each one, with a button ▶, its source and its length, the chosen one in bold.
- **A scene plays its sound in time with its animation**, at the moment that makes it (the contact of a bump, the start of a hop), once, after a click on its button ▶ (*Play with sound*). The scenes that loop stay silent, or the page becomes noise.
- **The browser plays a sound only after a click**: create the audio context (`AudioContext`) at the first click on the page, and resume it if it is suspended.
- **Match the loudness of the candidates**: the ear prefers the louder of two sounds. Measure the mean level of each file (`ffmpeg -i <file> -af volumedetect -f null -`) and bring them all to the same level with a gain, then add a **Volume** slider that applies to every sound at once.
- **Compare several temperatures side by side**: calm sounds, bolder ones (high temperature), wilder ones (explosive temperature). The owner may choose an unexpected sound, and the wild ones show where the limit is.
- **Mix three sources**: sounds synthesized in the browser with the Web Audio API (no file, no license), files from a CC0 library (Kenney's packs, mirrored on OpenGameArt with direct links), and sounds made by a script. Download only from sources that give a direct link: never work around the download flow of a site.
- **Make sounds with a reproducible script** rather than by hand: a recipe per sound (oscillators, frequency modulation, filtered noise, a plucked string, formants for a voice, echo, reverb, bit crushing), Python's standard library and ffmpeg to encode them, the noise seeded by the name of the sound, and the encoder made bit-exact (`-fflags +bitexact -flags:a +bitexact -serial_offset 1` for Ogg), so that running it again gives the same files. Live-coding tools (Strudel, TidalCycles, FoxDot, Sardine) are made to play music in loops and most need SuperCollider: too heavy for sound effects of a second.
- **A sound repeated at each step** (a move, a click) is heard in a scene at a faster speed too before it is decided, and played quieter than the others.
- **Check the terms of every source** before the owner chooses (the license file of each pack, its page), and write them with their date in a note of `docs/`.
- **Claude Code can't hear the sounds**: the names of the candidates say what was intended, not what was heard. Check every button in a headless browser instead (no error in the console, every file decoded, the audio context running), and say plainly that the owner's ear decides.

## 5. Finish: the design tokens

- Write the chosen style in `specs.md` (visual style section) as named tokens: colors (bands, text, weak text, accent, warning, error, the colors of the domain), sizes (spacing, radius, heights), typography (fonts, size and weight per role, number formatting), icons and images (source, license, what is bundled with its notice), shapes and motion.
- Remove the styles that were not chosen from the page, or keep them in a section that says they were rejected.
- If the project has a `design-journal.md` (or the template it came from), add an entry: the context, the choices kept, the ones rejected, and why.
- The application then implements exactly these tokens, in one module, so that changing a color or a size happens in one place.
