use serde_json::json;

use crate::{Build, MAX_BYTES, ReadError};

fn error_of(text: &str) -> ReadError {
    Build::read(text).unwrap_err()
}

fn wrong_value(field: &str) -> ReadError {
    ReadError::WrongValue {
        field: field.to_owned(),
    }
}

/// A build with `skills` as its skills.
fn with_skills(skills: &serde_json::Value) -> String {
    json!({ "name": "Bad", "skills": skills }).to_string()
}

#[test]
fn a_text_that_isnt_json_gives_its_line_and_the_text_of_the_line() {
    assert_eq!(
        error_of("{\n  \"name\": \"Broken\",\n  oops\n}"),
        ReadError::NotJson {
            line: 3,
            column: 3,
            excerpt: "  oops".to_owned(),
        }
    );
}

#[test]
fn a_long_line_is_cut_to_80_characters_around_the_error() {
    let before = "a".repeat(100);
    let after = "b".repeat(100);
    let text = format!("{{\"name\": \"{before}\" oops \"{after}\"}}");

    let ReadError::NotJson { line, excerpt, .. } = error_of(&text) else {
        panic!("the text isn't JSON");
    };

    assert_eq!(line, 1);
    // The error is on the `o` of `oops`, the 113th character: 40 characters before it.
    let start = 112 - 40;
    let kept: String = text.chars().skip(start).take(80).collect();
    assert_eq!(excerpt, format!("…{kept}…"));
    assert!(
        kept.starts_with("aaaa") && kept.contains("\" oops \"bbb"),
        "{kept}"
    );
}

#[test]
fn a_long_line_cut_near_one_of_its_ends_keeps_80_characters() {
    let near_start = format!("{{ oops \"{}\" }}", "a".repeat(200));
    let near_end = format!("{{\"name\": \"{}\" oops }}", "a".repeat(200));

    let ReadError::NotJson { excerpt, .. } = error_of(&near_start) else {
        panic!("the text isn't JSON");
    };
    let kept: String = near_start.chars().take(80).collect();
    assert_eq!(excerpt, format!("{kept}…"));

    let ReadError::NotJson { excerpt, .. } = error_of(&near_end) else {
        panic!("the text isn't JSON");
    };
    let length = near_end.chars().count();
    let kept: String = near_end.chars().skip(length - 80).collect();
    assert_eq!(excerpt, format!("…{kept}"));
}

#[test]
fn a_long_line_is_cut_around_the_error_counted_in_characters() {
    // « é » is two bytes, which `serde_json` counts in its column.
    let text = format!(
        "{{\"name\": \"{}\" oops \"{}\"}}",
        "é".repeat(100),
        "b".repeat(100)
    );

    let ReadError::NotJson {
        column, excerpt, ..
    } = error_of(&text)
    else {
        panic!("the text isn't JSON");
    };

    assert_eq!(column, 213);
    let kept: String = text.chars().skip(112 - 40).take(80).collect();
    assert_eq!(excerpt, format!("…{kept}…"));
}

#[test]
fn a_text_that_ends_too_soon_gives_its_last_line_with_a_character() {
    let last = "  \"name\": \"Cut\",";
    let error = ReadError::NotJson {
        line: 2,
        column: last.len() + 1,
        excerpt: last.to_owned(),
    };

    assert_eq!(error_of(&format!("{{\n{last}")), error);
    assert_eq!(error_of(&format!("{{\n{last}\n")), error);
    assert_eq!(error_of(&format!("{{\n{last}\n   \n\n")), error);
    assert_eq!(error_of(&format!("{{\r\n{last}\r\n")), error);
    assert_eq!(error_of(&format!("\u{feff}{{\n{last}   \t")), error);
}

#[test]
fn an_error_on_a_line_break_gives_the_line_it_ends() {
    for (text, line, last) in [
        (
            "{\n  \"name\": \"Cut,\n  \"author\": \"Me\"\n}",
            2,
            "  \"name\": \"Cut,",
        ),
        ("{\n\"name\": tru\n}", 2, "\"name\": tru"),
        ("{\n\"name\": 1e\n}", 2, "\"name\": 1e"),
        ("{\"name\": \"abc\n\"}", 1, "{\"name\": \"abc"),
        ("{\n\"name\": \"abc   \n\"}", 2, "\"name\": \"abc"),
    ] {
        let expected = ReadError::NotJson {
            line,
            column: last.len() + 1,
            excerpt: last.to_owned(),
        };
        assert_eq!(error_of(text), expected, "{text:?}");
        // The same file in CRLF, whose `\r` stops `serde_json` on the line of the error.
        assert_eq!(
            error_of(&text.replace('\n', "\r\n")),
            expected,
            "{text:?} in CRLF"
        );
    }
}

#[test]
fn a_long_last_line_of_a_text_that_ends_too_soon_keeps_its_end() {
    let text = format!("{{\"name\": \"{}", "a".repeat(200));

    let ReadError::NotJson { excerpt, .. } = error_of(&text) else {
        panic!("the text isn't JSON");
    };

    assert_eq!(excerpt, format!("…{}", "a".repeat(80)));
}

#[test]
fn the_last_line_of_a_text_that_ends_too_soon_leaves_out_its_spaces() {
    let last = "{\"name\": \"Cut\",";
    let text = format!("{last}{}", " ".repeat(200));

    assert_eq!(
        error_of(&text),
        ReadError::NotJson {
            line: 1,
            column: last.len() + 1,
            excerpt: last.to_owned(),
        }
    );
}

#[test]
fn an_empty_text_or_one_of_spaces_isnt_a_build() {
    for text in ["", "\u{feff}", "   \n\t\n", "\r\n"] {
        assert_eq!(error_of(text), ReadError::NotABuild, "{text:?}");
    }
}

#[test]
fn a_line_ending_in_crlf_gives_its_text_without_the_carriage_return() {
    assert_eq!(
        error_of("{\r\n  \"name\": \"Broken\",\r\n  oops\r\n}"),
        ReadError::NotJson {
            line: 3,
            column: 3,
            excerpt: "  oops".to_owned(),
        }
    );
}

#[test]
fn a_line_of_80_characters_is_kept_whole_and_one_of_81_cut() {
    // `{ oops "…" }`: 11 characters around the name.
    let of_80 = format!("{{ oops \"{}\" }}", "a".repeat(69));
    let of_81 = format!("{{ oops \"{}\" }}", "a".repeat(70));
    assert_eq!((of_80.chars().count(), of_81.chars().count()), (80, 81));

    let excerpt_of = |text: &str| match error_of(text) {
        ReadError::NotJson { excerpt, .. } => excerpt,
        other => panic!("{other:?}"),
    };

    assert_eq!(excerpt_of(&of_80), of_80);
    let kept: String = of_81.chars().take(80).collect();
    assert_eq!(excerpt_of(&of_81), format!("{kept}…"));
}

#[test]
fn json_nested_too_deep_is_refused_without_a_panic() {
    let text = format!("{{\"name\": \"Deep\", \"x\": {}}}", "[".repeat(200));

    let ReadError::NotJson { line, column, .. } = error_of(&text) else {
        panic!("the text isn't JSON");
    };

    // `serde_json` refuses the 128th level, the object of the build the first: the 127th `[`,
    // after the 22 characters before the first.
    assert_eq!((line, column), (1, 22 + 127));
}

#[test]
fn json_without_a_name_or_that_isnt_an_object_isnt_a_build() {
    for text in [
        r#"{ "author": "Nobody" }"#,
        "[]",
        r#""a build""#,
        "null",
        "3",
    ] {
        assert_eq!(error_of(text), ReadError::NotABuild, "{text}");
    }
}

#[test]
fn a_value_of_the_wrong_type_gives_its_field() {
    assert_eq!(error_of(r#"{ "name": 3 }"#), wrong_value("name"));
    assert_eq!(error_of(r#"{ "name": null }"#), wrong_value("name"));
    assert_eq!(
        error_of(r#"{ "name": "Bad", "author": 4 }"#),
        wrong_value("author")
    );
    assert_eq!(
        error_of(r#"{ "name": "Bad", "passives": {} }"#),
        wrong_value("passives")
    );
}

#[test]
fn a_value_of_the_wrong_type_inside_an_entry_gives_its_place() {
    assert_eq!(
        error_of(&with_skills(&json!([
            "Metadata/Items/Gems/SkillGemEarthquake",
            { "id": "a", "support_skills": ["b", { "id": 5 }] }
        ]))),
        wrong_value("skills[1].support_skills[1].id")
    );
    assert_eq!(
        error_of(&with_skills(&json!([{ "id": "a", "level_interval": "z" }]))),
        wrong_value("skills[0].level_interval")
    );
    assert_eq!(
        error_of(r#"{ "name": "Bad", "passives": [{ "id": "a", "weapon_set": -1 }] }"#),
        wrong_value("passives[0].weapon_set")
    );
    assert_eq!(
        error_of(r#"{ "name": "Bad", "passives": [{ "id": "a", "level_interval": 1.5 }] }"#),
        wrong_value("passives[0].level_interval")
    );
    assert_eq!(
        error_of(
            r#"{ "name": "Bad", "inventory_slots": [{ "inventory_id": "Weapon1", "slot_x": "1" }] }"#
        ),
        wrong_value("inventory_slots[0].slot_x")
    );
}

#[test]
fn an_entry_neither_an_id_nor_an_object_gives_its_place() {
    assert_eq!(
        error_of(r#"{ "name": "Bad", "passives": ["a", 7] }"#),
        wrong_value("passives[1]")
    );
}

#[test]
fn a_field_an_entry_needs_that_is_missing_gives_its_place() {
    let missing = |field: &str| ReadError::MissingField {
        field: field.to_owned(),
    };

    assert_eq!(
        error_of(r#"{ "name": "Bad", "passives": [{ "weapon_set": 1 }] }"#),
        missing("passives[0].id")
    );
    assert_eq!(
        error_of(r#"{ "name": "Bad", "skills": ["a", { "support_skills": [{}] }] }"#),
        missing("skills[1].support_skills[0].id")
    );
    assert_eq!(
        error_of(r#"{ "name": "Bad", "inventory_slots": [{ "slot_x": 1 }] }"#),
        missing("inventory_slots[0].inventory_id")
    );
}

/// The largest text read, as a length.
fn max_length() -> usize {
    usize::try_from(MAX_BYTES).unwrap()
}

/// A build whose text is `bytes` long, its name filled to reach it.
fn build_of(bytes: usize) -> String {
    let empty = r#"{"name":""}"#;
    format!(r#"{{"name":"{}"}}"#, "a".repeat(bytes - empty.len()))
}

#[test]
fn a_text_of_1_mb_is_read_and_a_larger_one_refused() {
    assert_eq!(build_of(max_length()).len(), max_length());

    assert!(Build::read(&build_of(max_length())).is_ok());
    assert_eq!(
        error_of(&build_of(max_length() + 1)),
        ReadError::TooLarge {
            bytes: MAX_BYTES + 1
        }
    );
}

#[test]
fn a_size_of_1_mb_is_read_and_a_larger_one_refused_before_its_text_is() {
    assert_eq!(ReadError::of_size(0), None);
    assert_eq!(ReadError::of_size(MAX_BYTES), None);
    assert_eq!(
        ReadError::of_size(MAX_BYTES + 1),
        Some(ReadError::TooLarge {
            bytes: MAX_BYTES + 1
        })
    );
}

#[test]
fn a_size_past_what_the_memory_of_the_page_holds_is_refused_with_its_size() {
    // A file of 5 GB, more than the 4 GB a WebAssembly module addresses.
    let five_gigabytes = 5 * 1024 * 1024 * 1024;

    assert_eq!(
        ReadError::of_size(five_gigabytes),
        Some(ReadError::TooLarge {
            bytes: five_gigabytes
        })
    );
}

#[test]
fn a_larger_text_is_refused_before_it_is_read() {
    let text = format!("{}oops", " ".repeat(max_length()));

    assert_eq!(
        error_of(&text),
        ReadError::TooLarge {
            bytes: MAX_BYTES + 4
        }
    );
}

#[test]
fn the_bytes_of_a_build_are_read_as_its_text() {
    let build = Build::read_bytes(br#"{ "name": "Bytes" }"#).unwrap();
    assert_eq!(build.name, "Bytes");
}

#[test]
fn bytes_that_arent_utf_8_arent_text() {
    // The start of a PNG image, its 0x89 never a character of UTF-8.
    let image = b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR";
    assert_eq!(Build::read_bytes(image), Err(ReadError::NotText));
}

#[test]
fn bytes_that_arent_utf_8_are_measured_as_bytes_not_as_their_text() {
    // 600 KB of an image: read as text, each byte would become a replacement character of 3
    // bytes, 1.8 MB, and the file would be refused as too large.
    let image = vec![0x89; 600_000];
    assert_eq!(Build::read_bytes(&image), Err(ReadError::NotText));
}

#[test]
fn bytes_of_1_mb_are_read_and_more_refused_by_their_size_before_their_text() {
    assert!(Build::read_bytes(build_of(max_length()).as_bytes()).is_ok());

    let mut more = vec![0x89; max_length()];
    more.push(b' ');
    assert_eq!(
        Build::read_bytes(&more),
        Err(ReadError::TooLarge {
            bytes: MAX_BYTES + 1
        })
    );
}

#[test]
fn a_byte_order_mark_before_the_bytes_of_a_build_is_skipped() {
    let build = Build::read_bytes(b"\xef\xbb\xbf{ \"name\": \"Windows\" }").unwrap();
    assert_eq!(build.name, "Windows");
}

#[test]
fn a_level_that_isnt_a_whole_number_refuses_the_file_with_its_place() {
    let refused = [
        json!([-1, 5]),
        json!([1.5, 5]),
        json!([1.0, 50.0]),
        json!([1, 4_294_967_296_u64]),
        json!([1, null]),
        json!("1-50"),
        json!(-1),
    ];

    for interval in refused {
        let text = json!({
            "name": "Bad",
            "passives": [{ "id": "melee17", "level_interval": interval }]
        })
        .to_string();
        assert_eq!(
            Build::read(&text),
            Err(wrong_value("passives[0].level_interval")),
            "{interval}"
        );
    }
    let read = json!({
        "name": "Good",
        "passives": [{ "id": "melee17", "level_interval": [4_294_967_295_u32, 0] }]
    })
    .to_string();
    assert!(Build::read(&read).is_ok());
}
