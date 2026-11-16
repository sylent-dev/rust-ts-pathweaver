//! The first thing the interface shows of a dropped file: what the build is, and how much it
//! holds. Replaced by the viewer of the passive tree, the skills and the inventory.

use pathweaver_build_file::Build;
use serde::Serialize;
use tsify::{Ts, Tsify};
use wasm_bindgen::prelude::{JsError, wasm_bindgen};

/// A build as the interface lists it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct BuildSummary {
    pub name: String,
    pub author: Option<String>,
    pub ascendancy: Option<String>,
    pub passive_count: u32,
    pub skill_count: u32,
    pub inventory_slot_count: u32,
}

/// A count of the core as a number that JavaScript holds exactly.
fn count<T>(entries: Option<&Vec<T>>) -> u32 {
    entries.map_or(0, |entries| {
        u32::try_from(entries.len()).unwrap_or(u32::MAX)
    })
}

/// The summary of the text of a `.build` file, in plain Rust for `cargo test`.
///
/// # Errors
///
/// The sentence of the core when the text isn't a `.build` file.
pub fn summarize(text: &str) -> Result<BuildSummary, String> {
    let build = Build::read(text).map_err(|error| error.to_string())?;
    Ok(BuildSummary {
        passive_count: count(build.passives.as_ref()),
        skill_count: count(build.skills.as_ref()),
        inventory_slot_count: count(build.inventory_slots.as_ref()),
        name: build.name,
        author: build.author,
        ascendancy: build.ascendancy,
    })
}

/// The summary of the text of a `.build` file; throws an `Error` with the sentence of the core
/// when the text isn't one.
///
/// # Errors
///
/// When the text isn't a `.build` file, or when the summary can't be made a JavaScript object,
/// which it never is.
#[wasm_bindgen(js_name = summarizeBuild)]
pub fn summarize_build(text: &str) -> Result<Ts<BuildSummary>, JsError> {
    let summary = summarize(text).map_err(|message| JsError::new(&message))?;
    Ok(Ts::from_rust(&summary)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_build_is_summarized_with_its_counts() {
        let text = include_str!("../../build-file/tests/builds/every-field.build");

        assert_eq!(
            summarize(text),
            Ok(BuildSummary {
                name: "Every Field".to_owned(),
                author: Some("Pathweaver".to_owned()),
                ascendancy: Some("Warrior1".to_owned()),
                passive_count: 3,
                skill_count: 2,
                inventory_slot_count: 2,
            })
        );
    }

    #[test]
    fn a_text_that_isnt_a_build_gives_the_sentence_of_the_core() {
        let error = summarize("[]").unwrap_err();

        assert!(error.starts_with("not a .build file"), "{error}");
    }
}
