// The brand (2e), decided by the owner on 2026-11-17: the mark 88 · Bold (js/logo-mark.js), its
// frame in the accent and its P in the text, at 24 px beside the name at 16 px, 8 px apart; the
// same mark as the favicon, which this page takes too. The weights, inks and sizes compared are in
// the history of Git (commit 5e2394d).

// The browser around the favicon draws its tabs in its own colours, light or dark, whatever the
// style of the page: those of a common browser.
const BROWSER_CHROMES = {
  light: { title: "A light browser", strip: "#f0f0f4", tab: "#ffffff", text: "#15141a" },
  dark: { title: "A dark browser", strip: "#1c1b22", tab: "#42414d", text: "#fbfbfe" },
};

const browserTabs = chrome => `<div class="brand-browser" style="--chrome-strip:${chrome.strip};--chrome-tab:${chrome.tab};--chrome-text:${chrome.text}">
  <div class="brand-browser-tab is-current">${logoMark(16)}<span>${escapeHtml(BUILDS.open[0].name)} · Pathweaver</span></div>
  <div class="brand-browser-tab">${logoMark(16)}<span>${escapeHtml(BUILDS.open[1].name)} · Pathweaver</span></div>
</div>`;

addSection(() => ["The brand · the mark beside the name in the app bar, in the style of the page; the favicon in the tabs of a light and a dark browser, with the accent of the style of the page",
  [["The app bar", `<div class="brand-card">${shownStyles().map(style =>
    `<div class="brand-style" data-sample-theme="${style}" title="${THEMES[style].title}">${appBar(560, { menu: false })}</div>`).join("")}</div>`],
  ...Object.values(BROWSER_CHROMES).map(chrome => [chrome.title, browserTabs(chrome)])]]);

// The favicon of this page, as the website will serve it: an SVG of the mark at 16 px, its frame
// in the accent, its P dark or light after the scheme of the system, as the browser draws its tabs.
function setFavicon() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const [light, dark] = [BROWSER_CHROMES.light.text, BROWSER_CHROMES.dark.text];
  const svg = logoMark(16).replace(/(<svg[^>]*>)/,
    `$1<style>.logo-frame{fill:${accent}}.logo-p{fill:${light}}@media (prefers-color-scheme: dark){.logo-p{fill:${dark}}}</style>`);
  let link = document.querySelector("link[rel=icon]");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  link.type = "image/svg+xml";
  link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

AFTER_RENDER.push(setFavicon);
