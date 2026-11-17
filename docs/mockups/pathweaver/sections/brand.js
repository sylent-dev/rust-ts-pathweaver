// The brand (2e): the owner's mark (js/logo-mark.js) beside the name in the app bar, then alone,
// in the tab of the browser and as the favicon, in each of its six weights (86 to 91). The lists
// and sliders of the page set what the bar shows (« Mark in the bar », « Mark size », « Name size »,
// « Gap »), the inks of the mark (« Mark ») and the favicon of this page (« Favicon »).
// The sections of 2c, the four weights at 128, 64, 32 and 16 px and the name alone, are in the
// history of Git (commit 501b851).

const BRAND_STYLES = ["frost", "frost-night", "ember"];

// The browser around the favicon draws its tabs in its own colours, light or dark, whatever the
// style of the page: those of a common browser.
const BROWSER_CHROMES = {
  light: { title: "A light browser", strip: "#f0f0f4", tab: "#ffffff", text: "#15141a" },
  dark: { title: "A dark browser", strip: "#1c1b22", tab: "#42414d", text: "#fbfbfe" },
};

const markLabel = mark => `${mark.id} · ${escapeHtml(mark.name)}: ${escapeHtml(mark.note)}`;

// The mark alone, at the sizes where it lives, the favicon in the tabs of a light and a dark
// browser, and the real pixels of the favicon at 16 and 32 px, four and two times larger.
const browserTabs = (mark, chrome) => {
  const colours = BROWSER_CHROMES[chrome];
  const style = `--chrome-strip:${colours.strip};--chrome-tab:${colours.tab};--chrome-text:${colours.text}`;
  return `<div class="brand-browser" style="${style}" title="${colours.title}">
    <div class="brand-browser-tab is-current">${logoMark(mark, 16)}<span>${escapeHtml(BUILDS.open[0].name)} · Pathweaver</span></div>
    <div class="brand-browser-tab">${logoSquare(mark, 16)}<span>${escapeHtml(BUILDS.open[1].name)} · Pathweaver</span></div>
  </div>`;
};
const markZoom = (mark, size, square, chrome) =>
  `<canvas class="brand-zoom" width="${size}" height="${size}" style="width:64px;height:64px" data-mark="${mark.id}" data-size="${size}" data-square="${square}" data-chrome="${chrome}" title="${size} px, ${64 / size} times larger"></canvas>`;

const markCard = mark => `<div class="brand-mark-card">
  <div class="brand-sizes">${logoMark(mark, 96)}${[32, 16].map(size => logoMark(mark, size)).join("")}${[32, 16].map(size => logoSquare(mark, size)).join("")}</div>
  ${Object.keys(BROWSER_CHROMES).map(chrome => browserTabs(mark, chrome)).join("")}
  <div class="brand-zooms">${Object.keys(BROWSER_CHROMES).map(chrome => [16, 32].map(size =>
    markZoom(mark, size, false, chrome) + markZoom(mark, size, true, chrome)).join("")).join("")}</div>
</div>`;

addSection(() => ["The mark alone · at 96, 32 and 16 px, in its ink and on the accent, in the tabs of a light and a dark browser, then its real pixels at 16 and 32 px (four and two times larger), in the style of the page",
  LOGO_WEIGHTS.map(mark => [markLabel(mark), markCard(mark)])]);

// The brand in the app bar, the real one with its tabs, on the three styles.
const brandCard = mark => `<div class="brand-card">${BRAND_STYLES.map(style =>
  `<div class="brand-style" data-sample-theme="${style}" title="${THEMES[style].title}">${appBar(560, mark)}</div>`).join("")}</div>`;

addSection(() => ["The brand · the mark beside the name in the app bar, on Frost, Frost Night and Ember: « Mark size », « Name size » and « Gap » apply to every row, « Mark in the bar » picks the one of the page of a build",
  [["None · the name alone", brandCard(null)], ...LOGO_WEIGHTS.map(mark => [markLabel(mark), brandCard(mark)])]]);

// The canvases of the zoom: the favicon drawn at its real size by the browser, then shown larger
// pixel by pixel, on the tab of the browser.
function drawZooms() {
  const page = getComputedStyle(document.documentElement);
  const accent = page.getPropertyValue("--accent").trim();
  const onAccent = page.getPropertyValue("--on-accent").trim();
  for (const canvas of document.querySelectorAll(".brand-zoom")) {
    const mark = LOGO_WEIGHTS.find(weight => String(weight.id) === canvas.dataset.mark);
    const size = Number(canvas.dataset.size);
    const chrome = BROWSER_CHROMES[canvas.dataset.chrome];
    const square = canvas.dataset.square === "true";
    const context = canvas.getContext("2d");
    context.fillStyle = chrome.tab;
    context.fillRect(0, 0, size, size);
    if (square) {
      context.fillStyle = accent;
      context.beginPath();
      context.roundRect(0, 0, size, size, size * .22);
      context.fill();
    }
    const margin = square ? Math.round(size * .11) : 0;
    const inner = size - 2 * margin;
    const inks = square ? { frame: onAccent, p: onAccent } : logoInks(chosen.logoInk, chrome.text, accent);
    const image = new Image();
    image.onload = () => context.drawImage(image, margin, margin, inner, inner);
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(logoMark(mark, inner, inks));
  }
}

// The favicon of this page, the choice of « Favicon » at 16 px: in its ink, it follows the light or
// dark scheme of the system, as the browser does; on the accent, it keeps the accent of the style.
function setFavicon() {
  const [id, square] = chosen.favicon.split("-");
  const mark = LOGO_WEIGHTS.find(weight => String(weight.id) === id);
  const page = getComputedStyle(document.documentElement);
  const accent = page.getPropertyValue("--accent").trim();
  let svg;
  if (square) {
    const margin = Math.round(16 * .11);
    const onAccent = page.getPropertyValue("--on-accent").trim();
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" rx="3.5" fill="${accent}"/>${
      logoMark(mark, 16 - 2 * margin, { frame: onAccent, p: onAccent }).replace("<svg ", `<svg x="${margin}" y="${margin}" `)}</svg>`;
  } else {
    const [light, dark] = [BROWSER_CHROMES.light.text, BROWSER_CHROMES.dark.text].map(text => logoInks(chosen.logoInk, text, accent));
    svg = logoMark(mark, 16).replace(/(<svg[^>]*>)/, `$1<style>.logo-frame{fill:${light.frame}}.logo-p{fill:${light.p}}@media (prefers-color-scheme: dark){.logo-frame{fill:${dark.frame}}.logo-p{fill:${dark.p}}}</style>`);
  }
  let link = document.querySelector("link[rel=icon]");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  link.type = "image/svg+xml";
  link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

AFTER_RENDER.push(drawZooms, setFavicon);
