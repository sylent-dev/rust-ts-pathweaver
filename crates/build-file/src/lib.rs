//! The `.build` files of the Build Planner of Path of Exile 2: a single JSON object, read by the
//! game from its `BuildPlanner` folder (format version 1, experimental, documented by Grinding
//! Gear Games at <https://www.pathofexile.com/developer/docs/game>).
//!
//! A file is read into [`Build`] and written back without loss: every field the format doesn't
//! know yet (a future version, another tool) is kept in `extra` and written again as it was, so
//! that opening and saving a file never drops what another tool put in it.
//!
//! The crate never panics: it runs in the WebAssembly module of the website, where a panic
//! would abort the page.
#![cfg_attr(
    not(test),
    deny(
        clippy::arithmetic_side_effects,
        clippy::indexing_slicing,
        clippy::string_slice,
        clippy::unwrap_used,
        clippy::expect_used,
        clippy::panic,
        clippy::unreachable,
        clippy::todo,
        clippy::unimplemented
    )
)]

mod content_key;
mod entries;
mod level_interval;
mod read_error;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub use entries::{Entry, InventorySlot, Passive, Skill, Support};
pub use level_interval::LevelInterval;
pub use read_error::{MAX_BYTES, ReadError};

/// The fields of a JSON object that the format doesn't name, kept in their order.
pub type Extra = Map<String, Value>;

/// A build: the root object of a `.build` file.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Build {
    /// The name the game lists the build under; the only field the format requires.
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    /// Where the build comes from, usually the page of its guide; any text, not always an
    /// address.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
    /// The id of the ascendancy, such as `Warrior1`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ascendancy: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub passives: Option<Vec<Entry<Passive>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub skills: Option<Vec<Entry<Skill>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub inventory_slots: Option<Vec<InventorySlot>>,
    #[serde(flatten)]
    pub extra: Extra,
}

impl Build {
    /// Reads the text of a `.build` file. A byte order mark at its start, which some editors of
    /// Windows write, is skipped. A field written twice in an object keeps its last value, as
    /// `JSON.parse` of the browsers does (`specs.md`, Unknown and invalid entries).
    ///
    /// # Errors
    ///
    /// When the text is larger than [`MAX_BYTES`], isn't JSON, isn't an object with a `name`, or
    /// holds a value of the wrong type or misses a field ([`ReadError`]).
    pub fn read(text: &str) -> Result<Self, ReadError> {
        if text.len() > MAX_BYTES {
            return Err(ReadError::TooLarge { bytes: text.len() });
        }
        let text = text.strip_prefix('\u{feff}').unwrap_or(text);
        let value: Value =
            serde_json::from_str(text).map_err(|error| ReadError::of_json(text, &error))?;
        if !value
            .as_object()
            .is_some_and(|object| object.contains_key("name"))
        {
            return Err(ReadError::NotABuild);
        }
        serde_path_to_error::deserialize(value).map_err(|error| ReadError::of_value(&error))
    }

    /// The text of the file, indented with four spaces as the files of Grinding Gear Games are.
    #[must_use]
    pub fn write(&self) -> String {
        let mut bytes = Vec::new();
        let formatter = serde_json::ser::PrettyFormatter::with_indent(b"    ");
        let mut serializer = serde_json::Serializer::with_formatter(&mut bytes, formatter);
        // Writing to a `Vec` can't fail, and every value of a `Build` is JSON: a map with keys
        // that are strings, numbers that are whole.
        if self.serialize(&mut serializer).is_err() {
            return String::new();
        }
        String::from_utf8(bytes).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests;
