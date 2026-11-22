use serde_json::{Value, json};

use super::*;

const EVERY_FIELD: &str = include_str!("../tests/builds/every-field.build");

fn as_json(text: &str) -> Value {
    serde_json::from_str(text).unwrap()
}

#[test]
fn a_file_with_every_field_is_read_with_each_entry_in_its_form() {
    let build = Build::read(EVERY_FIELD).unwrap();

    assert_eq!(build.name, "Every Field");
    assert_eq!(build.ascendancy.as_deref(), Some("Warrior1"));
    assert_eq!(
        build.link.as_deref(),
        Some("https://example.com/guides/every-field")
    );

    let passives = build.passives.into_option().unwrap();
    let ids: Vec<&str> = passives.iter().map(Entry::id).collect();
    assert_eq!(ids, ["strength89", "melee17", "melee18"]);
    assert!(matches!(passives[0], Entry::Id(_)));
    assert_eq!(
        passives[1].level_interval(),
        Some(&LevelInterval::Levels(vec![1, 50]))
    );
    assert_eq!(
        passives[2].level_interval(),
        Some(&LevelInterval::Level(40))
    );

    let skills = build.skills.into_option().unwrap();
    let Entry::Detailed(earthquake) = &skills[1] else {
        panic!("the second skill is written with its fields");
    };
    let supports: Vec<&str> = earthquake
        .support_skills
        .get()
        .into_iter()
        .flatten()
        .map(Entry::id)
        .collect();
    assert_eq!(
        supports,
        [
            "Metadata/Items/Gems/SupportGemFastForward",
            "Metadata/Items/Gems/SupportGemAftershock"
        ]
    );

    let slots = build.inventory_slots.into_option().unwrap();
    assert_eq!(slots[1].unique_name.as_deref(), Some("Blackflame"));
}

#[test]
fn a_file_is_written_back_as_it_was_read() {
    let written = Build::read(EVERY_FIELD).unwrap().write();

    assert_eq!(as_json(&written), as_json(EVERY_FIELD));
}

#[test]
fn the_fields_the_format_doesnt_name_are_kept_in_their_order() {
    let text = json!({
        "name": "Future",
        "zeta": 1,
        "alpha": { "nested": [true, null] },
        "passives": [{ "id": "strength89", "colour": "red" }],
        "skills": [{
            "id": "Metadata/Items/Gems/SkillGemEarthquake",
            "support_skills": [{ "id": "Metadata/Items/Gems/SupportGemFastForward", "rank": 2 }],
            "slot": "main"
        }],
        "inventory_slots": [{ "inventory_id": "Weapon1", "mods": ["+1 to Level"] }]
    })
    .to_string();

    let build = Build::read(&text).unwrap();
    let extra_keys: Vec<&String> = build.extra.keys().collect();
    assert_eq!(extra_keys, ["zeta", "alpha"]);
    assert_eq!(as_json(&build.write()), as_json(&text));
}

#[test]
fn a_build_with_its_name_alone_is_written_with_its_name_alone() {
    let build = Build::read(r#"{ "name": "Empty" }"#).unwrap();

    assert_eq!(as_json(&build.write()), json!({ "name": "Empty" }));
}

#[test]
fn a_byte_order_mark_at_the_start_is_skipped() {
    let build = Build::read("\u{feff}{ \"name\": \"Windows\" }").unwrap();

    assert_eq!(build.name, "Windows");
}

#[test]
fn a_file_is_written_with_four_spaces_of_indentation() {
    let written = Build::read(r#"{ "name": "Indented", "author": "Me" }"#)
        .unwrap()
        .write();

    assert_eq!(
        written,
        "{\n    \"name\": \"Indented\",\n    \"author\": \"Me\"\n}"
    );
}

#[test]
fn a_field_written_twice_keeps_its_last_value() {
    let build = Build::read(
        r#"{ "name": "First", "name": "Last", "passives": [{ "id": "a", "id": "b" }] }"#,
    )
    .unwrap();

    assert_eq!(build.name, "Last");
    assert_eq!(build.passives.into_option().unwrap()[0].id(), "b");
}

#[test]
fn a_field_written_null_is_written_back_null() {
    let text = json!({
        "name": "Nulls",
        "author": null,
        "description": null,
        "link": null,
        "ascendancy": null,
        "passives": [{ "id": "a", "level_interval": null, "weapon_set": null, "additional_text": null }],
        "skills": [
            { "id": "b", "level_interval": null, "additional_text": null, "support_skills": null },
            { "id": "c", "support_skills": [{ "id": "d", "level_interval": null, "additional_text": null }] }
        ],
        "inventory_slots": [{
            "inventory_id": "Weapon1",
            "slot_x": null,
            "slot_y": null,
            "level_interval": null,
            "unique_name": null,
            "additional_text": null
        }]
    })
    .to_string();

    let build = Build::read(&text).unwrap();

    assert_eq!(build.author, Nullable::Null);
    assert_eq!(build.author.get(), None);
    assert_eq!(as_json(&build.write()), as_json(&text));
}

#[test]
fn the_lists_of_a_build_written_null_are_written_back_null() {
    let text = r#"{ "name": "Nulls", "passives": null, "skills": null, "inventory_slots": null }"#;

    assert_eq!(as_json(&Build::read(text).unwrap().write()), as_json(text));
}

#[test]
fn each_field_left_out_is_read_absent_and_written_back_left_out() {
    // Every struct written whole: a field added to one of them must be added here, and read
    // absent when the file leaves it out, which its `#[serde(default)]` decides.
    let text = json!({
        "name": "Bare",
        "passives": [{ "id": "a" }],
        "skills": [{ "id": "b", "support_skills": [{ "id": "c" }] }],
        "inventory_slots": [{ "inventory_id": "Weapon1" }]
    })
    .to_string();

    let build = Build::read(&text).unwrap();

    assert_eq!(
        build,
        Build {
            name: "Bare".to_owned(),
            author: Nullable::Absent,
            description: Nullable::Absent,
            link: Nullable::Absent,
            ascendancy: Nullable::Absent,
            passives: Nullable::Value(vec![Entry::Detailed(Passive {
                id: "a".to_owned(),
                level_interval: Nullable::Absent,
                weapon_set: Nullable::Absent,
                additional_text: Nullable::Absent,
                extra: Extra::new(),
            })]),
            skills: Nullable::Value(vec![Entry::Detailed(Skill {
                id: "b".to_owned(),
                level_interval: Nullable::Absent,
                additional_text: Nullable::Absent,
                support_skills: Nullable::Value(vec![Entry::Detailed(Support {
                    id: "c".to_owned(),
                    level_interval: Nullable::Absent,
                    additional_text: Nullable::Absent,
                    extra: Extra::new(),
                })]),
                extra: Extra::new(),
            })]),
            inventory_slots: Nullable::Value(vec![InventorySlot {
                inventory_id: "Weapon1".to_owned(),
                slot_x: Nullable::Absent,
                slot_y: Nullable::Absent,
                level_interval: Nullable::Absent,
                unique_name: Nullable::Absent,
                additional_text: Nullable::Absent,
                extra: Extra::new(),
            }]),
            extra: Extra::new(),
        }
    );
    assert_eq!(as_json(&build.write()), as_json(&text));
}
