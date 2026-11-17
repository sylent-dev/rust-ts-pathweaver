// The fonts proposed for the name (2c, the owner, 2026-11-17): every kind, chosen by a list of the
// page (js/page.js), each in the weight that suits it. All from Google Fonts while the font is
// chosen, under open licences; the license of the font kept is checked before the website serves
// it itself. A font loads only once picked (loadNameFont).

const NAME_FONTS = {
  "Sans serif": [
    ["Geist", 600], ["Inter", 600], ["Space Grotesk", 600], ["Outfit", 600], ["Lexend", 600],
    ["Plus Jakarta Sans", 700], ["Red Hat Display", 700], ["Familjen Grotesk", 600], ["Syne", 700],
    ["Unbounded", 600], ["Comfortaa", 700],
  ],
  "Technical": [
    ["Orbitron", 700], ["Audiowide", 400], ["Exo 2", 700], ["Chakra Petch", 600], ["Oxanium", 700],
    ["Michroma", 400], ["Russo One", 400], ["Saira", 600], ["Righteous", 400],
  ],
  "Condensed": [
    ["Bebas Neue", 400], ["Big Shoulders Display", 800], ["Anton", 400], ["Teko", 600], ["Oswald", 600],
  ],
  "Serif": [
    ["Fraunces", 600], ["Playfair Display", 700], ["DM Serif Display", 400], ["Cormorant Garamond", 600],
    ["Bodoni Moda", 700], ["Instrument Serif", 400], ["Young Serif", 400], ["Libre Baskerville", 700],
  ],
  "Carved and ancient": [
    ["Cinzel", 700], ["Cinzel Decorative", 700], ["Marcellus", 400], ["Uncial Antiqua", 400],
    ["MedievalSharp", 400], ["Almendra", 700], ["IM Fell English", 400], ["Metamorphous", 400],
  ],
  "Gothic": [
    ["Pirata One", 400], ["UnifrakturMaguntia", 400], ["Grenze Gotisch", 600], ["New Rocker", 400],
  ],
  "Handwriting": [
    ["Caveat", 700], ["Kalam", 700], ["Permanent Marker", 400], ["Rock Salt", 400],
    ["Shadows Into Light", 400], ["Kaushan Script", 400],
  ],
  "Script": [
    ["Pacifico", 400], ["Dancing Script", 700], ["Satisfy", 400], ["Great Vibes", 400],
    ["Yellowtail", 400], ["Sacramento", 400],
  ],
  "Mono and pixel": [
    ["JetBrains Mono", 700], ["Space Mono", 700], ["Major Mono Display", 400], ["Silkscreen", 400],
    ["Press Start 2P", 400],
  ],
  "Display": [
    ["Monoton", 400], ["Bungee", 400], ["Bungee Shade", 400], ["Rubik Glitch", 400],
  ],
};

// The name, its W apart so that the case PathWeaver needs no other text (css/logo.css).
const LOGO_NAME = 'Path<span class="logo-name-w">w</span>eaver';

const nameFontKey = family => family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const NAME_FONT_LIST = Object.values(NAME_FONTS).flat().map(([family, weight]) => ({ key: nameFontKey(family), family, weight }));

// Loads the font of the name once, then sets the variables that css/logo.css reads.
function loadNameFont(key) {
  const font = NAME_FONT_LIST.find(candidate => candidate.key === key);
  if (!font) return;
  const href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}:wght@${font.weight}&display=swap`;
  if (!document.querySelector(`link[href="${href}"]`)) {
    document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));
  }
  document.documentElement.style.setProperty("--name-font", `"${font.family}"`);
  document.documentElement.style.setProperty("--name-weight", font.weight);
}
