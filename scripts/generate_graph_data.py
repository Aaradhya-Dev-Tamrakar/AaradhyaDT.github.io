#!/usr/bin/env python3
"""
generate_graph_data.py — ExplainGit-Style Graph Data Generator
Extracts repository file architecture, symbol AST nodes, radiating file-to-symbol
edges, cross-file dependency links, and explorer tree hierarchy from graphify-out/graph.json.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
GRAPH_JSON = ROOT / "graphify-out" / "graph.json"
OUT_FILE = ROOT / "assets" / "js" / "data" / "graph-data.js"

# ExplainGit Category Palette
FILE_COLORS = {
    # Scripts / Automation (Warm Orange)
    "scripts/site_automation.py": "#ff8042",
    "scripts/test_e2e.py": "#ff8042",
    "scripts/test_visual_regression.py": "#ff8042",
    "scripts/manage_payloads.py": "#c084fc",
    "scripts/benchmark_bundle.py": "#a855f7",
    "scripts/verify.py": "#f472b6",
    "scripts/extract_index.py": "#ff8042",
    "scripts/dev-serve.py": "#ff8042",
    "scripts/build_css.py": "#ff8042",
    "scripts/generate_og_cards.py": "#ff8042",
    "scripts/generate_pwa_icons.py": "#ff8042",
    
    # Core & Script (Mint / Emerald Green)
    "assets/js/modules/core.js": "#56d364",
    "assets/js/script.js": "#56d364",
    "assets/js/modules/tour.js": "#48e589",
    
    # UI & Presentation (Golden Amber)
    "assets/js/modules/ui.js": "#e3b341",
    "assets/js/modules/home-widgets.js": "#10b981",
    
    # Security, Access & Terminal (Purple & Magenta)
    "assets/js/modules/access.js": "#bc8cff",
    "assets/js/modules/terminal.js": "#f778ba",
    "assets/js/modules/graph-modal.js": "#d28eff",
    "assets/js/modules/cmdk.js": "#ffa657",
    "assets/js/modules/shortcuts.js": "#39c5cf",
    "assets/js/modules/haptics.js": "#ffa657",
    "assets/js/modules/audio.js": "#39c5cf",
    "assets/js/modules/constants.js": "#e3b341",
    
    # Background & Animations (Electric Sky)
    "assets/js/bg-animations.js": "#38bdf8",
    
    # Tests (Lavender / Royal Purple)
    "tests/unit/test_crypto.test.mjs": "#bc8cff",
    "tests/unit/test_shortcuts.test.mjs": "#bc8cff",
    "tests/unit/test_cmdk_search.test.mjs": "#bc8cff",
    "tests/unit/test_core_helpers.test.mjs": "#bc8cff",
    "tests/unit/test_terminal.test.mjs": "#bc8cff",
    
    # MCP Server (Coral Red)
    "mcp-server/site_mcp.py": "#ff7b72",
    "sw.js": "#ffa657",
}

DEFAULT_COLOR_BY_EXT = {
    ".py": "#ff8042",
    ".js": "#56d364",
    ".mjs": "#bc8cff",
    ".css": "#38bdf8",
    ".html": "#e3b341",
    ".json": "#f778ba",
    ".md": "#8b949e",
}

def get_file_color(filepath: str) -> str:
    if filepath in FILE_COLORS:
        return FILE_COLORS[filepath]
    ext = Path(filepath).suffix.lower()
    return DEFAULT_COLOR_BY_EXT.get(ext, "#79c0ff")

def build_graph_data():
    if not GRAPH_JSON.exists():
        print(f"Error: {GRAPH_JSON} not found.")
        return 1

    with open(GRAPH_JSON, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    raw_nodes = raw_data.get("nodes", [])
    raw_links = raw_data.get("links", [])

    # Filter to code nodes
    nodes = []
    node_id_map = {}
    file_symbols = defaultdict(list)

    for n in raw_nodes:
        if n.get("file_type") == "code":
            idx = len(nodes)
            node_id_map[n["id"]] = idx
            sf = n.get("source_file", "").replace("\\", "/")
            item = {
                "id": n["id"],
                "label": n.get("label", n["id"]),
                "file": sf,
                "line": n.get("source_location", ""),
                "type": "class" if n.get("_callable_class") else "function",
                "comm": n.get("community", 0),
                "comm_name": n.get("community_name", ""),
            }
            nodes.append(item)
            if sf:
                file_symbols[sf].append(idx)

    # Collect unique code files
    file_list = []
    for sf, sym_indices in file_symbols.items():
        p = Path(sf)
        file_list.append({
            "id": sf,
            "name": p.name,
            "path": sf,
            "dir": str(p.parent).replace("\\", "/"),
            "ext": p.suffix.lower(),
            "color": get_file_color(sf),
            "symbolCount": len(sym_indices),
            "symbols": sym_indices,
            "size": min(28, max(14, 10 + int(len(sym_indices) ** 0.65) * 2.5)),
        })

    # Sort files by importance / symbol count
    file_list.sort(key=lambda x: x["symbolCount"], reverse=True)
    # Re-index
    file_id_map = {f["id"]: i for i, f in enumerate(file_list)}

    # Build intra-symbol edges
    edges = []
    file_links = defaultdict(int)
    for l in raw_links:
        s = l.get("source")
        t = l.get("target")
        if s in node_id_map and t in node_id_map:
            s_idx = node_id_map[s]
            t_idx = node_id_map[t]
            edges.append([s_idx, t_idx])
            
            # Record file-level link
            s_file = nodes[s_idx]["file"]
            t_file = nodes[t_idx]["file"]
            if s_file and t_file and s_file != t_file:
                if s_file in file_id_map and t_file in file_id_map:
                    sf_i = file_id_map[s_file]
                    tf_i = file_id_map[t_file]
                    pair = (min(sf_i, tf_i), max(sf_i, tf_i))
                    file_links[pair] += 1

    file_edges = [[k[0], k[1], v] for k, v in file_links.items()]

    # Build Explorer Directory Tree matching repo layout
    tree = {
        "name": "root",
        "type": "dir",
        "children": []
    }

    def add_to_tree(parent_node, parts, full_path, is_file):
        if not parts:
            return
        curr = parts[0]
        if len(parts) == 1 and is_file:
            parent_node["children"].append({
                "name": curr,
                "type": "file",
                "path": full_path,
                "ext": Path(curr).suffix.lower(),
                "color": get_file_color(full_path),
                "hasCode": full_path in file_id_map,
            })
            return
        
        existing = next((c for c in parent_node["children"] if c["name"] == curr and c["type"] == "dir"), None)
        if not existing:
            existing = {
                "name": curr,
                "type": "dir",
                "children": []
            }
            parent_node["children"].append(existing)
        
        add_to_tree(existing, parts[1:], full_path, is_file)

    repo_files = [
        "assets/certificates",
        "assets/css",
        "assets/docs",
        "assets/events",
        "assets/images",
        "assets/js/data/releases.js",
        "assets/js/data/search-index.js",
        "assets/js/data/resume-data.js",
        "assets/js/data/graph-data.js",
        "assets/js/modules/access.js",
        "assets/js/modules/audio.js",
        "assets/js/modules/cmdk.js",
        "assets/js/modules/constants.js",
        "assets/js/modules/core.js",
        "assets/js/modules/graph-modal.js",
        "assets/js/modules/haptics.js",
        "assets/js/modules/home-widgets.js",
        "assets/js/modules/shortcuts.js",
        "assets/js/modules/terminal.js",
        "assets/js/modules/tour.js",
        "assets/js/modules/ui.js",
        "assets/js/bg-animations.js",
        "assets/js/last-commit.json",
        "assets/js/script.js",
        "assets/videos",
        "dev-logs",
        "graphify-out",
        "mcp-server/site_mcp.py",
        "scripts/benchmark_bundle.py",
        "scripts/build_css.py",
        "scripts/dev-serve.py",
        "scripts/extract_index.py",
        "scripts/generate_og_cards.py",
        "scripts/generate_pwa_icons.py",
        "scripts/manage_payloads.py",
        "scripts/site_automation.py",
        "scripts/test_e2e.py",
        "scripts/test_visual_regression.py",
        "scripts/verify.py",
        "tests/unit/test_cmdk_search.test.mjs",
        "tests/unit/test_core_helpers.test.mjs",
        "tests/unit/test_crypto.test.mjs",
        "tests/unit/test_shortcuts.test.mjs",
        "tests/unit/test_terminal.test.mjs",
        "sw.js",
    ]

    for rf in repo_files:
        parts = rf.split("/")
        is_f = "." in parts[-1]
        add_to_tree(tree, parts, rf, is_f)

    def sort_tree(node):
        if "children" in node:
            node["children"].sort(key=lambda x: (0 if x["type"] == "dir" else 1, x["name"].lower()))
            for c in node["children"]:
                sort_tree(c)

    sort_tree(tree)

    output_data = {
        "stats": {
            "files": len(file_list),
            "nodes": len(nodes),
            "edges": len(edges),
            "fileEdges": len(file_edges),
        },
        "files": file_list,
        "nodes": nodes,
        "edges": edges,
        "fileEdges": file_edges,
        "tree": tree["children"]
    }

    js_content = f"""/* ============================================================
   GRAPH DATA — aaradhyadt.github.io
   Generated from graphify-out/graph.json for ExplainGit Knowledge Graph HUD.
   Contains file topology, AST symbols, radiating links, and explorer tree.
   ============================================================ */
const GRAPH_DATA = {json.dumps(output_data, separators=(',', ':'))};
"""

    OUT_FILE.write_text(js_content, encoding="utf-8")
    print(f"Successfully generated {OUT_FILE}")
    print(f"Stats: {output_data['stats']}")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(build_graph_data())
