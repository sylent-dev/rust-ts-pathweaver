"""Writes the sample data of the mock-up from the real sources, so that no value is typed by hand.

    python3 docs/mockups/pathweaver/tools/make-data.py [cache-folder]

From the repository root. Reads:

- the passive tree and the class portraits exported by Grinding Gear Games
  (grindinggear/poe2-skilltree-export, tag TREE_TAG);
- the names, kinds, colours, tags and descriptions of the gems (RePoE, base_items, skill_gems,
  skills and gem_tags);
- the images of the items the hints of the inventory name (RePoE, base_items and uniques, which give
  the path of their art in the files of the game, `Art/2DItems/…`, and serve it as WebP beside the data),
  and the words of their kinds (item_classes: « Staff »; a unique gives its kind in its own entry);
- the stats of the uniques (Path of Building for Path of Exile 2, src/Data/Uniques/*.lua at POB_COMMIT,
  MIT, docs/game-data.md): the files of the game don't say which stats a unique has;
- the builds of the corpus, in inputs/builds/ (local only, never committed).

Writes js/data-tree.js, js/data-builds.js, img/portraits/*.webp (the discs),
img/portraits-square/*.webp (the square inside each disc, for the tabs), img/portraits-large/*.webp (the
portrait under the ascendancy at the centre of the tree, 2i2) and img/tree/*.webp (the sheets of the icons
and frames of the passives, kept whole, 2i), img/items/*.webp (the images of the items, 2j3) and img/skills/*.webp
(the icons of the gems, 2k) next to this folder. The downloads are kept in the cache folder (a temporary one by default) so that a second run is fast.
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
POB_COMMIT = "601768bd105869618c3d6581b883e5d7aeec91b2"
POB_URL = f"https://raw.githubusercontent.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/{POB_COMMIT}/src/Data/Uniques"
POB_FILES = ["amulet", "axe", "belt", "body", "boots", "bow", "claw", "crossbow", "dagger", "fishing", "flail",
             "flask", "focus", "gloves", "helmet", "incursionlimb", "jewel", "mace", "quiver", "ring", "sceptre",
             "shield", "soulcore", "spear", "staff", "sword", "talisman", "tincture", "traptool", "wand"]
# The lines of a unique in Path of Building that its tooltip in the game doesn't show.
POB_META = ("League:", "Source:", "Variant:", "Version:", "Implicits:", "Requires", "LevelReq:", "Sockets:",
            "Has Alt Variant", "Selected Variant", "Selected Alt Variant")
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
# The items of the case of the other slots of the inventory (2j3), beyond those of the build shown:
# charms in Trinket1, as Maxroll writes them (7 entries of the corpus), and in an id the game doesn't know.
SAMPLE_ITEMS = ["Thawing Charm", "Golden Charm"]
# The case of the overflow of the right column (2j4): the most skills of the corpus at a level, 14 at
# 53, where seven of them come at once, with « New at N » full.
CROWDED = "utkarshbehre-spark-comet.build"
# The cases of the gems shared between two attributes (2kb): an Amazon of dexterity with Freezing Mark,
# Ghost Dance and Herald of Ice (dexterity and intelligence); a Mercenary of strength and intelligence
# with its grenades (strength and dexterity) and Pounce (strength and intelligence).
ATTRIBUTE_CASES = {
    "dexterity": "maxroll-aer0-ice-shot-amazon.build",
    "grenades": "mobalytics-fubgun-flameblast-lvl-15-32.build",
}
# The cases of the Inventory tab (2k2): the most hints of the corpus, 30 on 17 cells, 13 of them replaced
# at 65 by the gear of the end; a campaign of free texts, up to three hints on a cell one after the other.
INVENTORY_CASES = {
    "replaced": "maxroll-aer0-ice-shot-amazon.build",
    "campaign": "poe2-tools-fubgun-ice-shot-campaign.build",
}
# The cases of the About tab (2k3): the build shown, a long description in the markup of the game (1,160
# characters, the longest of the corpus) and the link of its guide; a leveling guide without description nor
# link, 18 gems the game data don't know (the only warnings of the corpus outside its test fixtures); an
# Amazon whose links are written in its description, its `link` empty.
ABOUT_CASES = {
    "shown": SHOWN,
    "warnings": "ferox-shield-wall-leveling.build",
    "amazon": "maxroll-aer0-ice-shot-amazon.build",
    # The snapshot of the band (2g2), its page at 1,920 px (2k5): its header.
    "snapshot": "pobr-summoner-lv98.build",
}
# The inventory ids of the game (docs/build-files-in-the-wild.md).
INVENTORY_IDS = {"Weapon1", "Weapon2", "Offhand1", "Offhand2", "Helm1", "BodyArmour1", "Gloves1", "Boots1", "Belt1",
                 "Amulet1", "Ring1", "Ring2", "Flask1", "Flask2", "Charm1", "Trinket1"}
# The cases of « N changes at N » (2g): a respec, 42 passives given back at 65; the swap of a
# leveling build to its end, 82 changes at 71.
CHANGE_CASES = {
    "respec": ("maxroll-aer0-ice-shot-amazon.build", 65),
    "swap": ("utkarshbehre-spark-comet.build", 71),
    "crowded": (CROWDED, 53),
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
# The portrait of the colophon of the About tab (2k3, the owner, 2026-11-21): the square inside the disc, the
# width of its column of 260 px, twice for the screens of a higher density.
ABOUT_PORTRAIT_SIZE = 520
# The ascendancy at the centre of the tree (2i2, the owner, 2026-11-19): in the empty disc inside the ring
# of the class starts, every ascendancy shrunk alike so that the largest (Monk3, 1,490 units from the
# centre of its box) fits with room for its passives.
ASCENDANCY_SCALE = 0.85
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


class Texts:
    """The texts of the hover (2i3), each written once: the names and stats of the passives repeat (4,782
    passives, 1,930 names), so the data hold the index of each in this list."""

    def __init__(self):
        self.list, self.index = [], {}

    def __call__(self, text):
        if text not in self.index:
            self.index[text] = len(self.list)
            self.list.append(text)
        return self.index[text]


def info_of(node, texts):
    """What the hover shows of a passive from the game data (2i3): its name and its stats."""
    return [texts(node.get("name", "")), [texts(stat) for stat in node.get("stats", [])]]


def hint_of(entry, texts):
    """The hint of the author on an entry, its markup kept (the hover reads it), or -1."""
    text = entry.get("additional_text")
    return texts(text) if isinstance(text, str) and text.strip() else -1


def ascendancy_graph(tree, asc_id, build, icons, texts):
    """The passives of an ascendancy at the centre of the tree (2i2), its links, and those the build
    takes, with their levels and the hints of the author (no weapon set: 0)."""
    place = ascendancy_place(tree)[asc_id]
    members = [(key, n) for key, n in tree["nodes"].items() if n.get("ascendancyId") == asc_id and "x" in n]
    index = {key: i for i, (key, _) in enumerate(members)}
    nodes = [[round(x), round(y), KINDS.index("start") if n.get("isAscendancyStart") else kind_of(n), icon_of(n, icons)]
             for (_, n), (x, y) in zip(members, (place(n) for _, n in members))]
    info = [info_of(n, texts) for _, n in members]
    edges = [[index[str(e["from"])], index[str(e["to"])]] for e in tree["edges"]
             if str(e["from"]) in index and str(e["to"]) in index]
    by_id = {node["id"]: key for key, node in tree["nodes"].items() if "id" in node}
    # A passive may be written as its id alone (53 of the corpus): from level 1 to 100.
    passives = [p if isinstance(p, dict) else {"id": p} for p in build.get("passives", [])]
    taken = [[index[by_id[p["id"]]], *interval(p), 0, hint_of(p, texts)] for p in passives if by_id.get(p["id"]) in index]
    return {"nodes": nodes, "edges": edges, "info": info, "taken": taken}


def tree_data(tree, shown, sheet):
    icons = {key: i for i, (key, _) in enumerate(sheet["icons"])}
    texts = Texts()
    nodes, info, index = [], [], {}
    for key, node in tree["nodes"].items():
        # The masteries are only the art at the centre of a group, never taken nor linked (Path of
        # Building reads them as « isOnlyImage »): their art waits in docs/backlog.md.
        if "x" not in node or node.get("isMastery") or node.get("ascendancyId"):
            continue
        index[key] = len(nodes)
        nodes.append([round(node["x"]), round(node["y"]), kind_of(node), icon_of(node, icons)])
        info.append(info_of(node, texts))
    edges = [[index[str(e["from"])], index[str(e["to"])]] for e in tree["edges"]
             if str(e["from"]) in index and str(e["to"]) in index]
    ascendancy = ascendancy_graph(tree, shown.get("ascendancy"), shown, icons, texts)
    by_id = {node["id"]: key for key, node in tree["nodes"].items() if "id" in node}
    asc_ids = {node["id"] for node in tree["nodes"].values() if node.get("ascendancyId") and "id" in node}
    taken, unknown = [], []
    for passive in shown.get("passives", []):
        key = by_id.get(passive["id"])
        low, high = interval(passive)
        if key in index:
            taken.append([index[key], low, high, passive.get("weapon_set", 0), hint_of(passive, texts)])
        elif passive["id"] not in asc_ids:
            unknown.append(passive["id"])
    return {
        "kinds": KINDS,
        "sheets": {"scale": sheet["scale"], "icons": [place for _, place in sheet["icons"]],
                   "frames": sheet["frames"]},
        "nodes": nodes,
        "edges": edges,
        "ascendancy": {"nodes": ascendancy["nodes"], "edges": ascendancy["edges"], "info": ascendancy["info"]},
        # The hover (2i3): the name and stats of each passive, as indices of `texts`; each entry taken
        # ends with the hint of its author, an index of `texts` or -1.
        "info": info,
        "texts": texts.list,
        "taken": taken,
        "ascendancyTaken": ascendancy["taken"],
        "unknown": unknown,
    }


def game_words(text):
    """The words of a text of the game data without its links: `[Ref|Words]` gives Words, `[Words]` Words."""
    return re.sub(r"\[([^\]|]*)\|([^\]]*)\]|\[([^\]]*)\]", lambda m: m.group(2) if m.group(1) is not None else m.group(3), text or "")


def described(entry, gems, skills, tags):
    """What the hover of a gem shows from the game data (2j2): its tags as the game names them (those
    it doesn't show left out), and its description: the text of a support, or that of the skill a
    skill gem grants."""
    info = gems.get(entry["id"], {})
    shown = [game_words(tags[tag]) for tag in info.get("tags", []) if tags.get(tag)]
    if info.get("gem_type") == "support":
        text = info.get("support_text", "")
    else:
        granted = (info.get("grants_skills") or [""])[0]
        text = skills.get(granted, {}).get("active_skill", {}).get("description", "")
    return {"tags": shown, "text": game_words(text)}


# The letters of the attributes, in the order of the game: strength, dexterity, intelligence.
ATTRIBUTES = {"strength": "r", "dexterity": "g", "intelligence": "b"}


def gem_colour(info):
    """The colour of a gem: the letter of its attribute (RePoE), or two letters for a gem shared half
    and half between two attributes (2kb: 114 gems, « w » in RePoE as a gem without an attribute;
    23 builds of the corpus hold one). A gem that leans to one attribute (25/75) keeps its letter."""
    weights = info.get("requirement_weights", {})
    shared = [letter for attribute, letter in ATTRIBUTES.items() if weights.get(attribute, 0) > 0]
    if info.get("color") == "w" and len(shared) == 2 and len({weights[a] for a in ATTRIBUTES if weights.get(a, 0) > 0}) == 1:
        return "".join(shared)
    return info.get("color", "w")


def icon_file(info):
    """The file of the icon of a gem in img/skills/, named after its path under SkillIcons/ (« 4k-
    sorceressspark.webp », « support-4k-acrimonysupport.webp »: a skill and a support may share the name
    of their file), or "" when the game data give none."""
    dds = info.get("icon_dds_file") or ""
    return re.sub(r"[^a-z0-9]+", "-", dds.split("SkillIcons/", 1)[-1].removesuffix(".dds").lower()) + ".webp" if dds else ""


def skill_icons(cache, gems, skill_lists):
    """The icons of the gems of the builds shown (2k, the owner, 2026-11-20: on the card of a gem):
    RePoE serves the art of the game beside its data, the icon of a gem at the path `icon_dds_file` of
    skill_gems.json gives (Art/2DArt/SkillIcons/4k/… for a skill, a square, and SkillIcons/Support/4k/…
    for a support, a disc; 88 × 88 pixels, 2 to 3 KB). 637 supports of 642 have one. An icon RePoE
    doesn't serve leaves its gem without one: its card shows no icon."""
    paths = {icon_file(info): info["icon_dds_file"].removesuffix(".dds") for info in gems.values() if info.get("icon_dds_file")}
    entries = [gem for skills in skill_lists for skill in skills for gem in [skill, *skill["supports"]] if gem.get("icon")]
    folder = OUT / "img" / "skills"
    folder.mkdir(exist_ok=True)
    missing = set()
    for file in sorted({gem["icon"] for gem in entries}):
        try:
            (folder / file).write_bytes(fetch(cache, f"{REPOE_URL}/{paths[file]}.webp", file).read_bytes())
        except urllib.error.HTTPError as error:
            print(f"no icon for {paths[file]}: {error}", file=sys.stderr)
            missing.add(file)
    for gem in entries:
        if gem["icon"] in missing:
            gem["icon"] = ""


def gem(entry, names, gems, among_supports=False):
    """A gem of the build. One the game data don't know takes its kind from its place in the file (a
    support among the supports of a skill, 2j3b)."""
    info = gems.get(entry["id"], {})
    base = names.get(entry["id"], {})
    known = entry["id"] in names
    kind = info.get("gem_type", "support" if "support_gem" in base.get("tags", []) or (among_supports and not known) else "active")
    return {
        "name": base.get("name", entry["id"].rsplit("/", 1)[-1]),
        "kind": kind,
        "colour": gem_colour(info),
        "levels": interval(entry),
        "known": known,
        # The icon of a gem (2k: on its card), the name of its file in img/skills/, from the path the game
        # data give (skill_icons downloads it): a square for a skill, a disc for a support.
        "icon": icon_file(info),
        # A lineage support (2j2: its colour in the list « Lineage support » of the mock-up).
        "lineage": bool(info.get("is_lineage")),
        # The note of the author on the gem, its markup kept (2j2: its mark in the row, its text in
        # the hover), or "".
        "note": (entry.get("additional_text") or "").strip(),
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


def about_of(name, build, tree, names, uniques, ascendancies):
    """What the About tab shows of a build (2k3): its words, its link, its file and its size, the levels it
    covers, its counts, and its warnings by part: an id the game data don't know (a passive, a gem, a
    unique, a slot, the ascendancy), an interval whose min is above its max (specs.md, The level)."""
    dicts = lambda items: [item for item in items or [] if isinstance(item, dict)]
    passive_ids = {node["id"] for node in tree["nodes"].values() if "id" in node}
    unique_names = {u["name"] for u in uniques.values()}
    skills = dicts(build.get("skills"))
    warnings = []
    warn = lambda part, entry_id, where, entry: warnings.append(
        {"part": part, "id": entry_id, "where": where, "levels": interval(entry) if isinstance(entry, dict) else None})
    if build.get("ascendancy") and build["ascendancy"] not in ascendancies:
        warn("ascendancy", build["ascendancy"], "", None)
    for passive in dicts(build.get("passives")):
        if passive.get("id") not in passive_ids:
            warn("passive", passive.get("id"), "", passive)
    gem_name = lambda gem_id: names.get(gem_id, {}).get("name", gem_id.rsplit("/", 1)[-1])
    for skill in skills:
        if skill.get("id") not in names:
            warn("gem", skill.get("id"), "", skill)
        for support in dicts(skill.get("support_skills")):
            if support.get("id") not in names:
                warn("gem", support.get("id"), gem_name(skill.get("id", "")), support)
    for slot in dicts(build.get("inventory_slots")):
        if slot.get("inventory_id") not in INVENTORY_IDS:
            warn("slot", slot.get("inventory_id"), "", slot)
        if slot.get("unique_name") and slot["unique_name"] not in unique_names:
            warn("unique", slot["unique_name"], slot.get("inventory_id", ""), slot)
    for entry in [*dicts(build.get("passives")), *skills, *(s for k in skills for s in dicts(k.get("support_skills"))),
                  *dicts(build.get("inventory_slots"))]:
        low, high = interval(entry)
        if low > high:
            warn("interval", entry.get("id") or entry.get("inventory_id"), "", entry)
    asc = ascendancies.get(build.get("ascendancy"), {})
    return {
        "name": build.get("name", ""), "author": build.get("author") or "",
        "ascendancy": asc.get("name", ""), "class": asc.get("class", ""),
        "portrait": (build.get("ascendancy") or "").lower(),
        "description": build.get("description") or "", "link": build.get("link") or "",
        "file": f"{build.get('name', name)}.build", "size": (CORPUS / name).stat().st_size,
        "levels": level_range(build),
        "counts": {"passives": len(dicts(build.get("passives"))), "skills": len(skills),
                   "supports": sum(len(dicts(s.get("support_skills"))) for s in skills),
                   "hints": len(dicts(build.get("inventory_slots")))},
        "warnings": warnings,
    }


def first_line(text):
    lines = [line for line in (text or "").splitlines() if line.strip()]
    return lines[0] if lines else ""


def build_data(build, names, gems, ascendancies, skills, tags):
    asc = ascendancies.get(build.get("ascendancy"), {})
    hover = lambda entry: described(entry, gems, skills, tags)
    return {
        "name": build["name"],
        "author": build.get("author", ""),
        "link": build.get("link", ""),
        "ascendancy": asc.get("name", build.get("ascendancy", "")),
        "class": asc.get("class", ""),
        "portrait": (build.get("ascendancy") or "").lower(),
        "skills": [dict(gem(skill, names, gems), **hover(skill),
                        supports=[dict(gem(s, names, gems, among_supports=True), **hover(s)) for s in skill.get("support_skills", [])])
                   for skill in build.get("skills", [])],
        "slots": [{"id": slot["inventory_id"], "x": slot.get("slot_x", 0), "y": slot.get("slot_y", 0),
                   "levels": interval(slot), "unique": slot.get("unique_name", ""),
                   "base": "" if slot.get("unique_name") else plain(first_line(slot.get("additional_text"))),
                   # The rest of the author's text, its markup kept (2j3: in the card of the slot): after
                   # the first line, which names the base, unless the hint names a unique.
                   "note": slot_note(slot)}
                  for slot in build.get("inventory_slots", [])],
    }


def item_name(slot):
    """The item a hint names: its unique, or the first line of its text without the base its author
    wrote after it (« Sacramental Robe (Int Base) »), as js/levels.js reads it (withoutBase)."""
    name = slot.get("unique_name") or plain(first_line(slot.get("additional_text")))
    return re.sub(r"\s*\((?:Str|Dex|Int)(?:/(?:Str|Dex|Int))? Base\)$", "", name)


def slot_note(slot):
    text = (slot.get("additional_text") or "").strip()
    return text if slot.get("unique_name") else text.partition("\n")[2].strip()


def pob_uniques(cache):
    """The stats of the uniques, as their tooltips in the game show them, from Path of Building:
    {name: {"base", "implicits", "stats"}}. A block of its files is the name, the base, then lines of its
    own (POB_META) and the stats, each maybe behind `{variant:1,2}` (or `{version:…}`), `{tags:…}`; the
    first `Implicits: N` stats are the implicits. The current variant is the last one listed. The mock-up
    only: a unique whose variant is chosen by the player (« Has Alt Variant ») shows all of them, which
    the script of step 4 will read better."""
    found = {}
    for file in POB_FILES:
        text = fetch(cache, f"{POB_URL}/{file}.lua", f"pob-{file}.lua").read_text(encoding="utf-8")
        for block in re.findall(r"\[\[(.*?)\]\]", text, re.S):
            lines = [line.strip() for line in block.splitlines() if line.strip()]
            if len(lines) < 2:
                continue
            current = str(sum(line.startswith(("Variant:", "Version:")) for line in lines))
            implicits = next((int(line.split(":")[1]) for line in lines if line.startswith("Implicits:")), 0)
            mods = []
            for line in lines[2:]:
                if line.startswith(POB_META):
                    continue
                prefixes = re.match(r"(?:\{[^}]*\})*", line).group(0)
                chosen = re.findall(r"\{(?:variant|version):([\d,]+)\}", prefixes)
                mods.append((line[len(prefixes):], not chosen or current in chosen[0].split(",")))
            shown = [mod for mod, kept in mods[implicits:] if kept]
            found.setdefault(lines[0], {"base": lines[1], "implicits": [mod for mod, kept in mods[:implicits] if kept],
                                        "stats": shown})
    return found


def item_art(cache, names, uniques, items, classes, stats):
    """What the inventory shows of each item a hint names (2j3): {name: {"art": file, "w": cells wide,
    "h": cells high, "kind": its kind in one word, "unique": bool}}, and for a unique its base, implicits
    and stats when Path of Building has them. The image from RePoE, which serves the art of the game as
    WebP at the path the game data give; a name the game data don't know (a free text of the author:
    « Any Belt ») has nothing."""
    known = {}
    for entry in [*(u for u in uniques.values() if not u.get("is_alternate_art")), *names.values()]:
        if entry.get("name") and entry.get("visual_identity") and entry.get("release_state") != "unreleased":
            known.setdefault(entry["name"], entry)
    art = {}
    folder = OUT / "img" / "items"
    folder.mkdir(exist_ok=True)
    for name in sorted(set(items)):
        entry = known.get(name)
        if not entry:
            continue
        dds = entry["visual_identity"]["dds_file"].removesuffix(".dds")
        file = re.sub(r"[^a-z0-9]+", "-", dds.removeprefix("Art/2DItems/").lower()) + ".webp"
        (folder / file).write_bytes(fetch(cache, f"{REPOE_URL}/{dds}.webp", file).read_bytes())
        cls = entry.get("item_class", "")
        art[name] = {"art": file, "w": entry.get("inventory_width", 1), "h": entry.get("inventory_height", 1),
                     "kind": game_words(classes[cls]["category"]) if cls in classes else cls,
                     "unique": entry in uniques.values(),
                     **(stats.get(name, {}) if entry in uniques.values() else {})}
    return art


def plain(text):
    """The words of a line of the author's markup (`<b>{…}`, `<rgb(…)>{…}`), without its tags."""
    return re.sub(r"<[^>]*>\{|\}", "", text or "").strip()


def state_at(build, level, ascendancy):
    """What a build holds at a level, as its file says: its skills (id → note, and support id →
    note), its gear (slot id → the items of its hints, each with its text; a list, since the three
    charms share Charm1, whatever their place) and its passives ((id, weapon set) → of the
    ascendancy, its note)."""
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
    passives = {(p["id"], p.get("weapon_set", 0)): (p["id"] in ascendancy, text(p))
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
        # Its new text as the card of its slot reads it (slot_note): after the line that names its
        # base, unless it names a unique (2j5).
        retold += [dict(name=entry[0], kind="gear", on=slot, note=entry[2] if entry[1] else entry[2].partition("\n")[2].strip())
                   for entry in gear.get(slot, []) if entry[:2] in old_texts and old_texts[entry[:2]] != entry[2]]
    return {"added": added, "replaced": replaced, "removed": removed}, retold


def changes_at(build, level, tree, names, gems):
    """What changes at a level, by category (2g, the owner, 2026-11-18): what the file says the
    build holds at it and didn't hold at the level before, and the reverse. An entry that stops and
    starts again the same at the next level (the same id, the same place, the same note) changes
    nothing: 70 of the 81 supports « added » at 71 by a build of the corpus; one that comes back with
    another note of its author is a change of its note. A gem, a hint or a note counts as one change,
    each group of passives as one; a new skill brings its supports with it. A note carries its text,
    its markup kept, for the card of its mark (2j5)."""
    ascendancy = {node["id"] for node in tree["nodes"].values() if node.get("ascendancyId") and "id" in node}
    passive_names = {node["id"]: node.get("name", node["id"]) for node in tree["nodes"].values() if "id" in node}
    skills, notes, gear, passives = state_at(build, level, ascendancy)
    old_skills, old_notes, old_gear, old_passives = state_at(build, level - 1, ascendancy) if level > 1 else ({}, {}, {}, {})
    def named(gem_id, note=""):
        found = gem({"id": gem_id}, names, gems)
        return dict(name=found["name"], colour=found["colour"], kind=found["kind"], lineage=found["lineage"], note=note)
    # The passives taken at the level, each in its group: of the ascendancy, of a weapon set, or taken.
    group_of = lambda weapon_set, asc: "ascendancy" if asc else {1: "set1", 2: "set2"}.get(weapon_set, "taken")
    taken = [(group_of(key[1], asc), key[0], note) for key, (asc, note) in passives.items() if key not in old_passives]
    groups = {
        **{group: sum(1 for g, _, _ in taken if g == group) for group in ("taken", "set1", "set2", "ascendancy")},
        "givenBack": sum(1 for key in old_passives if key not in passives),
        # The notes of each group, with the name of the passive that carries each, in the order of the file.
        "notes": {group: [dict(name=passive_names.get(i, i), note=note) for g, i, note in taken if g == group and note]
                  for group in ("taken", "set1", "set2", "ascendancy") if any(g == group and note for g, _, note in taken)},
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
        "notes": [dict(name=named(i)["name"], kind="skill", note=notes[i]) for i in kept if notes[i] != old_notes[i]]
                 + [dict(name=named(s)["name"], kind="support", on=named(i)["name"], note=skills[i][s]) for i in kept for s in skills[i]
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


def portrait(cache, ascendancy, sprite, large=False, about=False):
    """Cuts the round portrait of an ascendancy from the sprite of its class, and the square inside
    it, made small; the large one too for the build shown, under its ascendancy on the tree; the square
    large for a case of the About tab, the width of its colophon."""
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
    if about:
        target = OUT / "img" / "portraits-about" / f"{ascendancy.lower()}.webp"
        target.parent.mkdir(exist_ok=True)
        subprocess.run(["magick", str(image), "-crop", f"{side}x{side}+{frame['x'] + inset}+{frame['y'] + inset}",
                        "+repage", "-resize", f"{ABOUT_PORTRAIT_SIZE}x{ABOUT_PORTRAIT_SIZE}", "-quality", "82",
                        str(target)], check=True)
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
    skills = json.loads(fetch(cache, f"{REPOE_URL}/skills.min.json", "skills.min.json").read_text())
    tags = json.loads(fetch(cache, f"{REPOE_URL}/gem_tags.min.json", "gem_tags.min.json").read_text())
    uniques = json.loads(fetch(cache, f"{REPOE_URL}/uniques.min.json", "uniques.min.json").read_text())
    classes = json.loads(fetch(cache, f"{REPOE_URL}/item_classes.min.json", "item_classes.min.json").read_text())
    ascendancies = {a["id"]: {"name": a["name"], "class": c["name"]}
                    for c in tree["classes"] for a in c["ascendancies"]}
    read = lambda name: json.loads((CORPUS / name).read_text(encoding="utf-8-sig"))
    builds = [read(name) for name in [SHOWN, *OPEN]]
    write_js("data-tree.js", "TREE", tree_data(tree, builds[0], sheets(cache)))
    shown = build_data(builds[0], names, gems, ascendancies, skills, tags)
    # The skills of the case of the overflow of the right column (2j4), beside the build shown.
    crowded = build_data(read(CROWDED), names, gems, ascendancies, skills, tags)["skills"]
    # The skills of the cases of the gems of two attributes (2kb).
    attributes = {key: build_data(read(name), names, gems, ascendancies, skills, tags)["skills"]
                  for key, name in ATTRIBUTE_CASES.items()}
    # The hints of the cases of the Inventory tab (2k2).
    inventories = {key: build_data(read(name), names, gems, ascendancies, skills, tags)["slots"]
                   for key, name in INVENTORY_CASES.items()}
    # The skills of the snapshot of the band, its page at 1,920 px (2k5).
    snapshot = build_data(read(BAND_CASES["snapshot"]), names, gems, ascendancies, skills, tags)["skills"]
    skill_icons(cache, gems, [shown["skills"], crowded, snapshot, *attributes.values()])
    # The cases of the About tab (2k3).
    abouts = {key: about_of(name, read(name), tree, names, uniques, ascendancies) for key, name in ABOUT_CASES.items()}
    write_js("data-builds.js", "BUILDS", {
        "treeVersion": TREE_TAG,
        "shown": shown,
        "crowded": {"skills": crowded},
        "snapshot": {"skills": snapshot},
        "attributes": attributes,
        "inventories": inventories,
        "abouts": abouts,
        "items": item_art(cache, names, uniques,
                          [*map(item_name, builds[0].get("inventory_slots", [])), *SAMPLE_ITEMS,
                           *(item_name(slot) for name in INVENTORY_CASES.values() for slot in read(name).get("inventory_slots", []))],
                          classes, pob_uniques(cache)),
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
    about_ascendancies = {read(name).get("ascendancy") for name in ABOUT_CASES.values()}
    for ascendancy, sprite in PORTRAITS.items():
        portrait(cache, ascendancy, sprite, large=ascendancy == builds[0].get("ascendancy"), about=ascendancy in about_ascendancies)


main()
