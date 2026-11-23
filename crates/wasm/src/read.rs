//! A file opened in the page (`specs.md`, Opening builds): the build it holds, or why it is
//! refused, as data the interface writes in each language.

use pathweaver_build_file::{Build, ReadError};
use serde::Serialize;
use tsify::{Ts, Tsify};
use wasm_bindgen::prelude::{JsError, wasm_bindgen};

/// What a file gives: its build, or why it is refused. Not an exception: a file of a stranger
/// that isn't a build is expected.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum BuildFile {
    Build { build: OpenedBuild },
    Refused { error: RefusedFile },
}

/// A build as the page opens it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct OpenedBuild {
    /// The key of its content: two files of the same build have the same key.
    pub content_key: String,
    pub name: String,
    pub author: Option<String>,
    /// The id of the ascendancy, such as `Warrior1`.
    pub ascendancy: Option<String>,
    /// Usually the page of its guide; any text, not always an address.
    pub link: Option<String>,
    pub levels: BuildLevels,
}

/// The levels of a build, as far as the page moves among them (`specs.md`, The level).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct BuildLevels {
    /// The lowest level its entries cover.
    pub lowest: u32,
    /// The highest level its entries cover, included.
    pub highest: u32,
    /// The markers: the levels where the build changes, but those where it only takes
    /// passives, each once, from the lowest to the highest.
    pub markers: Vec<u32>,
}

impl From<&Build> for BuildLevels {
    fn from(build: &Build) -> Self {
        let levels = build.covered_levels();
        Self {
            lowest: levels.first(),
            highest: levels.last(),
            markers: build.markers(),
        }
    }
}

/// Why a file is refused, [`ReadError`] as the interface reads it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(
    tag = "reason",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum RefusedFile {
    /// Larger than the limit of the core, in bytes.
    TooLarge { bytes: u64, limit: usize },
    /// The line of the error, from 1, and its text cut to 80 characters around the error;
    /// for a text that ends too soon, its last line with a character other than a space. The
    /// column of the core, in bytes, means nothing to JavaScript, which counts in UTF-16.
    NotJson { line: usize, excerpt: String },
    /// JSON, but not an object with a `name`; or a text empty, or of spaces only.
    NotABuild,
    /// The place of a value of the wrong type, such as `skills[2].support_skills[0].id`.
    WrongValue { field: String },
    /// The place of a field an entry needs that is missing, such as `passives[0].id`.
    MissingField { field: String },
}

impl From<ReadError> for RefusedFile {
    fn from(error: ReadError) -> Self {
        match error {
            ReadError::TooLarge { bytes } => Self::TooLarge {
                bytes,
                limit: pathweaver_build_file::MAX_BYTES,
            },
            ReadError::NotJson { line, excerpt, .. } => Self::NotJson { line, excerpt },
            ReadError::NotABuild => Self::NotABuild,
            ReadError::WrongValue { field } => Self::WrongValue { field },
            ReadError::MissingField { field } => Self::MissingField { field },
        }
    }
}

/// Why a file of `bytes` bytes is refused from its size alone, before its text is read; none
/// when the core reads a file of that size. In plain Rust for `cargo test`.
#[must_use]
pub fn refused_by_size(bytes: u64) -> Option<RefusedFile> {
    ReadError::of_size(bytes).map(RefusedFile::from)
}

/// Why a file of `bytes` bytes is refused from its size alone, so that the page never reads
/// the text of a file the core would refuse (`specs.md`, Opening builds): the rule of the core,
/// not a copy of its limit. A `bigint`, since a file may be larger than a `number` of 32 bits.
///
/// # Errors
///
/// When the result can't be made a JavaScript object, which it never is.
#[wasm_bindgen(js_name = refusedBySize)]
pub fn refused_by_size_of_file(bytes: u64) -> Result<Option<Ts<RefusedFile>>, JsError> {
    Ok(refused_by_size(bytes)
        .map(|refused| Ts::from_rust(&refused))
        .transpose()?)
}

/// The build of the text of a file, or why it is refused, in plain Rust for `cargo test`.
#[must_use]
pub fn read_file(text: &str) -> BuildFile {
    match Build::read(text) {
        Ok(build) => BuildFile::Build {
            build: OpenedBuild {
                content_key: build.content_key(),
                levels: BuildLevels::from(&build),
                name: build.name,
                author: build.author.into_option(),
                ascendancy: build.ascendancy.into_option(),
                link: build.link.into_option(),
            },
        },
        Err(error) => BuildFile::Refused {
            error: error.into(),
        },
    }
}

/// The build of the text of a file, or why it is refused.
///
/// # Errors
///
/// When the result can't be made a JavaScript object, which it never is.
#[wasm_bindgen(js_name = readBuildFile)]
pub fn read_build_file(text: &str) -> Result<Ts<BuildFile>, JsError> {
    Ok(Ts::from_rust(&read_file(text))?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_build_gives_its_key_and_what_the_page_shows_of_it() {
        let text = include_str!("../../build-file/tests/builds/every-field.build");

        assert_eq!(
            read_file(text),
            BuildFile::Build {
                build: OpenedBuild {
                    content_key: Build::read(text).unwrap().content_key(),
                    name: "Every Field".to_owned(),
                    author: Some("Pathweaver".to_owned()),
                    ascendancy: Some("Warrior1".to_owned()),
                    link: Some("https://example.com/guides/every-field".to_owned()),
                    levels: BuildLevels {
                        lowest: 1,
                        highest: 100,
                        markers: vec![30, 51, 60],
                    },
                },
            }
        );
    }

    #[test]
    fn a_build_gives_the_levels_it_covers_and_its_markers() {
        let guide_of_the_maps = r#"{ "name": "Maps", "skills": [
            { "id": "Spark", "level_interval": [65, 89] },
            { "id": "Comet", "level_interval": [90, 100] }
        ], "passives": [{ "id": "melee17", "level_interval": [70, 100] }] }"#;

        let BuildFile::Build { build } = read_file(guide_of_the_maps) else {
            panic!("the text is a build");
        };
        assert_eq!(
            build.levels,
            BuildLevels {
                lowest: 65,
                highest: 100,
                markers: vec![90],
            }
        );
    }

    #[test]
    fn each_error_of_the_core_crosses_with_its_values() {
        let too_large = " ".repeat(pathweaver_build_file::MAX_BYTES + 1);
        let cases = [
            (
                too_large.as_str(),
                RefusedFile::TooLarge {
                    bytes: u64::try_from(pathweaver_build_file::MAX_BYTES + 1).unwrap(),
                    limit: pathweaver_build_file::MAX_BYTES,
                },
            ),
            (
                "{ oops",
                RefusedFile::NotJson {
                    line: 1,
                    excerpt: "{ oops".to_owned(),
                },
            ),
            ("[]", RefusedFile::NotABuild),
            (
                r#"{ "name": 3 }"#,
                RefusedFile::WrongValue {
                    field: "name".to_owned(),
                },
            ),
            (
                r#"{ "name": "Bad", "passives": [{}] }"#,
                RefusedFile::MissingField {
                    field: "passives[0].id".to_owned(),
                },
            ),
        ];

        for (text, error) in cases {
            assert_eq!(read_file(text), BuildFile::Refused { error });
        }
    }

    #[test]
    fn a_size_is_refused_by_the_rule_of_the_core_with_its_limit() {
        let limit = pathweaver_build_file::MAX_BYTES;
        let larger = u64::try_from(limit + 1).unwrap();

        assert_eq!(refused_by_size(u64::try_from(limit).unwrap()), None);
        assert_eq!(
            refused_by_size(larger),
            Some(RefusedFile::TooLarge {
                bytes: larger,
                limit
            })
        );
    }
}
