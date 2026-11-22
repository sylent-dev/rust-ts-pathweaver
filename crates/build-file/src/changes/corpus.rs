//! The levels and the changes of the builds of the corpus (`docs/build-files-in-the-wild.md`),
//! whose files are kept out of Git in `inputs/builds/`: the numbers `specs.md` quotes, to
//! record again when the rules of the levels or the corpus change. Run it with
//! `cargo test -p pathweaver-build-file corpus -- --ignored`.

use std::collections::BTreeMap;
use std::path::Path;
use std::time::Instant;

use crate::{Build, Change};

/// The builds of the corpus, by the name of their file.
fn corpus() -> BTreeMap<String, Build> {
    let folder = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../inputs/builds");
    let files = std::fs::read_dir(folder)
        .unwrap()
        .map(|file| file.unwrap().path());
    files
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "build")
        })
        .map(|path| {
            let name = path.file_name().unwrap().to_str().unwrap().to_owned();
            let build = Build::read(&std::fs::read_to_string(&path).unwrap()).unwrap();
            (name, build)
        })
        .collect()
}

/// The levels of a build in numbers: the lowest and the highest it covers, how many have a
/// change, how many are markers, and its changes in all.
type Numbers = (u32, u32, usize, usize, usize);

fn numbers(build: &Build) -> Numbers {
    let levels = build.levels();
    let by_level = build.changes_by_level();
    let changes = by_level.iter().map(|level| level.changes.len()).sum();
    (
        levels.first(),
        levels.last(),
        by_level.len(),
        build.markers().len(),
        changes,
    )
}

/// Measured on 2026-11-22, on the 32 files of 2026-11-16.
const NUMBERS: [(&str, Numbers); 32] = [
    ("chatgpt-untether-gemling.build", (1, 100, 0, 0, 0)),
    ("companion-fixture-deadeye.build", (1, 100, 1, 1, 5)),
    ("ferox-shield-wall-leveling.build", (1, 100, 1, 1, 3)),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-01-14.build",
        (1, 100, 7, 7, 12),
    ),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-31-41.build",
        (1, 100, 11, 11, 16),
    ),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-60.build",
        (1, 100, 12, 12, 17),
    ),
    ("ggg-titan-warrior-docs.build", (1, 100, 0, 0, 0)),
    ("ggg-titan-warrior-sample.build", (1, 100, 0, 0, 0)),
    ("maxroll-aer0-ice-shot-amazon.build", (1, 100, 7, 6, 93)),
    // The only build that starts late: a guide of the maps.
    (
        "maxroll-cptn-garbage-flameblast-gemling-mapping.build",
        (65, 100, 1, 1, 11),
    ),
    // A passive a level: 83 levels with a change, 14 markers (`specs.md`, The level).
    (
        "mobalytics-animeprincess-coc-comet-annotated.build",
        (1, 100, 83, 14, 154),
    ),
    (
        "mobalytics-animeprincess-coc-comet-basic.build",
        (1, 100, 18, 18, 22),
    ),
    (
        "mobalytics-animeprincess-coc-comet-endgame-mageblood.build",
        (1, 100, 14, 14, 19),
    ),
    (
        "mobalytics-fubgun-flameblast-endgame.build",
        (1, 100, 17, 17, 21),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-01-14.build",
        (1, 100, 8, 8, 11),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-15-32.build",
        (1, 100, 8, 8, 12),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-33-51.build",
        (1, 100, 9, 9, 14),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-52-swap.build",
        (1, 100, 13, 13, 19),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-53-68.build",
        (1, 100, 13, 13, 19),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-85.build",
        (1, 100, 16, 16, 21),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-early.build",
        (1, 100, 16, 16, 25),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-live-gear.build",
        (1, 100, 14, 14, 28),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-uber-endgame.build",
        (1, 100, 13, 13, 25),
    ),
    // Its two flasks of `Flask1`, whose texts start with the same line, are one hint with two
    // texts: nothing changes until both go at 20 (`docs/backlog.md`).
    (
        "mobalytics-guythatdies-varashta-lvl-01-19.build",
        (1, 100, 1, 1, 11),
    ),
    (
        "mobalytics-guythatdies-varashta-lvl-19-swap.build",
        (1, 100, 4, 4, 9),
    ),
    (
        "mobalytics-guythatdies-varashta-lvl-20-58.build",
        (1, 100, 9, 9, 12),
    ),
    ("pob-twobyul-deadeye.build", (1, 100, 0, 0, 0)),
    ("pobr-summoner-lv98.build", (1, 100, 0, 0, 0)),
    ("pobr-writer-fixture.build", (1, 100, 0, 0, 0)),
    (
        "poe-ninja-disciple-of-varashta-lvl-22-65.build",
        (1, 100, 0, 0, 0),
    ),
    (
        "poe2-tools-fubgun-ice-shot-campaign.build",
        (1, 100, 8, 7, 66),
    ),
    ("utkarshbehre-spark-comet.build", (1, 100, 4, 4, 33)),
];

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_levels_and_the_changes_of_each_build_of_the_corpus() {
    let corpus = corpus();
    let start = Instant::now();
    let measured: Vec<(&str, Numbers)> = corpus
        .iter()
        .map(|(name, build)| (name.as_str(), numbers(build)))
        .collect();
    // 86 ms in release and 823 ms in debug on 2026-11-22: under 3 ms a build opened.
    println!(
        "the levels of {} builds read in {:?}",
        corpus.len(),
        start.elapsed()
    );

    assert_eq!(measured, NUMBERS);
}

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn a_build_that_lists_its_supports_again_at_71_changes_only_by_those_that_come() {
    let corpus = corpus();
    let build = &corpus["utkarshbehre-spark-comet.build"];

    let listed_from_71 = build.skills.get().unwrap().iter().flat_map(|skill| {
        let supports = skill.supports().iter();
        supports.filter(|support| support.levels().is_some_and(|levels| levels.first() == 71))
    });
    assert_eq!(listed_from_71.count(), 81);
    let by_level = build.changes_by_level();
    let at_71 = by_level.iter().find(|level| level.level == 71).unwrap();
    assert_eq!(at_71.changes.len(), 11);
    assert!(
        at_71
            .changes
            .iter()
            .all(|change| matches!(change, Change::SupportAdded(_)))
    );
}
