//! What the tests of several modules share: the builds they read, and the things they expect
//! a build to hold.

use serde_json::{Value, json};

use crate::{Build, Held, HintItem, HintOnSlot, PassiveInSet, SupportOnSkill, WeaponSet};

/// A build of the given fields, written as in a file, under a name of its own.
pub fn build(fields: Value) -> Build {
    let Value::Object(mut fields) = fields else {
        panic!("the fields of a build are an object");
    };
    fields.insert("name".to_owned(), json!("A build of the tests"));
    Build::read(&Value::Object(fields).to_string()).unwrap()
}

/// A thing held without a note.
pub fn held<T>(what: T) -> Held<'static, T> {
    noted(what, &[])
}

/// A thing held with the notes of its author.
pub fn noted<T>(what: T, notes: &[&'static str]) -> Held<'static, T> {
    Held {
        what,
        notes: notes.to_vec(),
    }
}

pub fn support(id: &'static str, skill: &'static str) -> SupportOnSkill<'static> {
    SupportOnSkill { id, skill }
}

pub fn passive(id: &'static str, weapon_set: WeaponSet) -> PassiveInSet<'static> {
    PassiveInSet { id, weapon_set }
}

pub fn hint(slot: &'static str, item: HintItem<'static>) -> HintOnSlot<'static> {
    HintOnSlot { slot, item }
}
