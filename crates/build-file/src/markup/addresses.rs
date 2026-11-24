//! The addresses an author writes in a description (`specs.md`, The header of a build): each
//! that starts with `https://` is a link, made of the visible characters of ASCII, up to a
//! quote, a tag or a brace of the markup, never on a mark of punctuation that closes the
//! sentence.

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
