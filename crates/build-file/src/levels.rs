//! The levels of the character an entry applies at (`specs.md`, The level).

use crate::entries::Identified;
use crate::{Build, Entry, InventorySlot, LevelInterval, Skill, Support};

/// The lowest level of a character.
pub const LOWEST_LEVEL: u32 = 1;
/// The highest level of a character.
pub const HIGHEST_LEVEL: u32 = 100;

/// Levels of the character that follow one another, from the first to the last, both included:
/// at least one, all of them from 1 to 100.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Levels {
    first: u32,
    last: u32,
}

impl Levels {
    /// Every level of a character: where an entry without a `level_interval` applies.
    pub const ALL: Self = Self {
        first: LOWEST_LEVEL,
        last: HIGHEST_LEVEL,
    };

    /// The levels of a character from `first` to `last`, both included: `0` counts as `1`, and a
    /// `last` above 100 stops at 100. None when they hold no level of a character: `first`
    /// above `last`, or above 100.
    fn between(first: u32, last: u32) -> Option<Self> {
        let first = first.max(LOWEST_LEVEL);
        let last = last.clamp(LOWEST_LEVEL, HIGHEST_LEVEL);
        (first <= last).then_some(Self { first, last })
    }

    /// The lowest of the levels, included.
    #[must_use]
    pub fn first(self) -> u32 {
        self.first
    }

    /// The highest of the levels, included.
    #[must_use]
    pub fn last(self) -> u32 {
        self.last
    }

    /// Whether `level` is one of the levels.
    #[must_use]
    pub fn contains(self, level: u32) -> bool {
        self.first <= level && level <= self.last
    }

    /// The levels from the lowest of both to the highest of both.
    fn stretched_to(self, other: Self) -> Self {
        Self {
            first: self.first.min(other.first),
            last: self.last.max(other.last),
        }
    }

    /// The levels of both: where a support applies, whose skill must apply too. None when they
    /// share no level.
    #[must_use]
    pub fn shared_with(self, other: Self) -> Option<Self> {
        Self::between(self.first.max(other.first), self.last.min(other.last))
    }
}

impl LevelInterval {
    /// The levels the interval covers: from its level to 100 when it is a single level (allowed
    /// by the documentation of the format, without its meaning: to check in the game), from the
    /// first to the second when it is a list of two. None for an invalid interval, which covers
    /// no level of a character: a first level above the second or above 100, a list that isn't
    /// two levels.
    #[must_use]
    pub fn levels(&self) -> Option<Levels> {
        match self {
            Self::Level(first) => Levels::between(*first, HIGHEST_LEVEL),
            Self::Levels(levels) => match levels.as_slice() {
                &[first, last] => Levels::between(first, last),
                _ => None,
            },
        }
    }
}

/// The levels of an entry from its `level_interval`: every level without one, none with an
/// invalid one.
fn levels_of(interval: Option<&LevelInterval>) -> Option<Levels> {
    interval.map_or(Some(Levels::ALL), LevelInterval::levels)
}

impl<T: Identified> Entry<T> {
    /// The levels the entry is set for: every level without a `level_interval`, none with an
    /// invalid one. A support applies only at those of them where its skill applies too
    /// ([`Levels::shared_with`]).
    #[must_use]
    pub fn levels(&self) -> Option<Levels> {
        levels_of(self.level_interval())
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

impl InventorySlot {
    /// The levels the hint applies at: every level without a `level_interval`, none with an
    /// invalid one.
    #[must_use]
    pub fn levels(&self) -> Option<Levels> {
        levels_of(self.level_interval.get())
    }
}

/// An entry of a build, as the page names it: by its id, and by its skill for a support.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EntryName<'a> {
    Passive {
        id: &'a str,
    },
    Skill {
        id: &'a str,
    },
    Support {
        id: &'a str,
        skill: &'a str,
    },
    /// A hint of the inventory, by the id of its slot.
    Hint {
        slot: &'a str,
    },
}

/// An entry whose `level_interval` is invalid: it applies at no level, and the warnings of the
/// build list it (`specs.md`, The level).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct InvalidInterval<'a> {
    pub entry: EntryName<'a>,
    /// The interval as the file writes it.
    pub interval: &'a LevelInterval,
}

impl<'a> InvalidInterval<'a> {
    /// The invalid interval of an entry, none for an entry without an interval or with a valid
    /// one.
    fn of(entry: EntryName<'a>, interval: Option<&'a LevelInterval>) -> Option<Self> {
        interval
            .filter(|interval| interval.levels().is_none())
            .map(|interval| Self { entry, interval })
    }
}

impl Build {
    /// The levels the build covers, those its slider moves among: from the lowest to the
    /// highest level its entries write and apply at, 65 to 100 for a guide of the maps. An
    /// entry without a `level_interval` covers none of its own, and a build without any, a
    /// snapshot of a character, covers every level.
    #[must_use]
    pub fn levels(&self) -> Levels {
        let written = |interval: Option<&LevelInterval>| interval.and_then(LevelInterval::levels);
        let passives = self.passives.get().into_iter().flatten();
        let passives = passives.filter_map(|passive| written(passive.level_interval()));
        let gems = self.skills.get().into_iter().flatten().flat_map(|skill| {
            let supports = skill.supports().iter().filter_map(move |support| {
                written(support.level_interval())?.shared_with(skill.levels()?)
            });
            written(skill.level_interval()).into_iter().chain(supports)
        });
        let hints = self.inventory_slots.get().into_iter().flatten();
        let hints = hints.filter_map(|hint| written(hint.level_interval.get()));
        let covered = passives
            .chain(gems)
            .chain(hints)
            .reduce(Levels::stretched_to);
        covered.unwrap_or(Levels::ALL)
    }

    /// The entries whose `level_interval` is invalid, in the order of the file: the passives,
    /// each skill followed by its supports, the hints of the inventory.
    #[must_use]
    pub fn invalid_intervals(&self) -> Vec<InvalidInterval<'_>> {
        let passives = self
            .passives
            .get()
            .into_iter()
            .flatten()
            .filter_map(|passive| {
                InvalidInterval::of(
                    EntryName::Passive { id: passive.id() },
                    passive.level_interval(),
                )
            });
        let gems = self.skills.get().into_iter().flatten().flat_map(|skill| {
            let supports = skill.supports().iter().filter_map(|support| {
                InvalidInterval::of(
                    EntryName::Support {
                        id: support.id(),
                        skill: skill.id(),
                    },
                    support.level_interval(),
                )
            });
            InvalidInterval::of(EntryName::Skill { id: skill.id() }, skill.level_interval())
                .into_iter()
                .chain(supports)
        });
        let hints = self
            .inventory_slots
            .get()
            .into_iter()
            .flatten()
            .filter_map(|hint| {
                InvalidInterval::of(
                    EntryName::Hint {
                        slot: &hint.inventory_id,
                    },
                    hint.level_interval.get(),
                )
            });
        passives.chain(gems).chain(hints).collect()
    }
}

#[cfg(test)]
mod tests;
