// The fonts proposed for each role (2d, 2026-11-18): the titles, the text, and the numbers, whose
// figures must all be one width so that the levels line up (« tabular figures »). Sorted by kind,
// numbered 222 to 306 after the fonts of the name (90 to 221). Every one is on Google Fonts under
// the SIL Open Font License (its folder in ofl/ of the google/fonts repository, checked on
// 2026-11-18), so that the website may serve the one kept itself; each with its weights on Google
// Fonts, a range for a variable font. Archivo (the name) and Manrope (the links of the band of the
// site) are among them, so that one font may hold several roles. Loaded before page.js, whose lists
// read them; the fonts load only on the page of the board (loadRoleFonts).

const ROLE_FONTS = {
  "Neutral sans": [
    ["Geist", "100..900"], ["Inter", "100..900"], ["Manrope", "200..800"], ["IBM Plex Sans", "100..700"], ["Public Sans", "100..900"], ["DM Sans", "100..1000"], ["Figtree", "300..900"], ["Onest", "100..900"], ["Instrument Sans", "400..700"], ["Hanken Grotesk", "100..900"], ["Schibsted Grotesk", "400..900"], ["Albert Sans", "100..900"], ["Source Sans 3", "200..900"], ["Red Hat Text", "300..700"], ["Golos Text", "400..900"], ["Rethink Sans", "400..800"], ["Funnel Sans", "300..800"], ["Mona Sans", "200..900"], ["Atkinson Hyperlegible Next", "200..800"], ["Libre Franklin", "100..900"], ["Wix Madefor Text", "400..800"], ["Work Sans", "100..900"], ["Karla", "200..800"], ["Be Vietnam Pro", "100;200;300;400;500;600;700;800;900"],
  ],
  "Geometric and wide": [
    ["Archivo", "100..900"], ["Hubot Sans", "200..900"], ["Plus Jakarta Sans", "200..800"], ["Outfit", "100..900"], ["Sora", "100..800"], ["Space Grotesk", "300..700"], ["Lexend", "100..900"], ["Urbanist", "100..900"], ["Unbounded", "200..900"], ["Syne", "400..800"], ["Bricolage Grotesque", "200..800"], ["Epilogue", "100..900"], ["Jost", "100..900"], ["Familjen Grotesk", "400..700"],
  ],
  "Condensed and technical": [
    ["Archivo Narrow", "400..700"], ["Barlow Semi Condensed", "100;200;300;400;500;600;700;800;900"], ["Barlow Condensed", "100;200;300;400;500;600;700;800;900"], ["Saira Condensed", "100;200;300;400;500;600;700;800;900"], ["Sofia Sans Condensed", "1..1000"], ["Rajdhani", "300;400;500;600;700"], ["Chakra Petch", "300;400;500;600;700"], ["Oxanium", "200..800"], ["Tektur", "400..900"], ["Exo 2", "100..900"], ["Oswald", "200..700"], ["Antonio", "100..700"], ["Teko", "300..700"], ["Titillium Web", "200;300;400;600;700;900"], ["Bebas Neue", "400"], ["Michroma", "400"], ["Orbitron", "400..900"],
  ],
  "Serif and carved": [
    ["Cinzel", "400..900"], ["Marcellus", "400"], ["Cormorant", "300..700"], ["Fraunces", "100..900"], ["Spectral", "200;300;400;500;600;700;800"], ["Newsreader", "200..800"], ["EB Garamond", "400..800"], ["Young Serif", "400"], ["Instrument Serif", "400"], ["Gloock", "400"], ["Literata", "200..900"], ["Source Serif 4", "200..900"],
  ],
  "Mono": [
    ["Geist Mono", "100..900"], ["JetBrains Mono", "100..800"], ["IBM Plex Mono", "100;200;300;400;500;600;700"], ["Space Mono", "400;700"], ["Fira Code", "300..700"], ["DM Mono", "300;400;500"], ["Martian Mono", "100..800"], ["Azeret Mono", "100..900"], ["Red Hat Mono", "300..700"], ["Spline Sans Mono", "300..700"], ["Sometype Mono", "400..700"], ["Chivo Mono", "100..900"], ["Source Code Pro", "200..900"], ["Fragment Mono", "400"], ["Reddit Mono", "200..900"], ["Google Sans Code", "300..800"], ["Overpass Mono", "300..700"], ["Kode Mono", "400..700"],
  ],
};

let roleFontId = 222;
const ROLE_FONT_LIST = Object.entries(ROLE_FONTS).flatMap(([kind, fonts]) => fonts.map(([family, weights]) =>
  ({ id: roleFontId++, key: family.toLowerCase().replace(/ /g, "-"), family, kind, weights })));
const roleFont = key => ROLE_FONT_LIST.find(font => font.key === key);
// The options of a list of the page: « 222 · Geist ».
const roleFontOptions = () => Object.fromEntries(ROLE_FONT_LIST.map(font => [font.key, `${font.id} · ${font.family}`]));
// The value of a token of a font: the mono ones fall back on a monospace font.
const roleFontCss = key => `"${roleFont(key).family}", ${roleFont(key).kind === "Mono" ? "monospace" : "sans-serif"}`;

// Every font of the board, from Google Fonts, fifteen to a sheet so that no address grows too long.
function loadRoleFonts() {
  for (let start = 0; start < ROLE_FONT_LIST.length; start += 15) {
    const families = ROLE_FONT_LIST.slice(start, start + 15)
      .map(font => `family=${font.family.replace(/ /g, "+")}:wght@${font.weights}`).join("&");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.append(link);
  }
}
