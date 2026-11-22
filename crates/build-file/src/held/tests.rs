use serde_json::json;

use super::*;
use crate::fixtures::{build, held, hint, noted, passive, support};

#[test]
fn a_build_holds_at_a_level_the_things_of_the_entries_that_apply_there() {
    let build = build(json!({
        "passives": ["strength89", { "id": "melee17", "level_interval": [10, 20] }],
        "skills": [
            { "id": "Earthquake", "level_interval": [1, 9] },
            { "id": "Boneshatter", "level_interval": [10, 100] }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "unique_name": "Blackflame", "level_interval": 10 },
            { "inventory_id": "Ring1", "unique_name": "Dream Fragments", "level_interval": [1, 9] }
        ]
    }));

    assert_eq!(
        build.at_level(9),
        BuildAtLevel {
            skills: vec![held("Earthquake")],
            supports: vec![],
            passives: vec![held(passive("strength89", WeaponSet::Shared))],
            hints: vec![held(hint("Ring1", HintItem::Unique("Dream Fragments")))],
        }
    );
    assert_eq!(
        build.at_level(10),
        BuildAtLevel {
            skills: vec![held("Boneshatter")],
            supports: vec![],
            passives: vec![
                held(passive("strength89", WeaponSet::Shared)),
                held(passive("melee17", WeaponSet::Shared))
            ],
            hints: vec![held(hint("Weapon1", HintItem::Unique("Blackflame")))],
        }
    );
}

#[test]
fn a_support_applies_only_where_it_and_its_skill_both_apply() {
    let build = build(json!({
        "skills": [{
            "id": "Comet",
            "level_interval": [59, 80],
            "support_skills": [
                "Always",
                { "id": "FromTheStart", "level_interval": [1, 100] },
                { "id": "Late", "level_interval": [70, 100] }
            ]
        }]
    }));

    let supports_at = |level| build.at_level(level).supports;
    assert_eq!(supports_at(58), []);
    assert_eq!(
        supports_at(59),
        [
            held(support("Always", "Comet")),
            held(support("FromTheStart", "Comet"))
        ]
    );
    let all_three = [
        held(support("Always", "Comet")),
        held(support("FromTheStart", "Comet")),
        held(support("Late", "Comet")),
    ];
    assert_eq!(supports_at(70), all_three);
    assert_eq!(supports_at(80), all_three);
    assert_eq!(supports_at(81), []);
}

#[test]
fn two_entries_of_a_skill_with_different_levels_are_one_skill_with_the_supports_of_the_one_that_applies()
 {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "level_interval": [1, 5], "support_skills": ["Pierce"] },
            { "id": "Spark", "level_interval": [6, 14], "support_skills": ["Pierce", "Fork"] }
        ]
    }));

    let at_5 = build.at_level(5);
    assert_eq!(at_5.skills, [held("Spark")]);
    assert_eq!(at_5.supports, [held(support("Pierce", "Spark"))]);
    let at_6 = build.at_level(6);
    assert_eq!(at_6.skills, [held("Spark")]);
    assert_eq!(
        at_6.supports,
        [
            held(support("Pierce", "Spark")),
            held(support("Fork", "Spark"))
        ]
    );
}

#[test]
fn two_entries_of_a_skill_at_the_same_level_are_one_skill_with_the_supports_and_the_notes_of_both()
{
    let build = build(json!({
        "skills": [
            { "id": "Mirage", "additional_text": "Level 20", "support_skills": [
                { "id": "Pierce", "additional_text": "first" }, "Fork"
            ] },
            { "id": "Other" },
            { "id": "Mirage", "additional_text": "again", "support_skills": [
                "Chain", { "id": "Pierce", "additional_text": "second" }
            ] }
        ]
    }));

    let at_1 = build.at_level(1);
    assert_eq!(
        at_1.skills,
        [noted("Mirage", &["Level 20", "again"]), held("Other")]
    );
    assert_eq!(
        at_1.supports,
        [
            noted(support("Pierce", "Mirage"), &["first", "second"]),
            held(support("Fork", "Mirage")),
            held(support("Chain", "Mirage"))
        ]
    );
}

#[test]
fn the_same_support_on_two_skills_is_held_on_each() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "support_skills": ["Pierce"] },
            { "id": "Comet", "support_skills": ["Pierce"] }
        ]
    }));

    assert_eq!(
        build.at_level(1).supports,
        [
            held(support("Pierce", "Spark")),
            held(support("Pierce", "Comet"))
        ]
    );
}

#[test]
fn a_passive_is_held_once_in_each_weapon_set_it_is_taken_in() {
    let build = build(json!({
        "passives": [
            "melee17",
            { "id": "melee17", "weapon_set": 1, "additional_text": "in set I" },
            { "id": "melee17", "weapon_set": 2 },
            { "id": "melee17", "weapon_set": 0, "additional_text": "again" },
            { "id": "melee17", "weapon_set": 1, "additional_text": "set I again" },
            { "id": "melee17", "weapon_set": null },
            { "id": "melee17", "weapon_set": 7 }
        ]
    }));

    assert_eq!(
        build.at_level(1).passives,
        [
            noted(passive("melee17", WeaponSet::Shared), &["again"]),
            noted(
                passive("melee17", WeaponSet::First),
                &["in set I", "set I again"]
            ),
            held(passive("melee17", WeaponSet::Second)),
        ]
    );
}

#[test]
fn a_hint_names_its_unique_or_the_first_line_of_its_text() {
    let build = build(json!({
        "inventory_slots": [
            { "inventory_id": "Helm1", "unique_name": "The Black Crest", "additional_text": "Any helmet before it" },
            { "inventory_id": "BodyArmour1", "additional_text": "  <b>{Sacramental Robe} (Int Base)  \r\n  Life and resistances\n" },
            { "inventory_id": "Belt1", "unique_name": "", "additional_text": "Any belt" },
            { "inventory_id": "Ring1" },
            { "inventory_id": "Ring2", "additional_text": "   " },
            { "inventory_id": "Charm1", "additional_text": "\n Thawing Charm \nAgainst the cold" }
        ]
    }));

    assert_eq!(
        build.at_level(1).hints,
        [
            noted(
                hint("Helm1", HintItem::Unique("The Black Crest")),
                &["Any helmet before it"]
            ),
            noted(
                hint(
                    "BodyArmour1",
                    HintItem::Named("<b>{Sacramental Robe} (Int Base)")
                ),
                &["<b>{Sacramental Robe} (Int Base)  \r\n  Life and resistances"]
            ),
            noted(hint("Belt1", HintItem::Named("Any belt")), &["Any belt"]),
            held(hint("Ring1", HintItem::Unnamed)),
            held(hint("Ring2", HintItem::Unnamed)),
            noted(
                hint("Charm1", HintItem::Named("Thawing Charm")),
                &["Thawing Charm \nAgainst the cold"]
            ),
        ]
    );
}

#[test]
fn the_hints_of_a_slot_are_told_apart_by_their_item_never_by_their_place() {
    let build = build(json!({
        "inventory_slots": [
            { "inventory_id": "Charm1", "slot_x": 0, "additional_text": "Thawing Charm" },
            { "inventory_id": "Charm1", "slot_x": 1, "additional_text": "Golden Charm" },
            { "inventory_id": "Charm1", "slot_x": 2, "additional_text": "Thawing Charm\nA second one" },
            { "inventory_id": "Charm1", "slot_x": 0, "unique_name": "Thawing Charm" },
            { "inventory_id": "Trinket1", "slot_x": 0, "additional_text": "Thawing Charm" }
        ]
    }));

    assert_eq!(
        build.at_level(1).hints,
        [
            noted(
                hint("Charm1", HintItem::Named("Thawing Charm")),
                &["Thawing Charm", "Thawing Charm\nA second one"]
            ),
            noted(
                hint("Charm1", HintItem::Named("Golden Charm")),
                &["Golden Charm"]
            ),
            held(hint("Charm1", HintItem::Unique("Thawing Charm"))),
            noted(
                hint("Trinket1", HintItem::Named("Thawing Charm")),
                &["Thawing Charm"]
            ),
        ]
    );
}

#[test]
fn a_note_is_read_without_the_spaces_around_it_and_one_of_spaces_alone_is_none() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "additional_text": "  Take it early\n" },
            { "id": "melee18", "additional_text": " \n " },
            { "id": "melee19", "additional_text": null }
        ],
        "skills": [{ "id": "Spark", "additional_text": "\tMain skill ", "support_skills": [
            { "id": "Pierce", "additional_text": "" }
        ] }]
    }));

    let at_1 = build.at_level(1);
    assert_eq!(
        at_1.passives,
        [
            noted(passive("melee17", WeaponSet::Shared), &["Take it early"]),
            held(passive("melee18", WeaponSet::Shared)),
            held(passive("melee19", WeaponSet::Shared)),
        ]
    );
    assert_eq!(at_1.skills, [noted("Spark", &["Main skill"])]);
    assert_eq!(at_1.supports, [held(support("Pierce", "Spark"))]);
}

#[test]
fn an_entry_with_an_invalid_interval_is_held_at_no_level_and_neither_are_the_supports_of_such_a_skill()
 {
    let build = build(json!({
        "passives": [{ "id": "melee17", "level_interval": [50, 1] }],
        "skills": [
            { "id": "Spark", "level_interval": [30, 20], "support_skills": ["Pierce"] },
            { "id": "Comet", "support_skills": [{ "id": "Fork", "level_interval": [1, 2, 3] }] }
        ],
        "inventory_slots": [{ "inventory_id": "Weapon1", "level_interval": [] }]
    }));

    for level in 1..=100 {
        assert_eq!(
            build.at_level(level),
            BuildAtLevel {
                skills: vec![held("Comet")],
                supports: vec![],
                passives: vec![],
                hints: vec![],
            },
            "at {level}"
        );
    }
}

#[test]
fn a_build_holds_nothing_at_a_level_a_character_doesnt_have() {
    let every_field = Build::read(include_str!("../../tests/builds/every-field.build")).unwrap();
    let nothing = BuildAtLevel {
        skills: vec![],
        supports: vec![],
        passives: vec![],
        hints: vec![],
    };

    assert_eq!(every_field.at_level(0), nothing);
    assert_eq!(every_field.at_level(101), nothing);
    assert_ne!(every_field.at_level(1), nothing);
    assert_ne!(every_field.at_level(100), nothing);
}

#[test]
fn the_same_note_on_two_entries_of_a_thing_is_held_once() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "additional_text": "Early" },
            { "id": "melee17", "additional_text": " Early " },
            { "id": "melee17", "additional_text": "Late" },
            { "id": "melee17", "additional_text": "Early" }
        ],
        "skills": [
            { "id": "Spark", "level_interval": [1, 10], "additional_text": "Main skill", "support_skills": [
                { "id": "Pierce", "additional_text": "Always" }
            ] },
            { "id": "Spark", "level_interval": [5, 20], "additional_text": "Main skill", "support_skills": [
                { "id": "Pierce", "additional_text": "Always" }
            ] }
        ],
        "inventory_slots": [
            { "inventory_id": "Belt1", "level_interval": [1, 10], "additional_text": "Any belt" },
            { "inventory_id": "Belt1", "level_interval": [5, 20], "additional_text": "Any belt" }
        ]
    }));

    assert_eq!(
        build.at_level(5),
        BuildAtLevel {
            skills: vec![noted("Spark", &["Main skill"])],
            supports: vec![noted(support("Pierce", "Spark"), &["Always"])],
            passives: vec![noted(
                passive("melee17", WeaponSet::Shared),
                &["Early", "Late"]
            )],
            hints: vec![noted(
                hint("Belt1", HintItem::Named("Any belt")),
                &["Any belt"]
            )],
        }
    );
}

#[test]
fn the_notes_of_a_thing_are_kept_in_the_order_of_the_file() {
    let build = build(json!({
        "passives": [
            { "id": "intelligence59", "level_interval": [36, 100], "additional_text": "Point #47" },
            { "id": "intelligence59", "level_interval": [83, 100], "additional_text": "Point #106" },
            { "id": "intelligence59", "level_interval": [90, 100], "additional_text": "Point #47" }
        ]
    }));

    let at_90 = build.at_level(90);
    let notes: Vec<&str> = at_90.passives[0].notes.iter().collect();
    assert_eq!(notes, ["Point #47", "Point #106"]);
}

#[test]
fn two_notes_are_the_same_whatever_their_order() {
    let notes = |notes: &[&'static str]| notes.iter().copied().collect::<Notes>();

    assert_eq!(
        notes(&["Swap at 10", "Main skill"]),
        notes(&["Main skill", "Swap at 10"])
    );
    assert_eq!(notes(&["Main skill", "Main skill"]), notes(&["Main skill"]));
    assert_ne!(notes(&["Main skill"]), notes(&["Main skill", "Swap at 10"]));
    assert_ne!(
        notes(&["Main skill", "Late"]),
        notes(&["Main skill", "Swap at 10"])
    );
    assert_ne!(notes(&[]), notes(&["Main skill"]));
}
