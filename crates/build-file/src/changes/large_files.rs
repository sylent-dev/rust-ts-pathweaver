//! The time the levels of a file as large as the reading allows take (`MAX_BYTES`): a file of
//! a stranger may be made to cost, and the core runs on the main thread of the page. Run it
//! with `cargo test --release -p pathweaver-build-file large_files -- --ignored --nocapture`.

use std::fmt::Write;
use std::time::{Duration, Instant};

use crate::{Build, MAX_BYTES};

/// A build of as many entries as fit in a file, each written by `entry` from its number.
fn build_of(part: &str, entry: impl Fn(usize) -> String) -> (Build, usize) {
    let mut text = format!(r#"{{"name":"Large","{part}":["#);
    let mut entries = 0;
    loop {
        let next = entry(entries);
        if text.len() + next.len() + 3 > MAX_BYTES {
            break;
        }
        if entries > 0 {
            text.push(',');
        }
        text.push_str(&next);
        entries += 1;
    }
    text.push_str("]}");
    (Build::read(&text).unwrap(), entries)
}

/// The entries of the cases, each written from its number: the first four give each entry a
/// thing of its own, the last four one thing with a note of its own on each entry.
fn cases() -> [(Build, usize); 8] {
    let level = |number: usize| number % 100 + 1;
    [
        build_of("passives", |number| format!(r#""p{number}""#)),
        build_of("passives", |number| {
            format!(
                r#"{{"id":"p{number}","level_interval":[{},100]}}"#,
                level(number)
            )
        }),
        build_of("skills", |number| {
            format!(
                r#"{{"id":"s{number}","level_interval":[{},100],"additional_text":"n{number}","support_skills":["u{number}"]}}"#,
                level(number)
            )
        }),
        build_of("inventory_slots", |number| {
            let (slot, first) = (number % 100, number % 99 + 1);
            format!(
                r#"{{"inventory_id":"Slot{slot}","level_interval":[{first},{}],"additional_text":"Item {number}\nIts text"}}"#,
                first + 1
            )
        }),
        build_of("passives", |number| {
            format!(
                r#"{{"id":"p","level_interval":[{},100],"additional_text":"n{number}"}}"#,
                level(number)
            )
        }),
        build_of("skills", |number| {
            format!(
                r#"{{"id":"s","level_interval":[{},100],"additional_text":"n{number}"}}"#,
                level(number)
            )
        }),
        build_of("skills", |number| {
            format!(
                r#"{{"id":"s","support_skills":[{{"id":"u","level_interval":[{},100],"additional_text":"n{number}"}}]}}"#,
                level(number)
            )
        }),
        build_of("inventory_slots", |number| {
            format!(
                r#"{{"inventory_id":"Belt1","unique_name":"Item","level_interval":[{},100],"additional_text":"n{number}"}}"#,
                level(number)
            )
        }),
    ]
}

/// Measured on 2026-11-22 in release, natively, each file of 1 MB, in the order of the cases:
/// 15 ms, 0.36 s, 0.64 s, 16 ms, 73 ms, 89 ms, 75 ms and 57 ms. Before the sorted tables of `held_once`, 10,000 passives (90 KB) took 6.1 s, 20,000
/// took 23 s, and a snapshot of 1 MB took 3.8 s while every level was read; with the notes of a
/// thing in a list, the last four cases took 2.2 to 3.7 s.
#[test]
#[ignore = "a measure, to run in release"]
fn the_levels_of_a_file_of_the_largest_size_are_read_in_less_than_a_second() {
    let mut times = String::new();
    for (build, entries) in &cases() {
        let start = Instant::now();
        let markers = build.markers();
        let elapsed = start.elapsed();
        writeln!(
            times,
            "{entries} entries, {} markers: {elapsed:?}",
            markers.len()
        )
        .unwrap();
        assert!(elapsed < Duration::from_secs(1), "{times}");
    }
    println!("{times}");
}
