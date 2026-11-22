//! What the tests of several modules share: the builds they read.

use serde_json::{Value, json};

use crate::Build;

/// A build of the given fields, written as in a file, under a name of its own.
pub fn build(fields: Value) -> Build {
    let Value::Object(mut fields) = fields else {
        panic!("the fields of a build are an object");
    };
    fields.insert("name".to_owned(), json!("A build of the tests"));
    Build::read(&Value::Object(fields).to_string()).unwrap()
}
