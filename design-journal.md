# Design journal

One entry per application: the design choices made with the owner, the ones rejected, and why.

**This journal is a source of ideas, not a set of rules.** Each application has its own users, subject and constraints: its design starts from its own wireframes and explores new directions (see the mock-up phase of [process.md](process.md)). An entry of this journal may inspire one of the styles compared, never all of them, and nothing here is a default.

## rust-exile-market (2026-10)

A small desktop window, a companion to Path of Exile 2, that prices a copied item ([mock-up](https://github.com/sylent-dev/rust-exile-market/blob/main/docs/mockups/narrow-styles.html), [specs](https://github.com/sylent-dev/rust-exile-market/blob/main/specs.md)).

### Context

- Used next to a dark, busy game, often on a second screen; the player glances at it between two items.
- Many kinds of data in a narrow window (420 px): item, price in three currencies, stats, filters, offers.
- The game already has strong color codes (item rarities), which the interface had to respect.

### How it went

1. A first coded mock-up, all at once (layout, content and style together): correct, but generic and never exactly what the owner wanted.
2. Editable Excalidraw wireframes, iterated with the owner: the owner drew, Claude Code rearranged and completed. The layout became personal.
3. Three styles on one HTML page, switched with tabs: A · Forge (engraved capitals, gold, close to the game), B · Slate (geometric, modern), C · Compact (condensed, dense). The owner picked Slate.
4. About a hundred small decisions on Slate, each compared on the page with a temporary tab, decided by the owner on their own screen, then the tab removed.

### Choices kept

- **Bands, not cards**: full-width bands in two near-black grays, without borders or rounded frames ("rounded cards look old").
- **White as the main action color**; the colors only carry a meaning: item rarities, the softcore (blue) or hardcore (red) league, warnings (dark yellow bands), better or worse (green, red).
- **Flat square action blocks** glued to the edges (league, settings, search, refresh); **small information elements rounded by 3 px** (tags, inputs, checkboxes); **secondary actions as pills** with a verb ("Check on trade", "Show 6 stats", "Copy whisper").
- **Minimalism**: every redundant text, counter or icon removed; e.g. "Show the next 10" became a bare double chevron, the stats chevron became a pill.
- **Manrope** for the text, **JetBrains Mono** for the numbers that line up; a point as decimal separator in every language, no thousands separator.
- **Subtle hover motion**: an icon grows, the refresh icon turns a quarter, a chevron slides 2 px.
- A **vivid orange** (`#ff8c1a`) for the best tier, the only accent that "pops".

### Choices rejected

- A blue accent: it clashed with the blue of the magic items.
- Bronze tints and a glow on the item name: "looks old", "hurts the eyes".
- Poppins: its uneven character widths looked irregular in a narrow window.
- Badges for the tiers: too heavy; plain colored text was enough.
- Icons next to text when they never looked aligned: replaced by pills or removed.

### Lessons

- Pixel alignments (icon and text) are tuned **by eye on the owner's real screen**, with a tab of offsets (0, 0.5, 1… px); headless screenshots at another display scale only give the direction.
- Icons are aligned on the lowercase letters, not on the box of the text.
- Text symbols (⌕, ↻, ✓) render small and off-center: draw the icons as SVG lines.
- A class name shared by two components (`top`, `online`) silently broke the layout twice: prefix the state classes.

## sylent.art (2026-10)

The static website of a freelance trainer in software development, for schools, training organizations and companies ([mock-up](https://github.com/sylent-dev/sylent.art/tree/main/docs/mockups), [branding and tokens](https://github.com/sylent-dev/sylent.art/blob/main/docs/branding.md), [specs](https://github.com/sylent-dev/sylent.art/blob/main/specs.md)).

### Context

- The visitors are pedagogical teams who choose a trainer: the site must read as professional and trustworthy, and show a pedagogue rather than a « field developer ».
- A former site to replace quickly, whose signature the owner wanted to keep: a title over a large faded word, the motto « Une vie, mille leçons », the back-to-top square.
- An owner who loves motion and playful details, and tunes everything by eye.

### How it went

1. Three layout directions as Excalidraw wireframes for every page type; the « Editorial » set was kept and edited by the owner.
2. Several styles compared on one HTML page with tabs; « Night » was kept, then every page of the first release was built in it, as separate pages shown in a viewer at phone and desktop width.
3. Many small decisions, each with its own temporary tab (six fill grays for the fields, six text fonts, six fonts for the numerals, three reds against the orange…).
4. Step 5 turned the values of the mock-up into tokens: a 4 px spacing scale, one size token per typographic role, four breakpoints, durations and layers; the mock-up was then rewritten to use only them, and checked against screenshots taken before.

### Choices kept

- **Night**: neutral blacks without a blue tint, white as the main accent, sharp corners, glass cards; no gradients and no colored lights behind the sections.
- **One signal color with a meaning**: an orange (`#d3450e`) used only on what moves, what is reached, what succeeds or is new: trails in the animated covers, the fluid that runs along the grid textures under the pointer, the « Nouveau » badge, « Copiée ». Never on a focus ring, a field or a large surface.
- **Manrope** for the titles and the interface, **Anaheim** medium for the text, **Bodoni Moda** only for the Roman numerals of the pedagogy (a subset of three letters).
- **White line-art 3D scenes** (Three.js), one per domain and module, that explain the subject in three to five elements; a 3D spiral for the cycle of a lesson.
- **Calm interactions**: magnetic main buttons, domain cards that turn half a turn to show their modules, a thick white caret instead of a focus ring in the fields.
- **Tokens by role** rather than by scale for the type (`--size-card-title`, `--size-label`), and a plain `--space-N = N × 4 px` rule for the spacing.

### Choices rejected

- The « Console » style of the owner's course materials (night and mint green, monospace labels): its code look shows a developer, while the site must show a pedagogue.
- The « Atelier » style (paper, vermilion, Fraunces), set aside for Night.
- A red signal color: in a development course, red means an error, a failing test or a deleted line.
- Poppins and Roboto for the text, neumorphic fields, an orange caret or glowing fields, arrows on the buttons, technology tags and icons on the cards.

### Lessons

- Separate pages shown in a viewer (phone and desktop frames side by side) scale better than one page with every screen once a site has several page types.
- Give the signal color a meaning in each place it appears: the owner judged the covers right only once the orange told a small story.
- Raw values multiply during the mock-up (fifteen font sizes, five breakpoints, odd paddings of 18 or 26 px): writing the tokens at the end means rounding many of them, which shifts a few lines of text. Taking screenshots before the rewrite and comparing them shows which shifts matter (a lead that got a lone word on its last line kept its wider measure).
- The process names the token file `docs/design-system.md`; this project kept them in its branding note, next to the decisions they come from (the process now names it `docs/branding.md`).
- After the build, most of the owner's remarks were about the large titles on a phone: a title that breaks on two lines or a faded word that widens the page. Each large title is now sized at build time from the metrics of its font, so that it fills one line, and a check in Chromium fails on a title on two lines. With large display titles, test them at phone width in the mock-up already.
- The white line-art 3D scenes are what the owner liked most: playful and precise, each one tells its subject in a few elements, with the orange on what moves.

## Pathweaver (2026-11)

A website, run in the browser alone, that shows a build of Path of Exile 2 (a `.build` file of the game) at each level: the passive tree, the skills and the inventory ([mock-up](docs/mockups/pathweaver.html), [the style and the design system](specs.md), The style).

### Context

- The players open a guide next to the game, in a window as narrow as half a screen: the page must read at a glance, and the tree is the part one zooms in.
- The data are the game's: the colours of the attributes, the icons and frames of the passives, the portraits of the ascendancies; the rest is Pathweaver's own (its mark, its marks of gems and of notes, a sticky note « ? »).
- An owner who decides by eye, among many variants, on sliders, one decision at a time.

### How it went

1. Twenty-nine styles on one page, ten from directions (sober, bold, wild), five from a moodboard the owner picked, then twelve mixes of the three kept; Frost Night kept, Frost (light) and Ember (amber) on trial.
2. The page of a build cut into its components and drawn from top to bottom, one component a sub-step and a pull request, the decisions it brings up (the second accent, the texture, the motion) settled in the component where they show: about thirty pull requests.
3. Frost and Ember set aside until after version 1, every colour made a token, the style sheets checked by a script and a review, then split one per component so that each copies into its Svelte component; every refactoring checked the same to the pixel against `main`, on headless screenshots with the text drawn without antialiasing differences.

### Choices kept

- **Frost Night**: a blue black, pale blue lines, flat boxes, one blue accent; no borders, the blocks told apart by shades; a graph paper at 3 % behind every block.
- **Manrope** for every role, its figures of one width for the levels; Archivo for the name and the big titles.
- **The colours of the domain apart from one another**: the attributes as in the game, the changes at a level (green, orange, red) apart from them, the red of an error apart from strength.
- **Cards on hover in one construction**: a head in the deep shade, a body a step darker, the note of the author last, see-through over the tree and opaque over rows.
- **Motion with a small bounce** on what opens, every motion stopped when the system asks for less.

### Choices rejected

- Frost and Ember for version 1: one style is enough for a first version, and the light one needs a pass of its own (shadows, textures and grey portraits don't carry over).
- Borders between the blocks, the underline in the accent under the current tab, the light of the page on the cards, the graph paper on the cards.
- A page drawn again for the phone: one message under 600 pixels, the players use a computer.

### Lessons

- One component a pull request, from top to bottom, kept each review short and each decision in the place where it shows; a sub-step that brought up more decisions opened another rather than growing.
- Svelte scopes the classes and the `@keyframes` of a component: a mock-up whose style sheets reach into each other has to be split before the copy, or its rules stop applying without a word. Writing one style sheet per component from the start, and the colours as tokens from the first style, saves that pass.
- A refactoring of style sheets is checked to the pixel: Chromium with fixed font rendering gives two identical shots, so a difference is a real change.
- A colour tuned on sliders slips under 4.5 to 1 easily; a contrast check by script belongs with the tokens, before the review.
