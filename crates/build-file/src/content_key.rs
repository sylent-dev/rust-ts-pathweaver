//! The key of the content of a build: the same build opened twice is one build (`specs.md`,
//! Opening builds), whatever the spaces, the line breaks and the order of the fields of its
//! file.

use serde_json::Value;

use crate::Build;

/// The offset basis and the prime of FNV-1a on 64 bits.
const FNV_OFFSET: u64 = 0xcbf2_9ce4_8422_2325;
const FNV_PRIME: u64 = 0x0000_0100_0000_01b3;

impl Build {
    /// The key of the content of the build, 16 hexadecimal digits: FNV-1a on 64 bits of the
    /// build written in JSON, without spaces, the fields of each object sorted by name. The
    /// same from one version of Rust to the next, since the library keeps it; a number with a
    /// fraction is written by `serde_json`, whose updates the keys recorded in the tests watch.
    #[must_use]
    pub fn content_key(&self) -> String {
        // Every value of a `Build` is JSON, a map with keys that are strings: it can't fail.
        let value = serde_json::to_value(self).unwrap_or_default();
        let mut text = String::new();
        write_sorted(&value, &mut text);
        format!("{:016x}", fnv1a(text.as_bytes()))
    }
}

/// `value` in JSON without spaces, the fields of each object sorted by name.
fn write_sorted(value: &Value, text: &mut String) {
    match value {
        Value::Object(object) => {
            let mut fields: Vec<(&String, &Value)> = object.iter().collect();
            fields.sort_unstable_by_key(|(name, _)| *name);
            text.push('{');
            for (index, (name, value)) in fields.into_iter().enumerate() {
                if index > 0 {
                    text.push(',');
                }
                text.push_str(&Value::from(name.as_str()).to_string());
                text.push(':');
                write_sorted(value, text);
            }
            text.push('}');
        }
        Value::Array(values) => {
            text.push('[');
            for (index, value) in values.iter().enumerate() {
                if index > 0 {
                    text.push(',');
                }
                write_sorted(value, text);
            }
            text.push(']');
        }
        scalar => text.push_str(&scalar.to_string()),
    }
}

fn fnv1a(bytes: &[u8]) -> u64 {
    bytes.iter().fold(FNV_OFFSET, |hash, &byte| {
        (hash ^ u64::from(byte)).wrapping_mul(FNV_PRIME)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn key_of(text: &str) -> String {
        Build::read(text).unwrap().content_key()
    }

    #[test]
    fn fnv1a_gives_the_values_of_its_reference() {
        // The test vectors of the reference implementation of FNV-1a.
        assert_eq!(fnv1a(b""), 0xcbf2_9ce4_8422_2325);
        assert_eq!(fnv1a(b"a"), 0xaf63_dc4c_8601_ec8c);
        assert_eq!(fnv1a(b"foobar"), 0x8594_4171_f739_67e8);
    }

    #[test]
    fn the_key_is_16_hexadecimal_digits_of_the_build_sorted_without_spaces() {
        let text = r#"{ "name": "Key", "zeta": { "b": [1, "x"], "a": null } }"#;
        let sorted = r#"{"name":"Key","zeta":{"a":null,"b":[1,"x"]}}"#;

        assert_eq!(key_of(text), format!("{:016x}", fnv1a(sorted.as_bytes())));
    }

    #[test]
    fn the_key_stays_the_one_recorded() {
        // Recorded on 2026-11-22. A key that changes is a key the library no longer finds: a
        // change of the fixture records it again, a change of the core or of `serde_json` is
        // a finding.
        let every_field = include_str!("../tests/builds/every-field.build");
        let numbers = r#"{ "name": "Float", "x": [1.5, 1e29, 123456789012345678901234567890] }"#;

        assert_eq!(key_of(every_field), "01b5828dfd9bcb94");
        assert_eq!(key_of(numbers), "87b5bec56127ddcd");
    }

    #[test]
    fn the_same_build_on_one_line_and_indented_has_one_key() {
        let one_line = r#"{"name":"Same","passives":["a",{"id":"b","level_interval":[1,20]}]}"#;
        let indented = "{\n    \"name\": \"Same\",\n    \"passives\": [\n        \"a\",\n        \
                        { \"id\": \"b\", \"level_interval\": [1, 20] }\n    ]\n}\n";

        assert_eq!(key_of(one_line), key_of(indented));
    }

    #[test]
    fn the_order_of_the_fields_changes_nothing() {
        let first = r#"{ "name": "Same", "author": "Me", "x": { "a": 1, "b": 2 } }"#;
        let second = r#"{ "x": { "b": 2, "a": 1 }, "author": "Me", "name": "Same" }"#;

        assert_eq!(key_of(first), key_of(second));
    }

    #[test]
    fn a_different_value_or_order_of_entries_gives_another_key() {
        let build = key_of(r#"{ "name": "Same", "passives": ["a", "b"] }"#);

        for other in [
            r#"{ "name": "Same", "passives": ["b", "a"] }"#,
            r#"{ "name": "Same", "passives": ["a", { "id": "b" }] }"#,
            r#"{ "name": "Same ", "passives": ["a", "b"] }"#,
            r#"{ "name": "Same", "passives": ["a", "b"], "link": "" }"#,
        ] {
            assert_ne!(key_of(other), build, "{other}");
        }
    }
}
