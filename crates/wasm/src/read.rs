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
    TooLarge { bytes: usize, limit: usize },
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

/// The build of the text of a file, or why it is refused, in plain Rust for `cargo test`.
#[must_use]
pub fn read_file(text: &str) -> BuildFile {
    match Build::read(text) {
        Ok(build) => BuildFile::Build {
            build: OpenedBuild {
                content_key: build.content_key(),
                name: build.name,
                author: build.author,
                ascendancy: build.ascendancy,
                link: build.link,
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
                },
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
                    bytes: pathweaver_build_file::MAX_BYTES + 1,
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
}
