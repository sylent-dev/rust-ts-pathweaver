//! A field the format lets leave out, kept in the form it was read in.

use std::ops::Deref;

use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// A field the format lets leave out: absent, written `null`, or a value. An `Option` would
/// read `"author": null` as no author and write nothing back; the file is written as it was
/// read (`specs.md`, Unknown and invalid entries). Its field is written with
/// `#[serde(default, skip_serializing_if = "Nullable::is_absent")]`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Nullable<T> {
    Absent,
    Null,
    Value(T),
}

impl<T> Default for Nullable<T> {
    /// Absent, for a field the file doesn't write: without the bound `T: Default` that
    /// `#[derive(Default)]` would ask.
    fn default() -> Self {
        Self::Absent
    }
}

impl<T> Nullable<T> {
    /// The value, `None` for a field absent or `null`: what the viewer shows of either.
    #[must_use]
    pub fn get(&self) -> Option<&T> {
        match self {
            Self::Value(value) => Some(value),
            Self::Absent | Self::Null => None,
        }
    }

    /// The value, taken out of the field.
    #[must_use]
    pub fn into_option(self) -> Option<T> {
        match self {
            Self::Value(value) => Some(value),
            Self::Absent | Self::Null => None,
        }
    }

    /// Whether the file doesn't write the field, which is then written back without it.
    #[must_use]
    pub fn is_absent(&self) -> bool {
        matches!(self, Self::Absent)
    }
}

impl<T: Deref> Nullable<T> {
    /// The value borrowed as its target, a `&str` for a `String`, as `Option::as_deref`.
    #[must_use]
    pub fn as_deref(&self) -> Option<&T::Target> {
        self.get().map(Deref::deref)
    }
}

impl<T: Serialize> Serialize for Nullable<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Value(value) => value.serialize(serializer),
            // An absent field is skipped by its `skip_serializing_if` before it gets here.
            Self::Absent | Self::Null => serializer.serialize_none(),
        }
    }
}

/// Called for a field the file writes only, `default` giving [`Nullable::Absent`] otherwise.
impl<'de, T: Deserialize<'de>> Deserialize<'de> for Nullable<T> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        Ok(Option::deserialize(deserializer)?.map_or(Self::Null, Self::Value))
    }
}
