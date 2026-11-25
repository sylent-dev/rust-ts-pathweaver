# The texts of the interface in English, the reference language: every other language has
# the same messages. The syntax is Fluent's: https://projectfluent.org/fluent/guide/

app-name = Pathweaver
# The title of the page in the browser, its tab and its bookmarks.
app-page-title = { app-name } · Build viewer and planner for Path of Exile 2

## The band of the site, and the links that float over the first visit.

# The name a screen reader gives the links of the band of the site.
site-band = Site
# Opens a new issue on GitHub.
site-report-bug = Report a bug
# Opens the box of what the next versions bring, and names it.
site-whats-next = What's next
# The name a screen reader gives a link of the site, which opens in a new tab. $label (String): its words.
site-link-new-tab = { $label } (opens in a new tab)

## The home page at the first visit.

# The game, small, in capitals, over the title.
first-visit-game = Path of Exile 2
first-visit-title = Weave your path to level 100
# The three things a build shows, around the drop zone, in capitals.
first-visit-shows-tree = The passive tree
first-visit-shows-skills = The skills
first-visit-shows-gear = The gear
# The sites and the tools the .build files come from: brand names, never translated.
first-visit-sources = From Mobalytics · Maxroll · poe.ninja · Path of Building
first-visit-stays = Your builds stay in this browser. Nothing is sent anywhere.
first-visit-foot = { first-visit-sources } · { first-visit-stays }

## The drop zone: a click chooses the files, the files dropped anywhere on the page open.

drop-zone-title = Add your first build
drop-zone-call = Drop a .build file here, or click to choose it
# While files are dragged over the page.
drop-zone-let-go = Let go to open it
# $count (Number): the files dragged over the page, from 1.
drop-zone-files-over =
    { $count ->
        [one] 1 file over the page
       *[other] { $count } files over the page
    }

## Paste JSON: the drop zone become a field, where the JSON of a build pasted opens at once.

# Under the zone, a link in words.
paste-json = Paste JSON
# Under the field, in place of Paste JSON: gives the zone back.
paste-back = Drop a file instead
# The name of the field for a screen reader.
paste-field = The JSON of a build
paste-title = Paste the JSON of a build
paste-call = Ctrl+V: it opens at once · Esc: back to the files
# $reason (String): one of the refused- messages below, never refused-not-text nor
# refused-unreadable, which a text pasted can't be.
paste-refused = This text { $reason }

## The phone page: one message in place of every page, under 600 pixels. One sentence a line.

phone-title = Pathweaver needs a computer
phone-why-computer = It is made for a computer next to the game:
phone-why-screen = its passive tree needs a large screen.

## The band of the open builds, under the band of the site.

# The name a screen reader gives the band.
builds-band = Open builds
# The close button of a tab. $name (String): the name of the build, as its file writes it.
builds-close = Close { $name }
# The + at the end of the band: opens the choice of files of the system.
builds-add = Open .build files
# The name a screen reader gives « +N ▾ », which lists the builds the band has no tab for: it
# starts with what the button shows (+N), so that a voice names it as it reads.
# $count (Number): those builds, from 1.
builds-more =
    { $count ->
        [one] +1 more build
       *[other] +{ $count } more builds
    }

## The header of a build.

# Before the ascendancy, after a « · ». $author (String): as the file writes it.
build-by = by { $author }
# In the weak grey, in place of the name of a build that shows nothing (spaces, marks of direction).
build-untitled = Untitled build

## The tabs of the page of a build.

tab-overview = Overview
tab-skills = Skills
tab-tree = Tree
tab-inventory = Inventory
tab-about = About

## Why a file is refused, written after its name, which the page shows in the colour of the text
## and the reason in the red; without a period at its end (the owner, 2026-11-23).

# $bytes (Number), $limit (Number): the size of the file and the largest the core reads.
refused-too-large = is { $bytes } bytes, larger than { $limit }
# Bytes that aren't text (UTF-8), such as an image.
refused-not-text = isn't a text file
# $line (Number): from 1.
refused-not-json = isn't valid JSON at line { $line }
refused-not-a-build = isn't a build: an object with a name
# $field (String): the place of the value in the build, such as skills[2].support_skills[0].id.
refused-wrong-value = has a value of the wrong type at { $field }
# $field (String): the place of the field in the build, such as passives[0].id.
refused-missing-field = misses the field { $field }
# A folder dropped, or a file removed or locked since it was chosen.
refused-unreadable = couldn't be read by the browser
# $count (Number): the files refused that aren't listed, from 2.
refused-more = and { $count } more

## The drop zone of the first visit, when no file of a drop opens: what went wrong, over the
## files refused and their reasons.

# One file, which isn't text.
refused-zone-not-a-build-file = That isn't a .build file
# One file, for any other reason.
refused-zone-unreadable = That build can't be read
refused-zone-several = These files can't be read

core-load-failed = The core of Pathweaver could not load.

## The notices, between the band of the site and the band of the open builds.

# The close button of a notice.
notice-close = Close

## The box of What's next: a card for each update to come, its version, its name, a line, then
## what it brings, a line each.

# The close button of the box.
next-close = Close
# Small, in capitals, over the name of an update. $version (Number): the version, such as 2.
next-version = Version { $version }
next-editor-name = The Editor Update
next-editor-line = Plan your own build
next-editor-tree = Passives allocated on the tree
next-editor-gems = Gems and their supports chosen
next-editor-hints = Your hints, level by level
next-editor-export = Exported as a .build for the game
next-community-name = The Community Update
next-community-line = Share it with every exile
next-community-publish = Your builds published
next-community-links = Short links, for a chat
next-community-search = Votes and search, by ascendancy
next-community-versions = The versions of a build
next-community-french = In French too

## The About tab: what the file says of the build besides its levels.

# In the weak grey, in place of the description of a file that has none.
about-no-description = The author wrote no description.

# The colophon, at the left of the About tab: the facts of the build, each under its title.
about-levels = Levels
about-entries = Entries
about-guide = Guide
# $lowest (Number), $highest (Number): the levels its entries cover, the highest included.
about-level-range = { $lowest }–{ $highest }
# The levels of a build that is the same at every level.
about-snapshot = a snapshot
# Its entries, each thing once over every level. $count (Number).
about-passives = { $count ->
    [one] { $count } passive
   *[other] { $count } passives
}
about-skills = { $count ->
    [one] { $count } skill
   *[other] { $count } skills
}
about-supports = { $count ->
    [one] { $count } support
   *[other] { $count } supports
}
about-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}
# Small and grey under the guide, when the file names none and its description does.
about-guide-from-description = from the description
# In the weak grey, in place of the guide of a build that names none.
about-no-guide = none

## An author's text: a description or a note, with the markup of the game.

# In the weak grey, a space after the last piece of a text the core cut (1,000 pieces kept).
author-text-cut = …
