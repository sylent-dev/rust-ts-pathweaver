//! The entries of a build: its passives, its skills with their supports, and the hints of its
//! inventory slots.

use std::marker::PhantomData;

use serde::de::value::MapAccessDeserializer;
use serde::de::{self, MapAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize};

use crate::{Extra, LevelInterval, Nullable};

/// An entry the format lets write as its id alone, when it needs no other field:
/// `"strength89"` or `{ "id": "strength89", "level_interval": [1, 20] }`. Kept in the form it
/// was read in.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(untagged)]
pub enum Entry<T> {
    Id(String),
    Detailed(T),
}

/// Read by its JSON type rather than by `#[serde(untagged)]`, which would try each form and
/// say only that none matched: an object is read as its fields, so that a wrong value inside
/// it keeps its place (`skills[0].support_skills[0].id`, not `skills[0]`).
impl<'de, T: Deserialize<'de>> Deserialize<'de> for Entry<T> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct EntryVisitor<T>(PhantomData<T>);

        impl<'de, T: Deserialize<'de>> Visitor<'de> for EntryVisitor<T> {
            type Value = Entry<T>;

            fn expecting(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                formatter.write_str("an id or an object")
            }

            fn visit_str<E: de::Error>(self, id: &str) -> Result<Self::Value, E> {
                Ok(Entry::Id(id.to_owned()))
            }

            fn visit_string<E: de::Error>(self, id: String) -> Result<Self::Value, E> {
                Ok(Entry::Id(id))
            }

            fn visit_map<A: MapAccess<'de>>(self, map: A) -> Result<Self::Value, A::Error> {
                T::deserialize(MapAccessDeserializer::new(map)).map(Entry::Detailed)
            }
        }

        deserializer.deserialize_any(EntryVisitor(PhantomData))
    }
}

/// The fields every entry shares, through [`Entry::id`], [`Entry::level_interval`] and
/// [`Entry::additional_text`].
pub trait Identified {
    fn id(&self) -> &str;
    fn level_interval(&self) -> Option<&LevelInterval>;
    fn additional_text(&self) -> Option<&str>;
}

impl<T: Identified> Entry<T> {
    /// The id of the entry, in either form.
    #[must_use]
    pub fn id(&self) -> &str {
        match self {
            Self::Id(id) => id,
            Self::Detailed(entry) => entry.id(),
        }
    }

    /// The levels the entry is meant for; none for an entry written as its id alone.
    #[must_use]
    pub fn level_interval(&self) -> Option<&LevelInterval> {
        match self {
            Self::Id(_) => None,
            Self::Detailed(entry) => entry.level_interval(),
        }
    }

    /// The text of the author on the entry, with the markup of the game; none for an entry
    /// written as its id alone.
    #[must_use]
    pub fn additional_text(&self) -> Option<&str> {
        match self {
            Self::Id(_) => None,
            Self::Detailed(entry) => entry.additional_text(),
        }
    }
}

impl Entry<Skill> {
    /// The supports of the skill, none for a skill written as its id alone.
    #[must_use]
    pub fn supports(&self) -> &[Entry<Support>] {
        match self {
            Self::Id(_) => &[],
            Self::Detailed(skill) => skill.support_skills.get().map_or(&[], Vec::as_slice),
        }
    }
}

/// A passive of the passive skill tree.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Passive {
    /// An id of the `PassiveSkills` table, such as `strength89`.
    pub id: String,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub level_interval: Nullable<LevelInterval>,
    /// The weapon set the passive is allocated in, from 0 to 2.
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub weapon_set: Nullable<u32>,
    /// Shown when the passive is hovered in the game, with the markup of the game.
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub additional_text: Nullable<String>,
    #[serde(flatten)]
    pub extra: Extra,
}

/// A skill gem, cut from an Uncut Skill Gem or an Uncut Spirit Gem.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Skill {
    /// An id of the `BaseItemTypes` table, such as `Metadata/Items/Gems/SkillGemEarthquake`.
    pub id: String,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub level_interval: Nullable<LevelInterval>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub additional_text: Nullable<String>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub support_skills: Nullable<Vec<Entry<Support>>>,
    #[serde(flatten)]
    pub extra: Extra,
}

/// A support gem of a skill.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Support {
    /// An id of the `BaseItemTypes` table.
    pub id: String,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub level_interval: Nullable<LevelInterval>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub additional_text: Nullable<String>,
    #[serde(flatten)]
    pub extra: Extra,
}

/// A hint shown on a slot of the inventory of the character.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct InventorySlot {
    /// An id of the `Inventories` table, such as `Weapon1`.
    pub inventory_id: String,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub slot_x: Nullable<u32>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub slot_y: Nullable<u32>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub level_interval: Nullable<LevelInterval>,
    /// A unique item suggested for the slot, a `UniqueName` of the `Words` table.
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub unique_name: Nullable<String>,
    #[serde(default, skip_serializing_if = "Nullable::is_absent")]
    pub additional_text: Nullable<String>,
    #[serde(flatten)]
    pub extra: Extra,
}

macro_rules! identified {
    ($($entry:ty),*) => {
        $(impl Identified for $entry {
            fn id(&self) -> &str {
                &self.id
            }

            fn level_interval(&self) -> Option<&LevelInterval> {
                self.level_interval.get()
            }

            fn additional_text(&self) -> Option<&str> {
                self.additional_text.as_deref()
            }
        })*
    };
}

identified!(Passive, Skill, Support);
