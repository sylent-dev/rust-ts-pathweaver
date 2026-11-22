use serde_json::json;

use super::*;
use crate::fixtures::build;

fn levels_of_interval(interval: serde_json::Value) -> Option<(u32, u32)> {
    let interval: LevelInterval = serde_json::from_value(interval).unwrap();
    interval
        .levels()
        .map(|levels| (levels.first(), levels.last()))
}

#[test]
fn a_list_of_two_levels_covers_from_the_first_to_the_second_both_included() {
    let levels = LevelInterval::Levels(vec![6, 14]).levels().unwrap();

    let covered: Vec<u32> = (0..=101).filter(|level| levels.contains(*level)).collect();
    assert_eq!(covered, (6..=14).collect::<Vec<u32>>());
    assert_eq!(levels_of_interval(json!([40, 40])), Some((40, 40)));
}

#[test]
fn a_single_level_covers_from_it_to_the_highest_level() {
    assert_eq!(levels_of_interval(json!(41)), Some((41, 100)));
    assert_eq!(levels_of_interval(json!(100)), Some((100, 100)));
}

#[test]
fn a_level_of_zero_counts_as_the_first_level() {
    assert_eq!(levels_of_interval(json!([0, 100])), Some((1, 100)));
    assert_eq!(levels_of_interval(json!([0, 0])), Some((1, 1)));
    assert_eq!(levels_of_interval(json!(0)), Some((1, 100)));
}

#[test]
fn an_interval_that_ends_above_the_highest_level_stops_at_it() {
    assert_eq!(levels_of_interval(json!([90, 120])), Some((90, 100)));
}

#[test]
fn an_interval_that_covers_no_level_of_a_character_is_invalid() {
    let invalid = [
        json!([50, 10]),
        json!([2, 1]),
        json!([5, 0]),
        json!([101, 130]),
        json!(101),
        json!([]),
        json!([5]),
        json!([1, 50, 100]),
    ];

    for interval in invalid {
        assert_eq!(levels_of_interval(interval.clone()), None, "{interval}");
    }
}

#[test]
fn the_levels_two_ranges_share_are_those_of_both() {
    let levels = |interval| LevelInterval::Levels(interval).levels().unwrap();

    assert_eq!(
        levels(vec![1, 70]).shared_with(levels(vec![59, 100])),
        Some(levels(vec![59, 70]))
    );
    assert_eq!(
        levels(vec![59, 100]).shared_with(levels(vec![1, 59])),
        Some(levels(vec![59, 59]))
    );
    assert_eq!(levels(vec![1, 58]).shared_with(levels(vec![59, 100])), None);
}

#[test]
fn an_entry_without_an_interval_is_set_for_every_level() {
    let build = build(json!({
        "passives": ["strength89", { "id": "melee17", "level_interval": null }],
        "skills": [{ "id": "Earthquake", "support_skills": ["FastForward"] }],
        "inventory_slots": [{ "inventory_id": "Weapon1" }]
    }));

    let passives: Vec<Option<Levels>> = build
        .passives
        .get()
        .unwrap()
        .iter()
        .map(Entry::levels)
        .collect();
    assert_eq!(passives, [Some(Levels::ALL), Some(Levels::ALL)]);
    let skill = &build.skills.get().unwrap()[0];
    assert_eq!(skill.levels(), Some(Levels::ALL));
    assert_eq!(skill.supports()[0].levels(), Some(Levels::ALL));
    assert_eq!(
        build.inventory_slots.get().unwrap()[0].levels(),
        Some(Levels::ALL)
    );
}

#[test]
fn an_entry_is_set_for_the_levels_of_its_interval_and_for_none_when_it_is_invalid() {
    let build = build(json!({
        "skills": [
            { "id": "Earthquake", "level_interval": [6, 14] },
            { "id": "Boneshatter", "level_interval": [14, 6] }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "level_interval": 60 },
            { "inventory_id": "Ring1", "level_interval": [1, 2, 3] }
        ]
    }));

    let skills = build.skills.get().unwrap();
    assert_eq!(
        skills[0].levels(),
        LevelInterval::Levels(vec![6, 14]).levels()
    );
    assert_eq!(skills[1].levels(), None);
    let hints = build.inventory_slots.get().unwrap();
    assert_eq!(hints[0].levels(), LevelInterval::Level(60).levels());
    assert_eq!(hints[1].levels(), None);
}

#[test]
fn a_skill_written_as_its_id_alone_has_no_support() {
    let build = build(json!({ "skills": ["Earthquake", { "id": "Boneshatter" }] }));

    let supports: Vec<usize> = build
        .skills
        .get()
        .unwrap()
        .iter()
        .map(|skill| skill.supports().len())
        .collect();
    assert_eq!(supports, [0, 0]);
}

#[test]
fn the_invalid_intervals_are_listed_with_their_entry_in_the_order_of_the_file() {
    let build = build(json!({
        "passives": [
            "strength89",
            { "id": "melee17", "level_interval": [1, 50] },
            { "id": "melee18", "level_interval": [50, 1] }
        ],
        "skills": [
            {
                "id": "Earthquake",
                "level_interval": [30, 20],
                "support_skills": [
                    { "id": "FastForward", "level_interval": [1, 100] },
                    { "id": "Aftershock", "level_interval": [] }
                ]
            },
            { "id": "Boneshatter", "level_interval": 40 }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "level_interval": 101 },
            { "inventory_id": "Ring1", "level_interval": [60, 100] }
        ]
    }));

    assert_eq!(
        build.invalid_intervals(),
        [
            InvalidInterval {
                entry: EntryName::Passive { id: "melee18" },
                interval: &LevelInterval::Levels(vec![50, 1]),
            },
            InvalidInterval {
                entry: EntryName::Skill { id: "Earthquake" },
                interval: &LevelInterval::Levels(vec![30, 20]),
            },
            InvalidInterval {
                entry: EntryName::Support {
                    id: "Aftershock",
                    skill: "Earthquake"
                },
                interval: &LevelInterval::Levels(vec![]),
            },
            InvalidInterval {
                entry: EntryName::Hint { slot: "Weapon1" },
                interval: &LevelInterval::Level(101),
            },
        ]
    );
}

#[test]
fn a_build_without_an_invalid_interval_lists_none() {
    let every_field = include_str!("../../tests/builds/every-field.build");

    assert_eq!(Build::read(every_field).unwrap().invalid_intervals(), []);
}
