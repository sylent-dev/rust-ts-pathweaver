//! An author's text as the interface draws it (`specs.md`, The author's texts): the pieces the
//! core read, flat, each text with its style, and whether it goes on past them; and the guide
//! of a build.

use pathweaver_build_file::{Colour, Guide, Markup, NamedColour, Piece, Size, Style};
use serde::Serialize;
use tsify::Tsify;

/// An author's text, [`Markup`] as the interface reads it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct MarkupText {
    /// Its pieces kept, in order.
    pub pieces: Vec<MarkupPiece>,
    /// Whether it goes on past them, « … » drawn after them.
    pub is_cut: bool,
}

/// A piece of an author's text, [`Piece`] as the interface reads it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum MarkupPiece {
    /// A text in one style, never empty.
    Text {
        text: String,
        style: MarkupStyle,
    },
    /// An address of a description, a link where it is, drawn as a chip of its site; its
    /// style draws it only when the interface can't read its site and shows it as text.
    Link {
        address: String,
        style: MarkupStyle,
    },
    LineBreak,
}

/// The style of a text, [`Style`] as the interface reads it.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub struct MarkupStyle {
    pub is_bold: bool,
    pub is_italic: bool,
    pub is_underlined: bool,
    /// None: the size of the text around the author's text.
    pub size: Option<MarkupSize>,
    /// None: the colour of the text.
    pub colour: Option<MarkupColour>,
}

/// A size of the markup, a factor that is a token of the style.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub enum MarkupSize {
    Small,
    Medium,
    Large,
}

/// A colour of the markup: a named one, a token of the style, or `rgb(r, g, b)`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Tsify)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum MarkupColour {
    Named { name: MarkupColourName },
    Rgb { red: u8, green: u8, blue: u8 },
}

/// A colour the game names, in the words of its tag (`gray` is `grey`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Tsify)]
#[serde(rename_all = "camelCase")]
pub enum MarkupColourName {
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

/// Where the guide of a build leads, [`Guide`] as the interface reads it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Tsify)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum BuildGuide {
    /// The `link` of the file, an address that starts with `https://`.
    Link { address: String },
    /// The `link` of the file, a text that isn't such an address.
    Text { text: String },
    /// The first address of the description, for a file without a `link`.
    FromDescription { address: String },
}

impl From<Markup> for MarkupText {
    fn from(markup: Markup) -> Self {
        let is_cut = markup.is_cut();
        Self {
            pieces: markup.into_iter().map(MarkupPiece::from).collect(),
            is_cut,
        }
    }
}

impl From<Piece> for MarkupPiece {
    fn from(piece: Piece) -> Self {
        match piece {
            Piece::Text { text, style } => Self::Text {
                text,
                style: style.into(),
            },
            Piece::Link { address, style } => Self::Link {
                address,
                style: style.into(),
            },
            Piece::LineBreak => Self::LineBreak,
        }
    }
}

impl From<Style> for MarkupStyle {
    fn from(style: Style) -> Self {
        Self {
            is_bold: style.is_bold,
            is_italic: style.is_italic,
            is_underlined: style.is_underlined,
            size: style.size.map(MarkupSize::from),
            colour: style.colour.map(MarkupColour::from),
        }
    }
}

impl From<Size> for MarkupSize {
    fn from(size: Size) -> Self {
        match size {
            Size::Small => Self::Small,
            Size::Medium => Self::Medium,
            Size::Large => Self::Large,
        }
    }
}

impl From<Colour> for MarkupColour {
    fn from(colour: Colour) -> Self {
        match colour {
            Colour::Named(name) => Self::Named { name: name.into() },
            Colour::Rgb { red, green, blue } => Self::Rgb { red, green, blue },
        }
    }
}

impl From<NamedColour> for MarkupColourName {
    fn from(name: NamedColour) -> Self {
        match name {
            NamedColour::White => Self::White,
            NamedColour::Grey => Self::Grey,
            NamedColour::Black => Self::Black,
            NamedColour::Red => Self::Red,
            NamedColour::Orange => Self::Orange,
            NamedColour::Yellow => Self::Yellow,
            NamedColour::Green => Self::Green,
            NamedColour::Blue => Self::Blue,
            NamedColour::Indigo => Self::Indigo,
            NamedColour::Violet => Self::Violet,
            NamedColour::Bronze => Self::Bronze,
            NamedColour::Silver => Self::Silver,
            NamedColour::Gold => Self::Gold,
            NamedColour::Unique => Self::Unique,
        }
    }
}

impl From<Guide<'_>> for BuildGuide {
    fn from(guide: Guide<'_>) -> Self {
        match guide {
            Guide::Link(address) => Self::Link {
                address: address.to_owned(),
            },
            Guide::Text(text) => Self::Text {
                text: text.to_owned(),
            },
            Guide::FromDescription(address) => Self::FromDescription {
                address: address.to_owned(),
            },
        }
    }
}
