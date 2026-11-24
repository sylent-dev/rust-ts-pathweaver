//! The markup of the author's texts of the corpus (`docs/build-files-in-the-wild.md`), whose
//! files are kept out of Git in `inputs/builds/`: the tags `specs.md` quotes and the guides of
//! the builds, to record again when the corpus changes. Run it with
//! `cargo test -p pathweaver-build-file markup::corpus -- --ignored`.

use std::collections::BTreeMap;

use super::{Colour, Markup, Piece, Tag, Token, Tokens};
use crate::fixtures::corpus;
use crate::{Build, Guide};

/// The author's texts of a build: its description, then the notes of its entries.
fn texts(build: &Build) -> Vec<&str> {
    let passives = build.passives.get().into_iter().flatten();
    let skills = build.skills.get().into_iter().flatten();
    let slots = build.inventory_slots.get().into_iter().flatten();
    let notes = passives
        .map(crate::Entry::additional_text)
        .chain(skills.flat_map(|skill| {
            std::iter::once(skill.additional_text())
                .chain(skill.supports().iter().map(crate::Entry::additional_text))
        }))
        .chain(slots.map(|slot| slot.additional_text.as_deref()));
    std::iter::once(build.description.as_deref())
        .chain(notes)
        .flatten()
        .collect()
}

/// The name of a tag in the counts: its own, `rgb` for every colour `rgb(…)`.
fn name_of(written: &str, tag: Tag) -> String {
    match tag {
        Tag::Colour(Colour::Rgb { .. }) => "rgb".to_owned(),
        Tag::Regular
        | Tag::Bold
        | Tag::Italic
        | Tag::Underlined
        | Tag::Size(_)
        | Tag::Colour(Colour::Named(_)) => written
            .trim_start_matches('<')
            .trim_end_matches(['>', '{'])
            .trim()
            .to_ascii_lowercase(),
    }
}

/// Measured on 2026-11-24, on the 32 files of 2026-11-16: the tags the corpus writes, by
/// name, the most written first.
const TAGS: [(&str, usize); 16] = [
    ("s", 704),
    ("m", 424),
    ("b", 422),
    ("i", 316),
    ("grey", 226),
    ("rgb", 91),
    ("red", 41),
    ("gold", 35),
    ("green", 18),
    ("blue", 14),
    ("yellow", 12),
    ("silver", 11),
    ("unique", 11),
    ("orange", 7),
    ("bronze", 3),
    ("u", 1),
];

#[test]
#[ignore = "reads the corpus, kept out of Git"]
fn the_tags_of_the_corpus_are_all_known_and_closed() {
    let corpus = corpus();
    let texts: Vec<&str> = corpus.values().flat_map(texts).collect();
    // The texts of the fields the format names: two conversions from Path of Building write 22
    // more, without markup, in a list `items` it doesn't name.
    assert_eq!(texts.len(), 1197, "the author's texts");

    let mut tags: Vec<(String, usize)> = Vec::new();
    let mut unknown = Vec::new();
    for token in texts.iter().flat_map(|text| Tokens { rest: text }) {
        let Token::Open { written, tag } = token else {
            continue;
        };
        let Some(tag) = tag else {
            unknown.push(written);
            continue;
        };
        let name = name_of(written, tag);
        match tags.iter_mut().find(|(known, _)| *known == name) {
            Some((_, count)) => *count += 1,
            None => tags.push((name, 1)),
        }
    }
    tags.sort_by(|(a, a_count), (b, b_count)| b_count.cmp(a_count).then(a.cmp(b)));
    let expected: Vec<(String, usize)> = TAGS
        .iter()
        .map(|(name, count)| ((*name).to_owned(), *count))
        .collect();
    assert_eq!(tags, expected);
    assert_eq!(
        unknown,
        Vec::<&str>::new(),
        "the tags the game doesn't know"
    );

    let written_braces: Vec<&str> = texts
        .iter()
        .copied()
        .filter(|text| {
            Markup::of(text).into_iter().any(|piece| match piece {
                Piece::Text { text, .. } => text.contains(['{', '}']),
                Piece::Link { .. } | Piece::LineBreak => false,
            })
        })
        .collect();
    assert_eq!(
        written_braces,
        Vec::<&str>::new(),
        "a brace written as text"
    );
}

/// The addresses of the descriptions of a corpus, by file, for those that hold any.
fn links_of(corpus: &BTreeMap<String, Build>) -> Vec<(&str, Vec<String>)> {
    corpus
        .iter()
        .filter_map(|(name, build)| {
            let links: Vec<String> = build
                .description_markup()?
                .into_iter()
                .filter_map(|piece| match piece {
                    Piece::Link { address, .. } => Some(address),
                    Piece::Text { .. } | Piece::LineBreak => None,
                })
                .collect();
            (!links.is_empty()).then_some((name.as_str(), links))
        })
        .collect()
}

#[test]
#[ignore = "reads the corpus, kept out of Git"]
fn the_longest_texts_of_the_corpus_are_far_from_the_pieces_kept() {
    let corpus = corpus();
    let descriptions: Vec<Markup> = corpus
        .values()
        .filter_map(Build::description_markup)
        .collect();
    let notes: Vec<Markup> = corpus
        .values()
        .flat_map(|build| {
            texts(build)
                .into_iter()
                .skip(usize::from(build.description.as_deref().is_some()))
        })
        .map(Markup::of)
        .collect();
    let longest = |texts: &[Markup]| {
        texts
            .iter()
            .map(|text| text.clone().into_iter().count())
            .max()
    };
    // Measured on 2026-11-24, on the 32 files of 2026-11-16: the longest description, a build of
    // Maxroll, and the longest note, in pieces; none cut by the bound of 1,000.
    assert_eq!(
        (longest(&descriptions), longest(&notes)),
        (Some(27), Some(31))
    );
    assert!(descriptions.iter().chain(&notes).all(|text| !text.is_cut()));
}

#[test]
#[ignore = "reads the corpus, kept out of Git"]
fn the_links_and_the_guides_of_the_corpus() {
    let corpus = corpus();
    // Measured on 2026-11-24: one description writes addresses, the Amazon of Maxroll, its guide
    // then its planner, each closed by the braces of its tags.
    assert_eq!(
        links_of(&corpus),
        [(
            "maxroll-aer0-ice-shot-amazon.build",
            vec![
                "https://maxroll.gg/poe2/build-guides/ice-shot-amazon-build-guide".to_owned(),
                "https://maxroll.gg/poe2/planner/0pgpe000".to_owned(),
            ]
        )]
    );

    let descriptions: Vec<Option<Markup>> =
        corpus.values().map(Build::description_markup).collect();
    let guides: Vec<(&str, Guide<'_>)> = corpus
        .iter()
        .zip(&descriptions)
        .filter_map(|((name, build), description)| {
            let guide = Guide::of(build.link.as_deref(), description.as_ref())?;
            Some((name.as_str(), guide))
        })
        .collect();
    let links = guides
        .iter()
        .filter(|(_, guide)| matches!(guide, Guide::Link(_)))
        .count();
    let others: Vec<(&str, Guide<'_>)> = guides
        .into_iter()
        .filter(|(_, guide)| !matches!(guide, Guide::Link(_)))
        .collect();
    // Measured on 2026-11-24: 19 builds of 32 have a guide, 18 their link, none a link that
    // isn't one address, and the Amazon of Maxroll the first address of its description.
    assert_eq!(links, 18, "the links of the files");
    assert_eq!(
        others,
        [(
            "maxroll-aer0-ice-shot-amazon.build",
            Guide::FromDescription(
                "https://maxroll.gg/poe2/build-guides/ice-shot-amazon-build-guide"
            )
        )]
    );
}
