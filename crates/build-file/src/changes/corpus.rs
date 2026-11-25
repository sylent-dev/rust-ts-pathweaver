//! The levels and the changes of the builds of the corpus (`docs/build-files-in-the-wild.md`),
//! whose files are kept out of Git in `inputs/builds/`: the numbers `specs.md` quotes, to
//! record again when the rules of the levels or the corpus change. Run it with
//! `cargo test -p pathweaver-build-file corpus -- --ignored`.

use std::time::Instant;

use crate::fixtures::corpus;
use crate::{Build, Change, Entry, LevelRange, Passive, WeaponSet};

/// The levels of a build in numbers: the lowest and the highest it covers, how many have a
/// change, how many are markers, and its changes in all.
type Numbers = (u32, u32, usize, usize, usize);

fn numbers(build: &Build) -> Numbers {
    let levels = build.covered_levels();
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
    // 15 ms in release and 112 ms in debug on 2026-11-22: half a millisecond a build opened.
    println!(
        "the levels of {} builds read in {:?}",
        corpus.len(),
        start.elapsed()
    );

    assert_eq!(measured, NUMBERS);
}

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_snapshots_of_the_corpus_are_its_builds_without_a_change() {
    let corpus = corpus();
    let snapshots: Vec<&str> = corpus
        .iter()
        .filter(|(_, build)| build.is_snapshot())
        .map(|(name, _)| name.as_str())
        .collect();

    // Measured on 2026-11-25: those of NUMBERS without a change, passives included.
    assert_eq!(
        snapshots,
        [
            "chatgpt-untether-gemling.build",
            "ggg-titan-warrior-docs.build",
            "ggg-titan-warrior-sample.build",
            "pob-twobyul-deadeye.build",
            "pobr-summoner-lv98.build",
            "pobr-writer-fixture.build",
            "poe-ninja-disciple-of-varashta-lvl-22-65.build",
        ]
    );
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

/// The pairs of entries of a list that set the same thing at a level they share, each with
/// whether their notes are the same.
fn set_twice<T, K: PartialEq>(
    entries: &[T],
    key_of: impl Fn(&T) -> (K, Option<LevelRange>, Option<&str>),
) -> Vec<bool> {
    let mut pairs = Vec::new();
    for (index, entry) in entries.iter().enumerate() {
        let (key, levels, note) = key_of(entry);
        for earlier in &entries[..index] {
            let (earlier_key, earlier_levels, earlier_note) = key_of(earlier);
            let shared = levels.zip(earlier_levels).is_some_and(|(levels, earlier)| {
                levels.first().max(earlier.first()) <= levels.last().min(earlier.last())
            });
            if key == earlier_key && shared {
                pairs.push(note.map(str::trim) == earlier_note.map(str::trim));
            }
        }
    }
    pairs
}

/// A passive in its weapon set, the levels it is set for and its note.
fn passive(passive: &Entry<Passive>) -> ((String, WeaponSet), Option<LevelRange>, Option<&str>) {
    let in_set = (passive.id().to_owned(), passive.weapon_set());
    (in_set, passive.levels(), passive.additional_text())
}

/// The numbers of `docs/build-files-in-the-wild.md` (Entries) and of `specs.md` (The level),
/// measured on 2026-11-22.
#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_things_set_twice_at_one_level_in_the_corpus() {
    let corpus = corpus();
    let passives_twice: Vec<Vec<bool>> = corpus
        .values()
        .map(|build| {
            set_twice(
                build.passives.get().map(Vec::as_slice).unwrap_or_default(),
                passive,
            )
        })
        .collect();
    let pairs = passives_twice.iter().flatten();
    assert_eq!(pairs.clone().count(), 226);
    assert_eq!(pairs.filter(|same_note| !**same_note).count(), 25);
    let files = passives_twice.iter().filter(|pairs| !pairs.is_empty());
    assert_eq!(files.count(), 15);

    let skills_twice = corpus.values().flat_map(|build| {
        let skills = build.skills.get().map(Vec::as_slice).unwrap_or_default();
        set_twice(skills, |skill| {
            (
                skill.id().to_owned(),
                skill.levels(),
                skill.additional_text(),
            )
        })
    });
    assert_eq!(skills_twice.count(), 1);

    let hints_of_two_texts = corpus.values().filter(|build| {
        let levels = build.covered_levels();
        let mut held = (levels.first()..=levels.last()).map(|level| build.at_level(level));
        held.any(|held| held.hints.iter().any(|hint| hint.notes.iter().count() > 1))
    });
    assert_eq!(hints_of_two_texts.count(), 1);

    let (mut beyond, mut by_their_own_interval, mut never_with_their_skill) = (0, 0, 0);
    let skills = corpus
        .values()
        .flat_map(|build| build.skills.get().into_iter().flatten());
    for skill in skills {
        let Some(skill_levels) = skill.levels() else {
            continue;
        };
        for support in skill.supports() {
            let Some(levels) = support.levels() else {
                continue;
            };
            if levels.first() < skill_levels.first() || levels.last() > skill_levels.last() {
                beyond += 1;
                by_their_own_interval += usize::from(support.level_interval().is_some());
            }
            let shared =
                levels.first().max(skill_levels.first()) <= levels.last().min(skill_levels.last());
            never_with_their_skill += usize::from(!shared);
        }
    }
    assert_eq!(
        (beyond, by_their_own_interval, never_with_their_skill),
        (356, 297, 0)
    );
}
