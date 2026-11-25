//! A file opened in the page (`specs.md`, Opening builds): the build it holds, or why it is
//! refused, as data the interface writes in each language.

use std::borrow::Cow;

use pathweaver_build_file::{Build, Guide, HeldTotals, ReadError};
use serde::Serialize;
use tsify::{Ts, Tsify};
use wasm_bindgen::prelude::{JsError, wasm_bindgen};

use crate::markup::{BuildGuide, MarkupText};

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
    /// Its name, without the characters that move the text around it, nor the spaces around it;
    /// empty when it shows nothing.
    pub name: String,
    /// Its author, without the characters that move the text around it, nor the spaces around
    /// it; none when it shows nothing.
    pub author: Option<String>,
    /// The id of the ascendancy, such as `Warrior1`.
    pub ascendancy: Option<String>,
    /// Its description with the markup of the game and its addresses as links; none when the
    /// author wrote none.
    pub description: Option<MarkupText>,
    /// Its guide: the `link` of the file, else the first address of its description among its
    /// pieces shown.
    pub guide: Option<BuildGuide>,
    pub levels: BuildLevels,
    /// How many things it holds over its levels, each once: the entries of its colophon.
    pub totals: BuildTotals,
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

/// How many things a build holds over its levels, each once, [`HeldTotals`] as the interface
/// reads it.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct BuildTotals {
    pub passives: usize,
    pub skills: usize,
    pub supports: usize,
    /// The hints of the inventory, the items of the colophon.
    pub hints: usize,
}

impl From<HeldTotals> for BuildTotals {
    fn from(totals: HeldTotals) -> Self {
        let HeldTotals {
            passives,
            skills,
            supports,
            hints,
        } = totals;
        Self {
            passives,
            skills,
            supports,
            hints,
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
    TooLarge { bytes: u64, limit: u64 },
    /// Not text: bytes that aren't UTF-8, such as an image.
    NotText,
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
            ReadError::NotText => Self::NotText,
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
/// not a copy of its limit. A `u64`, a `bigint` in JavaScript: wasm-bindgen would take a file of
/// 4 GiB or more modulo 2³² as a `u32`, as a small one.
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

/// The build of the bytes of a file, or why it is refused, in plain Rust for `cargo test`.
#[must_use]
pub fn read_file(bytes: &[u8]) -> BuildFile {
    match Build::read_bytes(bytes) {
        Ok(build) => {
            let description = build.description_markup();
            let guide =
                Guide::of(build.link.as_deref(), description.as_ref()).map(BuildGuide::from);
            BuildFile::Build {
                build: OpenedBuild {
                    content_key: build.content_key(),
                    levels: BuildLevels::from(&build),
                    totals: build.held_totals().into(),
                    description: description.map(MarkupText::from),
                    guide,
                    name: build.shown_name().into_owned(),
                    author: build.shown_author().map(Cow::into_owned),
                    ascendancy: build.ascendancy.into_option(),
                },
            }
        }
        Err(error) => BuildFile::Refused {
            error: error.into(),
        },
    }
}

/// The build of the bytes of a file, or why it is refused: the bytes as they are on the disk,
/// a `Uint8Array` in JavaScript, so that the core measures the file and not its text, and says
/// when it isn't text.
///
/// # Errors
///
/// When the result can't be made a JavaScript object, which it never is.
#[wasm_bindgen(js_name = readBuildFile)]
pub fn read_build_file(bytes: &[u8]) -> Result<Ts<BuildFile>, JsError> {
    Ok(Ts::from_rust(&read_file(bytes))?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::markup::{MarkupColour, MarkupColourName, MarkupPiece, MarkupSize, MarkupStyle};

    /// A text that goes on no further than its pieces.
    fn whole(pieces: Vec<MarkupPiece>) -> MarkupText {
        MarkupText {
            pieces,
            is_cut: false,
        }
    }

    #[test]
    fn a_build_gives_its_key_and_what_the_page_shows_of_it() {
        let text = include_str!("../../build-file/tests/builds/every-field.build");

        assert_eq!(
            read_file(text.as_bytes()),
            BuildFile::Build {
                build: OpenedBuild {
                    content_key: Build::read(text).unwrap().content_key(),
                    name: "Every Field".to_owned(),
                    author: Some("Pathweaver".to_owned()),
                    ascendancy: Some("Warrior1".to_owned()),
                    description: Some(whole(vec![MarkupPiece::Text {
                        text: "A build written for the tests: every field of version 1 of the format, in both of its forms.".to_owned(),
                        style: MarkupStyle::default(),
                    }])),
                    guide: Some(BuildGuide::Link {
                        address: "https://example.com/guides/every-field".to_owned(),
                    }),
                    levels: BuildLevels {
                        lowest: 1,
                        highest: 100,
                        markers: vec![30, 51, 60],
                    },
                    totals: BuildTotals {
                        passives: 3,
                        skills: 2,
                        supports: 2,
                        hints: 2,
                    },
                },
            }
        );
    }

    #[test]
    fn a_description_crosses_with_its_styles_and_its_links_and_gives_the_guide() {
        let text = r#"{ "name": "Amazon", "link": "",
            "description": "<b>{<rgb(134, 189, 163)>{Guide}}:\r\nhttps://maxroll.gg/a." }"#;

        let BuildFile::Build { build } = read_file(text.as_bytes()) else {
            panic!("the text is a build");
        };
        let green = MarkupStyle {
            is_bold: true,
            colour: Some(MarkupColour::Rgb {
                red: 134,
                green: 189,
                blue: 163,
            }),
            ..MarkupStyle::default()
        };
        let plain = MarkupStyle::default();
        assert_eq!(
            build.description,
            Some(whole(vec![
                MarkupPiece::Text {
                    text: "Guide".to_owned(),
                    style: green,
                },
                MarkupPiece::Text {
                    text: ":".to_owned(),
                    style: plain,
                },
                MarkupPiece::LineBreak,
                MarkupPiece::Link {
                    address: "https://maxroll.gg/a".to_owned(),
                    style: plain,
                },
                MarkupPiece::Text {
                    text: ".".to_owned(),
                    style: plain,
                },
            ]))
        );
        assert_eq!(
            build.guide,
            Some(BuildGuide::FromDescription {
                address: "https://maxroll.gg/a".to_owned(),
            })
        );
    }

    #[test]
    fn a_description_cut_by_the_core_crosses_cut() {
        let text = format!(
            r#"{{ "name": "Steps", "description": "{}" }}"#,
            "x\\n".repeat(501)
        );

        let BuildFile::Build { build } = read_file(text.as_bytes()) else {
            panic!("the text is a build");
        };
        let step = [
            MarkupPiece::Text {
                text: "x".to_owned(),
                style: MarkupStyle::default(),
            },
            MarkupPiece::LineBreak,
        ];
        let Some(description) = build.description else {
            panic!("a description");
        };
        assert!(description.is_cut);
        assert!(
            description.pieces == step.iter().cycle().take(1_000).cloned().collect::<Vec<_>>(),
            "x and a line break, 500 times"
        );
    }

    #[test]
    fn each_style_and_colour_crosses_as_the_core_read_it() {
        let text = r#"{ "name": "Styles", "description":
            "<i>{<u>{<s>{a}<m>{b}<l>{c}}}<gold>{d}<gray>{e}<unique>{f}" }"#;

        let BuildFile::Build { build } = read_file(text.as_bytes()) else {
            panic!("the text is a build");
        };
        let italic_underlined = |size| MarkupStyle {
            is_italic: true,
            is_underlined: true,
            size: Some(size),
            ..MarkupStyle::default()
        };
        let named = |name| MarkupStyle {
            colour: Some(MarkupColour::Named { name }),
            ..MarkupStyle::default()
        };
        let piece = |text: &str, style| MarkupPiece::Text {
            text: text.to_owned(),
            style,
        };
        assert_eq!(
            build.description,
            Some(whole(vec![
                piece("a", italic_underlined(MarkupSize::Small)),
                piece("b", italic_underlined(MarkupSize::Medium)),
                piece("c", italic_underlined(MarkupSize::Large)),
                piece("d", named(MarkupColourName::Gold)),
                piece("e", named(MarkupColourName::Grey)),
                piece("f", named(MarkupColourName::Unique)),
            ]))
        );
        assert_eq!(build.guide, None);
    }

    #[test]
    fn each_named_colour_crosses_under_the_name_of_its_tag() {
        let names = [
            "white", "grey", "black", "red", "orange", "yellow", "green", "blue", "indigo",
            "violet", "bronze", "silver", "gold", "unique",
        ];
        for (written, name) in names
            .map(|name| (name, name))
            .into_iter()
            .chain([("gray", "grey")])
        {
            let text = format!(r#"{{ "name": "Colours", "description": "<{written}>{{x}}" }}"#);
            let BuildFile::Build { build } = read_file(text.as_bytes()) else {
                panic!("the text is a build");
            };
            let Some([MarkupPiece::Text { style, .. }]) = build
                .description
                .as_ref()
                .map(|description| description.pieces.as_slice())
            else {
                panic!("one text: {:?}", build.description);
            };
            assert_eq!(
                serde_json::to_value(style.colour).unwrap(),
                serde_json::json!({ "kind": "named", "name": name }),
                "{written}"
            );
        }
    }

    #[test]
    fn each_guide_crosses_as_the_core_read_it() {
        let guide_of = |link: &str, description: &str| {
            let text = format!(
                r#"{{ "name": "Guide", "link": "{link}", "description": "{description}" }}"#
            );
            let BuildFile::Build { build } = read_file(text.as_bytes()) else {
                panic!("the text is a build");
            };
            serde_json::to_value(build.guide).unwrap()
        };
        assert_eq!(
            guide_of("https://a.com", ""),
            serde_json::json!({ "kind": "link", "address": "https://a.com" })
        );
        assert_eq!(
            guide_of("mobalytics.gg/a", ""),
            serde_json::json!({ "kind": "text", "text": "mobalytics.gg/a" })
        );
        assert_eq!(
            guide_of("", "See https://b.com"),
            serde_json::json!({ "kind": "fromDescription", "address": "https://b.com" })
        );
        assert_eq!(guide_of("", "none"), serde_json::Value::Null);
    }

    #[test]
    fn the_name_the_author_and_a_link_of_text_cross_without_what_moves_the_text_around_them() {
        let text = r#"{ "name": "\u202bIce Shot\u2069", "author": "\u202e ",
            "link": "my \u2066guide" }"#;

        let BuildFile::Build { build } = read_file(text.as_bytes()) else {
            panic!("the text is a build");
        };
        assert_eq!(
            (build.name.as_str(), build.author, build.guide),
            (
                "Ice Shot",
                None,
                Some(BuildGuide::Text {
                    text: "my guide".to_owned()
                })
            )
        );
    }

    #[test]
    fn a_build_gives_the_levels_it_covers_and_its_markers() {
        let guide_of_the_maps = r#"{ "name": "Maps", "skills": [
            { "id": "Spark", "level_interval": [65, 89] },
            { "id": "Comet", "level_interval": [90, 100] }
        ], "passives": [{ "id": "melee17", "level_interval": [70, 100] }] }"#;

        let BuildFile::Build { build } = read_file(guide_of_the_maps.as_bytes()) else {
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
        let limit = pathweaver_build_file::MAX_BYTES;
        let too_large = " ".repeat(usize::try_from(limit + 1).unwrap());
        let cases: [(&[u8], RefusedFile); 6] = [
            (
                too_large.as_bytes(),
                RefusedFile::TooLarge {
                    bytes: limit + 1,
                    limit,
                },
            ),
            (b"\x89PNG", RefusedFile::NotText),
            (
                b"{ oops",
                RefusedFile::NotJson {
                    line: 1,
                    excerpt: "{ oops".to_owned(),
                },
            ),
            (b"[]", RefusedFile::NotABuild),
            (
                br#"{ "name": 3 }"#,
                RefusedFile::WrongValue {
                    field: "name".to_owned(),
                },
            ),
            (
                br#"{ "name": "Bad", "passives": [{}] }"#,
                RefusedFile::MissingField {
                    field: "passives[0].id".to_owned(),
                },
            ),
        ];

        for (bytes, error) in cases {
            assert_eq!(read_file(bytes), BuildFile::Refused { error });
        }
    }

    #[test]
    fn a_size_is_refused_by_the_rule_of_the_core_with_its_limit() {
        let limit = pathweaver_build_file::MAX_BYTES;
        let larger = limit + 1;

        assert_eq!(refused_by_size(limit), None);
        assert_eq!(
            refused_by_size(larger),
            Some(RefusedFile::TooLarge {
                bytes: larger,
                limit
            })
        );
    }
}
