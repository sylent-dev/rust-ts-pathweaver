//! What changes at a level of a build (`specs.md`, The level): what it holds at the level
//! against what it held at the level before, read from its file alone.

use std::collections::{BTreeMap, BTreeSet};

use crate::{
    Build, BuildAtLevel, Held, HintItem, HintOnSlot, PassiveInSet, SupportOnSkill, WeaponSet,
};

/// One change of a build at a level, a line of the window of « N changes »: a gem, a hint or a
/// note counts as one change, each group of passives as one.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Change<'a> {
    /// A skill comes, with the supports that come with it, by their ids.
    SkillAdded {
        skill: Held<'a, &'a str>,
        supports: Vec<Held<'a, &'a str>>,
    },
    /// A skill goes, and its supports with it.
    SkillRemoved { id: &'a str },
    /// A support comes onto a skill already there.
    SupportAdded(Held<'a, SupportOnSkill<'a>>),
    /// A support leaves a skill that stays.
    SupportRemoved(SupportOnSkill<'a>),
    /// The passives taken in a weapon set, by their ids.
    PassivesTaken {
        weapon_set: WeaponSet,
        passives: Vec<Held<'a, &'a str>>,
    },
    /// The passives given back, of every weapon set: a respec.
    PassivesGivenBack(Vec<PassiveInSet<'a>>),
    /// A hint comes on a slot.
    HintAdded(Held<'a, HintOnSlot<'a>>),
    /// A hint comes on a slot where the hint of another item goes, the only ones to come and
    /// to go there: where several do, the file doesn't say which replaces which.
    HintReplaced {
        hint: Held<'a, HintOnSlot<'a>>,
        before: HintItem<'a>,
    },
    /// A hint goes.
    HintRemoved(HintOnSlot<'a>),
    /// A skill that stays is set again with other notes of its author: the new ones.
    SkillNoteChanged(Held<'a, &'a str>),
    /// A support that stays on its skill is set again with other notes: the new ones.
    SupportNoteChanged(Held<'a, SupportOnSkill<'a>>),
    /// A hint that stays is set again with another text: the new one.
    HintTextChanged(Held<'a, HintOnSlot<'a>>),
}

impl Change<'_> {
    /// Whether the change makes a marker of its level: every change but the passives taken,
    /// which a file can add at every level.
    fn makes_marker(&self) -> bool {
        match self {
            Self::PassivesTaken { .. } => false,
            Self::SkillAdded { .. }
            | Self::SkillRemoved { .. }
            | Self::SupportAdded(_)
            | Self::SupportRemoved(_)
            | Self::PassivesGivenBack(_)
            | Self::HintAdded(_)
            | Self::HintReplaced { .. }
            | Self::HintRemoved(_)
            | Self::SkillNoteChanged(_)
            | Self::SupportNoteChanged(_)
            | Self::HintTextChanged(_) => true,
        }
    }
}

/// The changes of a build at one of its levels.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LevelChanges<'a> {
    pub level: u32,
    /// At least one, in the order of the categories.
    pub changes: Vec<Change<'a>>,
}

impl Build {
    /// What changes at each level of the build where something does, from the lowest to the
    /// highest. None at the lowest level it covers, which nothing comes before to compare
    /// with. Only the levels where an entry starts or has just stopped are read: reading all
    /// hundred took 3.8 s for a snapshot of 1 MB (`changes/large_files.rs`).
    #[must_use]
    pub fn changes_by_level(&self) -> Vec<LevelChanges<'_>> {
        let levels = self.covered_levels();
        let turning_levels = self.turning_levels();
        let mut before = self.at_level(levels.first());
        let mut by_level = Vec::new();
        for level in (levels.first()..=levels.last()).skip(1) {
            // The build holds what it held at the level before, which `before` still is.
            if !turning_levels.contains(&level) {
                continue;
            }
            let held = self.at_level(level);
            let changes = held.changes_since(&before);
            if !changes.is_empty() {
                by_level.push(LevelChanges { level, changes });
            }
            before = held;
        }
        by_level
    }

    /// The markers of the build: the levels where it changes, from the lowest to the highest,
    /// but those where it only takes passives, which a file can add at every level.
    #[must_use]
    pub fn markers(&self) -> Vec<u32> {
        let by_level = self.changes_by_level().into_iter();
        let with_marker = by_level.filter(|level| level.changes.iter().any(Change::makes_marker));
        with_marker.map(|level| level.level).collect()
    }
}

impl<'a> BuildAtLevel<'a> {
    /// What changes from the level before to this one, in the order of the categories: the
    /// skills, the supports, the passives, the hints of the inventory, the notes; each in the
    /// order of the file. A thing held at both levels changes nothing, whatever the entries
    /// that set it, unless its notes differ.
    fn changes_since(&self, before: &Self) -> Vec<Change<'a>> {
        let mut changes = self.gem_changes_since(before);
        changes.extend(self.passive_changes_since(before));
        changes.extend(self.hint_changes_since(before));
        changes.extend(self.note_changes_since(before));
        changes
    }

    /// The skills that come, with their supports, and go; then the supports that come onto a
    /// skill already there, and leave one that stays.
    fn gem_changes_since(&self, before: &Self) -> Vec<Change<'a>> {
        let skills_of = |held: &Self| -> BTreeSet<&'a str> {
            held.skills.iter().map(|skill| skill.what).collect()
        };
        let (skills, skills_before) = (skills_of(self), skills_of(before));
        let mut supports_of: BTreeMap<&str, Vec<Held<'a, &'a str>>> = BTreeMap::new();
        for support in &self.supports {
            let of_skill = supports_of.entry(support.what.skill).or_default();
            of_skill.push(support.named(support.what.id));
        }
        let skills_added = things_absent_from(&self.skills, &before.skills).map(|skill| {
            let supports = supports_of.get(skill.what).cloned().unwrap_or_default();
            Change::SkillAdded {
                skill: skill.clone(),
                supports,
            }
        });
        let skills_removed = things_absent_from(&before.skills, &self.skills)
            .map(|skill| Change::SkillRemoved { id: skill.what });
        let supports_added = things_absent_from(&self.supports, &before.supports)
            .filter(|support| skills_before.contains(support.what.skill))
            .map(|support| Change::SupportAdded(support.clone()));
        let supports_removed = things_absent_from(&before.supports, &self.supports)
            .filter(|support| skills.contains(support.what.skill))
            .map(|support| Change::SupportRemoved(support.what));
        skills_added
            .chain(skills_removed)
            .chain(supports_added)
            .chain(supports_removed)
            .collect()
    }

    /// The passives taken, one change for each weapon set that takes some, then those given
    /// back, in one change.
    fn passive_changes_since(&self, before: &Self) -> Vec<Change<'a>> {
        let (mut shared, mut first, mut second) = (Vec::new(), Vec::new(), Vec::new());
        for passive in things_absent_from(&self.passives, &before.passives) {
            let taken_in_set = match passive.what.weapon_set {
                WeaponSet::Shared => &mut shared,
                WeaponSet::First => &mut first,
                WeaponSet::Second => &mut second,
            };
            taken_in_set.push(passive.named(passive.what.id));
        }
        let taken = [
            (WeaponSet::Shared, shared),
            (WeaponSet::First, first),
            (WeaponSet::Second, second),
        ];
        let taken = taken
            .into_iter()
            .filter(|(_, passives)| !passives.is_empty());
        let mut changes: Vec<Change<'a>> = taken
            .map(|(weapon_set, passives)| Change::PassivesTaken {
                weapon_set,
                passives,
            })
            .collect();
        let given_back: Vec<PassiveInSet<'a>> =
            things_absent_from(&before.passives, &self.passives)
                .map(|passive| passive.what)
                .collect();
        if !given_back.is_empty() {
            changes.push(Change::PassivesGivenBack(given_back));
        }
        changes
    }

    /// The hints that come, those that replace another, those that go.
    fn hint_changes_since(&self, before: &Self) -> Vec<Change<'a>> {
        let coming: Vec<_> = things_absent_from(&self.hints, &before.hints).collect();
        let going: Vec<_> = things_absent_from(&before.hints, &self.hints).collect();
        let (only_coming, only_going) = (only_on_their_slot(&coming), only_on_their_slot(&going));
        // The item a hint that comes replaces: the one that goes from its slot, when one hint
        // comes and one goes there.
        let replaced_on = |slot| {
            let replaced = only_going.get(slot)?;
            only_coming.get(slot).map(|_| replaced.item)
        };
        let added = coming
            .iter()
            .filter(|hint| replaced_on(hint.what.slot).is_none());
        let added = added.map(|hint| Change::HintAdded((*hint).clone()));
        let replaced = coming.iter().filter_map(|hint| {
            replaced_on(hint.what.slot).map(|before| Change::HintReplaced {
                hint: (*hint).clone(),
                before,
            })
        });
        let removed = going
            .iter()
            .filter(|hint| replaced_on(hint.what.slot).is_none());
        let removed = removed.map(|hint| Change::HintRemoved(hint.what));
        added.chain(replaced).chain(removed).collect()
    }

    /// The skills, the supports and the hints held at both levels whose notes differ.
    fn note_changes_since(&self, before: &Self) -> Vec<Change<'a>> {
        let skills = things_with_other_notes(&self.skills, &before.skills);
        let supports = things_with_other_notes(&self.supports, &before.supports);
        let hints = things_with_other_notes(&self.hints, &before.hints);
        skills
            .map(|skill| Change::SkillNoteChanged(skill.clone()))
            .chain(supports.map(|support| Change::SupportNoteChanged(support.clone())))
            .chain(hints.map(|hint| Change::HintTextChanged(hint.clone())))
            .collect()
    }
}

impl<'a, T> Held<'a, T> {
    /// The thing under another name, with its notes: a support by its id alone, under its
    /// skill.
    fn named<N>(&self, what: N) -> Held<'a, N> {
        Held {
            what,
            notes: self.notes.clone(),
        }
    }
}

/// The things of `held` that `others` doesn't hold, in their order.
fn things_absent_from<'h, 'a, T: Ord>(
    held: &'h [Held<'a, T>],
    others: &'h [Held<'a, T>],
) -> impl Iterator<Item = &'h Held<'a, T>> {
    let others: BTreeSet<&T> = others.iter().map(|held| &held.what).collect();
    held.iter().filter(move |held| !others.contains(&held.what))
}

/// The things of `held` that `before` held too, with other notes.
fn things_with_other_notes<'h, 'a, T: Ord>(
    held: &'h [Held<'a, T>],
    before: &'h [Held<'a, T>],
) -> impl Iterator<Item = &'h Held<'a, T>> {
    let notes_before: BTreeMap<&T, &[&str]> = before
        .iter()
        .map(|held| (&held.what, held.notes.as_slice()))
        .collect();
    held.iter().filter(move |held| {
        let notes_before = notes_before.get(&held.what);
        notes_before.is_some_and(|notes_before| *notes_before != held.notes.as_slice())
    })
}

/// The hints of a list that are the only one on their slot, by their slot.
fn only_on_their_slot<'a>(
    hints: &[&Held<'a, HintOnSlot<'a>>],
) -> BTreeMap<&'a str, HintOnSlot<'a>> {
    let mut on_slot: BTreeMap<&str, Vec<HintOnSlot<'a>>> = BTreeMap::new();
    for hint in hints {
        on_slot.entry(hint.what.slot).or_default().push(hint.what);
    }
    let only = on_slot
        .into_iter()
        .filter_map(|(slot, hints)| match hints.as_slice() {
            &[only] => Some((slot, only)),
            _ => None,
        });
    only.collect()
}

#[cfg(test)]
mod corpus;
#[cfg(test)]
mod large_files;
#[cfg(test)]
mod tests;
