"""Writes the sample data of the mock-up from the real sources, so that no value is typed by hand.

    python3 docs/mockups/pathweaver/tools/make-data.py [cache-folder]

From the repository root. Reads:

- the passive tree and the class portraits exported by Grinding Gear Games
  (grindinggear/poe2-skilltree-export, tag TREE_TAG);
- the names, kinds and colours of the gems (RePoE, base_items and skill_gems);
- the builds of the corpus, in inputs/builds/ (local only, never committed).

Writes js/data-tree.js, js/data-builds.js, img/portraits/*.webp (the discs),
img/portraits-square/*.webp (the square inside each disc, for the tabs), img/portraits-large/*.webp (the
portrait under the ascendancy at the centre of the tree, 2i2) and img/tree/*.webp (the sheets of the icons
and frames of the passives, kept whole, 2i) next to this folder. The
downloads are kept in the cache folder (a temporary one by default) so that a second run is fast.
The mock-up only: the website converts the game data with its own script, at step 4.
"""

import json
import math
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
# The cases of the level band (2g2): a snapshot of a character, the same at every level; a guide that
# covers part of the levels, its track from its lowest to its highest level (65–100: the only one of the
# corpus; the files of Mobalytics named « lvl 15-32 » say 1–100 in their entries).
BAND_CASES = {
    "snapshot": "pobr-summoner-lv98.build",
    "partial": "maxroll-cptn-garbage-flameblast-gemling-mapping.build",
}
# The portraits of the builds shown: the ascendancy id and its class sprite.
PORTRAITS = {"Sorceress1": "sorceress", "Sorceress3": "sorceress", "Mercenary3": "mercenary", "Ranger1": "ranger",
             "Huntress1": "huntress", "Warrior1": "warrior", "Warrior2": "warrior"}
PORTRAIT_SIZE = 128
# The portrait of a tab (the owner, 2026-11-17): the largest square inside the disc, centred, made
# small enough for the 44 px of a tab, twice for the screens of a higher density.
SQUARE_SIZE = 88
# The portrait under the ascendancy, at the centre of the tree (2i2, the owner, 2026-11-19): large and
# faded, the build shown only.
LARGE_PORTRAIT_SIZE = 300
# The ascendancy at the centre of the tree (2i2, the owner, 2026-11-19): in the empty disc inside the ring
# of the class starts, every ascendancy shrunk alike so that the largest (Monk3, 1,490 units from the
# centre of its box) fits with room for its passives.
ASCENDANCY_SCALE = 0.85
# The opacity of the portrait compared on three ascendancies (2i2, the owner, 2026-11-20): the build shown
# (Sorceress1, the brightest portrait), then a bright and warm one and the darkest with passives in the
# corpus, each with the ascendancy passives of a build of the corpus.
COMPARED = {"Mercenary3": "mobalytics-fubgun-flameblast-endgame.build", "Warrior1": "ggg-titan-warrior-sample.build"}
ASCENDANCY_MARGIN = 100
# The kinds of passives, in the order the mock-up reads them.
KINDS = ["small", "notable", "keystone", "jewel", "attribute", "start"]
# The sheets of the passives (2i, docs/game-data.md): the icons in colour and greyed, at the same
# places in both sheets, and the frames; drawn at half the scale of the game (their meta.scale).
ICON_SHEETS = ["skills", "skills-disabled"]
FRAME_SHEET = "frame"
# The prefix of the icon of a kind of passive in the sheets (an attribute is a small passive).
ICON_PREFIX = {"small": "normal", "attribute": "normal", "notable": "notable", "keystone": "keystone",
               "jewel": "normal"}
# The frames drawn, by kind of passive: not taken, then taken (the other states are 2i2's).
FRAMES = {
    "small": ["PSSkillFrame", "PSSkillFrameActive"],
    "notable": ["NotableFrameUnallocated", "NotableFrameAllocated"],
    "keystone": ["KeystoneFrameUnallocated", "KeystoneFrameAllocated"],
    "jewel": ["JewelFrameUnallocated", "JewelFrameAllocated"],
    "ascendancySmall": ["AscendancyFrameNormalUnallocated", "AscendancyFrameNormalAllocated"],
    "ascendancyNotable": ["AscendancyFrameNotableUnallocated", "AscendancyFrameNotableAllocated"],
    "ascendancyStart": ["AscendancyStartNode", "AscendancyStartNode"],
}


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


def icon_of(node, icons):
    """The place of the icon of a passive in the sheets, or -1 when it has none (the class starts, the
    jewel sockets and some ascendancy passives)."""
    prefix = ICON_PREFIX.get(KINDS[kind_of(node)])
    if not prefix or node.get("isJewelSocket"):
        return -1
    return icons.get(f"{prefix}Active:{node.get('icon', '')}", -1)


def sheets(cache):
    """Copies the sheets of the passives whole, and returns the place of each icon and of each frame
    drawn, with the scale of the sheets."""
    target = OUT / "img" / "tree"
    target.mkdir(exist_ok=True)
    index = {}
    for name in [*ICON_SHEETS, FRAME_SHEET]:
        index[name] = json.loads(fetch(cache, f"{TREE_URL}/assets/{name}.json", f"{name}.json").read_text())
        image = fetch(cache, f"{TREE_URL}/assets/{name}.webp", f"{name}.webp")
        (target / f"{name}.webp").write_bytes(image.read_bytes())
    scales = {float(sheet["meta"]["scale"]) for sheet in index.values()}
    if len(scales) != 1:
        raise SystemExit(f"the sheets of the passives have several scales: {scales}")
    places = lambda sheet: {key: [f["frame"][axis] for axis in "xywh"] for key, f in sheet["frames"].items()}
    icons, disabled = places(index["skills"]), places(index["skills-disabled"])
    for key, place in icons.items():
        if disabled.get(key.replace("Active:", "Inactive:")) != place:
            raise SystemExit(f"the greyed icon of {key} isn't at the same place as in colour")
    frames = places(index[FRAME_SHEET])
    return {
        "scale": scales.pop(),
        "icons": list(icons.items()),
        "frames": {kind: [frames[f"frame:{name}"] for name in names] for kind, names in FRAMES.items()},
    }


def ascendancy_place(tree):
    """For every ascendancy, the function that moves one of its passives to the centre of the tree:
    the centre of its box on the centre of the tree, shrunk by ASCENDANCY_SCALE. Checks that the largest
    fits inside the ring of the class starts, with ASCENDANCY_MARGIN units to spare."""
    members = {}
    for node in tree["nodes"].values():
        if node.get("ascendancyId") and "x" in node:
            members.setdefault(node["ascendancyId"], []).append(node)
    ring = min(math.hypot(n["x"], n["y"]) for n in tree["nodes"].values()
               if n.get("classStartIndex") is not None and "x" in n)
    places = {}
    for asc_id, nodes in members.items():
        cx = (min(n["x"] for n in nodes) + max(n["x"] for n in nodes)) / 2
        cy = (min(n["y"] for n in nodes) + max(n["y"] for n in nodes)) / 2
        reach = max(math.hypot(n["x"] - cx, n["y"] - cy) for n in nodes) * ASCENDANCY_SCALE
        if reach + ASCENDANCY_MARGIN > ring:
            raise SystemExit(f"{asc_id} doesn't fit inside the ring of the class starts ({reach:.0f} of {ring:.0f} units)")
        places[asc_id] = lambda n, cx=cx, cy=cy: ((n["x"] - cx) * ASCENDANCY_SCALE, (n["y"] - cy) * ASCENDANCY_SCALE)
    return places


def ascendancy_graph(tree, asc_id, build, icons):
    """The passives of an ascendancy at the centre of the tree (2i2), its links, and those the build
    takes, with their levels."""
    place = ascendancy_place(tree)[asc_id]
    members = [(key, n) for key, n in tree["nodes"].items() if n.get("ascendancyId") == asc_id and "x" in n]
    index = {key: i for i, (key, _) in enumerate(members)}
    nodes = [[round(x), round(y), KINDS.index("start") if n.get("isAscendancyStart") else kind_of(n), icon_of(n, icons)]
             for (_, n), (x, y) in zip(members, (place(n) for _, n in members))]
    edges = [[index[str(e["from"])], index[str(e["to"])]] for e in tree["edges"]
             if str(e["from"]) in index and str(e["to"]) in index]
    by_id = {node["id"]: key for key, node in tree["nodes"].items() if "id" in node}
    # A passive may be written as its id alone (53 of the corpus): from level 1 to 100.
    passives = [p if isinstance(p, dict) else {"id": p} for p in build.get("passives", [])]
    taken = [[index[by_id[p["id"]]], *interval(p)] for p in passives if by_id.get(p["id"]) in index]
    return {"nodes": nodes, "edges": edges, "taken": taken}


def tree_data(tree, shown, sheet, compared):
    icons = {key: i for i, (key, _) in enumerate(sheet["icons"])}
    nodes, index = [], {}
    for key, node in tree["nodes"].items():
        # The masteries are only the art at the centre of a group, never taken nor linked (Path of
        # Building reads them as « isOnlyImage »): their art waits in docs/backlog.md.
        if "x" not in node or node.get("isMastery") or node.get("ascendancyId"):
            continue
        index[key] = len(nodes)
        nodes.append([round(node["x"]), round(node["y"]), kind_of(node), icon_of(node, icons)])
    edges = [[index[str(e["from"])], index[str(e["to"])]] for e in tree["edges"]
             if str(e["from"]) in index and str(e["to"]) in index]
    ascendancy = ascendancy_graph(tree, shown.get("ascendancy"), shown, icons)
    by_id = {node["id"]: key for key, node in tree["nodes"].items() if "id" in node}
    asc_ids = {node["id"] for node in tree["nodes"].values() if node.get("ascendancyId") and "id" in node}
    taken, unknown = [], []
    for passive in shown.get("passives", []):
        key = by_id.get(passive["id"])
        low, high = interval(passive)
        if key in index:
            taken.append([index[key], low, high, passive.get("weapon_set", 0)])
        elif passive["id"] not in asc_ids:
            unknown.append(passive["id"])
    return {
        "kinds": KINDS,
        "sheets": {"scale": sheet["scale"], "icons": [place for _, place in sheet["icons"]],
                   "frames": sheet["frames"]},
        "nodes": nodes,
        "edges": edges,
        "ascendancy": {"nodes": ascendancy["nodes"], "edges": ascendancy["edges"]},
        "taken": taken,
        "ascendancyTaken": ascendancy["taken"],
        # The ascendancies the opacity of the portrait is compared on (2i2).
        "compared": {asc_id: ascendancy_graph(tree, asc_id, build, icons) for asc_id, build in compared.items()},
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
    """What a build holds at a level, as its file says: its skills (id → note, and support id →
    note), its gear (slot id → the items of its hints, each with its text; a list, since the three
    charms share Charm1, whatever their place) and its passives ((id, weapon set) → of the
    ascendancy, with a note)."""
    applies = lambda entry: isinstance(entry, dict) and interval(entry)[0] <= level <= interval(entry)[1]
    text = lambda entry: (entry.get("additional_text") or "").strip()
    skills, notes = {}, {}
    for skill in filter(applies, build.get("skills", [])):
        supports = skills.setdefault(skill["id"], {})
        notes[skill["id"]] = notes.get(skill["id"], "") + text(skill)
        for support in filter(applies, skill.get("support_skills", [])):
            supports[support["id"]] = supports.get(support["id"], "") + text(support)
    gear = {}
    for slot in filter(applies, build.get("inventory_slots", [])):
        name = plain(slot.get("unique_name") or first_line(slot.get("additional_text")))
        gear.setdefault(slot["inventory_id"], []).append((name, bool(slot.get("unique_name")), text(slot)))
    passives = {(p["id"], p.get("weapon_set", 0)): (p["id"] in ascendancy, bool(text(p)))
                for p in filter(applies, build.get("passives", []))}
    return skills, notes, gear, passives


def gear_changes(gear, old_gear):
    """The hints added, replaced (another item on a slot that holds one), removed, and set again
    with another text, slot by slot."""
    added, replaced, removed, retold = [], [], [], []
    for slot in sorted(set(gear) | set(old_gear)):
        new = [entry[:2] for entry in gear.get(slot, [])]
        old = [entry[:2] for entry in old_gear.get(slot, [])]
        coming = [entry for entry in new if entry not in old]
        going = [entry for entry in old if entry not in new]
        # A hint replaces another only when one leaves and one comes on its slot: where several
        # share a slot (the flasks, the charms), which replaces which can't be read from the file.
        pairs = 1 if len(coming) == len(going) == 1 else 0
        item = lambda entry: dict(slot=slot, item=entry[0], unique=entry[1])
        replaced += [dict(item(c), before=g[0]) for c, g in zip(coming[:pairs], going[:pairs])]
        added += [item(c) for c in coming[pairs:]]
        removed += [item(g) for g in going[pairs:]]
        old_texts = {entry[:2]: entry[2] for entry in old_gear.get(slot, [])}
        retold += [dict(name=entry[0], kind="gear", on=slot) for entry in gear.get(slot, [])
                   if entry[:2] in old_texts and old_texts[entry[:2]] != entry[2]]
    return {"added": added, "replaced": replaced, "removed": removed}, retold


def changes_at(build, level, tree, names, gems):
    """What changes at a level, by category (2g, the owner, 2026-11-18): what the file says the
    build holds at it and didn't hold at the level before, and the reverse. An entry that stops and
    starts again the same at the next level (the same id, the same place, the same note) changes
    nothing: 70 of the 81 supports « added » at 71 by a build of the corpus; one that comes back with
    another note of its author is a change of its note. A gem, a hint or a note counts as one change,
    each group of passives as one; a new skill brings its supports with it."""
    ascendancy = {node["id"] for node in tree["nodes"].values() if node.get("ascendancyId") and "id" in node}
    skills, notes, gear, passives = state_at(build, level, ascendancy)
    old_skills, old_notes, old_gear, old_passives = state_at(build, level - 1, ascendancy) if level > 1 else ({}, {}, {}, {})
    named = lambda gem_id, note="": dict(name=gem({"id": gem_id}, names, gems)["name"], colour=gem({"id": gem_id}, names, gems)["colour"], note=bool(note))
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
    kept = [i for i in skills if i in old_skills]
    gear_record, gear_notes = gear_changes(gear, old_gear)
    record = {
        "skills": {
            "added": [dict(named(i, notes[i]), supports=[named(s, n) for s, n in skills[i].items()]) for i in skills if i not in old_skills],
            "removed": [named(i) for i in old_skills if i not in skills],
        },
        "supports": {
            "added": [dict(named(s, n), skill=named(i)["name"]) for i in kept for s, n in skills[i].items() if s not in old_skills[i]],
            "removed": [dict(named(s), skill=named(i)["name"]) for i in kept for s in old_skills[i] if s not in skills[i]],
        },
        "passives": groups,
        "gear": gear_record,
        "notes": [dict(name=named(i)["name"], kind="skill") for i in kept if notes[i] != old_notes[i]]
                 + [dict(name=named(s)["name"], kind="support", on=named(i)["name"]) for i in kept for s in skills[i]
                    if s in old_skills[i] and skills[i][s] != old_skills[i][s]]
                 + gear_notes,
    }
    count = (sum(len(v) for part in ("skills", "supports", "gear") for v in record[part].values())
             + len(record["notes"]) + sum(1 for key, value in groups.items() if key != "notes" and value > 0))
    return dict(record, count=count) if count else None


def changes_of(build, levels, tree, names, gems):
    found = {level: changes_at(build, level, tree, names, gems) for level in levels}
    return {"name": build["name"], "range": level_range(build),
            "levels": {level: value for level, value in found.items() if value}}


def band_of(build, tree, names, gems):
    """What changes at every level of a build, from the one after its lowest to its highest (2g2):
    at its lowest level, nothing came before it to compare with; a snapshot has none."""
    low, high = level_range(build) or (1, 1)
    return changes_of(build, range(low + 1, high + 1), tree, names, gems)


def portrait(cache, ascendancy, sprite, large=False):
    """Cuts the round portrait of an ascendancy from the sprite of its class, and the square inside
    it, made small; the large one too for the build shown, under its ascendancy on the tree."""
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
    if large:
        target = OUT / "img" / "portraits-large" / f"{ascendancy.lower()}.webp"
        target.parent.mkdir(exist_ok=True)
        subprocess.run(["magick", str(image), "-crop", f"{frame['w']}x{frame['h']}+{frame['x']}+{frame['y']}",
                        "+repage", "-resize", f"{LARGE_PORTRAIT_SIZE}x{LARGE_PORTRAIT_SIZE}", "-quality", "82",
                        str(target)], check=True)


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
    compared = {asc_id: read(name) for asc_id, name in COMPARED.items()}
    write_js("data-tree.js", "TREE", tree_data(tree, builds[0], sheets(cache), compared))
    write_js("data-builds.js", "BUILDS", {
        "treeVersion": TREE_TAG,
        "shown": build_data(builds[0], names, gems, ascendancies),
        "open": [{"name": b["name"], "ascendancy": ascendancies.get(b.get("ascendancy"), {}).get("name", ""),
                  "portrait": (b.get("ascendancy") or "").lower()} for b in builds],
        "library": [library_row(b, ascendancies) for b in [*builds, *map(read, LIBRARY)]],
        # What changes at a level, by category (2g): the build shown and the cases of the band (2g2) at
        # every level, and two cases of the corpus a window must hold, a respec and the swap of a
        # leveling build to its end.
        "changes": {
            "shown": band_of(builds[0], tree, names, gems),
            **{key: band_of(read(name), tree, names, gems) for key, name in BAND_CASES.items()},
            **{key: changes_of(read(name), [level], tree, names, gems) for key, (name, level) in CHANGE_CASES.items()},
        },
    })
    for ascendancy, sprite in PORTRAITS.items():
        portrait(cache, ascendancy, sprite, large=ascendancy == builds[0].get("ascendancy") or ascendancy in COMPARED)


main()
