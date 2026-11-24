//! What the tests of several modules share: the builds they read, and the things they expect
//! a build to hold.

use std::collections::BTreeMap;
use std::path::Path;

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

/// The builds of the corpus (`docs/build-files-in-the-wild.md`), kept out of Git in
/// `inputs/builds/`, by the name of their file.
pub fn corpus() -> BTreeMap<String, Build> {
    let folder = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../inputs/builds");
    let files = std::fs::read_dir(folder)
        .unwrap()
        .map(|file| file.unwrap().path());
    files
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "build")
        })
        .map(|path| {
            let name = path.file_name().unwrap().to_str().unwrap().to_owned();
            let build = Build::read(&std::fs::read_to_string(&path).unwrap()).unwrap();
            (name, build)
        })
        .collect()
}

/// A thing held without a note.
pub fn held<T>(what: T) -> Held<'static, T> {
    noted(what, &[])
}

/// A thing held with the notes of its author.
pub fn noted<T>(what: T, notes: &[&'static str]) -> Held<'static, T> {
    Held {
        what,
        notes: notes.iter().copied().collect(),
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
