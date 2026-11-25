//! The guide of a build (`specs.md`, The header of a build): one link, the `link` of its file,
//! the one its author named; when it has none, the first address of its description among its
//! pieces shown (the owner, 2026-11-21: one guide, not two links to the same site; 2026-11-24: a
//! link the page doesn't show never becomes the guide).

use std::borrow::Cow;

use crate::Markup;
use crate::markup::is_address;
use crate::plain_text::plain_text;

/// Where the guide of a build leads.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Guide<'a> {
    /// The `link` of the file, one address whole by the rule of the addresses of a
    /// description.
    Link(&'a str),
    /// The `link` of the file, a text that isn't one address whole, shown as it is: without the
    /// characters that move the text around it, nor those that show nothing at its ends.
    Text(Cow<'a, str>),
    /// The first address of the description among its pieces shown, for a file without a
    /// `link`.
    FromDescription(&'a str),
}

impl<'a> Guide<'a> {
    /// The guide of a build of this `link` and this description read with its links; none
    /// when the link shows nothing (empty, or of spaces, marks that move the text and
    /// characters drawn as nothing only) and the description holds no address. The link is read as an address before any character is
    /// taken from it: one with a hidden character is a text.
    #[must_use]
    pub fn of(link: Option<&'a str>, description: Option<&'a Markup>) -> Option<Self> {
        let link = link.and_then(|link| Some((link.trim(), plain_text(link)?)));
        match link {
            Some((link, _)) if is_address(link) => Some(Self::Link(link)),
            Some((_, text)) => Some(Self::Text(text)),
            None => description
                .and_then(Markup::first_address)
                .map(Self::FromDescription),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const DESCRIPTION: &str =
        "<b>{Guide}: https://maxroll.gg/guide, planner: https://maxroll.gg/planner";

    #[test]
    fn the_link_of_the_file_is_the_guide_before_an_address_of_the_description() {
        let description = Markup::of_description(DESCRIPTION);
        assert_eq!(
            Guide::of(Some("https://mobalytics.gg/a"), Some(&description)),
            Some(Guide::Link("https://mobalytics.gg/a"))
        );
    }

    #[test]
    fn a_link_that_is_not_an_address_is_its_text() {
        let description = Markup::of_description(DESCRIPTION);
        for link in [
            "http://a.com",
            "mobalytics.gg/a",
            "HTTPS://a.com",
            "https://",
            "https://.",
            "https://a.com.",
            "https://a.com and its guide",
            "https://a\u{200b}.com",
            "see https://a.com",
        ] {
            assert_eq!(
                Guide::of(Some(link), Some(&description)),
                Some(Guide::Text(link.into())),
                "{link}"
            );
        }
    }

    #[test]
    fn a_link_shown_as_text_loses_what_moves_the_text_around_it() {
        assert_eq!(
            Guide::of(Some(" \u{202e}my guide\u{2069} "), None),
            Some(Guide::Text("my guide".into()))
        );
        assert_eq!(
            Guide::of(Some("https://a.com\u{202e}"), None),
            Some(Guide::Text("https://a.com".into()))
        );
    }

    #[test]
    fn a_link_that_is_one_address_whole_is_a_link() {
        for link in [
            "https://a.com",
            "https://w.org/Foo_(bar)",
            "https://a.com/x?y=1&z=2#c",
        ] {
            assert_eq!(
                Guide::of(Some(link), None),
                Some(Guide::Link(link)),
                "{link}"
            );
        }
    }

    #[test]
    fn a_link_is_read_without_the_spaces_around_it() {
        assert_eq!(
            Guide::of(Some(" https://a.com \n"), None),
            Some(Guide::Link("https://a.com"))
        );
    }

    #[test]
    fn without_a_link_the_guide_is_the_first_address_of_the_description() {
        let description = Markup::of_description(DESCRIPTION);
        for link in [
            None,
            Some(""),
            Some("  "),
            Some(" \u{202e}\u{2069} "),
            Some("\u{200b}\u{17b5}\u{feff}"),
        ] {
            assert_eq!(
                Guide::of(link, Some(&description)),
                Some(Guide::FromDescription("https://maxroll.gg/guide")),
                "{link:?}"
            );
        }
    }

    #[test]
    fn the_guide_is_the_first_address_among_the_pieces_shown() {
        let past_the_cut = Markup::of_description(&("x\n".repeat(600) + "https://a.com"));
        assert!(past_the_cut.is_cut());
        assert_eq!(Guide::of(None, Some(&past_the_cut)), None);
        let before_the_cut =
            Markup::of_description(&("https://a.com\n".to_owned() + &"x\n".repeat(600)));
        assert!(before_the_cut.is_cut());
        assert_eq!(
            Guide::of(None, Some(&before_the_cut)),
            Some(Guide::FromDescription("https://a.com"))
        );
    }

    #[test]
    fn without_a_link_nor_an_address_there_is_no_guide() {
        let description = Markup::of_description("No address, http://a.com");
        assert_eq!(Guide::of(None, Some(&description)), None);
        assert_eq!(Guide::of(Some(""), None), None);
    }
}
