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

    let passives = build.passives.unwrap();
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

    let skills = build.skills.unwrap();
    let Entry::Detailed(earthquake) = &skills[1] else {
        panic!("the second skill is written with its fields");
    };
    let supports: Vec<&str> = earthquake
        .support_skills
        .iter()
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

    let slots = build.inventory_slots.unwrap();
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
fn a_build_without_a_name_isnt_read() {
    let error = Build::read(r#"{ "author": "Nobody" }"#).unwrap_err();

    assert!(error.to_string().contains("name"), "{error}");
}

#[test]
fn a_text_that_isnt_json_is_refused_with_its_line() {
    let error = Build::read("{\n  \"name\": \"Broken\",\n  oops\n}").unwrap_err();

    assert_eq!(error.line(), 3);
}

#[test]
fn a_weapon_set_or_a_level_that_isnt_a_whole_number_is_refused() {
    let negative = r#"{ "name": "Bad", "passives": [{ "id": "a", "weapon_set": -1 }] }"#;
    let fraction = r#"{ "name": "Bad", "passives": [{ "id": "a", "level_interval": 1.5 }] }"#;

    assert!(Build::read(negative).is_err());
    assert!(Build::read(fraction).is_err());
}
