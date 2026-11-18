"""Writes the sample data of the mock-up from the real sources, so that no value is typed by hand.

    python3 docs/mockups/pathweaver/tools/make-data.py [cache-folder]

From the repository root. Reads:

- the passive tree and the class portraits exported by Grinding Gear Games
  (grindinggear/poe2-skilltree-export, tag TREE_TAG);
- the names, kinds and colours of the gems (RePoE, base_items and skill_gems);
- the builds of the corpus, in inputs/builds/ (local only, never committed).

Writes js/data-tree.js, js/data-builds.js, img/portraits/*.webp (the discs) and
img/portraits-square/*.webp (the square inside each disc, for the tabs) next to this folder. The
downloads are kept in the cache folder (a temporary one by default) so that a second run is fast.
The mock-up only: the website converts the game data with its own script, at step 4.
"""

import json
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

TREE_TAG = "0.5.2"
TREE_URL = f"https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/{TREE_TAG}"
REPOE_URL = "https://repoe-fork.github.io/poe2"
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "inputs" / "builds"

# The build shown, as in the wireframe, then the other open builds of its app bar.
SHOWN = "mobalytics-animeprincess-coc-comet-annotated.build"
OPEN = [
    "mobalytics-fubgun-flameblast-lvl-01-14.build",
    "mobalytics-fubgun-flameblast-lvl-15-32.build",
    "fubgun-ice-shot-deadeye-leveling-lvl-31-41.build",
    "maxroll-aer0-ice-shot-amazon.build",
]
# The other builds of the library (2l2): a guide of each kind of source, a guide that starts late,
# the snapshots of a character, a build without an author, a name in another script.
LIBRARY = [
    "ferox-shield-wall-leveling.build",
    "utkarshbehre-spark-comet.build",
    "maxroll-cptn-garbage-flameblast-gemling-mapping.build",
    "poe2-tools-fubgun-ice-shot-campaign.build",
    "mobalytics-guythatdies-varashta-lvl-01-19.build",
    "poe-ninja-disciple-of-varashta-lvl-22-65.build",
    "ggg-titan-warrior-sample.build",
    "pob-twobyul-deadeye.build",
    "pobr-summoner-lv98.build",
]
# The cases of « N changes at N » (2g): a respec, 42 passives given back at 65; the swap of a
# leveling build to its end, 82 changes at 71.
CHANGE_CASES = {
    "respec": ("maxroll-aer0-ice-shot-amazon.build", 65),
    "swap": ("utkarshbehre-spark-comet.build", 71),
}
# The portraits of the builds shown: the ascendancy id and its class sprite.
PORTRAITS = {"Sorceress1": "sorceress", "Sorceress3": "sorceress", "Mercenary3": "mercenary", "Ranger1": "ranger",
             "Huntress1": "huntress", "Warrior1": "warrior", "Warrior2": "warrior"}
PORTRAIT_SIZE = 128
# The portrait of a tab (the owner, 2026-11-17): the largest square inside the disc, centred, made
# small enough for the 44 px of a tab, twice for the screens of a higher density.
SQUARE_SIZE = 88
# The kinds of passives, in the order the mock-up reads them.
KINDS = ["small", "notable", "keystone", "jewel", "attribute", "start"]


def fetch(cache, url, name):
    path = cache / name
    if not path.exists():
        with urllib.request.urlopen(url) as answer:
            path.write_bytes(answer.read())
    return path


def kind_of(node):
    if node.get("classStartIndex") is not None:
        return KINDS.index("start")
    for flag, kind in (("isKeystone", "keystone"), ("isJewelSocket", "jewel"), ("isNotable", "notable"),
                       ("isGenericAttribute", "attribute")):
        if node.get(flag):
            return KINDS.index(kind)
    return KINDS.index("small")


def interval(entry):
    """The levels of an entry, as the specs read them: [min, max], a single number up to 100."""
    value = entry.get("level_interval")
    if value is None:
        return [1, 100]
    if isinstance(value, int):
        return [max(value, 1), 100]
    return [max(value[0], 1), value[1]]


def tree_data(tree, shown):
    nodes, index, ascendancy = [], {}, []
    asc_id = shown.get("ascendancy")
    for key, node in tree["nodes"].items():
        if "x" not in node:
            continue
        if node.get("ascendancyId"):
            if node["ascendancyId"] == asc_id:
                ascendancy.append((key, node))
            continue
        index[key] = len(nodes)
        nodes.append([round(node["x"]), round(node["y"]), kind_of(node)])
    edges = [[index[str(e["from"])], index[str(e["to"])]] for e in tree["edges"]
             if str(e["from"]) in index and str(e["to"]) in index]
    # The ascendancy, drawn in its own box: positions relative to its start.
    start = next((n for _, n in ascendancy if n.get("isAscendancyStart")), None)
    asc_index = {key: i for i, (key, _) in enumerate(ascendancy)}
    asc_nodes = [[round(n["x"] - start["x"]), round(n["y"] - start["y"]),
                  KINDS.index("start") if n.get("isAscendancyStart") else kind_of(n)] for _, n in ascendancy]
    asc_edges = [[asc_index[str(e["from"])], asc_index[str(e["to"])]] for e in tree["edges"]
                 if str(e["from"]) in asc_index and str(e["to"]) in asc_index]
    by_id = {node["id"]: key for key, node in tree["nodes"].items() if "id" in node}
    taken, asc_taken, unknown = [], [], []
    for passive in shown.get("passives", []):
        key = by_id.get(passive["id"])
        low, high = interval(passive)
        if key in index:
            taken.append([index[key], low, high, passive.get("weapon_set", 0)])
        elif key in asc_index:
            asc_taken.append([asc_index[key], low, high])
        else:
            unknown.append(passive["id"])
    return {
        "kinds": KINDS,
        "nodes": nodes,
        "edges": edges,
        "ascendancy": {"nodes": asc_nodes, "edges": asc_edges},
        "taken": taken,
        "ascendancyTaken": asc_taken,
        "unknown": unknown,
    }


def gem(entry, names, gems):
    info = gems.get(entry["id"], {})
    base = names.get(entry["id"], {})
    kind = info.get("gem_type", "support" if "support_gem" in base.get("tags", []) else "active")
    return {
        "name": base.get("name", entry["id"].rsplit("/", 1)[-1]),
        "kind": kind,
        "colour": info.get("color", "w"),
        "levels": interval(entry),
        "known": entry["id"] in names,
    }


def level_range(build):
    """The levels a build covers, from the lowest start to the highest end of its entries; None for a
    snapshot, whose entries have no levels."""
    found = []

    def walk(value):
        if isinstance(value, dict):
            if value.get("level_interval") is not None:
                found.append(interval(value))
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    walk(build)
    return [min(low for low, _ in found), max(high for _, high in found)] if found else None


def library_row(build, ascendancies):
    asc = ascendancies.get(build.get("ascendancy"), {})
    return {"name": build["name"], "author": build.get("author") or "", "ascendancy": asc.get("name", ""),
            "class": asc.get("class", ""), "portrait": (build.get("ascendancy") or "").lower(),
            "levels": level_range(build)}


def first_line(text):
    lines = [line for line in (text or "").splitlines() if line.strip()]
    return lines[0] if lines else ""


def build_data(build, names, gems, ascendancies):
    asc = ascendancies.get(build.get("ascendancy"), {})
    return {
        "name": build["name"],
        "author": build.get("author", ""),
        "link": build.get("link", ""),
        "ascendancy": asc.get("name", build.get("ascendancy", "")),
        "class": asc.get("class", ""),
        "portrait": (build.get("ascendancy") or "").lower(),
        "skills": [dict(gem(skill, names, gems),
                        supports=[gem(s, names, gems) for s in skill.get("support_skills", [])])
                   for skill in build.get("skills", [])],
        "slots": [{"id": slot["inventory_id"], "x": slot.get("slot_x", 0), "y": slot.get("slot_y", 0),
                   "levels": interval(slot), "unique": slot.get("unique_name", ""),
                   "base": "" if slot.get("unique_name") else first_line(slot.get("additional_text"))}
                  for slot in build.get("inventory_slots", [])],
    }


def plain(text):
    """The words of a line of the author's markup (`<b>{…}`, `<rgb(…)>{…}`), without its tags."""
    return re.sub(r"<[^>]*>\{|\}", "", text or "").strip()


def state_at(build, level, ascendancy):
    """What a build holds at a level: its skills (id → support ids, and their notes), its gear
    ((slot, x, y) → item) and its passives ((id, weapon set) → whether it is of the ascendancy)."""
    applies = lambda entry: isinstance(entry, dict) and interval(entry)[0] <= level <= interval(entry)[1]
    note = lambda entry: bool((entry.get("additional_text") or "").strip())
    skills, notes = {}, {}
    for skill in filter(applies, build.get("skills", [])):
        supports = skills.setdefault(skill["id"], {})
        notes[skill["id"]] = notes.get(skill["id"], False) or note(skill)
        for support in filter(applies, skill.get("support_skills", [])):
            supports[support["id"]] = supports.get(support["id"], False) or note(support)
    # A slot by its id and its place: the charms share one id (Charm1), told apart by slot_x.
    gear = {(slot["inventory_id"], slot.get("slot_x", 0), slot.get("slot_y", 0)):
            (plain(slot.get("unique_name") or first_line(slot.get("additional_text"))), bool(slot.get("unique_name")))
            for slot in filter(applies, build.get("inventory_slots", []))}
    passives = {(p["id"], p.get("weapon_set", 0)): (p["id"] in ascendancy, note(p))
                for p in filter(applies, build.get("passives", []))}
    return skills, notes, gear, passives


def changes_at(build, level, tree, names, gems):
    """What changes at a level, by category (2g, the owner, 2026-11-18): what the build holds at it
    and didn't hold at the level before, and the reverse. An entry that stops and starts again the
    same at the next level changes nothing (70 of the 81 supports « added » at 71 by a build of the
    corpus). A gem or a hint counts as one change, each group of passives as one; a new skill
    brings its supports with it; a note of the author marks its entry rather than counting."""
    ascendancy = {node["id"] for node in tree["nodes"].values() if node.get("ascendancyId") and "id" in node}
    skills, notes, gear, passives = state_at(build, level, ascendancy)
    old_skills, _, old_gear, old_passives = state_at(build, level - 1, ascendancy) if level > 1 else ({}, {}, {}, {})
    named = lambda gem_id, note=False: dict(name=gem({"id": gem_id}, names, gems)["name"], colour=gem({"id": gem_id}, names, gems)["colour"], note=note)
    item = lambda slot, value: dict(slot=slot[0], item=value[0], unique=value[1])
    # The passives taken at the level: (weapon set, of the ascendancy, with a note) of each.
    taken = [(key[1], asc, has_note) for key, (asc, has_note) in passives.items() if key not in old_passives]
    groups = {
        "taken": sum(1 for weapon_set, asc, _ in taken if not asc and not weapon_set),
        "set1": sum(1 for weapon_set, asc, _ in taken if not asc and weapon_set == 1),
        "set2": sum(1 for weapon_set, asc, _ in taken if not asc and weapon_set == 2),
        "ascendancy": sum(1 for _, asc, _ in taken if asc),
        "givenBack": sum(1 for key in old_passives if key not in passives),
        "notes": sum(1 for _, _, has_note in taken if has_note),
    }
    record = {
        "skills": {
            "added": [dict(named(i, notes[i]), supports=[named(s, n) for s, n in skills[i].items()]) for i in skills if i not in old_skills],
            "removed": [named(i) for i in old_skills if i not in skills],
        },
        "supports": {
            "added": [dict(named(s, n), skill=named(i)["name"]) for i in skills if i in old_skills for s, n in skills[i].items() if s not in old_skills[i]],
            "removed": [dict(named(s), skill=named(i)["name"]) for i in skills if i in old_skills for s in old_skills[i] if s not in skills[i]],
        },
        "passives": groups,
        "gear": {
            "added": [item(slot, value) for slot, value in gear.items() if slot not in old_gear],
            "replaced": [dict(item(slot, value), before=old_gear[slot][0]) for slot, value in gear.items() if slot in old_gear and old_gear[slot] != value],
            "removed": [item(slot, value) for slot, value in old_gear.items() if slot not in gear],
        },
    }
    count = (sum(len(v) for part in ("skills", "supports", "gear") for v in record[part].values())
             + sum(1 for key, value in groups.items() if key != "notes" and value > 0))
    return dict(record, count=count) if count else None


def changes_of(build, levels, tree, names, gems):
    found = {level: changes_at(build, level, tree, names, gems) for level in levels}
    return {"name": build["name"], "levels": {level: value for level, value in found.items() if value}}


def portrait(cache, ascendancy, sprite):
    """Cuts the round portrait of an ascendancy from the sprite of its class, and the square inside
    it, made small."""
    frames = json.loads(fetch(cache, f"{TREE_URL}/assets/background-{sprite}.json",
                              f"background-{sprite}.json").read_text())["frames"]
    image = fetch(cache, f"{TREE_URL}/assets/background-{sprite}.webp", f"background-{sprite}.webp")
    number = ascendancy[len(sprite):]
    frame = next(f["frame"] for name, f in frames.items() if name.endswith(f"Class{number}"))
    target = OUT / "img" / "portraits" / f"{ascendancy.lower()}.webp"
    subprocess.run(["magick", str(image), "-crop", f"{frame['w']}x{frame['h']}+{frame['x']}+{frame['y']}",
                    "+repage", "-resize", f"{PORTRAIT_SIZE}x{PORTRAIT_SIZE}", "-quality", "82", str(target)],
                   check=True)
    side = int(frame["w"] / 2 ** 0.5)
    inset = (frame["w"] - side) // 2
    square = OUT / "img" / "portraits-square" / f"{ascendancy.lower()}.webp"
    square.parent.mkdir(exist_ok=True)
    subprocess.run(["magick", str(image), "-crop", f"{side}x{side}+{frame['x'] + inset}+{frame['y'] + inset}",
                    "+repage", "-resize", f"{SQUARE_SIZE}x{SQUARE_SIZE}", "-quality", "82", str(square)],
                   check=True)


def write_js(name, constant, value):
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    (OUT / "js" / name).write_text(
        f"// Generated by tools/make-data.py from the real sources: never edit by hand.\n"
        f"const {constant} = {text};\n", encoding="utf-8")


def main():
    cache = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.mkdtemp())
    cache.mkdir(parents=True, exist_ok=True)
    tree = json.loads(fetch(cache, f"{TREE_URL}/data.json", "data.json").read_text(encoding="utf-8"))
    names = json.loads(fetch(cache, f"{REPOE_URL}/base_items.min.json", "base_items.min.json").read_text())
    gems = json.loads(fetch(cache, f"{REPOE_URL}/skill_gems.min.json", "skill_gems.min.json").read_text())
    ascendancies = {a["id"]: {"name": a["name"], "class": c["name"]}
                    for c in tree["classes"] for a in c["ascendancies"]}
    read = lambda name: json.loads((CORPUS / name).read_text(encoding="utf-8-sig"))
    builds = [read(name) for name in [SHOWN, *OPEN]]
    write_js("data-tree.js", "TREE", tree_data(tree, builds[0]))
    write_js("data-builds.js", "BUILDS", {
        "treeVersion": TREE_TAG,
        "shown": build_data(builds[0], names, gems, ascendancies),
        "open": [{"name": b["name"], "ascendancy": ascendancies.get(b.get("ascendancy"), {}).get("name", ""),
                  "portrait": (b.get("ascendancy") or "").lower()} for b in builds],
        "library": [library_row(b, ascendancies) for b in [*builds, *map(read, LIBRARY)]],
        # What changes at a level, by category (2g): the build shown at every level, and two cases
        # of the corpus a band must hold, a respec and the swap of a leveling build to its end.
        "changes": {
            "shown": changes_of(builds[0], range(1, 101), tree, names, gems),
            **{key: changes_of(read(name), [level], tree, names, gems) for key, (name, level) in CHANGE_CASES.items()},
        },
    })
    for ascendancy, sprite in PORTRAITS.items():
        portrait(cache, ascendancy, sprite)


main()
