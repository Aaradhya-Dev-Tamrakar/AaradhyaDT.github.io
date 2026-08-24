#!/usr/bin/env python3
"""
extract_index.py — regenerates SEARCH_STATIC_INDEX in
assets/js/data/search-index.js from the current contents of
achievements.html and projects.html.

Why this exists: buildSearchIndex() in cmdk.js merges a hardcoded
SEARCH_STATIC_INDEX snapshot with a live DOM scan. The live scan only
runs on achievements.html / projects.html themselves (since only those
pages render #achievementsList / #projectsGrid), so every other page
(index, contact, experience, about, 404) relies entirely on the static
snapshot for achievement/project search results. If that snapshot goes
stale, search silently misses anything added after the last manual
export — which is what happened to the EU AI Act Literacy certificate.

This script is the fix: it parses the same DOM shape the live JS scan
reads, in the same order, so the two can never drift. Run manually via
`python3 scripts/extract_index.py`, or automatically on every push via
.github/workflows/update-search-index.yml.

Requires: beautifulsoup4 (pip install beautifulsoup4)
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
INDEX_FILE = ROOT / "assets" / "js" / "data" / "search-index.js"

START_MARK = "const SEARCH_STATIC_INDEX = {"
END_MARK = "\n};"


def text_of(el):
    if not el:
        return ""
    # get_text(strip=True) strips each text fragment individually then
    # joins with '' — this smashes words together at inline-tag boundaries
    # (e.g. "team with <a>Name</a> —" -> "team withName—") and leaves
    # internal newlines/indentation intact when a single text node is
    # soft-wrapped across source lines. separator=" " fixes the join;
    # the regex collapses any remaining whitespace runs (incl. \xa0 from
    # &nbsp;) down to a single space.
    raw = el.get_text(separator=" ", strip=True)
    return re.sub(r"\s+", " ", raw).strip()


def extract_achievements():
    soup = BeautifulSoup((ROOT / "achievements.html").read_text(encoding="utf-8"), "html.parser")
    items = soup.select("#achievementsList .achievement-item")
    out = []
    for i, el in enumerate(items):
        el_id = el.get("id") or f"achv-{i}"
        org = text_of(el.select_one(".achievement-org"))
        title = text_of(el.select_one(".achievement-title"))
        desc = text_of(el.select_one(".achievement-desc"))
        date = text_of(el.select_one(".achievement-date"))
        href = f"achievements.html#{el_id}"
        meta = " · ".join(p for p in (org, date) if p)
        text = " ".join(p for p in (org, title, desc, date) if p).lower()
        out.append({
            "type": "achievement",
            "title": title,
            "meta": meta,
            "href": href,
            "text": text,
        })
    return out


def extract_projects():
    soup = BeautifulSoup((ROOT / "projects.html").read_text(encoding="utf-8"), "html.parser")
    cards = soup.select("#projectsGrid .project-card")
    out = []
    for i, el in enumerate(cards):
        el_id = el.get("id") or f"proj-{i}"
        title = text_of(el.select_one(".project-title"))
        # Mirrors the live-DOM fallback added in script.js: some cards use a
        # single .project-desc paragraph, others a .project-desc-list — the
        # live scan checks both, so this must too or the two indexes diverge.
        desc_el = el.select_one(".project-desc")
        if desc_el:
            desc = text_of(desc_el)
        else:
            desc = " ".join(text_of(li) for li in el.select(".project-desc-list li"))
        status = text_of(el.select_one(".project-status"))
        tags = [text_of(t) for t in el.select(".tag")]
        href = f"projects.html#{el_id}"
        meta = " · ".join(p for p in (status, ", ".join(tags[:3])) if p)
        text = " ".join(p for p in (title, desc, " ".join(tags), status) if p).lower()
        out.append({
            "type": "project",
            "title": title,
            "meta": meta,
            "href": href,
            "text": text,
        })
    return out


def render_entry(entry, indent="  "):
    lines = [f"{indent}{{"]
    for j, key in enumerate(("type", "title", "meta", "href", "text")):
        comma = "," if j < 4 else ""
        lines.append(f'{indent}  "{key}": {json.dumps(entry[key], ensure_ascii=False)}{comma}')
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def render_block(achievements, projects):
    parts = ["const SEARCH_STATIC_INDEX = {\n  achievement: ["]
    parts.append(",\n".join(render_entry(e) for e in achievements))
    parts.append("\n  ],\n  project: [")
    parts.append(",\n".join(render_entry(e) for e in projects))
    parts.append("\n  ]\n};")
    return "\n".join(parts)


def main():
    achievements = extract_achievements()
    projects = extract_projects()

    if not achievements or not projects:
        print("ERROR: extracted zero achievements or zero projects — DOM selectors "
              "likely no longer match achievements.html / projects.html. Aborting "
              "without touching search-index.js.", file=sys.stderr)
        sys.exit(1)

    new_block = render_block(achievements, projects)

    src = INDEX_FILE.read_text(encoding="utf-8")
    start = src.find(START_MARK)
    if start == -1:
        print(f"ERROR: could not find '{START_MARK}' in {INDEX_FILE}", file=sys.stderr)
        sys.exit(1)
    end = src.find(END_MARK, start)
    if end == -1:
        print(f"ERROR: could not find end of SEARCH_STATIC_INDEX block in {INDEX_FILE}", file=sys.stderr)
        sys.exit(1)
    end += len(END_MARK)

    updated = src[:start] + new_block + src[end:]

    if updated == src:
        print(f"No change — index already up to date ({len(achievements)} achievements, {len(projects)} projects).")
        return

    INDEX_FILE.write_text(updated, encoding="utf-8")
    print(f"Updated SEARCH_STATIC_INDEX: {len(achievements)} achievements, {len(projects)} projects.")


if __name__ == "__main__":
    main()
