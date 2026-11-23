# The texts of the interface in English, the reference language: every other language has
# the same messages. The syntax is Fluent's: https://projectfluent.org/fluent/guide/

app-name = Pathweaver
# The title of the page in the browser, its tab and its bookmarks.
app-page-title = { app-name } · Build viewer and planner for Path of Exile 2

## The band of the site, and the links that float over the first visit.

# Opens a new issue on GitHub.
site-report-bug = Report a bug
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

## The phone page: one message in place of every page, under 600 pixels. One sentence a line.

phone-title = Pathweaver needs a computer
phone-why-computer = It is made for a computer next to the game:
phone-why-screen = its passive tree needs a large screen.

## What a build opened is, until the page of a build.

build-name = Name
build-author = Author
build-ascendancy = Ascendancy
build-link = Link
build-unknown = Not given
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

# $version (String): the version of the core, as the WebAssembly module gives it.
core-version = Core { $version }, in Rust.
core-load-failed = The core of Pathweaver could not load.
