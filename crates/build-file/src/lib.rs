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

mod changes;
mod content_key;
mod entries;
#[cfg(test)]
mod fixtures;
mod held;
mod level_interval;
mod levels;
mod nullable;
mod read_error;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub use changes::{Change, LevelChanges};
pub use entries::{Entry, InventorySlot, Passive, Skill, Support};
pub use held::{
    BuildAtLevel, Held, HintItem, HintOnSlot, Notes, PassiveInSet, SupportOnSkill, WeaponSet,
};
pub use level_interval::LevelInterval;
pub use levels::{EntryName, HIGHEST_LEVEL, InvalidInterval, LOWEST_LEVEL, LevelRange};
pub use nullable::Nullable;
pub use read_error::{MAX_BYTES, ReadError};

/// The fields of a JSON object that the format doesn't name, kept in their order.
pub type Extra = Map<String, Value>;

/// A build: the root object of a `.build` file.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Build {
    /// The name the game lists the build under; the only field the format requires.
    pub name: String,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub author: Nullable<String>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub description: Nullable<String>,
    /// Where the build comes from, usually the page of its guide; any text, not always an
    /// address.
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub link: Nullable<String>,
    /// The id of the ascendancy, such as `Warrior1`.
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub ascendancy: Nullable<String>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub passives: Nullable<Vec<Entry<Passive>>>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub skills: Nullable<Vec<Entry<Skill>>>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub inventory_slots: Nullable<Vec<InventorySlot>>,
    #[serde(flatten)]
    pub extra: Extra,
}

/// The size of a text or of the bytes of a file, as the size of a file is given.
fn file_size_of(length: usize) -> u64 {
    u64::try_from(length).unwrap_or(u64::MAX)
}

impl Build {
    /// Reads the bytes of a `.build` file, as they are on the disk: their size is the size of
    /// the file, and bytes that aren't UTF-8 (an image) are refused as such, rather than read
    /// as a text of replacement characters three times larger.
    ///
    /// # Errors
    ///
    /// When the bytes are more than [`MAX_BYTES`], aren't UTF-8, or their text isn't a build
    /// ([`Build::read`]).
    pub fn read_bytes(bytes: &[u8]) -> Result<Self, ReadError> {
        if let Some(error) = ReadError::of_size(file_size_of(bytes.len())) {
            return Err(error);
        }
        let text = std::str::from_utf8(bytes).map_err(|_| ReadError::NotText)?;
        Self::read_measured(text)
    }

    /// Reads the text of a `.build` file. A byte order mark at its start, which some editors of
    /// Windows write, is skipped. A field written twice in an object keeps its last value, as
    /// `JSON.parse` of the browsers does (`specs.md`, Unknown and invalid entries).
    ///
    /// # Errors
    ///
    /// When the text is larger than [`MAX_BYTES`], isn't JSON, isn't an object with a `name`, or
    /// holds a value of the wrong type or misses a field ([`ReadError`]).
    pub fn read(text: &str) -> Result<Self, ReadError> {
        if let Some(error) = ReadError::of_size(file_size_of(text.len())) {
            return Err(error);
        }
        Self::read_measured(text)
    }

    /// Reads a text whose size was checked: its byte order mark skipped, its JSON, its build.
    fn read_measured(text: &str) -> Result<Self, ReadError> {
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
