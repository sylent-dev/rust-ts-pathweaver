//! The texts of a file the page shows as they are, without markup (`specs.md`, The header of a
//! build): the name, the author and a `link` that isn't an address. Like the author's texts,
//! they lose the characters that move the text around them (4g3, its third review): a mark
//! that turns the direction, in the name of a build, would turn the words drawn after it.

use std::borrow::Cow;

use crate::Build;
use crate::markup::{is_blank, without_characters_that_move_the_text};

impl Build {
    /// The name of the build as the page shows it: without the characters that move the text
    /// around it, nor the spaces around it; empty when nothing is left.
    #[must_use]
    pub fn shown_name(&self) -> Cow<'_, str> {
        plain_text(&self.name).unwrap_or_default()
    }

    /// The author of the build as the page shows it: without the characters that move the text
    /// around it, nor the spaces around it; none when the file has none or nothing is left.
    #[must_use]
    pub fn shown_author(&self) -> Option<Cow<'_, str>> {
        self.author.get().and_then(|author| plain_text(author))
    }
}

/// A text of the file shown as it is: without the characters that move the text around it,
/// nor the spaces around it; none when nothing is left.
pub(crate) fn plain_text(text: &str) -> Option<Cow<'_, str>> {
    if is_blank(text) {
        return None;
    }
    Some(match without_characters_that_move_the_text(text) {
        Cow::Borrowed(text) => Cow::Borrowed(text.trim()),
        Cow::Owned(text) => Cow::Owned(text.trim().to_owned()),
    })
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::fixtures::build;

    #[test]
    fn the_name_and_the_author_lose_what_moves_the_text_around_them() {
        let mut build = build(json!({ "author": " \u{202e}Fub\u{2066}gun\u{2069} " }));
        build.name = "\u{202b}Ice Shot\u{200f} \u{2029}Deadeye\u{85}".to_owned();

        assert_eq!(build.shown_name(), "Ice Shot\u{200f} Deadeye");
        assert_eq!(build.shown_author().as_deref(), Some("Fubgun"));
    }

    #[test]
    fn a_text_without_such_characters_is_borrowed_as_it_is_but_its_spaces() {
        let mut build = build(json!({ "author": "Fubgun" }));
        build.name = "  Ice Shot  ".to_owned();

        assert!(matches!(build.shown_name(), Cow::Borrowed("Ice Shot")));
        assert!(matches!(
            build.shown_author(),
            Some(Cow::Borrowed("Fubgun"))
        ));
    }

    #[test]
    fn an_author_of_spaces_and_such_characters_only_is_none() {
        for author in [json!(""), json!(" \u{202e} \u{2069}"), json!(null)] {
            let build = build(json!({ "author": author }));

            assert_eq!(build.shown_author(), None, "{author}");
        }
        let mut build = build(json!({}));
        build.name = "\u{202e} ".to_owned();
        assert_eq!(build.shown_name(), "");
    }
}
