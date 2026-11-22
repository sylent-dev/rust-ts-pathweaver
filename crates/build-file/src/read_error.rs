//! Why a text isn't a `.build` file the viewer can open (`specs.md`, Opening builds): data the
//! interface writes as a sentence in each language, never a sentence of the core.

/// The largest text read, in bytes: 1 MB, when the largest file of the corpus is 72 KB.
pub const MAX_BYTES: usize = 1_048_576;

/// The characters of a line of the text kept around a JSON error: a JSON pasted on one line
/// would otherwise be shown whole.
const EXCERPT_CHARS: usize = 80;

/// Why a text isn't a `.build` file.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReadError {
    /// Larger than [`MAX_BYTES`], refused before it is read.
    TooLarge { bytes: usize },
    /// Not JSON: where reading stopped, from 1, and the text of that line.
    NotJson {
        line: usize,
        column: usize,
        /// The line, cut to 80 characters around the error, an ellipsis where it was cut.
        excerpt: String,
    },
    /// JSON, but not an object with a `name`.
    NotABuild,
    /// A value of the wrong type, or a field an entry needs that is missing.
    WrongValue {
        /// Its place in the build, such as `skills[2].support_skills[0].id`.
        field: String,
    },
}

impl std::fmt::Display for ReadError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TooLarge { bytes } => {
                write!(formatter, "larger than {MAX_BYTES} bytes: {bytes} bytes")
            }
            Self::NotJson {
                line,
                column,
                excerpt,
            } => write!(
                formatter,
                "not JSON, at line {line} column {column}: {excerpt}"
            ),
            Self::NotABuild => write!(formatter, "not a build: no `name`"),
            Self::WrongValue { field } => write!(formatter, "a wrong value at `{field}`"),
        }
    }
}

impl std::error::Error for ReadError {}

impl ReadError {
    /// The error of a text that isn't JSON, with the line where `serde_json` stopped.
    pub(crate) fn not_json(text: &str, error: &serde_json::Error) -> Self {
        let (line, column) = (error.line(), error.column());
        let excerpt = line
            .checked_sub(1)
            .and_then(|index| text.lines().nth(index))
            .map_or_else(String::new, |text| excerpt(text, column));
        Self::NotJson {
            line,
            column,
            excerpt,
        }
    }

    /// The error of a value of the wrong type, at the place `serde_path_to_error` followed.
    /// A field that is missing is named after the object that misses it: `serde` says it in
    /// its message only, ``missing field `id` ``.
    pub(crate) fn wrong_value(error: &serde_path_to_error::Error<serde_json::Error>) -> Self {
        let path = error.path().to_string();
        let message = error.inner().to_string();
        let missing = message
            .strip_prefix("missing field `")
            .and_then(|rest| rest.strip_suffix('`'));
        let field = match missing {
            // The path of the root is `.`, which a field doesn't follow.
            Some(missing) if path == "." => missing.to_owned(),
            Some(missing) => format!("{path}.{missing}"),
            None => path,
        };
        Self::WrongValue { field }
    }
}

/// The characters of `line` around its byte `column` (from 1, as `serde_json` counts), at most
/// [`EXCERPT_CHARS`], with an ellipsis on each side that was cut.
fn excerpt(line: &str, column: usize) -> String {
    let length = line.chars().count();
    if length <= EXCERPT_CHARS {
        return line.to_owned();
    }
    let error_char = line
        .char_indices()
        .take_while(|(byte, _)| *byte < column.saturating_sub(1))
        .count();
    let start = error_char
        .saturating_sub(EXCERPT_CHARS / 2)
        .min(length.saturating_sub(EXCERPT_CHARS));
    let end = start.saturating_add(EXCERPT_CHARS);
    let mut excerpt = String::new();
    if start > 0 {
        excerpt.push('…');
    }
    excerpt.extend(line.chars().skip(start).take(EXCERPT_CHARS));
    if end < length {
        excerpt.push('…');
    }
    excerpt
}

#[cfg(test)]
mod tests;
