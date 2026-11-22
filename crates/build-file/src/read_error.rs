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
    /// Not JSON: the line of the error, from 1, and its text. For a text that ends too soon,
    /// the last line that holds a character other than a space.
    NotJson {
        line: usize,
        /// The byte of the line where reading stopped, from 1; after its end, its spaces
        /// left out, for an error on its line break or a text that ends too soon.
        column: usize,
        /// The line, cut to 80 characters around the error, an ellipsis where it was cut.
        excerpt: String,
    },
    /// JSON, but not an object with a `name`; or a text empty, or of spaces only.
    NotABuild,
    /// A value of the wrong type.
    WrongValue {
        /// Its place in the build, such as `skills[2].support_skills[0].id`.
        field: String,
    },
    /// A field an entry needs that is missing.
    MissingField {
        /// Its place in the build, such as `passives[0].id`.
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
            Self::MissingField { field } => write!(formatter, "a missing field `{field}`"),
        }
    }
}

impl std::error::Error for ReadError {}

impl ReadError {
    /// The error of a text `serde_json` couldn't read, at the line of the error
    /// ([`place_of`]); a text of spaces only isn't a build.
    pub(crate) fn of_json(text: &str, error: &serde_json::Error) -> Self {
        let Some((line, column, text_of_line)) = place_of(text, error) else {
            return Self::NotABuild;
        };
        Self::NotJson {
            line,
            column,
            excerpt: excerpt(text_of_line, column),
        }
    }

    /// The error of a value read from the JSON of a build, at the place `serde_path_to_error`
    /// followed. A field that is missing is named after the object that misses it: `serde`
    /// says it in its message only, ``missing field `id` ``, without the line and column that
    /// `serde_json` adds when it reads a text, since it reads a `Value` here.
    pub(crate) fn of_value(error: &serde_path_to_error::Error<serde_json::Error>) -> Self {
        let field = error.path().to_string();
        let message = error.inner().to_string();
        // The root needs only `name`, which `Build::read` checks first: a field missing is
        // always inside an object of the build, never at the root (`.`).
        match message
            .strip_prefix("missing field `")
            .and_then(|rest| rest.strip_suffix('`'))
        {
            Some(missing) => Self::MissingField {
                field: format!("{field}.{missing}"),
            },
            None => Self::WrongValue { field },
        }
    }
}

/// The line of a JSON error, from 1, its byte from 1 and its text; none for a text of spaces
/// only. `serde_json` places an error after the character it stopped on, which for two errors
/// is where no one can look: for a text that ends too soon, the line after its last line break,
/// where the last line with a character other than a space is meant; for an error on the line
/// break that ends its line (a string without its closing quote, a number or a `true` cut by
/// it), the column 0 of the next line, where the end of that line is meant, as for a file of
/// CRLF, whose `\r` stops `serde_json` before the line break.
fn place_of<'text>(
    text: &'text str,
    error: &serde_json::Error,
) -> Option<(usize, usize, &'text str)> {
    let line_of = |line: usize| {
        line.checked_sub(1)
            .and_then(|index| text.lines().nth(index))
            .unwrap_or_default()
    };
    let at_its_end = |line: usize, text_of_line: &'text str| {
        let text_of_line = text_of_line.trim_end();
        (line, text_of_line.len().saturating_add(1), text_of_line)
    };
    if error.classify() == serde_json::error::Category::Eof {
        let (index, last) = text
            .lines()
            .enumerate()
            .filter(|(_, line)| !line.trim().is_empty())
            .last()?;
        return Some(at_its_end(index.saturating_add(1), last));
    }
    Some(match (error.line(), error.column()) {
        (line, 0) if line > 1 => {
            let line = line.saturating_sub(1);
            at_its_end(line, line_of(line))
        }
        (line, column) => (line, column, line_of(line)),
    })
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
