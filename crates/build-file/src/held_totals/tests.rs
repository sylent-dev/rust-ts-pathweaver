use std::collections::BTreeSet;

use serde_json::json;

use super::*;
use crate::fixtures::build;
use crate::{HIGHEST_LEVEL, LOWEST_LEVEL};

/// What the build holds at one level at least, read level by level from [`Build::at_level`].
pub(super) fn held_over_every_level(build: &Build) -> HeldTotals {
    let mut passives = BTreeSet::new();
    let mut skills = BTreeSet::new();
    let mut supports = BTreeSet::new();
    let mut hints = BTreeSet::new();
    for level in LOWEST_LEVEL..=HIGHEST_LEVEL {
        let at_level = build.at_level(level);
        passives.extend(at_level.passives.into_iter().map(|held| held.what));
        skills.extend(at_level.skills.into_iter().map(|held| held.what));
        supports.extend(at_level.supports.into_iter().map(|held| held.what));
        hints.extend(at_level.hints.into_iter().map(|held| held.what));
    }
    HeldTotals {
        passives: passives.len(),
        skills: skills.len(),
        supports: supports.len(),
        hints: hints.len(),
    }
}

#[test]
fn each_thing_counts_once_however_many_entries_set_it() {
    let build = build(json!({
        "passives": [
            "strength89",
            "strength89",
            { "id": "strength89", "level_interval": [10, 20] },
            { "id": "melee17", "weapon_set": 1 },
            { "id": "melee17", "weapon_set": 2 },
            { "id": "melee17", "weapon_set": 2 }
        ],
        "skills": [
            { "id": "Comet", "level_interval": [1, 50], "support_skills": ["Efficiency"] },
            { "id": "Comet", "level_interval": [51, 100], "support_skills": ["Efficiency", "Ice"] },
            { "id": "Spark", "support_skills": ["Efficiency"] }
        ],
        "inventory_slots": [
            { "inventory_id": "Charm1", "unique_name": "Nascent Hope" },
            { "inventory_id": "Charm1", "additional_text": "Thawing Charm" },
            { "inventory_id": "Charm1", "additional_text": "Staunching Charm" },
            { "inventory_id": "Charm1", "additional_text": "Staunching Charm\nThe second line" },
            { "inventory_id": "Ring1", "unique_name": "Nascent Hope" }
        ]
    }));

    assert_eq!(
        build.held_totals(),
        HeldTotals {
            // strength89, then melee17 in set I and in set II.
            passives: 3,
            skills: 2,
            // Efficiency on Comet and on Spark, Ice on Comet.
            supports: 3,
            // The three charms of Charm1, told apart by their item, and the ring.
            hints: 4,
        }
    );
}

#[test]
fn what_applies_at_no_level_counts_nothing() {
    let build = build(json!({
        "passives": [{ "id": "strength89", "level_interval": [20, 10] }, "melee17"],
        "skills": [
            { "id": "Spark", "level_interval": [101, 120], "support_skills": ["Efficiency"] },
            {
                "id": "Comet",
                "level_interval": [1, 10],
                "support_skills": [
                    { "id": "Never", "level_interval": [11, 100] },
                    { "id": "Invalid", "level_interval": [] },
                    { "id": "AtTen", "level_interval": [10, 100] }
                ]
            }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "unique_name": "Blackflame", "level_interval": [5] },
            { "inventory_id": "Ring1", "unique_name": "Dream Fragments" }
        ]
    }));

    assert_eq!(
        build.held_totals(),
        HeldTotals {
            passives: 1,
            skills: 1,
            // AtTen, which meets Comet at its last level.
            supports: 1,
            hints: 1,
        }
    );
}

#[test]
fn the_totals_are_what_the_build_holds_at_one_level_at_least() {
    let build = build(json!({
        "passives": [
            { "id": "strength89", "level_interval": [1, 20] },
            { "id": "strength89", "weapon_set": 1, "level_interval": [21, 100] },
            { "id": "melee17", "level_interval": [0, 400] },
            { "id": "dex4", "level_interval": 70 }
        ],
        "skills": [
            {
                "id": "Comet",
                "level_interval": [30, 60],
                "support_skills": [
                    { "id": "Before", "level_interval": [1, 29] },
                    { "id": "First", "level_interval": [1, 30] },
                    { "id": "Last", "level_interval": [60, 100] },
                    { "id": "After", "level_interval": [61, 100] }
                ]
            },
            { "id": "Spark", "level_interval": 99, "support_skills": ["Before"] }
        ],
        "inventory_slots": [
            { "inventory_id": "Weapon1", "unique_name": "Blackflame", "level_interval": [1, 1] },
            { "inventory_id": "Weapon1", "additional_text": "Any wand", "level_interval": [2, 100] }
        ]
    }));

    let totals = build.held_totals();

    assert_eq!(totals, held_over_every_level(&build));
    assert_eq!(
        totals,
        HeldTotals {
            passives: 4,
            skills: 2,
            supports: 3,
            hints: 2,
        }
    );
}
