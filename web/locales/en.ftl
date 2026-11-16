# The texts of the interface in English, the reference language: every other language has
# the same messages. The syntax is Fluent's: https://projectfluent.org/fluent/guide/

app-name = Pathweaver
app-tagline = The build viewer and planner of Path of Exile 2.

## The first page, replaced by the viewer.

drop-build = Drop a .build file here, or choose one.
build-name = Name
build-author = Author
build-ascendancy = Ascendancy
build-contents = Contents
build-unknown = Not given
# $passives (Number), $skills (Number), $slots (Number): the entries of each kind in the file.
build-counts =
    { $passives ->
        [one] { $passives } passive
       *[other] { $passives } passives
    }, { $skills ->
        [one] { $skills } skill
       *[other] { $skills } skills
    }, { $slots ->
        [one] { $slots } inventory hint
       *[other] { $slots } inventory hints
    }
# $reason (String): the sentence of the core, in English.
build-unreadable = This file can't be read: { $reason }
# $version (String): the version of the core, as the WebAssembly module gives it.
core-version = Core { $version }, in Rust.
core-load-failed = The core of Pathweaver could not load.
