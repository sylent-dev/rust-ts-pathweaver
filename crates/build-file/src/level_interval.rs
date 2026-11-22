//! The levels of the character an entry is meant for.

use serde::{Deserialize, Serialize};

/// The `level_interval` of an entry, written by the format either as one level or as a list of
/// levels. Kept in the form it was read in, so that a file is written back as it was; what the
/// levels mean (from one level on, or between two) is read by [`LevelInterval::levels`].
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum LevelInterval {
    /// One level: `"level_interval": 40`.
    Level(u32),
    /// A list of levels, usually the first and the last: `"level_interval": [1, 14]`.
    Levels(Vec<u32>),
}
