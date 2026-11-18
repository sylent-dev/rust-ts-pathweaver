# Specifications

What Pathweaver does, as the user sees it. Version 1 was specified at step 0 of [roadmap.md](roadmap.md) on 2026-11-16, from a corpus of 32 real `.build` files (see [docs/build-files-in-the-wild.md](docs/build-files-in-the-wild.md)); the later versions are specified when their turn comes.

## Purpose

Path of Exile 2 reads `.build` files in its Build Planner since version 0.5: a JSON file that lists the passives, the skill gems and their supports, and hints on the inventory slots, each for a range of levels of the character. Guide sites and tools (poe.ninja, Maxroll, Mobalytics, Path of Building converters) export them; the only way to see what a file holds, before putting it in the game folder, is to read its JSON.

Pathweaver (the build viewer and planner of Path of Exile 2: the subtitle that goes with the name everywhere, so that it is found by those who search for a build planner) shows a `.build` file as a player reads a build: its passive tree, its skills and its gear, at each level of the character. Later, it edits them; then, in version 2, it hosts them for everyone to share.

## Design principles

- **The `.build` file is the native format.** Not an export of a format of our own: a file opens whatever tool made it, and is written back without losing a field another tool put in it.
- **Level by level.** A build is a progression: the interface follows a level of the character, not separate profiles.
- **A personal tool first.** Versions 1 and 1.5 serve the player who uses them: no account, no server, a static website; nothing leaves the browser unless the user copies a link.
- **The rules in Rust, once.** The reading, the checks, the levels, the merging and the passive tree are in the core, so that the same code checks a file in the browser and, in version 2, on the server.
- **The game data come from the game; so do the portraits and the passive tree.** The names and the stats come from the data of the game, never typed by hand (see [docs/game-data.md](docs/game-data.md)). The images of the game are the portraits of the classes and ascendancies, so that a build is recognized at a glance, and the icons and frames of the passives, which give the tree its charm (the owner, 2026-11-18); the other shapes and marks are drawn for Pathweaver.
- **The documentation of Grinding Gear Games wins.** When the files in the wild disagree with the [documentation of the format](https://www.pathofexile.com/developer/docs/game#buildplanner), Pathweaver follows the documentation, and still reads the file.

## Versions

| Version | Content |
|---|---|
| 1 | The viewer, for oneself: open one or several files, see their skills, tree and inventory at each level, merge the files of a guide into one, share a build by a link that holds it, keep one's builds in the browser. In English. |
| 1.5 | The editor, for oneself: allocate passives on the tree, choose gems, write the hints, export the `.build` file. |
| 1.x | French: the interface and the names of the game, once the French translations of the game have settled after its version 1.0 (2026-12-11). |
| 2 | The community: accounts, published builds, votes for the best builds, search, versions of a build and what changed between two. Hosted on Cloudflare (Workers, D1, R2). |
| 3 | The price of a build, with the prices of Exile Market. |

## Out of scope

- **Damage and defences.** A `.build` file holds no item, and computing a character is the work of Path of Building. Pathweaver shows what the build takes, not what it deals.
- **Phones and consoles.** Pathweaver is used on a computer (see [Screens](#screens)). On console, the game doesn't read local files: the players subscribe to builds on the website of Grinding Gear Games.
- **Translating the author's texts.** The name, the description and the hints of a build are shown as their author wrote them, in their language.
- **The images of the game, other than the portraits and the passive tree.** Gems and uniques are shown by their names and Pathweaver's own marks.

## Version 1

### Opening builds

- Three ways to open a build: drop one or several `.build` files on the page, choose them with a click on the drop zone of the home page, or paste the JSON of a build (poe.ninja offers to copy it). They open at once, without a button to confirm. A share link and the library open builds too (see below).
- Several builds are open at once: a list shows them by name, one of them is shown. Opening a build adds it to the list and shows it; a build is closed from the list, which takes it off the list only: it stays in the [library](#library).
- The same build opened twice (the same content) isn't added again: the one already open is shown.
- A file that can't be read is refused alone, with its name and the reason: not JSON (with the number and the text of the line of the error, so that no one has to look for it), not a build (no `name`), a value of the wrong type (with its field), larger than 1 MB (the largest file of the corpus is 72 KB). The other files dropped with it open.
- A byte order mark at the start of a file is skipped.

### The header of a build

- The name of the build, its author, its ascendancy (name and class, from the game data) and its description, with the [markup](#the-authors-texts) of the game.
- The `link` of the file (documented by Grinding Gear Games, usually the page of the guide) is shown as a link that opens in a new tab, only if it starts with `https://`; otherwise as plain text.

### The level

- The level of the character is chosen with a slider from 1 to 100, and with **markers**: one at each level where a skill, a support or an inventory hint starts or stops, or where passives stop (a respec). A passive that starts makes no marker: a file can add one at every level (99 markers on a build of the corpus, 15 without them); the passives are counted in « what changes here ». A click on the track moves the slider there.
- **◀ and ▶** on both sides of the level go to the previous and the next marker, each with the level it goes to written under it; the keyboard arrows do the same.
- An entry (a passive, a skill, a support, an inventory slot) applies at a level when:
  - it has no `level_interval`: at every level;
  - its `level_interval` is `[min, max]`: from `min` to `max`, both included (`0` counts as `1`);
  - its `level_interval` is a single number `n` (allowed by the documentation, without its meaning): from `n` to 100. To check in the game.
  - an interval whose `min` is above its `max` applies at no level, and is listed among the [warnings](#unknown-and-invalid-entries).
- A build opens at the highest level it covers (100 for most).
- A build that is the same at every level (a snapshot of a character, from poe.ninja or Path of Building) has no marker; the slider says so.
- **What changes here**: at a marker, each part (skills, tree, inventory) marks what starts at this level as new, and lists what stopped just before it as removed (for instance « − 34 passives » at a respec).

### Skills

Step 4 of the roadmap.

- The skill gems that apply at the level, each with its supports under it, in the order of the file. A support is shown when both it and its skill apply.
- Each gem shows its name from the game data, with a mark of its own for its kind (skill, support, spirit) and its colour (strength, dexterity, intelligence); on hover, its tags and its description from the game data, then the hint of the author (`additional_text`).
- Two lines of the same skill with different intervals (the same gem from 1 to 5, then from 6 to 14 with more supports) are two entries: at a level, only the one that applies is shown.

### Passive tree

Step 5 of the roadmap.

- The whole passive tree of the game, at the positions of the game, drawn with the icons and frames of the game for each kind of passive (small, notable, keystone, jewel socket, ascendancy); moved with the mouse and zoomed with the wheel.
- At the level chosen: the passives the build has taken up to this level are lit; the passives it takes later are shown faded; the others are dimmed.
- The ascendancy of the build, with its passives, beside the tree.
- The weapon sets: the passives with a `weapon_set` of 1 or 2 belong to that set; a switch shows set 1 or set 2 on top of the shared passives (`weapon_set` 0 or absent).
- On hover, a passive shows its name and its stats from the game data, then the hint of the author.
- The number of points the build has spent at the level: passives, ascendancy points, and those of each weapon set.

### Inventory

Step 6 of the roadmap.

- The inventory of the character laid out as in the game: weapons and offhands of both weapon sets, helmet, body armour, gloves, boots, belt, amulet, rings, flasks, charms.
- A slot with a hint at the level is marked; on hover or click, it shows the hint and, when it names one, the unique item (`unique_name`) with its kind and its stats from the game data.
- `slot_x` and `slot_y` say which cell of a slot with several cells the hint is for.
- A `.build` file holds no item: an empty slot is just a slot the build says nothing about.

### The author's texts

- The description and the hints (`additional_text`) are shown with the markup of the game: the fonts `r`, `b`, `i`, `u`, `s`, `m`, `l`, the named colours and `rgb(r, g, b)`, nested; line breaks (`\n` or `\r\n`) are kept.
- A tag Pathweaver doesn't know is shown as plain text. The texts of a file are never read as HTML: a file or a link from someone else is untrusted.

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

### Share link

Step 8 of the roadmap.

- **Copy link** puts in the clipboard an address of Pathweaver that holds the whole build, compressed, after the `#`: the browser never sends that part to the server, so nothing is stored anywhere.
- Opening such a link opens the build, as a file would.
- The length of the link is shown; above 2,000 characters (a Discord message), a note says that it may not fit in a message. On the corpus, half of the builds fit in 1,900 characters, all in 7,400.
- A link that is damaged or cut opens nothing and says why.

### Library

Step 9 of the roadmap.

- The library holds every build opened in this browser; the list of open builds holds those at hand. Opening a build adds it to both; closing it takes it off the list of open builds, never out of the library.
- The open builds are open again at the next visit, with the level each was shown at.
- The home page lists the builds of the library, the last opened first; one opens from there, or is removed from the library for good, which closes its tab when it is open. Once the last build is removed, the home page is the first visit again.
- The builds are kept only in this browser, on this computer. When the browser refuses to keep them (private browsing), Pathweaver works the same and says that nothing will be kept.

### Screens

- Pathweaver is used on a computer, from a window as narrow as half of a 1920-pixel screen, so that it fits next to the game. The minimum width is **900 pixels** (half of a 1920-pixel screen, less the borders of the browser and its scroll bar): below it, the page keeps its width and scrolls sideways.
- Below 600 pixels (a phone), a page says that Pathweaver is used on a computer; when it was opened from a share link, it shows the name of the build and a button to copy the link.

### Window layout

Agreed on the wireframes of [docs/wireframes/pathweaver.excalidraw](docs/wireframes/pathweaver.excalidraw) on 2026-11-16; the variants set aside are in `archive.excalidraw`. The wireframe only fixed this first layout: once approved, the mock-up of step 2 is the reference.

- **The portrait of the ascendancy** (of the class when the build has none) marks a build wherever it is named: its tab, its row of the library, its header, the phone page of a share link.
- **Two bands of 44 pixels at the top of every page but the first visit** (the owner, 2026-11-17; sketch in [docs/wireframes/app-bands.excalidraw](docs/wireframes/app-bands.excalidraw)), the site above, the open builds below, so that the menu of version 2 has its own room; the band of the open builds only while a build is open (the owner, 2026-11-18): with nothing open, the home page comes right under the band of the site; the band of the site takes the graph paper of the blocks, the band of the open builds a very light shadow under it:
  - **the band of the site**: the brand (see The brand), which leads to the home page; just after it, **My library**, the way back to the home page, the library, from anywhere (the owner, 2026-11-18), in the colour of the text while the library is shown, without its line, which only answers the hover (the owner, 2026-11-18); on the right, two links in words, the three in Manrope 600, in the colour of the frame of the logo, each the full height of the band, on hover the words turning to the colour of the text and a line of 2 pixels in that colour drawing itself under them from the left, leaving to the right: **Report a bug**, which opens a new issue on GitHub, and **What's next**, which opens a box of what version 2 brings, the community (its wording and its look are drawn with the other boxes); not a Sign in, which would lead nowhere in version 1. Version 2 adds the menu, the search, the settings and the account to it; version 1 has no settings.
  - **the band of the open builds**, at every width, in the shade of the band of the site (both light in the light style, both dark in the dark ones), the graph paper of the band of the site telling them apart: their tabs, the full height of the band, side by side, with square corners, without a box, by contrast: the current one in the full colour of the text and the only portrait in colour, the others in a weaker text, their portraits grey and dimmed (less on hover); the portrait square the full height of the tab, the largest square inside the disc the game gives; the name of the build as its file writes it, over the name of its ascendancy, smaller and weaker, each cut to fit, both in full on hover; the close button, always shown; 184 pixels, up to 240 when they all fit, then **+N ▾**, a menu attached under the band, in its shade, with square corners, each build that doesn't fit a tab laid down (its portrait square, its name over its ascendancy), growing out of +N ▾ when it opens and going a little past its size before it settles, then **Merge…**, then **+**, which adds a build: it leads to the library, its drop zone ready; on the library, no tab is the current one; both the full height of the band, told apart by contrast rather than borders (+N ▾ in the colour of the frame of the logo on the background of the band, turning to the colour of the text on hover and while open, like the links of the band of the site; +, the button that matters most, in the colour of the band on a white background, growing a little on hover), without a line between them.
- **The page of a build**, from top to bottom:
  - the header: the name, « by author · ascendancy (class) », and **Copy link**, **Download .build** and **⚠ warnings** (which leads to About);
  - the level band: ◀ and ▶ with the level each goes to, the level in large, the track with its markers and the cursor, « what changes at N » on the right;
  - five tabs: **Overview** (the default: the tree, and beside it what is new at this level, the skills and the inventory; side by side in a wide window), **Skills**, **Tree**, **Inventory** (the slots, and beside them the list of the hints at the level, then those to come), **About** (the description, the link to the guide, the file, the warnings).
- What is new at the level stands out (the « New at N » box, the new gems, the new passives ringed on the tree), as does the cursor of the level: the one accent of the interface.
- **The home page at the first visit** (the owner's E1b, 2026-11-18; the mock-up of step 2 is its reference), on the graph paper of the blocks over the whole window, without the band of the site: the brand floats at its top left, Report a bug and What's next at its top right (My library would lead to this page):
  - a title in the middle, « Weave your path to level 100 », in Archivo 800 at its normal width, 42 pixels, spaced -0.06 em, in sentence case, « Path of Exile 2 » over it, small, in the monospaced font, in capitals and in grey, rising from behind it as the page loads; the subtitle, « Build viewer and planner for Path of Exile 2 », is the title of the page in the browser, not on the page. No line drawn at random (set aside on 2026-11-18, with the nine variants of the first visit);
  - under it, the drop zone, 560 by 260 pixels (narrower in a window under 960 pixels, so that the notes around it keep their margin), black at 50 % over the page (65 % on hover), square corners, no border, its icon four corners around a + whose ends are cut flat like the + of the band of the open builds, the corners closing in on the + a little on hover and firmly while a file is over the page, then « Add your first build » and « Drop a .build file here, or click to choose it ». A click on the zone chooses the files; the files dropped anywhere on the page open;
  - around the zone, the three things a build shows, as the notes of a plan in white, their lines drawn to the zone, their dots beating: the passive tree, the skills, the gear; never in the accent, which marks what can be clicked;
  - under the zone, **Paste JSON**, a link in words like those of the band of the site, not the button of the library, so that the zone stays the one call of the page: most will drop a file (the owner, 2026-11-18);
  - at the foot of the page, the sources of the files (Mobalytics · Maxroll · poe.ninja · Path of Building) and « Your builds stay in this browser. Nothing is sent anywhere. »;
  - behind, the mark of the brand, large, in a watermark at 3 %; over the graph paper, a fluid in white runs along its main lines (every 48 pixels) under the pointer, in veins that beat (a volatility of 65 %, a persistence of 975, tuned by the owner), still when the system asks for less motion; while a file is over the page, the whole grid lights up in the accent, the zone grows a little with its notes and says « Let go to open it ».
- **The files the first visit refuses**: when no file of a drop opens, the zone stays, without its icon, a thin line in the red around it, and says why in its middle: what went wrong (« That isn't a .build file », « That build can't be read »), its reason in a vivid red (#ef4444, apart from the red of the gems of strength, so that an error never reads as strength) naming the file and what it is (« passive-tree.png is an image, not a build. », « Ritualist poison.build isn't valid JSON at line 12. »), the call to drop again at its foot, until the next drop. When a build of the drop opens, it is shown and a notice names the files refused.
- **Paste JSON** turns the zone itself into a field, in its place, its size and its black, the caret in it, a thin line in the accent around it while the caret is there, « Paste the JSON of a build » and « Ctrl+V: it opens at once · Esc: back to the files » in it until a text is typed; the link under it becomes **Drop a file instead**, which gives the zone back, like Esc. A paste opens the build at once, without a button; the field takes the paste of the keyboard, so the browser asks no permission. A text that isn't a whole build stays in the field, its line and its reason in the red, the reason at its foot (« That isn't the JSON of a whole build: it stops at line 7. »), until the next paste.
- **The home page afterwards, the library** (2l2), reached from My library and from the + of the band of the open builds: the two bands at its top, the band of the open builds while one is open, no tab the current one; under them a calm page on the graph paper of the blocks, without the fluid and the watermark of the first visit, its content 880 pixels wide at most:
  - « My library » in the font of the title of the first visit, 28 pixels, then the number of builds and « the last opened first », in grey;
  - a strip to drop the files on, the zone of the first visit made low and wide (84 pixels): its icon on the left, « Add a build » over « Drop .build files here, or click to choose them »; on its right, against it, **Paste JSON**, a button in the style of the + of the band of the open builds (the full height of the strip, square, white, its words in the colour of the band, the white a little dimmed and the words a little larger on hover; the owner, 2026-11-18). While a file is over the page, it lights up like the zone; Paste JSON turns it into a field 200 pixels high, as on the first visit, the button becoming **Drop a file instead**;
  - a row per build, 56 pixels high, the rows touching, one in two a shade lighter than the other, for the eye to follow a row (the owner, 2026-11-18); each row a link but for its bin, lighter on hover: a click anywhere opens the build, or shows its tab when it is already open (the owner, 2026-11-18, rather than a word Open, greyed for an open build): the portrait square the full height of the row, in colour; the name, cut to fit, in full in its title, over « by author · ascendancy (class) · levels 1–100 » (no « by » when the file has no author; « snapshot » when its entries have no levels; the levels from the lowest start to the highest end of its entries); when it was opened last (« today, 18:02 », « yesterday, 21:30 », « 12 Nov »); the bin, grey, red on hover, its lid opening a little from the left, its hinge on the right (the owner, 2026-11-18), its own button: a click on it never opens the build;
  - the bin asks once, in the row, which is no longer a link while it asks: in its place, a red shade, « Remove “name” from the library for good? », « Its tab closes too. » when the build is open, **Remove** in the red of the errors, **Cancel** in words; a long name is cut, never the question;
  - at the foot, « Your builds stay in this browser. Nothing is sent anywhere. ».
- Files dropped anywhere, on any page, open.
- **Opening errors**: the first build opened is shown, and a notice names each file refused with its reason; it stays until it is closed. A damaged share link and private browsing are notices under the two bands at the top.
- **Merge…** is a page of its own: the open builds with a box to tick, the ticked ones in the order of their start levels (each in a field, with the levels it applies to), the merged guide as a track of named segments, the checks (what blocks stands out, what only warns doesn't), the name and the author, and **Merge N builds**, greyed while something blocks.
- **Copy link** and **Download .build** answer in a box under their button: the length of the link and the Discord warning; where the game reads the file.

### The style

- **Frost Night is the reference style** (the owner, 2026-11-18): dark, a blue black, one blue. Every setting is tuned on it first; Frost (light) and Ember (amber on a neutral grey) derive from it and are adjusted after, the light one in a pass of its own, since a shadow, a texture or a grey portrait don't carry over as they are.
- **The graph paper at 3 % everywhere** (the owner, 2026-11-18): behind the blocks, the bands and the tree, and on the home page, the first visit and the library alike; its colour and its size are settled at 2d.

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
