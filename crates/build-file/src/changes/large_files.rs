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

/// The time the markers of a build take.
fn time_of_markers(build: &Build) -> Duration {
    let start = Instant::now();
    let markers = build.markers();
    let elapsed = start.elapsed();
    println!("{} markers in {elapsed:?}", markers.len());
    elapsed
}

/// Measured on 2026-11-22 in release, natively, each file of 1 MB: 115,965 passives written as
/// their id alone, 16 ms (3.8 s when every level was read, the build the same at each); 25,278
/// passives that each start at one of the hundred levels, 0.37 s; 11,162 skills with a note and
/// a support, 0.57 s; 11,550 hints that last two levels on 100 slots, 15 ms. Before the sorted
/// tables of `held_once`, 10,000 passives (90 KB) took 6.1 s and 20,000 took 23 s.
#[test]
#[ignore = "a measure, to run in release"]
fn the_levels_of_a_file_of_the_largest_size_are_read_in_seconds() {
    let mut note = String::new();
    let cases = [
        build_of("passives", |number| format!(r#""p{number}""#)),
        build_of("passives", |number| {
            let level = number % 100 + 1;
            format!(r#"{{"id":"p{number}","level_interval":[{level},100]}}"#)
        }),
        build_of("skills", |number| {
            let level = number % 100 + 1;
            format!(
                r#"{{"id":"s{number}","level_interval":[{level},100],"additional_text":"n{number}","support_skills":["u{number}"]}}"#
            )
        }),
        build_of("inventory_slots", |number| {
            let (slot, level) = (number % 100, number % 99 + 1);
            format!(
                r#"{{"inventory_id":"Slot{slot}","level_interval":[{level},{}],"additional_text":"Item {number}\nIts text"}}"#,
                level + 1
            )
        }),
    ];

    for (build, entries) in &cases {
        let elapsed = time_of_markers(build);
        writeln!(note, "{entries} entries: {elapsed:?}").unwrap();
        assert!(elapsed < Duration::from_secs(10), "{note}");
    }
    println!("{note}");
}
