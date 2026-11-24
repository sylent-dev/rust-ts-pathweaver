//! How many things a build holds over its levels (`specs.md`, Window layout: the entries of the
//! colophon of the About tab), each thing counted once, as [`Build::at_level`] reads it: a
//! passive by its id and its weapon set, a skill by its id, a support by its id and its skill,
//! a hint by its slot and its item.

use std::collections::BTreeSet;

use crate::{Build, PassiveInSet, SupportOnSkill};

/// How many things a build holds at one level at least: what applies at no level (an entry
/// with an invalid interval, a support whose levels never meet those of its skill) counts
/// nothing.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HeldTotals {
    pub passives: usize,
    pub skills: usize,
    pub supports: usize,
    /// The hints of the inventory, the items of the colophon.
    pub hints: usize,
}

impl Build {
    /// How many things the build holds over its levels, each once, however many entries set it
    /// and at however many levels: the same passive listed twice, or a gem listed again from
    /// level to level, is one thing.
    #[must_use]
    pub fn held_totals(&self) -> HeldTotals {
        let skills = self.skills.get().into_iter().flatten();
        let skills = skills.filter_map(|skill| skill.levels().map(|levels| (skill, levels)));
        let skills: Vec<_> = skills.collect();
        let supports = skills.iter().flat_map(|(skill, skill_levels)| {
            let supports = skill.supports().iter();
            let supports = supports.filter(|support| {
                support
                    .levels()
                    .is_some_and(|levels| levels.meets(*skill_levels))
            });
            supports.map(|support| SupportOnSkill {
                id: support.id(),
                skill: skill.id(),
            })
        });
        let passives = self.passives.get().into_iter().flatten();
        let passives = passives.filter(|passive| passive.levels().is_some());
        let hints = self.inventory_slots.get().into_iter().flatten();
        let hints = hints.filter(|hint| hint.levels().is_some());
        HeldTotals {
            passives: distinct(passives.map(|passive| PassiveInSet {
                id: passive.id(),
                weapon_set: passive.weapon_set(),
            })),
            skills: distinct(skills.iter().map(|(skill, _)| skill.id())),
            supports: distinct(supports),
            hints: distinct(hints.map(|hint| hint.on_slot())),
        }
    }
}

/// How many different things there are.
fn distinct<T: Ord>(things: impl Iterator<Item = T>) -> usize {
    things.collect::<BTreeSet<_>>().len()
}

#[cfg(test)]
mod corpus;
#[cfg(test)]
mod tests;
