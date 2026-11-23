# The texts of the interface in English, the reference language: every other language has
# the same messages. The syntax is Fluent's: https://projectfluent.org/fluent/guide/

app-name = Pathweaver
app-tagline = The build viewer and planner of Path of Exile 2.

## The phone page: one message in place of every page, under 600 pixels. One sentence a line.

phone-title = Pathweaver needs a computer
phone-why-computer = It is made for a computer next to the game:
phone-why-screen = its passive tree needs a large screen.

## The first page, replaced by the viewer.

drop-build = Drop a .build file here, or choose one.
build-name = Name
build-author = Author
build-ascendancy = Ascendancy
build-link = Link
build-unknown = Not given
# $reason (String): one of the refused- messages below.
build-unreadable = This file can't be read: { $reason }
# $bytes (Number), $limit (Number): the size of the file and the largest the core reads.
refused-too-large = it is { $bytes } bytes, larger than { $limit }.
# $line (Number): from 1. $excerpt (String): the text of that line, cut around the error.
refused-not-json = it isn't JSON, at line { $line }: { $excerpt }
refused-not-a-build = it isn't a build: an object with a name.
# $field (String): the place of the value in the build, such as skills[2].support_skills[0].id.
refused-wrong-value = the value of { $field } isn't of the right type.
# $field (String): the place of the field in the build, such as passives[0].id.
refused-missing-field = the field { $field } is missing.
# $version (String): the version of the core, as the WebAssembly module gives it.
core-version = Core { $version }, in Rust.
core-load-failed = The core of Pathweaver could not load.
