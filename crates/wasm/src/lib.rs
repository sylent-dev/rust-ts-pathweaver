//! The bridge between the core and the interface: each function exported to JavaScript only
//! converts its arguments and its result, the work stays in the crates of the core.
//!
//! The bridge runs in the same WebAssembly module as the core: it must never panic either,
//! under the same lints (Cargo refuses lints added per crate to those of the workspace, hence
//! the copy of the block of `crates/build-file/src/lib.rs`).
#![cfg_attr(
    not(test),
    deny(
        clippy::arithmetic_side_effects,
        clippy::indexing_slicing,
        clippy::string_slice,
        clippy::unwrap_used,
        clippy::expect_used,
        clippy::panic,
        clippy::unreachable,
        clippy::todo,
        clippy::unimplemented
    )
)]

mod markup;
mod read;
