// One search of Dribbble in Playwright's Chromium, called by build.py: the images of the
// results, written to a JSON file. A real browser, because the search page answers a plain
// download with an anti-robot page that only a browser passes on its own; a wall that asks
// for more (an account, a puzzle) shows as no image found, and stops there.
//
//   node search.cjs <search-slug> <output.json>
//
// The slug is the end of the address: https://dribbble.com/search/<slug> (`p-monogram`).
// Playwright is the one of the html-mockups skill, installed once outside the projects
// (see its SKILL.md); PLAYWRIGHT_HOME points to another installation folder.
const fs = require("node:fs");
const path = require("node:path");

const home = process.env.PLAYWRIGHT_HOME || path.join(process.env.HOME, ".local/share/mockup-tools");
const { chromium } = require(path.join(home, "node_modules/playwright"));

(async () => {
  const [slug, output] = process.argv.slice(2);
  if (!slug || !output) {
    console.error("usage: node search.cjs <search-slug> <output.json>");
    process.exit(2);
  }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    });
    await page.goto(`https://dribbble.com/search/${encodeURIComponent(slug)}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(6000);
    // The results load as the page scrolls: four scrolls give about forty images.
    for (let i = 0; i < 4; i += 1) {
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(1200);
    }
    const images = await page.$$eval("img", elements =>
      elements
        .map(element => ({ src: element.currentSrc || element.src, alt: element.alt }))
        .filter(image => image.src.includes("cdn.dribbble.com/userupload/")),
    );
    fs.writeFileSync(output, JSON.stringify({ slug, title: await page.title(), images }, null, 1));
    if (images.length === 0) console.error(`${slug}: no image found (page « ${await page.title()} »): a wall?`);
  } finally {
    await browser.close();
  }
})();
