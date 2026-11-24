use std::time::{Duration, Instant};

use super::*;

fn pieces(text: &str) -> Vec<Piece> {
    Markup::of(text).into_iter().collect()
}

fn text(text: &str, style: Style) -> Piece {
    Piece::Text {
        text: text.to_owned(),
        style,
    }
}

fn plain(written: &str) -> Piece {
    text(written, Style::default())
}

const BOLD: Style = Style {
    is_bold: true,
    is_italic: false,
    is_underlined: false,
    size: None,
    colour: None,
};

fn coloured(colour: Colour) -> Style {
    Style {
        colour: Some(colour),
        ..Style::default()
    }
}

fn sized(size: Size) -> Style {
    Style {
        size: Some(size),
        ..Style::default()
    }
}

#[test]
fn a_text_without_markup_is_one_plain_text() {
    assert_eq!(pieces("Take the flask."), [plain("Take the flask.")]);
    assert_eq!(pieces(""), []);
}

#[test]
fn the_fonts_style_the_text_inside_their_braces() {
    let italic = Style {
        is_italic: true,
        ..Style::default()
    };
    let underlined = Style {
        is_underlined: true,
        ..Style::default()
    };
    assert_eq!(
        pieces("a <b>{b} <i>{i} <u>{u}"),
        [
            plain("a "),
            text("b", BOLD),
            plain(" "),
            text("i", italic),
            plain(" "),
            text("u", underlined),
        ]
    );
}

#[test]
fn regular_is_neither_bold_nor_italic_but_keeps_the_rest() {
    let underlined_red = Style {
        is_underlined: true,
        colour: Some(Colour::Named(NamedColour::Red)),
        ..Style::default()
    };
    assert_eq!(
        pieces("<u>{<red>{<b>{<i>{<r>{x}}}}}"),
        [text("x", underlined_red)]
    );
    assert_eq!(pieces("<r>{<b>{x}}"), [text("x", BOLD)]);
}

#[test]
fn the_sizes_are_small_medium_and_large_the_innermost_winning() {
    assert_eq!(
        pieces("<s>{s}<m>{m}<l>{l}"),
        [
            text("s", sized(Size::Small)),
            text("m", sized(Size::Medium)),
            text("l", sized(Size::Large)),
        ]
    );
    assert_eq!(
        pieces("<l>{<s>{x}y}"),
        [text("x", sized(Size::Small)), text("y", sized(Size::Large))]
    );
}

#[test]
fn the_fourteen_named_colours_and_gray_for_grey() {
    let names = [
        ("white", NamedColour::White),
        ("grey", NamedColour::Grey),
        ("gray", NamedColour::Grey),
        ("black", NamedColour::Black),
        ("red", NamedColour::Red),
        ("orange", NamedColour::Orange),
        ("yellow", NamedColour::Yellow),
        ("green", NamedColour::Green),
        ("blue", NamedColour::Blue),
        ("indigo", NamedColour::Indigo),
        ("violet", NamedColour::Violet),
        ("bronze", NamedColour::Bronze),
        ("silver", NamedColour::Silver),
        ("gold", NamedColour::Gold),
        ("unique", NamedColour::Unique),
    ];
    for (name, colour) in names {
        assert_eq!(
            pieces(&format!("<{name}>{{x}}")),
            [text("x", coloured(Colour::Named(colour)))],
            "{name}"
        );
    }
}

#[test]
fn a_tag_is_read_whatever_its_case_and_the_spaces_around_it() {
    let gold = coloured(Colour::Named(NamedColour::Gold));
    assert_eq!(pieces("<GOLD>{x}"), [text("x", gold)]);
    assert_eq!(pieces("< Gold >{x}"), [text("x", gold)]);
    assert_eq!(pieces("<B>{x}"), [text("x", BOLD)]);
}

#[test]
fn the_innermost_colour_wins() {
    assert_eq!(
        pieces("<grey>{a <gold>{b} c}"),
        [
            text("a ", coloured(Colour::Named(NamedColour::Grey))),
            text("b", coloured(Colour::Named(NamedColour::Gold))),
            text(" c", coloured(Colour::Named(NamedColour::Grey))),
        ]
    );
}

#[test]
fn a_colour_rgb_has_three_values_up_to_255() {
    let rgb = |red, green, blue| coloured(Colour::Rgb { red, green, blue });
    assert_eq!(
        pieces("<rgb(134, 189, 163)>{x}"),
        [text("x", rgb(134, 189, 163))]
    );
    assert_eq!(pieces("<RGB( 0 ,07,255 )>{x}"), [text("x", rgb(0, 7, 255))]);
    let refused = [
        "rgb(256, 0, 0)",
        "rgb(1, 2)",
        "rgb(1, 2, 3, 4)",
        "rgb(1, , 3)",
        "rgb(0001, 2, 3)",
        "rgb(+1, 2, 3)",
        "rgb(1, 2, 3",
        "rgb (1, 2, 3)",
        "rgb()",
        "rgb",
    ];
    for name in refused {
        let written = format!("<{name}>{{x}}");
        assert_eq!(pieces(&written), [plain(&written)], "{name}");
    }
}

#[test]
fn tags_nest() {
    let bold_italic = Style {
        is_italic: true,
        ..BOLD
    };
    assert_eq!(
        pieces("<b>{a <i>{b} c} d"),
        [
            text("a ", BOLD),
            text("b", bold_italic),
            text(" c", BOLD),
            plain(" d"),
        ]
    );
}

#[test]
fn a_tag_the_game_does_not_know_is_written_its_braces_paired() {
    for name in ["purple", "cyan", "magenta", "bold", ""] {
        let written = format!("<{name}>{{x}}");
        assert_eq!(pieces(&written), [plain(&written)], "{name}");
    }
    assert_eq!(pieces("<b>{<purple>{x} y}"), [text("<purple>{x} y", BOLD)]);
}

#[test]
fn a_brace_alone_is_written_and_pairs() {
    assert_eq!(
        pieces("<b>{a {b} c} d"),
        [text("a {b} c", BOLD), plain(" d")]
    );
    assert_eq!(
        pieces("{<b>{x}}"),
        [plain("{"), text("x", BOLD), plain("}")]
    );
}

#[test]
fn a_brace_left_open_is_written_and_what_follows_it_read() {
    let italic = Style {
        is_italic: true,
        ..Style::default()
    };
    assert_eq!(pieces("<b>{x"), [plain("<b>{x")]);
    assert_eq!(pieces("<b>{<i>{x}"), [plain("<b>{"), text("x", italic)]);
    assert_eq!(pieces("<b>{{x}"), [plain("<b>{{x}")]);
    assert_eq!(
        pieces("<b>{a <i>{b"),
        [plain("<b>{a <i>{b")],
        "two braces left open"
    );
}

#[test]
fn a_closing_brace_with_no_brace_open_is_written() {
    assert_eq!(pieces("x}"), [plain("x}")]);
    assert_eq!(pieces("<b>{x}}y"), [text("x", BOLD), plain("}y")]);
}

#[test]
fn a_tag_without_its_brace_is_written() {
    for written in ["<b> x", "<b>", "a < b", "a <b c", "<b x}", "<b{x}"] {
        assert_eq!(pieces(written), [plain(written)], "{written}");
    }
    assert_eq!(pieces("<<b>{x}"), [plain("<"), text("x", BOLD)]);
    assert_eq!(pieces("<<b>>{x}"), [plain("<<b>>{x}")]);
}

#[test]
fn the_line_breaks_are_kept_inside_and_outside_tags() {
    assert_eq!(
        pieces("a\nb\r\nc"),
        [
            plain("a"),
            Piece::LineBreak,
            plain("b"),
            Piece::LineBreak,
            plain("c")
        ]
    );
    assert_eq!(
        pieces("<b>{a\n\nb}"),
        [
            text("a", BOLD),
            Piece::LineBreak,
            Piece::LineBreak,
            text("b", BOLD)
        ]
    );
    assert_eq!(pieces("a\rb"), [plain("a\rb")], "a carriage return alone");
}

#[test]
fn a_line_break_ends_a_tag_before_its_brace() {
    assert_eq!(
        pieces("<b\n>{x}"),
        [plain("<b"), Piece::LineBreak, plain(">{x}")]
    );
}

#[test]
fn texts_side_by_side_in_one_style_are_one_text() {
    assert_eq!(pieces("<b>{a}<b>{b}"), [text("ab", BOLD)]);
    assert_eq!(pieces("a<r>{b}c"), [plain("abc")]);
    assert_eq!(pieces("<b>{}x"), [plain("x")], "an empty tag");
}

#[test]
fn a_text_of_any_script_is_kept_whole() {
    assert_eq!(
        pieces("é<b>{ü—火}<ä>{x}"),
        [plain("é"), text("ü—火", BOLD), plain("<ä>{x}")]
    );
}

/// A text made to cost, read without a stack overflow and in a time that grows with its size:
/// a time that grows as its square would take hours on a million braces, where reading it in
/// a test of debug takes well under a second.
fn read_in_time(text: &str) -> Vec<Piece> {
    let start = Instant::now();
    let pieces = pieces(text);
    let elapsed = start.elapsed();
    assert!(elapsed < Duration::from_secs(10), "{elapsed:?}");
    pieces
}

#[test]
fn a_nesting_a_million_deep_is_read() {
    let deep = "<b>{".repeat(1_000_000) + "x" + &"}".repeat(1_000_000);
    assert_eq!(read_in_time(&deep), [text("x", BOLD)]);
    let braces = "{".repeat(500_000) + &"}".repeat(500_000);
    assert_eq!(read_in_time(&braces), [plain(&braces)]);
}

#[test]
fn a_megabyte_of_braces_left_open_or_never_opened_is_read() {
    let written = [
        "<b>{".repeat(250_000),
        "{".repeat(1_000_000),
        "}".repeat(1_000_000),
        "<".repeat(1_000_000),
        "<b>".repeat(333_333),
        "<b".repeat(500_000),
        "<".to_owned() + &"b".repeat(1_000_000),
    ];
    for written in written {
        assert_eq!(read_in_time(&written), [plain(&written)]);
    }
}

fn described(text: &str) -> Vec<Piece> {
    Markup::of_description(text).into_iter().collect()
}

fn link(address: &str, style: Style) -> Piece {
    Piece::Link {
        address: address.to_owned(),
        style,
    }
}

#[test]
fn an_address_of_a_description_is_a_link_where_it_is() {
    assert_eq!(
        described("Guide: https://maxroll.gg/poe2/a and the planner"),
        [
            plain("Guide: "),
            link("https://maxroll.gg/poe2/a", Style::default()),
            plain(" and the planner"),
        ]
    );
    assert_eq!(
        described("https://a.com"),
        [link("https://a.com", Style::default())]
    );
}

#[test]
fn a_link_keeps_the_style_of_its_text() {
    let gold = coloured(Colour::Named(NamedColour::Gold));
    assert_eq!(
        described("<gold>{see https://a.com now}"),
        [
            text("see ", gold),
            link("https://a.com", gold),
            text(" now", gold)
        ]
    );
}

#[test]
fn an_address_ends_at_a_space_a_quote_a_tag_or_a_brace() {
    let underlined = Style {
        is_underlined: true,
        ..Style::default()
    };
    assert_eq!(
        described("<u>{https://a.com}"),
        [link("https://a.com", underlined)]
    );
    for (written, after) in [
        ("https://a.com/x y", " y"),
        ("https://a.com/x\ty", "\ty"),
        ("https://a.com/x\"y", "\"y"),
        ("https://a.com/x'y", "'y"),
        ("https://a.com/x<y", "<y"),
        ("https://a.com/x>y", ">y"),
        ("https://a.com/x{y", "{y"),
        ("https://a.com/x}y", "}y"),
    ] {
        assert_eq!(
            described(written),
            [link("https://a.com/x", Style::default()), plain(after)],
            "{written:?}"
        );
    }
    assert_eq!(
        described("https://a.com\nb"),
        [
            link("https://a.com", Style::default()),
            Piece::LineBreak,
            plain("b")
        ]
    );
}

#[test]
fn an_address_never_ends_on_a_mark_that_closes_the_sentence() {
    for mark in [".", ",", ";", ":", "!", "?", "]", ")", "?!", ").", "))"] {
        assert_eq!(
            described(&format!("https://a.com/x{mark}")),
            [link("https://a.com/x", Style::default()), plain(mark)],
            "{mark}"
        );
    }
    assert_eq!(
        described("(https://a.com/x?y=1&z=2#c.d)"),
        [
            plain("("),
            link("https://a.com/x?y=1&z=2#c.d", Style::default()),
            plain(")"),
        ]
    );
}

#[test]
fn a_closing_bracket_of_the_address_itself_is_kept() {
    assert_eq!(
        described("(https://w.org/Foo_(bar))."),
        [
            plain("("),
            link("https://w.org/Foo_(bar)", Style::default()),
            plain(")."),
        ]
    );
    assert_eq!(
        described("[https://a.com]"),
        [
            plain("["),
            link("https://a.com", Style::default()),
            plain("]")
        ]
    );
}

#[test]
fn an_address_is_made_of_the_visible_characters_of_ascii() {
    for (written, after) in [
        ("https://a.com/x\u{200b}y", "\u{200b}y"),
        ("https://a.com/x\u{202e}y", "\u{202e}y"),
        ("https://a.com/x\u{a0}y", "\u{a0}y"),
        ("https://a.com/x\u{7f}y", "\u{7f}y"),
        ("https://a.com/x。", "。"),
        ("https://a.com/xé", "é"),
    ] {
        assert_eq!(
            described(written),
            [link("https://a.com/x", Style::default()), plain(after)],
            "{written:?}"
        );
    }
}

#[test]
fn an_address_ends_at_a_change_of_style_not_at_a_tag_that_changes_nothing() {
    assert_eq!(
        described("https://a<r>{.com}"),
        [link("https://a.com", Style::default())]
    );
    assert_eq!(
        described("https://a<b>{.com}"),
        [link("https://a", Style::default()), text(".com", BOLD)]
    );
}

#[test]
fn only_an_address_of_https_with_more_than_its_scheme_is_a_link() {
    for written in [
        "http://a.com",
        "HTTPS://a.com",
        "https:/a.com",
        "https://",
        "https://.",
        "https:// a",
    ] {
        assert_eq!(described(written), [plain(written)], "{written}");
    }
}

#[test]
fn every_address_of_a_description_is_a_link() {
    assert_eq!(
        described("https://a.com, https://b.com"),
        [
            link("https://a.com", Style::default()),
            plain(", "),
            link("https://b.com", Style::default()),
        ]
    );
    assert_eq!(
        Markup::of_description("https://. then https://b.com, https://c.com").first_address(),
        Some("https://b.com")
    );
    assert_eq!(Markup::of_description("none").first_address(), None);
}

#[test]
fn the_addresses_of_a_hint_stay_text() {
    assert_eq!(pieces("See https://a.com"), [plain("See https://a.com")]);
    assert_eq!(Markup::of("See https://a.com").first_address(), None);
}

#[test]
fn a_megabyte_of_addresses_is_read_in_time() {
    let start = Instant::now();
    let schemes = "https:// ".repeat(110_000);
    assert_eq!(described(&schemes), [plain(&schemes)]);
    let brackets = "https://a".to_owned() + &")".repeat(1_000_000);
    assert_eq!(
        described(&brackets),
        [
            link("https://a", Style::default()),
            plain(&")".repeat(1_000_000))
        ]
    );
    let marks = "https://a".to_owned() + &".".repeat(1_000_000);
    assert_eq!(
        described(&marks),
        [
            link("https://a", Style::default()),
            plain(&".".repeat(1_000_000))
        ]
    );
    let elapsed = start.elapsed();
    assert!(elapsed < Duration::from_secs(10), "{elapsed:?}");
}

#[test]
fn a_description_of_spaces_only_is_no_description() {
    let description_of = |fields| crate::fixtures::build(fields).description_markup();
    assert_eq!(description_of(serde_json::json!({})), None);
    assert_eq!(
        description_of(serde_json::json!({ "description": null })),
        None
    );
    assert_eq!(
        description_of(serde_json::json!({ "description": " \n " })),
        None
    );
    assert_eq!(
        description_of(serde_json::json!({ "description": "<b>{x} https://a.com" })),
        Some(Markup::of_description("<b>{x} https://a.com"))
    );
}
