//! The addresses an author writes in a description (`specs.md`, The header of a build): each
//! that starts with `https://` is a link, up to a space, a quote, a tag or a brace of the
//! markup, never on a mark of punctuation that closes the sentence.

use std::ops::Range;

use super::SCHEME;

/// Whether a character may be part of an address: a space, a quote, the angle brackets of a
/// tag and the braces of the markup end it.
fn is_in_address(character: char) -> bool {
    !character.is_whitespace() && !matches!(character, '"' | '\'' | '<' | '>' | '{' | '}')
}

/// The marks of punctuation that close a sentence, never the last character of an address.
const CLOSING_MARKS: [char; 7] = ['.', ',', ';', ':', '!', '?', ')'];

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
            let address = tail.get(..length)?.trim_end_matches(CLOSING_MARKS);
            let end = after_scheme.checked_add(address.len())?;
            from = after_scheme.checked_add(length)?;
            if !address.is_empty() {
                return Some(start..end);
            }
        }
    })
}
