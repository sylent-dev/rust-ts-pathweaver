#!/usr/bin/env python3
"""Build a moodboard from its plan: search, number, download, and write one page to scroll.

    python3 build.py outputs/<YYYY-MM-DD>-<subject>-moodboard/plan.json

The folder of the plan holds everything, ignored by Git with `outputs/`:

    plan.json     the boards and their searches (written by Claude Code, see SKILL.md)
    search/       the results of each search (search.cjs), kept so that a rerun searches again
                  only what is new
    img/          one image per reference, named by its number (R301.webp)
    refs.json     the references of each board, with their number, search and source
    sources.md    the same as a list, to find the source of a number

and the page beside the folder, `<folder>.html`, served from the root of the repository.

The plan:

    {
      "title": "Logo moodboard",
      "first": 301,                 the first number, after those of the earlier moodboards
      "per_board": 24,
      "exclude": ["wordpress"],     words that drop a result when its description has them
      "boards": [
        {"title": "Monograms of the letter P", "queries": ["p-monogram", "letter-p-logo"]},
        {"title": "Monograms of W, ligatures PW and WP",
         "parts": [{"queries": ["w-monogram"], "count": 12},
                   {"queries": ["pw-monogram", "pw-logo"], "count": 12}]}
      ]
    }

A board already built keeps its references and their numbers when the plan grows: add a
board at the end and run again, the new one takes the next numbers. The results of the
searches of a board are interleaved, and a result seen on an earlier board is skipped.
"""

import html
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

SEARCH = Path(__file__).with_name("search.cjs")
SIZE = "800x600"


def load(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def search(folder, slug):
    """The images of one search, from the cache of the folder or from Dribbble."""
    cache = folder / "search" / f"{slug}.json"
    if not cache.exists():
        cache.parent.mkdir(exist_ok=True)
        subprocess.run(["node", str(SEARCH), slug, str(cache)], check=True)
    return json.loads(cache.read_text())["images"]


def pick(folder, queries, count, exclude, seen):
    """Up to `count` new results, taken in turn from each search."""
    lists = [[image for image in search(folder, slug) if not any(word in image["alt"].lower() for word in exclude)] for slug in queries]
    picked, rank = [], 0
    while len(picked) < count and any(rank < len(results) for results in lists):
        for slug, results in zip(queries, lists):
            if rank < len(results) and len(picked) < count:
                image = results[rank]
                key = image["src"].split("?")[0]
                if key not in seen:
                    seen.add(key)
                    url = re.sub(r"resize=\d+x\d+", f"resize={SIZE}", image["src"])
                    picked.append({"query": slug, "url": url, "alt": image["alt"]})
        rank += 1
    return picked


def download(url, target):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        target.write_bytes(response.read())


def write_page(folder, plan, boards):
    nav = "".join(f'<a href="#board-{i}">{i} · {html.escape(b["title"])}</a>' for i, b in enumerate(boards, 1))
    sections = []
    for i, board in enumerate(boards, 1):
        refs = board["refs"]
        tiles = "".join(
            f'<button class="tile" data-ref="{r["id"]}" title="{html.escape(r["query"])}">'
            f'<img loading="lazy" src="{folder.name}/img/{r["id"]}.webp" alt="{r["id"]}"><span class="num">{r["id"]}</span></button>'
            for r in refs
        )
        span = f'{refs[0]["id"]}–{refs[-1]["id"]}' if refs else "empty"
        sections.append(f'<section id="board-{i}"><h2>{i} · {html.escape(board["title"])} <small>{span}</small></h2><div class="grid">{tiles}</div></section>')
    page = (Path(__file__).with_name("page.html").read_text()
            .replace("{{title}}", html.escape(plan["title"]))
            .replace("{{key}}", json.dumps(folder.name))
            .replace("{{nav}}", nav)
            .replace("{{sections}}", "".join(sections)))
    (folder.parent / f"{folder.name}.html").write_text(page)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: build.py <folder>/plan.json")
    plan_path = Path(sys.argv[1]).resolve()
    folder = plan_path.parent
    plan = json.loads(plan_path.read_text())
    exclude = [word.lower() for word in plan.get("exclude", [])]
    built = {b["title"]: b["refs"] for b in load(folder / "refs.json", {"boards": []})["boards"]}
    seen = {r["url"].split("?")[0] for refs in built.values() for r in refs}
    number = max([int(r["id"][1:]) for refs in built.values() for r in refs], default=plan["first"] - 1) + 1
    (folder / "img").mkdir(exist_ok=True)

    boards = []
    for board in plan["boards"]:
        refs = built.get(board["title"])
        if refs is None:
            parts = board.get("parts") or [{"queries": board["queries"], "count": plan.get("per_board", 24)}]
            refs = []
            for part in parts:
                for found in pick(folder, part["queries"], part["count"], exclude, seen):
                    refs.append({"id": f"R{number}", **found})
                    number += 1
        for ref in refs:
            image = folder / "img" / f'{ref["id"]}.webp'
            if not image.exists():
                try:
                    download(ref["url"], image)
                except OSError as error:
                    print(f'{ref["id"]}: not downloaded ({error})', file=sys.stderr)
        boards.append({"title": board["title"], "refs": refs})

    (folder / "refs.json").write_text(json.dumps({"boards": boards}, indent=1))
    lines = [f'# {plan["title"]}\n\nEach reference, numbered once across the boards, with its source (for inspiration only: never copied).\n']
    for i, board in enumerate(boards, 1):
        lines.append(f'\n## Board {i}: {board["title"]}\n\n')
        lines += [f'- {r["id"]}: dribbble {r["query"]} · {r["url"]}\n' for r in board["refs"]]
    (folder / "sources.md").write_text("".join(lines))
    write_page(folder, plan, boards)
    print(f'{sum(len(b["refs"]) for b in boards)} references on {len(boards)} boards, up to R{number - 1}: {folder.name}.html')


if __name__ == "__main__":
    main()
