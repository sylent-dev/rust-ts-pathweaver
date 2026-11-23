# The website online: the tests (step 3)

The website is published to Cloudflare at each merge into `main`, at its own domain; these tests check that the address answers, that the core in WebAssembly loads there as it does on the owner's machine, and that Cloudflare sends the headers of `web/static/_headers`. Run the tests in a row. A ✅ is enough when it works; detail only what goes wrong.

## Before

1. The pull request merged and the workflow **Deploy** green on `main` (the tab Actions of the repository).
2. Run the tests 1 to 4 in Firefox, then in a Chromium (Chrome, Edge, Brave), each in a private window, so that no copy of the website kept by the browser answers in its place; run the test 1 on the phone as well.
3. The file `inputs/builds/maxroll-aer0-ice-shot-amazon.build`, the largest of the corpus (71 KB).

## The tests

1. **The address**: type `pathweaver.sylent.tools` in the address bar.
   ✅ The page opens over `https://`, its padlock without a warning; it shows « Pathweaver », « The build viewer and planner of Path of Exile 2. », the box « Drop a .build file here, or choose one. » and, under it, « Core 0.1.0, in Rust. », the version of `Cargo.toml` (the core in WebAssembly loaded), never « The core of Pathweaver could not load. ». On the phone, held upright, one message in place of the page (4e1): the brand at the top, the yellow sticky note with its face, « Pathweaver needs a computer », in Archivo, and two lines under it, nothing cut at the edges.

2. **A build opens**: drop the file of the corpus on the box.
   ✅ Its Name, Author, Ascendancy and Contents show under the box (« … passives, … skills, … inventory hints »), never « This file can't be read: ».

3. **The headers**: open the tools of the browser (F12), tab Network, and reload the page.
   ✅ The response of the page itself (the first line, `/`) has `x-content-type-options: nosniff`, `x-frame-options: DENY` and `referrer-policy: strict-origin-when-cross-origin`; a file of `/_app/immutable/` (a `.js` or the `.wasm`) has `cache-control: public, max-age=31536000, immutable`; the `.wasm` (`pathweaver_bg….wasm`) has `content-type: application/wasm` (with another type the core still loads, more slowly, so the test 1 doesn't show it).

4. **Nothing from elsewhere**: in the same tab Network, after the reload, look at the column Domain (in Chromium, right-click the titles of the columns to show it).
   ✅ Every request goes to `pathweaver.sylent.tools`, the two fonts (`manrope-latin….woff2`, `archivo-latin….woff2`) included, none to another site (`cloudflareinsights.com`, `fonts.googleapis.com`, a script), and none has a path under `/cdn-cgi/`, where Cloudflare puts the scripts it adds.

5. **Your own scenarios**: whatever else you want to try.

## Results

| Test | Result | Remark |
|---|---|---|
| 1. The address (Firefox, Chromium, phone) | | |
| 2. A build opens | | |
| 3. The headers | | |
| 4. Nothing from elsewhere | | |
| 5. Your own scenarios | | |
