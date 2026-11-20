# Specifications

What Pathweaver does, as the user sees it. Version 1 was specified at step 0 of [roadmap.md](roadmap.md) on 2026-11-16, from a corpus of 32 real `.build` files (see [docs/build-files-in-the-wild.md](docs/build-files-in-the-wild.md)); the later versions are specified when their turn comes.

## Purpose

Path of Exile 2 reads `.build` files in its Build Planner since version 0.5: a JSON file that lists the passives, the skill gems and their supports, and hints on the inventory slots, each for a range of levels of the character. Guide sites and tools (poe.ninja, Maxroll, Mobalytics, Path of Building converters) export them; the only way to see what a file holds, before putting it in the game folder, is to read its JSON.

Pathweaver (the build viewer and planner of Path of Exile 2: the subtitle that goes with the name everywhere, so that it is found by those who search for a build planner) shows a `.build` file as a player reads a build: its passive tree, its skills and its gear, at each level of the character. Later, it edits them; then, in version 2, it hosts them for everyone to share.

## Design principles

- **The `.build` file is the native format.** Not an export of a format of our own: a file opens whatever tool made it, and is written back without losing a field another tool put in it.
- **Level by level.** A build is a progression: the interface follows a level of the character, not separate profiles.
- **A personal tool first.** Versions 1 and 1.5 serve the player who uses them: no account, no server, a static website; nothing leaves the browser: a build is shared as its `.build` file.
- **The rules in Rust, once.** The reading, the checks, the levels, the merging and the passive tree are in the core, so that the same code checks a file in the browser and, in version 2, on the server.
- **The game data come from the game; so do the portraits and the passive tree.** The names and the stats come from the data of the game, never typed by hand (see [docs/game-data.md](docs/game-data.md)). The images of the game are the portraits of the classes and ascendancies, so that a build is recognized at a glance, and the icons and frames of the passives, which give the tree its charm (the owner, 2026-11-18); the other shapes and marks are drawn for Pathweaver.
- **The documentation of Grinding Gear Games wins.** When the files in the wild disagree with the [documentation of the format](https://www.pathofexile.com/developer/docs/game#buildplanner), Pathweaver follows the documentation, and still reads the file.

## Versions

| Version | Content |
|---|---|
| 1 | The viewer, for oneself: open one or several files, see their skills, tree and inventory at each level, merge the files of a guide into one, share a build as its file, keep one's builds in the browser. In English. |
| 1.5 | The editor, for oneself: allocate passives on the tree, choose gems, write the hints, export the `.build` file. |
| 1.x | French: the interface and the names of the game, once the French translations of the game have settled after its version 1.0 (2026-12-11). |
| 2 | The community: accounts, published builds, short links to share a build, votes for the best builds, search, versions of a build and what changed between two. Hosted on Cloudflare (Workers, D1, R2). |
| 3 | The price of a build, with the prices of Exile Market. |

## Out of scope

- **A share link** (the owner, 2026-11-18): a link that holds the whole build is 1,936 characters for the median build of the corpus and 7,348 for the longest (its notes of the author), still 1,562 and 3,142 without them: no link to paste in a chat, where a Discord message stops at 2,000. A short link needs a server and a database: version 2. In version 1, a build is shared as its `.build` file, which a chat takes as an attachment.
- **Damage and defences.** A `.build` file holds no item, and computing a character is the work of Path of Building. Pathweaver shows what the build takes, not what it deals.
- **Phones and consoles.** Pathweaver is used on a computer (see [Screens](#screens)). On console, the game doesn't read local files: the players subscribe to builds on the website of Grinding Gear Games.
- **Translating the author's texts.** The name, the description and the hints of a build are shown as their author wrote them, in their language.
- **The images of the game, other than the portraits and the passive tree.** Gems and uniques are shown by their names and Pathweaver's own marks.

## Version 1

### Opening builds

- Three ways to open a build: drop one or several `.build` files on the page, choose them with a click on the drop zone of the home page or on the + of the band of the open builds, or paste the JSON of a build (poe.ninja offers to copy it). They open at once, without a button to confirm. The library opens builds too (see below).
- Several builds are open at once: a list shows them by name, one of them is shown. Opening a build adds it to the list and shows it; a build is closed from the list, which takes it off the list only: it stays in the [library](#library).
- The same build opened twice (the same content) isn't added again: the one already open is shown.
- A file that can't be read is refused alone, with its name and the reason: not JSON (with the number and the text of the line of the error, so that no one has to look for it), not a build (no `name`), a value of the wrong type (with its field), larger than 1 MB (the largest file of the corpus is 72 KB). The other files dropped with it open.
- A byte order mark at the start of a file is skipped.

### The header of a build

- The name of the build, its author and its ascendancy (name and class, from the game data), and the file of the build to download (see Window layout).
- In About: its description, with the [markup](#the-authors-texts) of the game, and the `link` of the file (documented by Grinding Gear Games, usually the page of the guide), shown as a link that opens in a new tab, only if it starts with `https://`; otherwise as plain text.

### The level

- The level of the character is chosen with a slider from the lowest level the entries of the build cover to the highest (1 to 100 for most, 65 to 100 for a guide of the maps; 2g2, 2026-11-19), and with **markers**: one at each level where the build changes, that is where what the file says the build holds differs from what it held at the level before (see What changes here below), passives aside: a passive that starts makes no marker, since a file can add one at every level (99 markers on a build of the corpus, 15 without them); passives that stop (a respec) make one. A click on the track moves the slider there; at the lowest level of the build, nothing comes before it to compare with, so no marker.
- **◀ and ▶** on both sides of the level go to the previous and the next marker, each with the level it goes to written under it; the keys ← and → do the same anywhere on the page of a build, without aiming at the slider first, but in a field, where they move the caret (the owner, 2026-11-19).
- An entry (a passive, a skill, a support, an inventory slot) applies at a level when:
  - it has no `level_interval`: at every level;
  - its `level_interval` is `[min, max]`: from `min` to `max`, both included (`0` counts as `1`);
  - its `level_interval` is a single number `n` (allowed by the documentation, without its meaning): from `n` to 100. To check in the game.
  - an interval whose `min` is above its `max` applies at no level, and is listed among the [warnings](#unknown-and-invalid-entries).
- A build opens at the highest level it covers (100 for most).
- A build that is the same at every level (a snapshot of a character, from poe.ninja or Path of Building) has no marker; the slider says so: « A snapshot: the same at every level » over its track from 1 to 100, ◀ and ▶ alone and greyed, without « N changes » (2g2).
- **What changes here**: at a marker, each part (skills, tree, inventory) marks what starts at this level as new, and lists what stopped just before it as removed (for instance « − 34 passives » at a respec).
- **What changes at a level is read from the file alone** (the owner, 2026-11-18): what the build holds at the level, as its entries say, against what it held at the level before. An entry that stops and starts again the same at the next level (the same id, the same skill, the same note) changes nothing: a build of the corpus does this with 70 of the 81 supports it lists again at 71, which change nothing for the player. One that comes back with another note of its author is a change of its note. A slot is read as a list of hints, without their place: the three charms share one id (`Charm1`) and are told apart by their item, never by their position; a hint replaces another only when one leaves and one comes on its slot, since where several share it (the flasks, the charms) the file doesn't say which replaces which. The changes, by category:
  - skills: a skill comes (with its supports) or goes; a support comes onto a skill already there, or leaves one that stays;
  - passives: taken (shared, of weapon set I, of weapon set II, of the ascendancy), given back;
  - gear: a hint comes, replaces another, goes;
  - notes: an entry set again with another note of its author (on a gem) or another text (on a hint).
  A gem, a hint or a note counts as one change, each group of passives as one; a note that comes with an entry marks it rather than counting.

### Skills

Step 4 of the roadmap.

- The skill gems that apply at the level, each with its supports under it, in the order of the file. A support is shown when both it and its skill apply.
- Each gem shows its name from the game data, with a mark of its own for its kind (skill, support, spirit) and its colour (strength, dexterity, intelligence): a skill a hexagon, its top facet lighter, a support a square on its tip, told apart by their shape as well as their colour (2g3, the owner, 2026-11-19, of twelve marks); the spirit gem is drawn with the Skills (2j); never under 10 pixels, where the shape is lost. On hover, its tags and its description from the game data, then the hint of the author (`additional_text`).
- Two lines of the same skill with different intervals (the same gem from 1 to 5, then from 6 to 14 with more supports) are two entries: at a level, only the one that applies is shown.

### Passive tree

Step 5 of the roadmap.

- The whole passive tree of the game, at the positions of the game, drawn with the icons and frames of the game for each kind of passive (small, notable, keystone, jewel socket, ascendancy), in colour when taken and greyed when not (2i, the owner, 2026-11-19); moved with the mouse and zoomed with the wheel. The icons show as soon as the frame of a small passive is 2 pixels wide, that is at nearly every zoom; zoomed out further, the passives are the dots of the style. The masteries of the export are only the art at the centre of a group, never taken nor linked: they aren't drawn (their art waits in [docs/backlog.md](docs/backlog.md)).
- At the level chosen: the passives the build has taken up to this level are lit; the passives it takes later are shown faded, their links solid in a faint colour, without dashes (the owner, 2026-11-19); the others are dimmed.
- The ascendancy of the build, with its passives, at the centre of the tree, in the empty disc inside the ring of the class starts (the owner, 2026-11-19), not in a box of its own: every ascendancy shrunk alike to 85 % around the centre of its box, so that the largest (Monk3) fits with room to spare, over the portrait of the ascendancy, large (about 300 pixels), in colour at 40 % (the owner, 2026-11-20). It isn't linked to the start of the class, since the export of the tree links them nowhere. The tree opens framed on the passives of the build, its ascendancy included.
- The weapon sets: the passives with a `weapon_set` of 1 or 2 belong to that set, the others (`weapon_set` 0 or absent) are shared. Both sets are drawn together (the owner, 2026-11-19): the links between shared passives in white, those of the passives of set I alone in red and of set II alone in green, as the game draws them (Path of Building, `PassiveTreeView.lua`), Vivid red `#ef4444` and Vivid green `#22c55e`; the set chosen with the switch strong, the other at 35 %; on a switch, the two swap their strength in 180 ms, the colour of the buttons in 120 ms (S1 of three, the owner, 2026-11-20: a wave lighting the set from the shared passives and a flash of its links set aside).
- On hover, a passive shows a card beside it, on the side of the tree with more room (B of three, the owner, 2026-11-20: a card that follows the pointer and a panel fixed under the legend set aside): its name and its kind, its stats from the game data (a keyword in brackets, `[Spell]` or `[Critical|Critical Hit]`, shown as its words), its state at the level (« Taken at N », « Taken later, at N », « Not taken ») and its weapon set, then the hint of the author under a line, with its markup (The author's texts). The card is in the shade of the window of what changes, without a border, its background see-through at 10 %, its corners rounded by 3 pixels; it fades in and out in 120 ms, at once when the system asks for less motion, and stays when the pointer goes straight from one passive to the next.
- The number of points the build has spent at the level: passives, ascendancy points, and those of each weapon set.
- What is new at the level is ringed in the accent on the tree, without a count beside it: « New at N », at the top of the right column, lists them (the owner, 2026-11-19).

### Inventory

Step 6 of the roadmap.

- The inventory of the character laid out as in the game: weapons and offhands of both weapon sets, helmet, body armour, gloves, boots, belt, amulet, rings, flasks, charms.
- A slot with a hint at the level is marked; on hover or click, it shows the hint and, when it names one, the unique item (`unique_name`) with its kind and its stats from the game data.
- `slot_x` and `slot_y` say which cell of a slot with several cells the hint is for.
- A `.build` file holds no item: an empty slot is just a slot the build says nothing about.

### The author's texts

- The description and the hints (`additional_text`) are shown with the markup of the game: the fonts `r`, `b`, `i`, `u`, `s`, `m`, `l`, the named colours and `rgb(r, g, b)`, nested; line breaks (`\n` or `\r\n`) are kept.
- A tag Pathweaver doesn't know is shown as plain text. The texts of a file are never read as HTML: a file from someone else is untrusted.

### Unknown and invalid entries

- An id that matches nothing in the game data (a passive, a gem, a unique, an ascendancy, a slot) is shown where it is with its raw id and an « unknown » mark, and listed in a **warnings** panel by part, with the version of the game data Pathweaver uses. A file made for another version of the game is the usual cause: Path of Exile 2 1.0 (2026-12-11) will rename and remove some.
- Ids are compared exactly: `Metadata/Items/Gem/` and `Metadata/Items/Gems/` are two different folders of the game, each gem lives in one of them.
- The rest of the build shows as usual; the file is written back as it was read.

### Merging a guide

Step 7 of the roadmap. Some guides (Mobalytics) come as several files: one per range of levels, each a snapshot of the build at that range.

- From the list of open builds, the user picks several builds and merges them; or completes a merged guide with one more build, for lower or higher levels.
- A screen lists the builds in the order of their levels, each with the level it starts at, guessed from its name (`lvl 15-32` starts at 15) and editable; a build whose level can't be guessed is asked for.
- Each build applies from its start level to the level before the next one; the last one up to 100.
- Checks before merging:
  - **Overlap**: two builds that start at the same level block the merge, which shows the level in conflict, until a start level is changed or a build removed.
  - **Gap**: the first build starting above level 1 is a warning (nothing is shown below it), not a block.
  - **Different guides**: builds with different `link`s or ascendancies are a warning (« these builds don't seem to come from the same guide »), not a block.
- The merged guide is one build: each entry applies over the levels of the builds that hold it, within its own `level_interval` if it has one, cut at the limits of each build. The name is that of the first build without the part its level was guessed from (« lvl 1-14 - 0.5.5 Fubgun Flameblast Oil G » gives « 0.5.5 Fubgun Flameblast Oil G »), and the author is that of the first build; both are editable.
- A build whose level can't be guessed (« Endgame - … ») blocks the merge until its start level is typed.
- The merged guide joins the list of open builds; the builds it comes from stay open.

### Downloading a build

Step 7 of the roadmap.

- Any open build, merged or not, downloads as a `.build` file, named after the build.
- The file is written as it was read: the fields Pathweaver doesn't know and the form of each entry are kept; only the indentation may change.
- With the download, a short help says where the game reads the files: `Documents/My Games/Path of Exile 2/BuildPlanner` on Windows, and the folder of the Proton prefix on Steam Deck, as in the documentation.

### Library

Step 8 of the roadmap.

- The library holds every build opened in this browser; the list of open builds holds those at hand. Opening a build adds it to both; closing it takes it off the list of open builds, never out of the library.
- The open builds are open again at the next visit, with the level each was shown at.
- The home page lists the builds of the library, the last opened first; one opens from there, or is removed from the library for good, which closes its tab when it is open. Once the last build is removed, the home page is the first visit again.
- The builds are kept only in this browser, on this computer. When the browser refuses to keep them (private browsing), Pathweaver works the same and says that nothing will be kept.

### Screens

- Pathweaver is used on a computer, from a window as narrow as half of a 1920-pixel screen, so that it fits next to the game. The minimum width is **900 pixels** (half of a 1920-pixel screen, less the borders of the browser and its scroll bar): below it, the page keeps its width and scrolls sideways.
- Below 600 pixels (a phone), a page says that Pathweaver is used on a computer.

### Window layout

Agreed on the wireframes of [docs/wireframes/pathweaver.excalidraw](docs/wireframes/pathweaver.excalidraw) on 2026-11-16; the variants set aside are in `archive.excalidraw`. The wireframe only fixed this first layout: once approved, the mock-up of step 2 is the reference.

- **The portrait of the ascendancy** (of the class when the build has none) marks a build wherever it is named: its tab, its row of the library, its header.
- **Two bands of 44 pixels at the top of every page but the first visit** (the owner, 2026-11-17; sketch in [docs/wireframes/app-bands.excalidraw](docs/wireframes/app-bands.excalidraw)), the site above, the open builds below, so that the menu of version 2 has its own room; the band of the open builds only while a build is open (the owner, 2026-11-18): with nothing open, the home page comes right under the band of the site; the band of the site takes the graph paper of the blocks, the band of the open builds a very light shadow under it:
  - **the band of the site**: the brand (see The brand), which leads to the home page; just after it, **My library**, the way back to the home page, the library, from anywhere (the owner, 2026-11-18), in the colour of the text while the library is shown, without its line, which only answers the hover (the owner, 2026-11-18); on the right, two links in words, the three in Manrope 600, in the colour of the frame of the logo, each the full height of the band, on hover the words turning to the colour of the text and a line of 2 pixels in that colour drawing itself under them from the left, leaving to the right: **Report a bug**, which opens a new issue on GitHub, and **What's next**, which opens a box of what version 2 brings, the community (its wording and its look are drawn with the other boxes); not a Sign in, which would lead nowhere in version 1. Version 2 adds the menu, the search, the settings and the account to it; version 1 has no settings.
  - **the band of the open builds**, at every width, in the shade of the band of the site (both light in the light style, both dark in the dark ones), the graph paper of the band of the site telling them apart: their tabs, the full height of the band, side by side, with square corners, without a box, by contrast: the current one in the full colour of the text and the only portrait in colour, the others in a weaker text, their portraits grey and dimmed (less on hover); the portrait square the full height of the tab, the largest square inside the disc the game gives; the name of the build as its file writes it, over the name of its ascendancy, smaller and weaker, each cut to fit, both in full on hover; the close button, always shown; 184 pixels, up to 240 when they all fit, then **+N ▾**, a menu 3 pixels under the band, in its shade, its corners rounded by 3 pixels, as the window of what changes (the owner, 2026-11-19), each build that doesn't fit a tab laid down (its portrait square, its name over its ascendancy), growing out of +N ▾ when it opens and going a little past its size before it settles, then **Merge…**, then **+**, which adds a build: it opens the choice of files of the system at once, and the builds chosen open as dropped ones do, without leaving the page (the owner, 2026-11-18: My library already leads to the library); on the library, no tab is the current one; both the full height of the band, told apart by contrast rather than borders (+N ▾ in the colour of the frame of the logo on the background of the band, turning to the colour of the text on hover and while open, like the links of the band of the site; +, the button that matters most, in the colour of the band on a white background, growing a little on hover), without a line between them.
- **The page of a build**, from top to bottom:
  - the header (2f, 2f2, the owner, 2026-11-18): the portrait on the left, square, the full height of the band, as in the tabs above; the name; « by author · ascendancy class », the class without brackets, in a grey a little darker than the rest of the line (the weak grey at 70 % over the page); on the right, **⚠ warnings** (which leads to About), then the file of the build itself: a page with a corner folded, « .build » written on it, beside « Download .build » in the accent over its size in grey, on no field, its words turning to the colour of the text on hover, without a line; a click downloads it, a drag takes it where the browser allows it, the name of the file in its tooltip;
  - the level band (2g, the owner, 2026-11-18; L6 of the mock-up, its reference), 84 pixels, in the darker shade of the bands, from left to right:
    - the level in a box of 124 pixels, « LEVEL » over its number, the two a group centred both ways in the box, each trimmed to the height of its capitals and figures: « LEVEL » in 11 pixels, spaced 0.12 em, in capitals, in the weak grey; the number in Archivo 800 at 58 pixels, spaced -0.05 em (no glow, no field);
    - a column of three blocks of 84 pixels, one under the other, in the shade of the band (lighter on hover): **◀** and the level of the marker before; **N changes**, here, its words in the accent on a shade of the accent, the colour of the text on hover and while its window is open, « 0 changes » in grey when nothing changes at the level, the block kept so that ◀ and ▶ never move (the owner, 2026-11-18); **▶** and the level of the marker after. Going to the next marker and seeing what changes there are one gesture (the owner, 2026-11-18, of nine places drawn for it: under the level, over the end of the track, riding the cursor, a box of its own, before-here-after, the cursor as a tab, a count on every marker, a badge on the level, stacks of squares);
    - the track, from that column to the margin of the band: a line of 2 pixels at the height of the middle block, the markers in the accent, ticks of 1 pixel on whole pixels, the cursor of the level a white bar of 4 by 28 pixels, without glow (tried, set aside: hard to judge, kitsch at worst), the lowest and the highest level of the build under its ends; the motion (2g2, the owner, 2026-11-19):
      - the cursor is dragged, a hand over it and a grip wider than its 4 pixels: lifted while it moves (a quarter taller), from level to level, its ghost left grey where it was, a short grey tail behind it, longer as it goes faster (up to 72 pixels), shrinking back to it once it stops (of two trails: a band held from the ghost veiled the markers it crossed; none on a slide, too short to see it), the level counting in its box, ◀ ▶ and « N changes » faded since they still say the level left; set down, it settles back to its height with a small bounce, and the page shows the level;
      - Tab reaches the cursor, which then turns to the accent, 6 pixels wide (of three looks: a ring framed it heavily, thin bars on its sides read as markers); a click on the cursor, the track or ◀ ▶ gives it the focus too, but keeps it white: the accent is for the keyboard; ← and → go to the marker before and after, as ◀ and ▶, whether the cursor has the focus or not;
      - on ◀ ▶, a click on the track and the keys, the cursor slides to its level in 0.28 s, slowing at the end; nothing slides or bounces when the system asks for less motion;
    - **N changes** opens the window of what changes at the level (see What changes at a level is read from the file alone), 3 pixels under the band from the left edge of the column of the arrows, 440 pixels wide, in the darker shade of the bands, its corners rounded by 3 pixels, a light shadow under it; it opens with the pop of the menu of « +N ▾ » (0.28 s, going a little past its size), none when the system asks for less motion; it stays open while ◀ ▶, the track and the keys move the level, its lines replaced at once (of four motions, the owner, 2026-11-19); Esc or a click outside closes it. No summary in the band: no order of the changes would hold for every build, and a level can change 20 things (the owner, 2026-11-18). The window (2g3 and 2g4, the owner, 2026-11-19, W1 of twelve layouts), a summary:
      - « 21 changes at 65 » in small capitals in the weak grey, then a line per change, 12 pixels, in the order of the categories (skills, supports, passives, gear, notes), without an order of importance;
      - each line: its sign, **+** what comes, **⇄** what replaces another, **−** what goes, in semi-bold in the colour of the change, the note of an author marked by its own mark; its category in small capitals in the weak grey (« SKILL », « SUPPORT », « PASSIVE », « GEAR », « NOTE »), written on every line, so that a line reads alone; its name in semi-bold, cut to fit, what goes in the weak grey; at the right, what it hangs on, in grey, cut to fit (« with 5 supports », « on Spark », « Body · for Wyrmscale Coat », « given back », « Belt · new text »);
      - the name of an item without the base its author wrote after it (« Sacramental Robe », not « Sacramental Robe (Int Base) »): the window says what changes, not what the item is; the gear tab shows the base, read from the game data (the owner, 2026-11-19);
      - the note of an author on an entry: a filled speech bubble after its name, 12 pixels, 2 pixels under the baseline, in the weak grey (N2 of twelve marks, the owner, 2026-11-19); on the passives, on their first group, its tooltip counting them;
      - each line is a link to the tab that shows its change: a gem and its note to Skills, a hint and its note to Inventory, the passives to the tree, which the Overview shows already; on hover the whole line a shade lighter and, in place of what it hangs on, where it leads in the accent (« Inventory »), without arrow or chevron (H4 of six hovers, the owner, 2026-11-19), the two in one cell so that nothing moves; a click shows the tab and closes the window, which would hide it. The change itself shown where the click leads (the gem in its row, the slot, the tree centred on the passives of the level) is drawn with the tabs, the tree and the right column (2h, 2i, 2j);
      - it scrolls past 460 pixels, its scroll bar a line of 4 pixels in the accent with square ends, on no track (the owner, 2026-11-19).
  - five tabs: **Overview** (the default: the tree, and beside it what is new at this level, the skills and the inventory; side by side in a wide window), **Skills**, **Tree**, **Inventory** (the slots, and beside them the list of the hints at the level, then those to come), **About** (the description, the link to the guide, the file, the warnings). Their row (2h, the owner, 2026-11-19, F3 of twelve variants; classic tabs, boxes with rounded tops, tried and set aside):
    - 44 pixels under the level band, the only light band between dark ones: the shade of the page and its graph paper, the level band casting a light shadow on it (1 pixel down, 6 pixels of blur), the tree and the side column under it in the darker shade of the level band;
    - the names alone, without counts (the number of skills, of points, of hints: unreadable without their unit, and said again by each view), in Manrope 600, 14 pixels, in the weak grey, turning to the colour of the text on hover; the current one in the colour of the text over the cursor of the level laid down, a white bar of 28 by 4 pixels at the foot of the row, centred under its name, without glow;
    - a click on a tab, or on a line of the window of what changes, shows it, the bar sliding to it in 0.28 s with the small bounce of the cursor set down (of three motions: a grey ghost left under the tab before, and a bar stretching to the new tab before letting go of the old one, set aside); nothing slides when the system asks for less motion;
    - the keys: Tab reaches the tabs, Enter or Space shows the one that has the focus; ← and → stay for the level everywhere, the tabs included (the owner, 2026-11-19).
  - the tree (2i, the owner, 2026-11-19), on the Overview beside the right column, on the **Tree** tab in the whole window without it, with the same controls over it (T14 of twenty bottom bars, the legend from T24 of eleven ways to it):
    - the legend always at the top, in the middle, without a button: a line of small words in the weak grey over a short gradient of the dark shade of the band, clear downward: « shared », « set I », « set II » with the line of their colour, and « new at N » with the ring of the accent, each mark on the middle of the lowercase letters beside it; what isn't taken goes without saying;
    - the bottom bar, without a border, on a gradient of the same shade, dark at the bottom, clear upward: on the left **Set I** and **Set II**, buttons without a box, in the weak grey, the set shown in its colour without a line under it; in the middle, whatever the width of the ends, the counts in 12 pixels, « 79 points · I 29 · II 23 · Ascendancy 0/8 »; on the right − + and the frame that fits the build again; on hover, a transparent tile behind a button, its corners rounded by 2 pixels;
    - the zoom (Z2 of three, the owner, 2026-11-20: a jump at each step, and the wheel eased too, set aside): − and + glide in 200 ms around the middle of the tree, a click during a zoom going on from where it was heading; the frame glides to the build in 350 ms, the zoom and the centre together; the wheel zooms at once around the pointer, never lagging behind the notches of a mouse; a drag stops a zoom where it is;
    - every motion of the tree at once when the system asks for less motion;
    - only the controls catch the pointer: the tree is dragged and zoomed everywhere else, under the gradients too.
  - the right column of the Overview, 330 pixels beside the tree, from top to bottom:
    - **New at N** (2j, N2 of twelve variants, the owner, 2026-11-20: a box weighed down a column that holds the skills and the inventory too): no box, a title in the accent like Skills and Inventory, « Nothing new at N » in the weak grey at a level without change; under it the lines of the window of what changes, each its sign, its name and what it hangs on, without its category, which the mark of a gem, « passives » and the slot at the right already say; each a link to its tab, with the hover of the window; six lines, then « and N more » in the accent, which opens the window;
    - when the level changes, its lines are replaced at once, as in the window, and its title lights up to white, the white of the cursor of the level, and back to the accent in 400 ms, only when something is new: the column is beside the band, where the eye isn't, and nothing of it moves (M3 of three, the owner, 2026-11-20: a fade, and a rise of the lines one after the other, set aside); a dragged cursor changes it once set down; nothing when the system asks for less motion.
- What is new at the level stands out (« New at N », the new gems, the new passives ringed on the tree) in the accent, the one accent of the interface, which also marks what can be clicked; the cursor of the level is white, the markers it moves between in the accent (the owner, 2026-11-18).
- **The home page at the first visit** (the owner's E1b, 2026-11-18; the mock-up of step 2 is its reference), on the graph paper of the blocks over the whole window, without the band of the site: the brand floats at its top left, Report a bug and What's next at its top right (My library would lead to this page):
  - a title in the middle, « Weave your path to level 100 », in Archivo 800 at its normal width, 42 pixels, spaced -0.06 em, in sentence case, « Path of Exile 2 » over it, small, in the monospaced font, in capitals and in grey, rising from behind it as the page loads; the subtitle, « Build viewer and planner for Path of Exile 2 », is the title of the page in the browser, not on the page. No line drawn at random (set aside on 2026-11-18, with the nine variants of the first visit);
  - under it, the drop zone, 560 by 260 pixels (narrower in a window under 960 pixels, so that the notes around it keep their margin), black at 50 % over the page (65 % on hover), square corners, no border, its icon four corners around a + whose ends are cut flat like the + of the band of the open builds, the corners closing in on the + a little on hover and firmly while a file is over the page, then « Add your first build » and « Drop a .build file here, or click to choose it ». A click on the zone chooses the files; the files dropped anywhere on the page open;
  - around the zone, the three things a build shows, as the notes of a plan in white, their lines drawn to the zone, their dots beating: the passive tree, the skills, the gear; never in the accent, which marks what can be clicked;
  - under the zone, **Paste JSON**, a link in words like those of the band of the site, not the button of the library, so that the zone stays the one call of the page: most will drop a file (the owner, 2026-11-18);
  - at the foot of the page, the sources of the files (Mobalytics · Maxroll · poe.ninja · Path of Building) and « Your builds stay in this browser. Nothing is sent anywhere. »;
  - behind, the mark of the brand, large, in a watermark at 3 %; over the graph paper, a fluid in white runs along its main lines (every 48 pixels) under the pointer, in veins that beat (a volatility of 65 %, a persistence of 975, tuned by the owner), still when the system asks for less motion; while a file is over the page, the whole grid lights up in the accent, the zone grows a little with its notes and says « Let go to open it ».
- **The files the first visit refuses**: when no file of a drop opens, the zone stays, without its icon, a thin line in the red around it, and says why in its middle: what went wrong (« That isn't a .build file », « That build can't be read »), its reason in a vivid red (#ef4444, apart from the red of the gems of strength, so that an error never reads as strength) naming the file and what it is (« passive-tree.png is an image, not a build. », « Ritualist poison.build isn't valid JSON at line 12. »), the call to drop again at its foot, until the next drop. When a build of the drop opens, it is shown and a notice names the files refused.
- **Paste JSON** turns the zone itself into a field, in its place, its size and its black, the caret in it, a thin line in the accent around it while the caret is there, « Paste the JSON of a build » and « Ctrl+V: it opens at once · Esc: back to the files » in it until a text is typed; the link under it becomes **Drop a file instead**, which gives the zone back, like Esc. A paste opens the build at once, without a button; the field takes the paste of the keyboard, so the browser asks no permission. A text that isn't a whole build stays in the field, its line and its reason in the red, the reason at its foot (« That isn't the JSON of a whole build: it stops at line 7. »), until the next paste.
- **The home page afterwards, the library** (2l2), reached from My library: the two bands at its top, the band of the open builds while one is open, no tab the current one; under them a calm page on the graph paper of the blocks, without the fluid and the watermark of the first visit, its content 880 pixels wide at most:
  - « My library » in the font of the title of the first visit, 28 pixels, then the number of builds and « the last opened first », in grey;
  - a strip to drop the files on, the zone of the first visit made low and wide (84 pixels): its icon on the left, « Add a build » over « Drop .build files here, or click to choose them »; on its right, against it, **Paste JSON**, a button in the style of the + of the band of the open builds (the full height of the strip, square, white, its words in the colour of the band, the white a little dimmed and the words a little larger on hover; the owner, 2026-11-18). While a file is over the page, it lights up like the zone; Paste JSON turns it into a field 200 pixels high, as on the first visit, the button becoming **Drop a file instead**;
  - a row per build, 56 pixels high, the rows touching, one in two a shade lighter than the other, for the eye to follow a row (the owner, 2026-11-18); each row a link but for its bin, lighter on hover: a click anywhere opens the build, or shows its tab when it is already open (the owner, 2026-11-18, rather than a word Open, greyed for an open build): the portrait square the full height of the row, in colour; the name, cut to fit, in full in its title, over « by author · ascendancy (class) · levels 1–100 » (no « by » when the file has no author; « snapshot » when its entries have no levels; the levels from the lowest start to the highest end of its entries); when it was opened last (« today, 18:02 », « yesterday, 21:30 », « 12 Nov »); the bin, empty, drawn in its outline alone, grey, red on hover, its lid rising 1 pixel, level (the owner, 2026-11-18), its own button: a click on it never opens the build;
  - the bin asks once, in the row, which is no longer a link while it asks: in its place, a red shade, « Remove “name” from the library for good? », « Its tab closes too. » when the build is open, **Remove** in the red of the errors, **Cancel** in words; a long name is cut, never the question;
  - at the foot, « Your builds stay in this browser. Nothing is sent anywhere. ».
- Files dropped anywhere, on any page, open.
- **The notices** (2l3, the owner, 2026-11-18): a band the whole width of the window, between the band of the site and the band of the open builds, so that a tab always touches the page it shows (on the library with no build open, under the band of the site: the same place); each stays until it is closed, several stacked, the errors first. No border and no icon: an error is told by a red shade (the red of the errors at 14 % over the page) and its words, private browsing by a grey one; its words 2 pixels smaller than the text of the page, none in bold, starting at the margin of the brand; on its right, centred on its height, the close button, a square of 44 pixels, its × of 16 pixels in the vivid red of the errors (grey on private browsing), turning white and growing like the + of the band of the open builds on hover, without turning:
  - **the files refused** when a build of the drop opens: the build is shown, and the notice lists each file refused, its name in the colour of the text, its reason in the red, and, for JSON that breaks, the text of its line in the monospaced font (« Ritualist poison.build isn't valid JSON at line 12: "level": 12,, »); no title that counts them: the list says it;
  - **private browsing**, grey, not an error, shown at every visit (a private window forgets that it was closed): « This browser keeps nothing », then « Private browsing: the builds you open will be gone once it's closed. Download .build keeps the file of a build. »; at the first visit, the foot of the page says it in place of « Your builds stay in this browser. Nothing is sent anywhere. ».
- **Merge…** is a page of its own: the open builds with a box to tick, the ticked ones in the order of their start levels (each in a field, with the levels it applies to), the merged guide as a track of named segments, the checks (what blocks stands out, what only warns doesn't), the name and the author, and **Merge N builds**, greyed while something blocks.
- **Download .build** answers in a box under its button: where the game reads the file.

### The style

- **Frost Night is the reference style** (the owner, 2026-11-18): dark, a blue black, one blue. Every setting is tuned on it first; Frost (light) and Ember (amber on a neutral grey) derive from it and are adjusted after, the light one in a pass of its own, since a shadow, a texture or a grey portrait don't carry over as they are.
- **Manrope for every role** (the owner, 2026-11-18, among 85 fonts): the text, the titles (600, spaced -0.02 em) and the numbers, which take its figures of one width so that the levels line up; the name alone in Archivo (see The brand), and the big titles of the home page and of the library with it; the code (a pasted JSON, the line of an error) in the monospace font of the system.
- **The colours of a change** (the owner, 2026-11-19, those of the rise, the warning and the fall of Exile Market, tuned together on a blue night): what comes `#5fcf80`, what replaces another `#f0b85a`, what goes `#e66a5c`, on the signs only, apart from the red of the errors and from the colours of the attributes.
- **The colours of the attributes**, of the gems as in the game (the owner, 2026-11-19, those of Exile Market): strength `#e0473f`, dexterity a true green `#3fbf4f`, intelligence `#5aa7f0`, apart from the green and the red of a change.
- **The graph paper at 3 % everywhere** (the owner, 2026-11-18): behind the blocks, the bands and the tree, and on the home page, the first visit and the library alike; its colour and its size are settled in the first component where they matter, from 2f (the owner, 2026-11-18: one component at a time, from top to bottom).

### The brand

Decided by the owner on the mock-up (step 2, 2026-11-17), its reference.

- **The mark**: the owner's own, two rings of a triangle pointing down, the outer one in three bars, the inner one a P, every edge flat or at 60°; in its bold weight (bars a little wider than the gaps). Its frame is in the accent, its P in the colour of the text around it.
- **In the band of the site**: the mark at 24 pixels, then « Pathweaver » in Archivo 700, spaced -0.06 em, at 16 pixels, 8 pixels apart, the middle of its capitals 1 pixel below the middle of the mark, tuned by eye.
- **The favicon**: the same mark, an SVG drawn at 16 pixels, its frame in the accent, its P dark or light after the scheme of the system, as the browser draws its tabs.
- Set aside: the weights as drawn, even and light, the mark on the pixel grid (sharper at 16 pixels, but a second drawing), the P alone, the mark on a square of the accent, the frame or the whole mark in one ink.

### Languages

- Version 1 is in English. Every text of the interface is in the translation file of English, none in the code, so that French is added in version 1.x without touching the code; the game data are loaded per language for the same reason.

## The `.build` format

Version 1 of the format, experimental, documented by Grinding Gear Games at <https://www.pathofexile.com/developer/docs/game#buildplanner>; read by `crates/build-file`. Path of Exile 2 leaves early access with its version 1.0 on 2026-12-11: the format may change then. What the files in the wild do with it: [docs/build-files-in-the-wild.md](docs/build-files-in-the-wild.md).
