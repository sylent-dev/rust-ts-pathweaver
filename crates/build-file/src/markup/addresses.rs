//! The addresses an author writes in a description (`specs.md`, The header of a build): each
//! that starts with `https://` is a link, made of the visible characters of ASCII, up to a
//! quote, a tag or a brace of the markup, never on a mark of punctuation that closes the
//! sentence, and only where what is drawn after it shows where it ends.

use std::ops::Range;

/// The start of an address that is a link, in lower case only.
const SCHEME: &str = "https://";

/// Whether a character may be part of an address: a visible character of ASCII, but the quotes,
/// the angle brackets of a tag and the braces of the markup. A space, a hidden character (a
/// space without width, a mark that turns the direction of the text, which could show an
/// address other than the one opened) and any character beyond ASCII end it (4g2, the owner,
/// 2026-11-24).
fn is_in_address(character: char) -> bool {
    character.is_ascii_graphic() && !matches!(character, '"' | '\'' | '<' | '>' | '{' | '}')
}

/// The marks of punctuation that close a sentence, never the last character of an address.
const CLOSING_MARKS: [char; 7] = ['.', ',', ';', ':', '!', '?', ']'];

/// Whether a character drawn after an address may close the sentence it ends: the marks of
/// [`CLOSING_MARKS`], a `)`, and the ideographic full stop `。` of Chinese and Japanese (4g3,
/// the owner, 2026-11-24), which no reader takes for a letter of an address.
fn closes_the_sentence(character: char) -> bool {
    CLOSING_MARKS.contains(&character) || matches!(character, ')' | '。')
}

/// Whether a character drawn after an address shows where it ends: a space, or a quote, an
/// angle bracket or a brace, which an address never holds.
fn sets_an_address_apart(character: char) -> bool {
    character.is_whitespace() || matches!(character, '"' | '\'' | '<' | '>' | '{' | '}')
}

/// Whether the characters drawn right after an address, in order, show where it ends: after
/// the marks that may close the sentence, the end of the text or a character that sets it
/// apart (4g3, its second review: a space without width, a letter beyond ASCII or a change of
/// style glued to an address drew `https://pathofexile.co` as `https://pathofexile.com/forum`).
/// `None` stands for a line break or the end of the text.
pub fn ends_where_it_shows(after: impl IntoIterator<Item = Option<char>>) -> bool {
    after
        .into_iter()
        .find(|character| !character.is_some_and(closes_the_sentence))
        .flatten()
        .is_none_or(sets_an_address_apart)
}

/// The address without the marks that close the sentence after it: a `)` is one only when it
/// doesn't close a `(` of the address (`wiki/Foo_(bar)`), as the links of GitHub read it.
fn without_closing_marks(address: &str) -> &str {
    let opening = address.matches('(').count();
    let mut closing = address.matches(')').count();
    let mut kept = address;
    while let Some(last) = kept.chars().next_back() {
        let closes_the_sentence = match last {
            ')' => closing > opening,
            mark => CLOSING_MARKS.contains(&mark),
        };
        if !closes_the_sentence {
            break;
        }
        if last == ')' {
            closing = closing.saturating_sub(1);
        }
        kept = kept
            .get(..kept.len().saturating_sub(last.len_utf8()))
            .unwrap_or_default();
    }
    kept
}

/// The addresses of a text, by their place in its bytes, in order: each starts with
/// [`SCHEME`] and holds more than it.
pub fn of(text: &str) -> impl Iterator<Item = Range<usize>> + '_ {
    let mut from = 0;
    std::iter::from_fn(move || {
        loop {
            let rest = text.get(from..)?;
            let start = from.checked_add(rest.find(SCHEME)?)?;
            let after_scheme = start.checked_add(SCHEME.len())?;
            let tail = text.get(after_scheme..)?;
            let length = tail
                .find(|character| !is_in_address(character))
                .unwrap_or(tail.len());
            let address = without_closing_marks(tail.get(..length)?);
            let end = after_scheme.checked_add(address.len())?;
            from = after_scheme.checked_add(length)?;
            if !address.is_empty() {
                return Some(start..end);
            }
        }
    })
}

/// Whether a whole text is one address, by the rule of the addresses of a description.
pub fn is_address(text: &str) -> bool {
    of(text).next() == Some(0..text.len())
}
