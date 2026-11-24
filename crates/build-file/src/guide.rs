//! The guide of a build (`specs.md`, The header of a build): one link, the `link` of its file,
//! the one its author named; when it has none, the first address of its description (the
//! owner, 2026-11-21: one guide, not two links to the same site).

use crate::Markup;
use crate::markup::is_address;

/// Where the guide of a build leads.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Guide<'a> {
    /// The `link` of the file, one address whole by the rule of the addresses of a
    /// description.
    Link(&'a str),
    /// The `link` of the file, a text that isn't one address whole, shown as it is.
    Text(&'a str),
    /// The first address of the description, for a file without a `link`.
    FromDescription(&'a str),
}

impl<'a> Guide<'a> {
    /// The guide of a build of this `link` and this description read with its links; none
    /// when the link is empty or of spaces only and the description holds no address.
    #[must_use]
    pub fn of(link: Option<&'a str>, description: Option<&'a Markup>) -> Option<Self> {
        match link.map(str::trim).filter(|link| !link.is_empty()) {
            Some(link) if is_address(link) => Some(Self::Link(link)),
            Some(link) => Some(Self::Text(link)),
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
        ] {
            assert_eq!(
                Guide::of(Some(link), Some(&description)),
                Some(Guide::Text(link)),
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
        for link in [None, Some(""), Some("  ")] {
            assert_eq!(
                Guide::of(link, Some(&description)),
                Some(Guide::FromDescription("https://maxroll.gg/guide")),
                "{link:?}"
            );
        }
    }

    #[test]
    fn without_a_link_nor_an_address_there_is_no_guide() {
        let description = Markup::of_description("No address, http://a.com");
        assert_eq!(Guide::of(None, Some(&description)), None);
        assert_eq!(Guide::of(Some(""), None), None);
    }
}
