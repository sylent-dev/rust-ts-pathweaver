// The fonts proposed for the name (2c, the owner, 2026-11-17, then twice as many): every kind, chosen by a list of the
// page (js/page.js), each in the weight that suits it, then its weights on Google Fonts when it has
// more than one (a range for a variable font, a list otherwise), which the slider « Weight » reads. All from Google Fonts while the font is
// chosen, under open licences; the license of the font kept is checked before the website serves
// it itself. A font loads only once picked (loadNameFont).

const NAME_FONTS = {
  "Sans serif": [
    ["Geist", 600, "100..900"], ["Inter", 600, "100..900"], ["Space Grotesk", 600, "300..700"], ["Outfit", 600, "100..900"], ["Lexend", 600, "100..900"],
    ["Plus Jakarta Sans", 700, "200..800"], ["Red Hat Display", 700, "300..900"], ["Familjen Grotesk", 600, "400..700"], ["Syne", 700, "400..800"],
    ["Unbounded", 600, "200..900"], ["Comfortaa", 700, "300..700"],
    ["Montserrat", 700, "100..900"], ["Poppins", 600, "100;200;300;400;500;600;700;800;900"], ["Raleway", 700, "100..900"], ["Nunito", 800, "200..1000"], ["Quicksand", 700, "300..700"], ["Josefin Sans", 600, "100..700"], ["Urbanist", 700, "100..900"], ["Figtree", 700, "300..900"], ["Epilogue", 700, "100..900"], ["Bricolage Grotesque", 700, "200..800"], ["Archivo", 700, "100..900"], ["Kanit", 600, "100;200;300;400;500;600;700;800;900"],
  ],
  "Technical": [
    ["Orbitron", 700, "400..900"], ["Audiowide", 400], ["Exo 2", 700, "100..900"], ["Chakra Petch", 600, "300;400;500;600;700"], ["Oxanium", 700, "200..800"],
    ["Michroma", 400], ["Russo One", 400], ["Saira", 600, "100..900"], ["Righteous", 400],
    ["Tektur", 600, "400..900"], ["Aldrich", 400], ["Electrolize", 400], ["Quantico", 700, "400;700"], ["Share Tech", 400], ["Turret Road", 700, "200;300;400;500;700;800"], ["Zen Dots", 400], ["Krona One", 400],
  ],
  "Condensed": [
    ["Bebas Neue", 400], ["Big Shoulders Display", 800, "100..900"], ["Anton", 400], ["Teko", 600, "300..700"], ["Oswald", 600, "200..700"],
    ["Barlow Condensed", 700, "100;200;300;400;500;600;700;800;900"], ["Fjalla One", 400], ["League Gothic", 400], ["Antonio", 700, "100..700"], ["Pathway Gothic One", 400],
  ],
  "Serif": [
    ["Fraunces", 600, "100..900"], ["Playfair Display", 700, "400..900"], ["DM Serif Display", 400], ["Cormorant Garamond", 600, "300..700"],
    ["Bodoni Moda", 700, "400..900"], ["Instrument Serif", 400], ["Young Serif", 400], ["Libre Baskerville", 700, "400..700"],
    ["Lora", 700, "400..700"], ["EB Garamond", 600, "400..800"], ["Prata", 400], ["Abril Fatface", 400], ["Gloock", 400], ["Rozha One", 400], ["Yeseva One", 400], ["Newsreader", 600, "200..800"],
  ],
  "Carved and ancient": [
    ["Cinzel", 700, "400..900"], ["Cinzel Decorative", 700, "400;700;900"], ["Marcellus", 400], ["Uncial Antiqua", 400],
    ["MedievalSharp", 400], ["Almendra", 700, "400;700"], ["IM Fell English", 400], ["Metamorphous", 400],
    ["Forum", 400], ["Philosopher", 700, "400;700"], ["Caudex", 700, "400;700"], ["Macondo", 400], ["Eagle Lake", 400], ["Fondamento", 400],
  ],
  "Gothic": [
    ["Pirata One", 400], ["UnifrakturMaguntia", 400], ["Grenze Gotisch", 600, "100..900"], ["New Rocker", 400],
    ["Germania One", 400], ["Jacquard 24", 400], ["Texturina", 600, "100..900"], ["Fruktur", 400],
  ],
  "Handwriting": [
    ["Caveat", 700, "400..700"], ["Kalam", 700, "300;400;700"], ["Permanent Marker", 400], ["Rock Salt", 400],
    ["Shadows Into Light", 400], ["Kaushan Script", 400],
    ["Indie Flower", 400], ["Gochi Hand", 400], ["Patrick Hand", 400], ["Architects Daughter", 400], ["Gloria Hallelujah", 400], ["Reenie Beanie", 400],
  ],
  "Script": [
    ["Pacifico", 400], ["Dancing Script", 700, "400..700"], ["Satisfy", 400], ["Great Vibes", 400],
    ["Yellowtail", 400], ["Sacramento", 400],
    ["Lobster", 400], ["Cookie", 400], ["Allura", 400], ["Parisienne", 400], ["Alex Brush", 400], ["Tangerine", 700, "400;700"],
  ],
  "Mono and pixel": [
    ["JetBrains Mono", 700, "100..800"], ["Space Mono", 700, "400;700"], ["Major Mono Display", 400], ["Silkscreen", 400, "400;700"],
    ["Press Start 2P", 400],
    ["IBM Plex Mono", 600, "100;200;300;400;500;600;700"], ["Special Elite", 400], ["VT323", 400], ["Pixelify Sans", 600, "400..700"],
  ],
  "Display": [
    ["Monoton", 400], ["Bungee", 400], ["Bungee Shade", 400], ["Rubik Glitch", 400],
    ["Rubik Mono One", 400], ["Black Ops One", 400], ["Bungee Inline", 400], ["Codystar", 400, "300;400"], ["Metal Mania", 400], ["Staatliches", 400], ["Wallpoet", 400],
  ],
};

// The name, its W apart so that the case PathWeaver needs no other text (css/logo.css).
const LOGO_NAME = 'Path<span class="logo-name-w">w</span>eaver';

const nameFontKey = family => family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
// Numbered once and for good after the weights of the mark (86 to 89): 90 to 221.
const NAME_FONT_LIST = Object.values(NAME_FONTS).flat().map(([family, weight, weights], index) =>
  ({ id: 90 + index, key: nameFontKey(family), family, weight, weights: weights ?? String(weight) }));
const nameFontQuery = font => `family=${font.family.replace(/ /g, "+")}:wght@${font.weights}`;
// The weights of a font, to read: « 100–900 » (a range, or more than three), « 400, 700 », « 400 only ».
function nameFontWeights(font) {
  const weights = font.weights.split(/\.\.|;/);
  if (weights.length === 1) return `${weights[0]} only`;
  return font.weights.includes("..") || weights.length > 3 ? `${weights[0]}–${weights.at(-1)}` : weights.join(", ");
}

// Loads the font of the name once, then sets the variables that css/logo.css reads.
function loadNameFont(key) {
  const font = NAME_FONT_LIST.find(candidate => candidate.key === key);
  if (!font) return;
  const href = `https://fonts.googleapis.com/css2?${nameFontQuery(font)}&display=swap`;
  if (!document.querySelector(`link[href="${href}"]`)) {
    document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));
  }
  document.documentElement.style.setProperty("--name-font", `"${font.family}"`);
  document.documentElement.style.setProperty("--name-weight", font.weight);
}

// Loads every font at once, one sheet per kind, for the section that shows them side by side.
function loadAllNameFonts() {
  for (const fonts of Object.values(NAME_FONTS)) {
    const href = `https://fonts.googleapis.com/css2?${fonts.map(([family]) => nameFontQuery(NAME_FONT_LIST.find(font => font.family === family))).join("&")}&display=swap`;
    document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));
  }
}

// The slider « Weight »: 0 leaves each font in its own weight; any other value is asked of every
// font, which shows its nearest weight (css/logo.css forbids the bold the browser would fake).
function setNameWeight(value) {
  if (value === "0") document.documentElement.style.removeProperty("--name-weight-chosen");
  else document.documentElement.style.setProperty("--name-weight-chosen", value);
}
