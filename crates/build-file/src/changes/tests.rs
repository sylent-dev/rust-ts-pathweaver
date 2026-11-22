use serde_json::json;

use super::*;
use crate::Build;
use crate::fixtures::{build, held, hint, noted, passive, support};

/// What changes at a level of a build, against the level before.
fn changes_at(build: &Build, level: u32) -> Vec<Change<'_>> {
    build
        .at_level(level)
        .changes_since(&build.at_level(level - 1))
}

#[test]
fn a_skill_that_comes_brings_its_supports_and_they_dont_count_apart() {
    let build = build(json!({
        "skills": [
            { "id": "Spark" },
            { "id": "Comet", "level_interval": [59, 100], "additional_text": "The main skill", "support_skills": [
                { "id": "FromTheStart", "level_interval": [1, 100], "additional_text": "Always" },
                "Pierce",
                { "id": "Late", "level_interval": [70, 100] }
            ] }
        ]
    }));

    assert_eq!(
        changes_at(&build, 59),
        [Change::SkillAdded {
            skill: noted("Comet", &["The main skill"]),
            supports: vec![noted("FromTheStart", &["Always"]), held("Pierce")],
        }]
    );
}

#[test]
fn a_skill_that_goes_takes_its_supports_and_they_dont_count_apart() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "level_interval": [1, 58], "additional_text": "Until Comet", "support_skills": ["Pierce", "Fork"] },
            { "id": "Comet" }
        ]
    }));

    assert_eq!(
        changes_at(&build, 59),
        [Change::SkillRemoved { id: "Spark" }]
    );
}

#[test]
fn a_support_comes_onto_a_skill_already_there_and_leaves_one_that_stays() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "support_skills": [
                { "id": "Pierce", "level_interval": [1, 22] },
                { "id": "Fork", "level_interval": [23, 100], "additional_text": "Once it is found" }
            ] },
            { "id": "Comet", "support_skills": ["Pierce"] }
        ]
    }));

    assert_eq!(
        changes_at(&build, 23),
        [
            Change::SupportAdded(noted(support("Fork", "Spark"), &["Once it is found"])),
            Change::SupportRemoved(support("Pierce", "Spark")),
        ]
    );
}

#[test]
fn a_support_already_on_a_skill_comes_onto_another_one() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "support_skills": ["Pierce"] },
            { "id": "Comet", "support_skills": [{ "id": "Pierce", "level_interval": [30, 100] }] }
        ]
    }));

    assert_eq!(
        changes_at(&build, 30),
        [Change::SupportAdded(held(support("Pierce", "Comet")))]
    );
}

#[test]
fn an_entry_that_stops_and_starts_again_the_same_at_the_next_level_changes_nothing() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "level_interval": [1, 70], "weapon_set": 1 },
            { "id": "melee17", "level_interval": [71, 100], "weapon_set": 1 }
        ],
        "skills": [
            { "id": "Spark", "level_interval": [1, 70], "additional_text": "Main", "support_skills": [
                { "id": "Pierce", "additional_text": "Early" }
            ] },
            { "id": "Spark", "level_interval": [71, 100], "additional_text": " Main ", "support_skills": [
                { "id": "Pierce", "additional_text": "Early" }, "Fork"
            ] }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "slot_x": 0, "level_interval": [1, 70], "additional_text": "Any wand" },
            { "inventory_id": "Weapon1", "slot_x": 1, "level_interval": [71, 100], "additional_text": "Any wand" }
        ]
    }));

    assert_eq!(
        changes_at(&build, 71),
        [Change::SupportAdded(held(support("Fork", "Spark")))]
    );
}

#[test]
fn an_entry_that_comes_back_with_another_note_is_a_change_of_its_note() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "level_interval": [1, 70], "additional_text": "For the campaign", "support_skills": [
                { "id": "Pierce", "additional_text": "Early" }, { "id": "Fork", "additional_text": "Kept" }
            ] },
            { "id": "Spark", "level_interval": [71, 100], "additional_text": "For the maps", "support_skills": [
                { "id": "Pierce" }, { "id": "Fork", "additional_text": "Kept" }
            ] },
            { "id": "Comet", "additional_text": "Unchanged" }
        ],
        "inventory_slots": [
            { "inventory_id": "Belt1", "level_interval": [1, 70], "additional_text": "Any belt\nLife" },
            { "inventory_id": "Belt1", "level_interval": [71, 100], "additional_text": "Any belt\nLife and resistances" },
            { "inventory_id": "Ring1", "unique_name": "Dream Fragments", "level_interval": [1, 70] },
            { "inventory_id": "Ring1", "unique_name": "Dream Fragments", "level_interval": [71, 100], "additional_text": "Keep it" }
        ]
    }));

    assert_eq!(
        changes_at(&build, 71),
        [
            Change::SkillNoteChanged(noted("Spark", &["For the maps"])),
            Change::SupportNoteChanged(held(support("Pierce", "Spark"))),
            Change::HintTextChanged(noted(
                hint("Belt1", HintItem::Named("Any belt")),
                &["Any belt\nLife and resistances"]
            )),
            Change::HintTextChanged(noted(
                hint("Ring1", HintItem::Unique("Dream Fragments")),
                &["Keep it"]
            )),
        ]
    );
}

#[test]
fn the_passives_taken_are_one_change_for_each_weapon_set_with_the_notes_of_each() {
    let build = build(json!({
        "passives": [
            "strength89",
            { "id": "second1", "level_interval": [10, 100], "weapon_set": 2 },
            { "id": "shared1", "level_interval": [10, 100], "additional_text": "First" },
            { "id": "first1", "level_interval": [10, 100], "weapon_set": 1 },
            { "id": "shared2", "level_interval": [10, 100], "weapon_set": 0 },
            { "id": "second2", "level_interval": [10, 100], "weapon_set": 2, "additional_text": "Swap" },
            { "id": "later", "level_interval": [11, 100] }
        ]
    }));

    assert_eq!(
        changes_at(&build, 10),
        [
            Change::PassivesTaken {
                weapon_set: WeaponSet::Shared,
                passives: vec![noted("shared1", &["First"]), held("shared2")],
            },
            Change::PassivesTaken {
                weapon_set: WeaponSet::First,
                passives: vec![held("first1")],
            },
            Change::PassivesTaken {
                weapon_set: WeaponSet::Second,
                passives: vec![held("second1"), noted("second2", &["Swap"])],
            },
        ]
    );
    assert_eq!(
        changes_at(&build, 11),
        [Change::PassivesTaken {
            weapon_set: WeaponSet::Shared,
            passives: vec![held("later")],
        }]
    );
}

#[test]
fn the_passives_given_back_are_one_change_whatever_their_weapon_set() {
    let build = build(json!({
        "passives": [
            { "id": "shared1", "level_interval": [1, 64], "additional_text": "Until the respec" },
            { "id": "kept", "level_interval": [1, 100] },
            { "id": "first1", "level_interval": [1, 64], "weapon_set": 1 },
            { "id": "second1", "level_interval": [1, 64], "weapon_set": 2 }
        ]
    }));

    assert_eq!(
        changes_at(&build, 65),
        [Change::PassivesGivenBack(vec![
            passive("shared1", WeaponSet::Shared),
            passive("first1", WeaponSet::First),
            passive("second1", WeaponSet::Second),
        ])]
    );
}

#[test]
fn a_passive_listed_again_while_it_is_held_changes_nothing_even_with_another_note() {
    let build = build(json!({
        "passives": [
            { "id": "intelligence59", "level_interval": [36, 100], "additional_text": "Point #47" },
            { "id": "intelligence59", "level_interval": [83, 100], "additional_text": "Point #106" }
        ]
    }));

    assert_eq!(changes_at(&build, 83), []);
}

#[test]
fn a_passive_that_moves_to_a_weapon_set_is_taken_there_and_given_back() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "level_interval": [1, 49] },
            { "id": "melee17", "level_interval": [50, 100], "weapon_set": 1 }
        ]
    }));

    assert_eq!(
        changes_at(&build, 50),
        [
            Change::PassivesTaken {
                weapon_set: WeaponSet::First,
                passives: vec![held("melee17")],
            },
            Change::PassivesGivenBack(vec![passive("melee17", WeaponSet::Shared)]),
        ]
    );
}

#[test]
fn a_hint_comes_on_a_slot_and_goes() {
    let build = build(json!({
        "inventory_slots": [
            { "inventory_id": "Helm1", "level_interval": [1, 19], "additional_text": "Any helmet" },
            { "inventory_id": "Ring1", "level_interval": [20, 100], "unique_name": "Dream Fragments", "additional_text": "From the first boss" }
        ]
    }));

    assert_eq!(
        changes_at(&build, 20),
        [
            Change::HintAdded(noted(
                hint("Ring1", HintItem::Unique("Dream Fragments")),
                &["From the first boss"]
            )),
            Change::HintRemoved(hint("Helm1", HintItem::Named("Any helmet"))),
        ]
    );
}

#[test]
fn a_hint_replaces_another_when_one_comes_and_one_goes_on_its_slot() {
    let build = build(json!({
        "inventory_slots": [
            { "inventory_id": "BodyArmour1", "level_interval": [1, 64], "additional_text": "Wyrmscale Coat" },
            { "inventory_id": "BodyArmour1", "level_interval": [65, 100], "additional_text": "Sacramental Robe (Int Base)\nLife" },
            { "inventory_id": "Helm1", "level_interval": [1, 64], "additional_text": "Any helmet" },
            { "inventory_id": "Helm1", "level_interval": [65, 100], "unique_name": "The Black Crest" },
            { "inventory_id": "Belt1", "additional_text": "Any belt" }
        ]
    }));

    assert_eq!(
        changes_at(&build, 65),
        [
            Change::HintReplaced {
                hint: noted(
                    hint(
                        "BodyArmour1",
                        HintItem::Named("Sacramental Robe (Int Base)")
                    ),
                    &["Sacramental Robe (Int Base)\nLife"]
                ),
                before: HintItem::Named("Wyrmscale Coat"),
            },
            Change::HintReplaced {
                hint: held(hint("Helm1", HintItem::Unique("The Black Crest"))),
                before: HintItem::Named("Any helmet"),
            },
        ]
    );
}

#[test]
fn where_several_hints_come_or_go_on_a_slot_none_replaces_another() {
    let build = build(json!({
        "inventory_slots": [
            { "inventory_id": "Charm1", "level_interval": [1, 64], "additional_text": "Thawing Charm" },
            { "inventory_id": "Charm1", "additional_text": "Stone Charm" },
            { "inventory_id": "Charm1", "level_interval": [65, 100], "additional_text": "Golden Charm" },
            { "inventory_id": "Charm1", "level_interval": [65, 100], "additional_text": "Silver Charm" },
            { "inventory_id": "Flask1", "level_interval": [1, 64], "additional_text": "Life Flask" },
            { "inventory_id": "Flask1", "level_interval": [1, 64], "additional_text": "Mana Flask" },
            { "inventory_id": "Flask1", "level_interval": [65, 100], "additional_text": "Ultimate Life Flask" },
            { "inventory_id": "Ring1", "level_interval": [1, 64], "additional_text": "Any ring" },
            { "inventory_id": "Ring2", "level_interval": [65, 100], "additional_text": "A better ring" }
        ]
    }));

    let charm = |name| hint("Charm1", HintItem::Named(name));
    let flask = |name| hint("Flask1", HintItem::Named(name));
    assert_eq!(
        changes_at(&build, 65),
        [
            Change::HintAdded(noted(charm("Golden Charm"), &["Golden Charm"])),
            Change::HintAdded(noted(charm("Silver Charm"), &["Silver Charm"])),
            Change::HintAdded(noted(
                flask("Ultimate Life Flask"),
                &["Ultimate Life Flask"]
            )),
            Change::HintAdded(noted(
                hint("Ring2", HintItem::Named("A better ring")),
                &["A better ring"]
            )),
            Change::HintRemoved(charm("Thawing Charm")),
            Change::HintRemoved(flask("Life Flask")),
            Change::HintRemoved(flask("Mana Flask")),
            Change::HintRemoved(hint("Ring1", HintItem::Named("Any ring"))),
        ]
    );
}

#[test]
fn the_changes_of_a_level_come_in_the_order_of_the_categories() {
    let build = build(json!({
        "passives": [
            { "id": "given_back", "level_interval": [1, 64] },
            { "id": "taken", "level_interval": [65, 100] }
        ],
        "skills": [
            { "id": "Retold", "level_interval": [1, 64], "additional_text": "Before", "support_skills": [
                { "id": "Leaves", "level_interval": [1, 64] },
                { "id": "Comes", "level_interval": [65, 100] }
            ] },
            { "id": "Goes", "level_interval": [1, 64] },
            { "id": "Retold", "level_interval": [65, 100], "additional_text": "After", "support_skills": [
                { "id": "Comes", "level_interval": [65, 100] }
            ] },
            { "id": "Comes", "level_interval": [65, 100] }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "level_interval": [1, 64], "additional_text": "Any wand" },
            { "inventory_id": "Weapon1", "level_interval": [65, 100], "additional_text": "A better wand" },
            { "inventory_id": "Ring1", "level_interval": [1, 64], "additional_text": "Any ring" },
            { "inventory_id": "Ring2", "level_interval": [65, 100], "additional_text": "Another ring" }
        ]
    }));

    let changes = changes_at(&build, 65);

    assert_eq!(
        changes,
        [
            Change::SkillAdded {
                skill: held("Comes"),
                supports: vec![],
            },
            Change::SkillRemoved { id: "Goes" },
            Change::SupportAdded(held(support("Comes", "Retold"))),
            Change::SupportRemoved(support("Leaves", "Retold")),
            Change::PassivesTaken {
                weapon_set: WeaponSet::Shared,
                passives: vec![held("taken")],
            },
            Change::PassivesGivenBack(vec![passive("given_back", WeaponSet::Shared)]),
            Change::HintAdded(noted(
                hint("Ring2", HintItem::Named("Another ring")),
                &["Another ring"]
            )),
            Change::HintReplaced {
                hint: noted(
                    hint("Weapon1", HintItem::Named("A better wand")),
                    &["A better wand"]
                ),
                before: HintItem::Named("Any wand"),
            },
            Change::HintRemoved(hint("Ring1", HintItem::Named("Any ring"))),
            Change::SkillNoteChanged(noted("Retold", &["After"])),
        ]
    );
    let without_marker: Vec<&Change> = changes
        .iter()
        .filter(|change| !change.makes_marker())
        .collect();
    assert_eq!(
        without_marker,
        [&Change::PassivesTaken {
            weapon_set: WeaponSet::Shared,
            passives: vec![held("taken")],
        }]
    );
}

#[test]
fn a_change_of_note_or_of_text_makes_a_marker() {
    let changes = [
        Change::SkillNoteChanged(held("Spark")),
        Change::SupportNoteChanged(held(support("Pierce", "Spark"))),
        Change::HintTextChanged(held(hint("Belt1", HintItem::Named("Any belt")))),
    ];

    assert!(changes.iter().all(Change::makes_marker));
}

#[test]
fn nothing_changes_between_two_levels_that_hold_the_same() {
    let every_field = Build::read(include_str!("../../tests/builds/every-field.build")).unwrap();

    assert_eq!(changes_at(&every_field, 20), []);
    assert_ne!(changes_at(&every_field, 30), []);
}

#[test]
fn the_changes_of_a_build_are_those_of_each_level_where_something_changes() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "level_interval": [10, 100] },
            { "id": "melee18", "level_interval": [23, 100] }
        ],
        "skills": [
            { "id": "Spark", "level_interval": [1, 22] },
            { "id": "Comet", "level_interval": [23, 100] }
        ]
    }));

    assert_eq!(
        build.changes_by_level(),
        [
            LevelChanges {
                level: 10,
                changes: vec![Change::PassivesTaken {
                    weapon_set: WeaponSet::Shared,
                    passives: vec![held("melee17")],
                }],
            },
            LevelChanges {
                level: 23,
                changes: vec![
                    Change::SkillAdded {
                        skill: held("Comet"),
                        supports: vec![],
                    },
                    Change::SkillRemoved { id: "Spark" },
                    Change::PassivesTaken {
                        weapon_set: WeaponSet::Shared,
                        passives: vec![held("melee18")],
                    },
                ],
            },
        ]
    );
}

#[test]
fn a_level_where_the_build_only_takes_passives_is_no_marker() {
    let build = build(json!({
        "passives": [
            { "id": "melee17", "level_interval": [10, 64] },
            { "id": "melee18", "level_interval": [11, 100], "weapon_set": 1 },
            { "id": "melee19", "level_interval": [65, 100] }
        ],
        "skills": [
            { "id": "Spark", "level_interval": [1, 22], "additional_text": "Early" },
            { "id": "Spark", "level_interval": [23, 100], "additional_text": "Late" },
            { "id": "Comet", "level_interval": [90, 100] }
        ],
        "inventory_slots": [{ "inventory_id": "Weapon1", "level_interval": [40, 100] }]
    }));

    let with_a_change: Vec<u32> = build
        .changes_by_level()
        .iter()
        .map(|level| level.level)
        .collect();
    assert_eq!(with_a_change, [10, 11, 23, 40, 65, 90]);
    assert_eq!(build.markers(), [23, 40, 65, 90]);
}

#[test]
fn nothing_changes_at_the_lowest_level_a_build_covers() {
    let build = build(json!({
        "passives": ["strength89"],
        "skills": [
            { "id": "Spark", "level_interval": [65, 89] },
            { "id": "Comet", "level_interval": [90, 100] }
        ]
    }));

    assert_eq!(build.markers(), [90]);
}

#[test]
fn a_build_that_is_the_same_at_every_level_has_no_change_and_no_marker() {
    let snapshot = build(json!({
        "passives": ["strength89", { "id": "melee17", "level_interval": [0, 100] }],
        "skills": [{ "id": "Spark", "support_skills": ["Pierce"] }],
        "inventory_slots": [{ "inventory_id": "Weapon1", "unique_name": "Blackflame" }]
    }));

    assert_eq!(snapshot.changes_by_level(), []);
    assert_eq!(snapshot.markers(), [] as [u32; 0]);
}

#[test]
fn a_change_at_the_highest_level_of_a_build_is_a_marker() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "level_interval": [1, 99] },
            { "id": "Comet", "level_interval": [100, 100] }
        ]
    }));

    assert_eq!(build.markers(), [100]);
}

#[test]
fn the_changes_of_a_build_are_those_of_every_level_compared_with_the_one_before() {
    let builds = [
        Build::read(include_str!("../../tests/builds/every-field.build")).unwrap(),
        build(json!({
            "passives": [
                "strength89",
                { "id": "melee17", "level_interval": [10, 64], "weapon_set": 1 },
                { "id": "melee18", "level_interval": 41 },
                { "id": "melee19", "level_interval": [100, 100] }
            ],
            "skills": [
                { "id": "Spark", "level_interval": [2, 22], "support_skills": [
                    { "id": "FromTheStart", "level_interval": [1, 100] },
                    { "id": "Early", "level_interval": [1, 9] },
                    { "id": "Late", "level_interval": [15, 30] }
                ] },
                { "id": "Comet", "support_skills": [{ "id": "Pierce", "level_interval": [50, 99] }] },
                { "id": "Never", "level_interval": [30, 20] }
            ],
            "inventory_slots": [
                { "inventory_id": "Weapon1", "level_interval": [1, 1], "additional_text": "Any wand" },
                { "inventory_id": "Weapon1", "level_interval": [2, 100], "additional_text": "A better wand" },
                { "inventory_id": "Ring1", "level_interval": [0, 98], "unique_name": "Dream Fragments" }
            ]
        })),
    ];

    for build in &builds {
        let levels = build.levels();
        let every_level = (levels.first() + 1..=levels.last()).filter_map(|level| {
            let changes = changes_at(build, level);
            (!changes.is_empty()).then_some(LevelChanges { level, changes })
        });
        let every_level: Vec<LevelChanges> = every_level.collect();
        assert_eq!(build.changes_by_level(), every_level);
        assert!(every_level.len() > 2);
    }
}

#[test]
fn the_level_after_an_entry_stops_is_a_marker_when_nothing_starts_there() {
    let build = build(json!({
        "passives": [{ "id": "melee17", "level_interval": [1, 100] }],
        "skills": [{ "id": "Spark", "level_interval": [1, 22] }, "Comet"],
        "inventory_slots": [{ "inventory_id": "Weapon1", "level_interval": [1, 98] }]
    }));

    assert_eq!(build.markers(), [23, 99]);
}

#[test]
fn a_gem_or_a_hint_listed_again_with_the_same_note_while_it_is_held_changes_nothing() {
    let build = build(json!({
        "skills": [
            { "id": "Spark", "level_interval": [1, 10], "additional_text": "Main skill", "support_skills": [
                { "id": "Pierce", "additional_text": "Always" }
            ] },
            { "id": "Spark", "level_interval": [5, 20], "additional_text": "Main skill", "support_skills": [
                { "id": "Pierce", "additional_text": "Always" }
            ] },
            { "id": "Comet", "level_interval": [1, 20] }
        ],
        "inventory_slots": [
            { "inventory_id": "Belt1", "level_interval": [1, 10], "additional_text": "Any belt" },
            { "inventory_id": "Belt1", "level_interval": [5, 20], "additional_text": "Any belt" }
        ]
    }));

    assert_eq!(build.changes_by_level(), []);
}
