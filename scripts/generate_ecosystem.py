#!/usr/bin/env python3
"""Build the accessible ecosystem tree from project cards and curated relationships.

Run after project onboarding: python scripts/generate_ecosystem.py
Check generated content without writing: python scripts/generate_ecosystem.py --check
Group membership is editorial; only explicitly sourced links imply integrations.
"""

import argparse
import html
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- ECOSYSTEM TREE START -->"
END = "<!-- ECOSYSTEM TREE END -->"


def render_tree(page, config):
    """Return a static tree, rejecting stale IDs and unsourced connections."""
    soup = BeautifulSoup(page, "html.parser")
    cards = {card["id"]: card for card in soup.select("#projectsGrid details.project-card")}
    groups = []
    assigned = set()
    for group in config["groups"]:
        ids = list(group["projects"])
        if group.get("include_coursework"):
            ids = [key for key, card in cards.items() if card.has_attr("data-fuse-week")] + ids
        for key in ids:
            if key not in cards:
                raise ValueError(f"Unknown project: {key}")
            if key in assigned:
                raise ValueError(f"Project appears twice: {key}")
            assigned.add(key)
        groups.append((group, ids))
    remaining = [key for key in cards if key not in assigned]
    if remaining:
        groups.append(({
            "id": "more", "label": "More projects",
            "description": "New additions to the portfolio.",
        }, remaining))
    connections = config["connections"]
    for edge in connections:
        if edge["from"] not in cards or edge["to"] not in cards:
            raise ValueError("Connection references an unknown project")
        if edge["from"] == edge["to"] or not edge.get("source") or not edge.get("evidence"):
            raise ValueError("Connections require distinct projects and evidence")
        if not re.fullmatch(r"[0-9a-f]{40}", edge.get("source_commit", "")):
            raise ValueError("Connections require an immutable source commit")
        if edge['evidence'] not in {'DOCUMENTED_INTEGRATION', 'DOCUMENTED_WORKFLOW'}:
            raise ValueError("Unsupported connection evidence tier")

    esc = html.escape
    labels = {
        key: config.get('labels', {}).get(
            key, card.select_one('.project-title').get_text(' ', strip=True).split(' — ')[0]
        ) for key, card in cards.items()
    }
    examples = config.get('search_examples', [])
    if any(key not in cards for key in examples):
        raise ValueError('Search examples must reference existing projects')
    example_names = [labels[key] for key in examples]
    placeholder = 'Search project names'
    if len(example_names) > 1:
        placeholder = 'Try ' + ', '.join(example_names[:-1]) + ', or ' + example_names[-1]
    elif example_names:
        placeholder = 'Try ' + example_names[0]
    edges = esc(json.dumps(connections, ensure_ascii=False), quote=True)
    lines = [START, f'<section class="ecosystem" id="ecosystem" aria-labelledby="ecosystem-title" data-connections="{edges}">',
             '<header class="ecosystem-heading">',
             '<div><p class="ecosystem-eyebrow">Connected work</p>',
             '<h2 id="ecosystem-title">One ecosystem. Many ways in.</h2>',
             '<p>Explore the tools, research, and learning that connect my engineering practice.</p></div>',
             f'<p class="ecosystem-totals">{len(cards)} projects <span aria-hidden="true">/</span> {len(groups)} branches</p>',
             '</header>',
             '<div class="ecosystem-controls" hidden>',
             '<div class="ecosystem-search"><label for="ecosystem-search">Find a project</label>',
             f'<input id="ecosystem-search" type="search" placeholder="{esc(placeholder, quote=True)}" autocomplete="off" aria-controls="ecosystem-tree"/></div>',
             '<button type="button" class="ecosystem-button" id="ecosystem-expand" aria-controls="ecosystem-tree">Expand branches</button>',
             '<button type="button" class="ecosystem-button" id="ecosystem-reset">Reset tree</button>',
             '</div>',
             '<div class="ecosystem-layout">',
             '<div class="ecosystem-map">',
             '<div class="ecosystem-root"><span class="ecosystem-root-mark" aria-hidden="true">ADT</span><div><strong>Engineering ecosystem</strong><span>Choose a branch, then a project</span></div></div>',
             '<ul class="ecosystem-tree" id="ecosystem-tree" role="list">']
    for index, (group, ids) in enumerate(groups):
        opened = ' open' if index == 0 else ''
        lines.extend([f'<li class="ecosystem-branch" data-group="{esc(group["id"])}">',
                      f'<details{opened}><summary><span>{esc(group["label"])}</span><span class="ecosystem-count">{len(ids)}</span></summary>',
                      f'<p class="ecosystem-branch-description">{esc(group["description"])}</p>',
                      '<ul class="ecosystem-projects" role="list">'])
        for key in ids:
            card = cards[key]
            title = card.select_one('.project-title').get_text(' ', strip=True)
            label = labels[key]
            week = card.get('data-fuse-week')
            if week:
                label = f"Week {week} · {label}"
            tags = ' '.join(tag.get_text(' ', strip=True) for tag in card.select('.tag'))
            lines.append(f'<li data-project="{key}" data-search="{esc(label + " " + title + " " + tags, quote=True)}"><a class="ecosystem-node" href="#{key}"><span>{esc(label)}</span><span class="ecosystem-node-arrow" aria-hidden="true">↗</span></a></li>')
        lines.extend(['</ul></details></li>'])
    lines.extend(['</ul>', '<p class="ecosystem-empty" hidden>No projects found. Try another name or technology.</p>',
                  '</div>', '<aside class="ecosystem-detail" aria-labelledby="ecosystem-detail-title" hidden>',
                  '<p class="ecosystem-eyebrow" id="ecosystem-detail-group"></p>',
                  '<h3 id="ecosystem-detail-title"></h3>',
                  '<p id="ecosystem-detail-description"></p>',
                  '<ul class="ecosystem-tags" id="ecosystem-detail-tags" role="list"></ul>',
                  '<a class="ecosystem-primary" id="ecosystem-project-link" href="#projects">Open project <span aria-hidden="true">↗</span></a>',
                  '<div id="ecosystem-repositories"></div>',
                  '<div class="ecosystem-relationships"><h4>Connected projects</h4><ul id="ecosystem-related" role="list"></ul></div>',
                  '<button type="button" class="ecosystem-button" id="ecosystem-return">Back to selected project in tree</button>',
                  '</aside>', '</div>',
                  '<footer class="ecosystem-footer"><p><span class="ecosystem-key-branch" aria-hidden="true"></span>Branches group projects by purpose. <span class="ecosystem-key-link" aria-hidden="true">↗</span>Connections describe documented integrations and workflows.</p>',
                  f'<p id="ecosystem-status" role="status">{len(cards)} projects in the tree.</p></footer>',
                  '<noscript><p>Follow any project name to its card. Branches expand without JavaScript.</p></noscript>',
                  '</section>', END])
    return '\n'.join(lines)


def generated_page(page, config):
    if START not in page or END not in page:
        raise ValueError("Missing ecosystem tree markers")
    before, rest = page.split(START, 1)
    _, after = rest.split(END, 1)
    return before + render_tree(page, config) + after


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    target = ROOT / 'projects.html'
    original = target.read_text(encoding='utf-8')
    config = json.loads((ROOT / 'data/ecosystem.json').read_text(encoding='utf-8'))
    result = generated_page(original, config)
    if args.check:
        if result != original:
            print('Ecosystem tree is stale. Run python scripts/generate_ecosystem.py')
            return 1
        print('Ecosystem tree matches project inventory and relationship data.')
    else:
        target.write_text(result, encoding='utf-8')
        print('Updated ecosystem tree in projects.html.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
