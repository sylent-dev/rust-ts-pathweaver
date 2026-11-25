//! The totals of the builds of the corpus (`docs/build-files-in-the-wild.md`), whose files are
//! kept out of Git in `inputs/builds/`: the numbers `specs.md` quotes, to record again when the
//! rules of what a build holds or the corpus change. Run it with
//! `cargo test -p pathweaver-build-file corpus -- --ignored`.

use super::tests::held_over_every_level;
use crate::HeldTotals;
use crate::fixtures::corpus;

/// The totals of a build: its passives, its skills, its supports and its hints.
type Totals = (usize, usize, usize, usize);

/// Measured on 2026-11-24, on the 32 files of 2026-11-16. The entries of the files say more
/// where a tool lists a thing again: 189 passives for 164 on the annotated Comet of Mobalytics,
/// 383 for 138 on the campaign of poe2-tools, which writes each passive again at each level.
const TOTALS: [(&str, Totals); 32] = [
    ("chatgpt-untether-gemling.build", (123, 0, 0, 0)),
    ("companion-fixture-deadeye.build", (132, 2, 2, 3)),
    ("ferox-shield-wall-leveling.build", (0, 9, 52, 0)),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-01-14.build",
        (23, 7, 5, 14),
    ),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-31-41.build",
        (69, 8, 17, 12),
    ),
    (
        "fubgun-ice-shot-deadeye-leveling-lvl-60.build",
        (119, 9, 24, 12),
    ),
    ("ggg-titan-warrior-docs.build", (34, 4, 8, 9)),
    ("ggg-titan-warrior-sample.build", (34, 4, 8, 9)),
    ("maxroll-aer0-ice-shot-amazon.build", (171, 16, 58, 26)),
    (
        "maxroll-cptn-garbage-flameblast-gemling-mapping.build",
        (149, 11, 34, 9),
    ),
    (
        "mobalytics-animeprincess-coc-comet-annotated.build",
        (164, 10, 35, 14),
    ),
    (
        "mobalytics-animeprincess-coc-comet-basic.build",
        (161, 10, 33, 15),
    ),
    (
        "mobalytics-animeprincess-coc-comet-endgame-mageblood.build",
        (165, 11, 37, 13),
    ),
    (
        "mobalytics-fubgun-flameblast-endgame.build",
        (159, 7, 26, 15),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-01-14.build",
        (21, 7, 7, 9),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-15-32.build",
        (53, 7, 11, 9),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-33-51.build",
        (74, 6, 10, 9),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-52-swap.build",
        (97, 6, 17, 15),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-53-68.build",
        (130, 6, 22, 15),
    ),
    (
        "mobalytics-fubgun-flameblast-lvl-85.build",
        (147, 7, 26, 15),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-early.build",
        (133, 10, 36, 15),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-live-gear.build",
        (177, 10, 42, 16),
    ),
    (
        "mobalytics-fubgun-ice-shot-deadeye-uber-endgame.build",
        (166, 10, 39, 15),
    ),
    (
        "mobalytics-guythatdies-varashta-lvl-01-19.build",
        (26, 11, 10, 11),
    ),
    (
        "mobalytics-guythatdies-varashta-lvl-19-swap.build",
        (26, 4, 7, 13),
    ),
    (
        "mobalytics-guythatdies-varashta-lvl-20-58.build",
        (89, 10, 18, 15),
    ),
    ("pob-twobyul-deadeye.build", (132, 10, 41, 0)),
    ("pobr-summoner-lv98.build", (130, 13, 44, 0)),
    ("pobr-writer-fixture.build", (2, 1, 1, 1)),
    (
        "poe-ninja-disciple-of-varashta-lvl-22-65.build",
        (90, 14, 22, 0),
    ),
    (
        "poe2-tools-fubgun-ice-shot-campaign.build",
        (138, 16, 36, 11),
    ),
    ("utkarshbehre-spark-comet.build", (0, 16, 81, 1)),
];

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_totals_of_the_corpus_are_those_recorded() {
    let totals: Vec<_> = corpus()
        .iter()
        .map(|(name, build)| {
            let HeldTotals {
                passives,
                skills,
                supports,
                hints,
            } = build.held_totals();
            (name.clone(), (passives, skills, supports, hints))
        })
        .collect();
    let recorded: Vec<_> = TOTALS
        .iter()
        .map(|(name, totals)| ((*name).to_owned(), *totals))
        .collect();
    assert_eq!(totals, recorded);
}

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_totals_of_the_corpus_are_what_each_build_holds_at_one_level_at_least() {
    for (name, build) in corpus() {
        assert_eq!(build.held_totals(), held_over_every_level(&build), "{name}");
    }
}

#[test]
#[ignore = "reads the corpus of inputs/builds, kept out of Git"]
fn the_passives_of_the_files_quoted_are_fewer_than_their_entries() {
    let corpus = corpus();
    let passives = |name: &str| {
        let build = &corpus[name];
        let entries = build.passives.get().map_or(0, Vec::len);
        (entries, build.held_totals().passives)
    };

    assert_eq!(
        [
            passives("mobalytics-animeprincess-coc-comet-annotated.build"),
            passives("poe2-tools-fubgun-ice-shot-campaign.build"),
        ],
        [(189, 164), (383, 138)]
    );
}
