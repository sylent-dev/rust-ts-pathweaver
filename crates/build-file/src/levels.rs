//! The levels of the character an entry applies at (`specs.md`, The level).

use std::collections::BTreeSet;

use crate::entries::Identified;
use crate::{Build, Entry, HintOnSlot, InventorySlot, LevelInterval, SupportOnSkill};

/// The lowest level of a character.
pub const LOWEST_LEVEL: u32 = 1;
/// The highest level of a character.
pub const HIGHEST_LEVEL: u32 = 100;

/// Levels of the character that follow one another, from the first to the last, both included:
/// at least one, all of them from 1 to 100.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LevelRange {
    first: u32,
    last: u32,
}

impl LevelRange {
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
}

impl LevelInterval {
    /// The levels the interval covers: from its level to 100 when it is a single level (allowed
    /// by the documentation of the format, without its meaning: to check in the game), from the
    /// first to the second when it is a list of two. None for an invalid interval, which covers
    /// no level of a character: a first level above the second or above 100, a list that isn't
    /// two levels.
    #[must_use]
    pub fn range(&self) -> Option<LevelRange> {
        match self {
            Self::Level(first) => LevelRange::between(*first, HIGHEST_LEVEL),
            Self::Levels(levels) => match levels.as_slice() {
                &[first, last] => LevelRange::between(first, last),
                _ => None,
            },
        }
    }
}

/// The levels of an entry from its `level_interval`: every level without one, none with an
/// invalid one.
fn levels_of(interval: Option<&LevelInterval>) -> Option<LevelRange> {
    interval.map_or(Some(LevelRange::ALL), LevelInterval::range)
}

impl<T: Identified> Entry<T> {
    /// The levels the entry is set for: every level without a `level_interval`, none with an
    /// invalid one. A support applies only at those of them where its skill applies too.
    #[must_use]
    pub fn levels(&self) -> Option<LevelRange> {
        levels_of(self.level_interval())
    }
}

impl InventorySlot {
    /// The levels the hint applies at: every level without a `level_interval`, none with an
    /// invalid one.
    #[must_use]
    pub fn levels(&self) -> Option<LevelRange> {
        levels_of(self.level_interval.get())
    }
}

/// An entry of a build, as the page names it: by its id, with its skill for a support, and by
/// its slot and its item for a hint of the inventory.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EntryName<'a> {
    Passive { id: &'a str },
    Skill { id: &'a str },
    Support(SupportOnSkill<'a>),
    Hint(HintOnSlot<'a>),
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
            .filter(|interval| interval.range().is_none())
            .map(|interval| Self { entry, interval })
    }
}

impl Build {
    /// The levels the build covers, those its slider moves among: from the lowest to the
    /// highest level its entries apply at. An entry without a `level_interval` applies at every
    /// level, so covers 1 to 100: a guide of the maps covers 65 to 100 only when each of its
    /// passives, skills and hints writes its levels. A support covers no more than its skill,
    /// an entry with an invalid interval none, and a build without a valid entry every level.
    #[must_use]
    pub fn covered_levels(&self) -> LevelRange {
        let covered = self
            .named_intervals()
            .filter_map(|(entry, interval)| match entry {
                // A support applies only where its skill does, whose levels count already.
                EntryName::Support(_) => None,
                EntryName::Passive { .. } | EntryName::Skill { .. } | EntryName::Hint(_) => {
                    levels_of(interval)
                }
            });
        covered
            .reduce(LevelRange::stretched_to)
            .unwrap_or(LevelRange::ALL)
    }

    /// The levels where what the build holds may differ from the level before: those where an
    /// entry starts to apply, and those just after one stops. At any other level, every entry
    /// applies as it did at the level before.
    pub(crate) fn turning_levels(&self) -> BTreeSet<u32> {
        let levels = self.named_intervals();
        let levels = levels.filter_map(|(_, interval)| levels_of(interval));
        levels
            .flat_map(|levels| [levels.first, levels.last.saturating_add(1)])
            .collect()
    }

    /// The entries whose `level_interval` is invalid, in the order of the file: the passives,
    /// each skill followed by its supports, the hints of the inventory.
    #[must_use]
    pub fn invalid_intervals(&self) -> Vec<InvalidInterval<'_>> {
        let intervals = self.named_intervals();
        let invalid =
            intervals.filter_map(|(entry, interval)| InvalidInterval::of(entry, interval));
        invalid.collect()
    }

    /// Every entry of the build with its `level_interval`, in the order of the file: the
    /// passives, each skill followed by its supports, the hints of the inventory.
    fn named_intervals(&self) -> impl Iterator<Item = (EntryName<'_>, Option<&LevelInterval>)> {
        let passives = self.passives.get().into_iter().flatten().map(|passive| {
            let name = EntryName::Passive { id: passive.id() };
            (name, passive.level_interval())
        });
        let gems = self.skills.get().into_iter().flatten().flat_map(|skill| {
            let supports = skill.supports().iter().map(move |support| {
                let name = EntryName::Support(SupportOnSkill {
                    id: support.id(),
                    skill: skill.id(),
                });
                (name, support.level_interval())
            });
            let name = EntryName::Skill { id: skill.id() };
            std::iter::once((name, skill.level_interval())).chain(supports)
        });
        let hints = self
            .inventory_slots
            .get()
            .into_iter()
            .flatten()
            .map(|hint| (EntryName::Hint(hint.on_slot()), hint.level_interval.get()));
        passives.chain(gems).chain(hints)
    }
}

#[cfg(test)]
mod tests;
