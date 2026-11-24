//! The markup of the game in the author's texts, the description and the hints (`specs.md`,
//! The author's texts): `<tag>{text}`, nested, as the documentation of Grinding Gear Games
//! writes it (<https://www.pathofexile.com/developer/docs/game#buildplanner>, read on
//! 2026-11-24). A tag it doesn't know, or a brace left open, is plain text, as written. The
//! addresses of a description are links.
//!
//! The text of a stranger may be made to cost: it is read in two passes over its tokens,
//! without recursion, so that a nesting a million deep neither overflows the stack nor takes a
//! time that grows as its square, and the result is a flat list of pieces, which neither its
//! drop nor the bridge walks as a tree.

mod addresses;
#[cfg(test)]
mod corpus;
#[cfg(test)]
mod tests;

pub(crate) use addresses::is_address;

/// An author's text read: its pieces in order, each text with the style of the tags around it.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Markup(Vec<Piece>);

/// A piece of an author's text.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Piece {
    /// A text in one style, never empty; two texts side by side never share a style.
    Text { text: String, style: Style },
    /// An address of a description that starts with `https://`, a link where it is, drawn by
    /// the interface as a chip of its site (`specs.md`, The header of a build); never in a hint,
    /// whose card on hover can't be clicked. Its style, that of the text around it, draws it
    /// only when the interface can't read its site and shows it as text.
    Link { address: String, style: Style },
    /// A line break of the author, `\n` or `\r\n`.
    LineBreak,
}

/// The style of a text, from the tags around it: the innermost tag of a kind wins.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct Style {
    pub is_bold: bool,
    pub is_italic: bool,
    pub is_underlined: bool,
    /// None: the size of the text around the author's text.
    pub size: Option<Size>,
    /// None: the colour of the text.
    pub colour: Option<Colour>,
}

/// A size of the markup, a factor of the size of the text around the whole author's text, so
/// that a size inside a size doesn't grow again (the factors are tokens of the style).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Size {
    Small,
    Medium,
    Large,
}

/// A colour of the markup: one the game names, which the interface reads from the tokens of its
/// style, or `rgb(r, g, b)`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Colour {
    Named(NamedColour),
    Rgb { red: u8, green: u8, blue: u8 },
}

/// The fourteen colours the documentation of Grinding Gear Games names (`gray` is `Grey`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NamedColour {
    White,
    Grey,
    Black,
    Red,
    Orange,
    Yellow,
    Green,
    Blue,
    Indigo,
    Violet,
    Bronze,
    Silver,
    Gold,
    /// The gold of a unique item.
    Unique,
}

/// A tag of the markup the game knows.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Tag {
    /// Neither bold nor italic.
    Regular,
    Bold,
    Italic,
    Underlined,
    Size(Size),
    Colour(Colour),
}

/// The tags written by name, as the documentation of Grinding Gear Games names them; `purple`,
/// `cyan` and `magenta`, which it doesn't name and the corpus never writes, aren't among them.
const NAMED_TAGS: [(&str, Tag); 22] = [
    ("r", Tag::Regular),
    ("b", Tag::Bold),
    ("i", Tag::Italic),
    ("u", Tag::Underlined),
    ("s", Tag::Size(Size::Small)),
    ("m", Tag::Size(Size::Medium)),
    ("l", Tag::Size(Size::Large)),
    ("white", named(NamedColour::White)),
    ("grey", named(NamedColour::Grey)),
    ("gray", named(NamedColour::Grey)),
    ("black", named(NamedColour::Black)),
    ("red", named(NamedColour::Red)),
    ("orange", named(NamedColour::Orange)),
    ("yellow", named(NamedColour::Yellow)),
    ("green", named(NamedColour::Green)),
    ("blue", named(NamedColour::Blue)),
    ("indigo", named(NamedColour::Indigo)),
    ("violet", named(NamedColour::Violet)),
    ("bronze", named(NamedColour::Bronze)),
    ("silver", named(NamedColour::Silver)),
    ("gold", named(NamedColour::Gold)),
    ("unique", named(NamedColour::Unique)),
];

/// The tag of a named colour.
const fn named(colour: NamedColour) -> Tag {
    Tag::Colour(Colour::Named(colour))
}

/// The tag written between `<` and `>`, its case and the spaces around it aside; none when the
/// game doesn't know it.
fn tag_of(written: &str) -> Option<Tag> {
    let name = written.trim();
    NAMED_TAGS
        .iter()
        .find(|(known, _)| known.eq_ignore_ascii_case(name))
        .map(|(_, tag)| *tag)
        .or_else(|| rgb_of(name).map(Tag::Colour))
}

/// A colour `rgb(r, g, b)`, each value one to three digits up to 255, spaces allowed around
/// each value.
fn rgb_of(name: &str) -> Option<Colour> {
    let prefix = name.get(..4)?;
    if !prefix.eq_ignore_ascii_case("rgb(") {
        return None;
    }
    let inside = name.get(4..)?.strip_suffix(')')?;
    let mut values = inside.split(',').map(|value| {
        let value = value.trim();
        let is_number = (1..=3).contains(&value.len()) && value.bytes().all(|b| b.is_ascii_digit());
        is_number.then(|| value.parse::<u8>().ok()).flatten()
    });
    let (red, green, blue) = (values.next()??, values.next()??, values.next()??);
    values
        .next()
        .is_none()
        .then_some(Colour::Rgb { red, green, blue })
}

impl Style {
    /// The style of a text inside `tag`, in a text of this style.
    fn within(self, tag: Tag) -> Self {
        match tag {
            Tag::Regular => Self {
                is_bold: false,
                is_italic: false,
                ..self
            },
            Tag::Bold => Self {
                is_bold: true,
                ..self
            },
            Tag::Italic => Self {
                is_italic: true,
                ..self
            },
            Tag::Underlined => Self {
                is_underlined: true,
                ..self
            },
            Tag::Size(size) => Self {
                size: Some(size),
                ..self
            },
            Tag::Colour(colour) => Self {
                colour: Some(colour),
                ..self
            },
        }
    }
}

/// A token of an author's text.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Token<'a> {
    /// A text without a brace, a line break nor the start of a tag but at its first character.
    Text(&'a str),
    LineBreak,
    /// An opening brace, as written: `<tag>{` with its tag when the game knows it, or a brace
    /// alone, `{`.
    Open {
        written: &'a str,
        tag: Option<Tag>,
    },
    Close,
}

/// The tokens of an author's text, in order. Each character is read at most twice: once by a
/// tag that turns out not to open (`<a>` without a brace), once as text.
struct Tokens<'a> {
    rest: &'a str,
}

impl<'a> Iterator for Tokens<'a> {
    type Item = Token<'a>;

    fn next(&mut self) -> Option<Token<'a>> {
        let rest = self.rest;
        let (token, length) = if rest.starts_with("\r\n") {
            (Token::LineBreak, 2)
        } else {
            match rest.chars().next()? {
                '\n' => (Token::LineBreak, 1),
                '{' => (
                    Token::Open {
                        written: "{",
                        tag: None,
                    },
                    1,
                ),
                '}' => (Token::Close, 1),
                '<' => opening_tag(rest).unwrap_or_else(|| text(rest)),
                _ => text(rest),
            }
        };
        self.rest = rest.get(length..).unwrap_or_default();
        Some(token)
    }
}

/// The opening tag at the start of `rest`, `<tag>{`, and its length; none when no brace
/// follows the `>`, or when a `<`, a brace or a line break comes before it.
fn opening_tag(rest: &str) -> Option<(Token<'_>, usize)> {
    let after = rest.strip_prefix('<')?;
    let end = after.find(['<', '>', '{', '}', '\n'])?;
    let (name, closing) = after.split_at_checked(end)?;
    if !closing.starts_with(">{") {
        return None;
    }
    let length = end.checked_add(3)?;
    let written = rest.get(..length)?;
    Some((
        Token::Open {
            written,
            tag: tag_of(name),
        },
        length,
    ))
}

/// The text at the start of `rest`, its first character whatever it is, and its length: up to
/// the next character that may start another token.
fn text(rest: &str) -> (Token<'_>, usize) {
    let length = rest
        .char_indices()
        .skip(1)
        .find(|(_, character)| matches!(character, '<' | '{' | '}' | '\n' | '\r'))
        .map_or(rest.len(), |(index, _)| index);
    (Token::Text(rest.get(..length).unwrap_or(rest)), length)
}

/// Whether a character moves the text around it, the words before it or after the author's
/// text, which no style of the page contains: the embeddings, overrides and isolates of
/// Unicode, and the separators of paragraphs of its algorithm of direction (4g3, its second
/// review: U+202B before a link drew the text before it at its right, U+2069 closed the isolate
/// the page puts around the text). The strong marks U+200E, U+200F and U+061C stay: invisible
/// letters, they turn no Latin letter.
fn moves_the_text_around(character: char) -> bool {
    matches!(
        character,
        '\u{202a}'..='\u{202e}' | '\u{2066}'..='\u{2069}' | '\u{2029}' | '\u{85}' | '\u{1c}'..='\u{1e}'
    )
}

/// An author's text without the characters that move the text around it; borrowed when it holds
/// none, the most usual case (the corpus holds none).
fn without_characters_that_move_the_text(text: &str) -> std::borrow::Cow<'_, str> {
    if text.contains(moves_the_text_around) {
        text.chars()
            .filter(|character| !moves_the_text_around(*character))
            .collect::<String>()
            .into()
    } else {
        text.into()
    }
}

/// Whether each opening brace of a text, in order, has its closing brace: each closing brace
/// closes the last brace still open, and one with no brace open closes nothing.
fn closed_braces(text: &str) -> Vec<bool> {
    let mut is_closed = Vec::new();
    let mut open = Vec::new();
    for token in (Tokens { rest: text }) {
        match token {
            Token::Open { .. } => {
                open.push(is_closed.len());
                is_closed.push(false);
            }
            Token::Close => {
                if let Some(closed) = open.pop().and_then(|index| is_closed.get_mut(index)) {
                    *closed = true;
                }
            }
            Token::Text(_) | Token::LineBreak => {}
        }
    }
    is_closed
}

/// A pair of braces open while the text is written: the style of the text inside it, and
/// whether its braces are written, those of a tag the game doesn't know or of a brace alone.
#[derive(Debug, Clone, Copy)]
struct Group {
    style: Style,
    is_written: bool,
}

impl Markup {
    /// Reads an author's text. A tag the game knows styles the text inside its braces; a tag it
    /// doesn't know or a brace alone is written as it is, its braces paired all the same, so
    /// that a brace of the author never ends the style around it (4g2, the owner, 2026-11-24);
    /// an opening brace never closed, or a closing brace with no brace open, is written as it
    /// is.
    #[must_use]
    pub fn of(text: &str) -> Self {
        let text = without_characters_that_move_the_text(text);
        let text = text.as_ref();
        // A brace never closed is never inside a pair: whatever opens after it and closes,
        // closes before the brace under it would. So the stack of groups is the stack of the
        // first pass without the braces never closed, and both pop the same brace at each `}`.
        let mut is_closed = closed_braces(text).into_iter();
        let mut markup = Self::default();
        let mut groups: Vec<Group> = Vec::new();
        for token in (Tokens { rest: text }) {
            let style = groups
                .last()
                .map_or_else(Style::default, |group| group.style);
            match token {
                Token::Text(text) => markup.write(text, style),
                Token::LineBreak => markup.0.push(Piece::LineBreak),
                Token::Open { written, tag } => match (is_closed.next().unwrap_or(false), tag) {
                    (true, Some(tag)) => groups.push(Group {
                        style: style.within(tag),
                        is_written: false,
                    }),
                    (true, None) => {
                        markup.write(written, style);
                        groups.push(Group {
                            style,
                            is_written: true,
                        });
                    }
                    (false, _) => markup.write(written, style),
                },
                Token::Close => match groups.pop() {
                    Some(Group {
                        is_written: false, ..
                    }) => {}
                    Some(Group {
                        style,
                        is_written: true,
                    }) => markup.write("}", style),
                    None => markup.write("}", style),
                },
            }
        }
        markup
    }

    /// Reads the description of a build: its markup, and its addresses as links.
    #[must_use]
    pub fn of_description(text: &str) -> Self {
        let mut pieces = Vec::new();
        for piece in Self::of(text) {
            match piece {
                Piece::Text { text, style } => push_linked(text, style, &mut pieces),
                Piece::Link { .. } | Piece::LineBreak => pieces.push(piece),
            }
        }
        Self(pieces)
    }

    /// The first address of a description read with its links, where the guide of a build
    /// without a link of its own comes from.
    #[must_use]
    pub fn first_address(&self) -> Option<&str> {
        self.0.iter().find_map(|piece| match piece {
            Piece::Link { address, .. } => Some(address.as_str()),
            Piece::Text { .. } | Piece::LineBreak => None,
        })
    }

    /// Adds a text in a style, to the text before it when it has the same style.
    fn write(&mut self, text: &str, style: Style) {
        if text.is_empty() {
            return;
        }
        if let Some(Piece::Text {
            text: last,
            style: last_style,
        }) = self.0.last_mut()
            && *last_style == style
        {
            last.push_str(text);
            return;
        }
        self.0.push(Piece::Text {
            text: text.to_owned(),
            style,
        });
    }
}

impl crate::Build {
    /// The description of the build read with its markup and its links; none when its file has
    /// none, or one of spaces and marks of direction only (« The author wrote no description. »).
    #[must_use]
    pub fn description_markup(&self) -> Option<Markup> {
        self.description
            .as_deref()
            .filter(|description| {
                !description
                    .chars()
                    .all(|character| character.is_whitespace() || moves_the_text_around(character))
            })
            .map(Markup::of_description)
    }
}

/// Pushes a text in a style, its addresses as links.
fn push_linked(text: String, style: Style, pieces: &mut Vec<Piece>) {
    // The text moves whole when it holds no address, the most usual case.
    if addresses::of(&text).next().is_none() {
        pieces.push(Piece::Text { text, style });
        return;
    }
    let piece_of = |range: std::ops::Range<usize>| text.get(range).unwrap_or_default().to_owned();
    let mut written = 0;
    for address in addresses::of(&text) {
        if written < address.start {
            pieces.push(Piece::Text {
                text: piece_of(written..address.start),
                style,
            });
        }
        written = address.end;
        pieces.push(Piece::Link {
            address: piece_of(address),
            style,
        });
    }
    if written < text.len() {
        pieces.push(Piece::Text {
            text: piece_of(written..text.len()),
            style,
        });
    }
}

impl IntoIterator for Markup {
    type Item = Piece;
    type IntoIter = std::vec::IntoIter<Piece>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}
