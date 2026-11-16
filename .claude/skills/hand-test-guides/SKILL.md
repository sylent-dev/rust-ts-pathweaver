---
name: hand-test-guides
description: Write the step-by-step guide of a test by hand (what only a real browser shows: a file dropped from the desktop, the clipboard, the storage of the library, a share link opened on a phone, the website once deployed) in docs/tests/, as a blank template run again before every deployment of a version, and list it in docs/tests/README.md. Use it when a step needs the owner or a tester to try the website by hand, or when the owner asks for a test guide.
---

# Guides of the tests by hand

Goal: a test the owner or a tester runs by hand is written as a guide they follow without the conversation, run again before every deployment of a version, never as instructions in the chat: given in the chat, a probe that had to be launched first was missed.

## 1. Size it first

- **Size the guide by what the tester can run**, not by the list of a review: thirteen tests, one per assumption, were cut to the four that matter for the release, the rest left to the backlog until a user reports. When proposing a step, say how many hand tests it adds.
- **One guide per feature**, named by it in kebab-case (`docs/tests/share-link.md`), in `docs/tests/`, listed in `docs/tests/README.md` with its step, in the pull request of the step it tests.
- **A feature that depends on the browser is tested in each setup the users have**: Firefox and a Chromium on the computer, the browser of a phone, a private window (where the storage may be refused), and the website deployed as well as `npm run dev` when the host changes something (the headers, the addresses). When the cause of a failure isn't known, a small probe in the real browser settles it before any fix is coded.

## 2. Write it

Start from `assets/guide-template.md`, in English, the language of the project (a guide for a French tester may be written in French: ask first):

- **Why first**, in two or three sentences: what changed and what the tests check, then « run the tests in a row; a ✅ is enough when it works, detail only what goes wrong ».
- **Before**: the exact commands, from a fresh state (the branch, `npm run dev` from `web/` and the address it serves, or the address of the website deployed; the files of `inputs/builds/` to use; a private window or a cleared storage when the test needs an empty library).
- **Each test**: a bold name, the action, then the expected result after a ✅, precise enough to tell a pass from a near miss (the exact text shown, the level reached, the number of builds listed).
- **Go to the end of the lists** (every build of a guide, the last level, the largest file of the corpus): the rare data lives there.
- **A free test last**: « your own scenarios ». It found a case no test asked for.
- **A blank results table**, one row per test with a Result and a Remark column. The guide stays a blank template: its results come back in the conversation or the pull request, never in the file.

## 3. Check it against the code

- **A text quoted in a guide is read where the code writes it**: its message in `web/locales/`, when it shows, its exact words.
- **A text a code review proposes for a guide is checked against the code** before it is written: a condition copied from a review came out inverted.
- **A step must not hide what it checks**: a build already in the library from an earlier test, a page left open in another tab, the cache of the browser. When a test depends on how another site or the browser behaves (what a chat does to a long link, what a private window keeps), check it first.
- The `code-reviewer` agent reads the guides of the branch against the code: give them to it with the code.

## 4. Hand it over

- Give the owner the path of the guide and the commands of its section Before; wait for their results.
- **A tester who isn't at hand** (on a phone or a browser the owner doesn't have) is never asked for results step after step: each step still writes its guide, blank, and the tester runs every guide at once before the deployment of the version.
- Before every deployment of a version, every guide is run again (`process.md`, Deployment); a guide whose feature changed is updated in the pull request of the change.
