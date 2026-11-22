//! What a build holds at a level of the character, as its file says (`specs.md`, The level):
//! each thing once, whatever the number of entries that set it there.

use crate::{Build, Entry, InventorySlot, Levels, Passive};

/// A thing a build holds at a level (a gem, a passive, the item of a hint), once, with the
/// notes of its author on the entries that set it there, in their order: several when two
/// entries of the file set the same thing at the same level.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Held<'a, T> {
    pub what: T,
    pub notes: Vec<&'a str>,
}

/// A support on its skill, by their ids: the same support on two skills is two things.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct SupportOnSkill<'a> {
    pub id: &'a str,
    pub skill: &'a str,
}

/// The weapon set a passive is taken in.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum WeaponSet {
    /// In both sets: a `weapon_set` of 0, left out, or that the game doesn't have.
    Shared,
    /// Set I, a `weapon_set` of 1.
    First,
    /// Set II, a `weapon_set` of 2.
    Second,
}

/// A passive in its weapon set: the same passive taken in set I and in set II is two things.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct PassiveInSet<'a> {
    pub id: &'a str,
    pub weapon_set: WeaponSet,
}

/// The item a hint of the inventory names.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum HintItem<'a> {
    /// Its `unique_name`.
    Unique(&'a str),
    /// Without a unique: the first line of its text, as its author wrote it, markup included;
    /// empty for a hint without text.
    Named(&'a str),
}

/// A hint on its slot, by its item and never by its place: the hints that share a slot (the
/// three charms of `Charm1`) are told apart by their item.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct HintOnSlot<'a> {
    /// The `inventory_id` of the slot.
    pub slot: &'a str,
    pub item: HintItem<'a>,
}

/// What a build holds at a level, each list in the order of the file.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BuildAtLevel<'a> {
    /// The skills, by their id.
    pub skills: Vec<Held<'a, &'a str>>,
    /// The supports that apply with their skill.
    pub supports: Vec<Held<'a, SupportOnSkill<'a>>>,
    pub passives: Vec<Held<'a, PassiveInSet<'a>>>,
    /// The hints of the inventory, the note of each its whole text.
    pub hints: Vec<Held<'a, HintOnSlot<'a>>>,
}

impl Build {
    /// What the build holds at a level: the things of its entries that apply there. A support
    /// applies only where its skill does. None at a level a character doesn't have.
    #[must_use]
    pub fn at_level(&self, level: u32) -> BuildAtLevel<'_> {
        let applies = |levels: Option<Levels>| levels.is_some_and(|levels| levels.contains(level));
        let skills = || {
            let skills = self.skills.get().into_iter().flatten();
            skills.filter(|skill| applies(skill.levels()))
        };
        let supports = skills().flat_map(|skill| {
            let supports = skill.supports().iter();
            let supports = supports.filter(|support| applies(support.levels()));
            supports.map(|support| {
                let on_skill = SupportOnSkill {
                    id: support.id(),
                    skill: skill.id(),
                };
                (on_skill, note(support.additional_text()))
            })
        });
        let passives = self.passives.get().into_iter().flatten();
        let passives = passives.filter(|passive| applies(passive.levels()));
        let hints = self.inventory_slots.get().into_iter().flatten();
        let hints = hints.filter(|hint| applies(hint.levels()));
        BuildAtLevel {
            skills: held_once(skills().map(|skill| (skill.id(), note(skill.additional_text())))),
            supports: held_once(supports),
            passives: held_once(passives.map(|passive| {
                let in_set = PassiveInSet {
                    id: passive.id(),
                    weapon_set: passive.weapon_set(),
                };
                (in_set, note(passive.additional_text()))
            })),
            hints: held_once(hints.map(|hint| {
                let on_slot = HintOnSlot {
                    slot: &hint.inventory_id,
                    item: hint.item(),
                };
                (on_slot, note(hint.additional_text.as_deref()))
            })),
        }
    }
}

impl Entry<Passive> {
    /// The weapon set the passive is taken in: both for a passive written as its id alone.
    #[must_use]
    pub fn weapon_set(&self) -> WeaponSet {
        let weapon_set = match self {
            Self::Id(_) => None,
            Self::Detailed(passive) => passive.weapon_set.get(),
        };
        match weapon_set {
            Some(1) => WeaponSet::First,
            Some(2) => WeaponSet::Second,
            None | Some(_) => WeaponSet::Shared,
        }
    }
}

impl InventorySlot {
    /// The item the hint names: its unique, or the first line of its text.
    #[must_use]
    pub fn item(&self) -> HintItem<'_> {
        if let Some(unique) = note(self.unique_name.as_deref()) {
            return HintItem::Unique(unique);
        }
        let text = note(self.additional_text.as_deref());
        let first_line = text.and_then(|text| text.lines().next());
        HintItem::Named(first_line.map_or("", str::trim_end))
    }
}

/// A text of the author as two levels compare it: without the spaces around it, none when
/// nothing is left.
fn note(text: Option<&str>) -> Option<&str> {
    text.map(str::trim).filter(|text| !text.is_empty())
}

/// Each thing once, in the order it first comes in, with the notes of all its entries.
fn held_once<'a, T: PartialEq>(
    entries: impl Iterator<Item = (T, Option<&'a str>)>,
) -> Vec<Held<'a, T>> {
    let mut things: Vec<Held<'a, T>> = Vec::new();
    for (what, note) in entries {
        match things.iter_mut().find(|held| held.what == what) {
            Some(held) => held.notes.extend(note),
            None => things.push(Held {
                what,
                notes: note.into_iter().collect(),
            }),
        }
    }
    things
}

#[cfg(test)]
mod tests;
