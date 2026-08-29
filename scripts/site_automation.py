#!/usr/bin/env python3
"""
site_automation.py — Hyper-Automation Engine for Aaradhya-Dev-Tamrakar.github.io (v49.50)

Provides automated workflows for:
- Automated site verification & diagnostics (via scripts/verify.py)
- Search index extraction (via scripts/extract_index.py)
- Knowledge Graph maintenance (via graphify update .)
- Programmatic HTML project & achievement updates
- Release tracker & Service Worker cache version syncing
- Structured telemetry & site metadata extraction
"""

import argparse
import datetime
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ROOT / "scripts"
VERIFY_PY = SCRIPTS_DIR / "verify.py"
EXTRACT_INDEX_PY = SCRIPTS_DIR / "extract_index.py"
TRACKER_MD = ROOT / "dev-logs" / "PortfolioWebsite_TRACKER.md"
SW_JS = ROOT / "sw.js"
SCRIPT_JS = ROOT / "assets" / "js" / "script.js"
RELEASES_JS = ROOT / "assets" / "js" / "data" / "releases.js"
CSS_MODULES_DIR = ROOT / "assets" / "css" / "modules"
MODULES_DIR = ROOT / "assets" / "js" / "modules"
SITEMAP_XML = ROOT / "sitemap.xml"
MANIFEST_JSON = ROOT / "site.webmanifest"
PROJECTS_HTML = ROOT / "projects.html"
ACHIEVEMENTS_HTML = ROOT / "achievements.html"
GRAPH_REPORT = ROOT / "graphify-out" / "GRAPH_REPORT.md"
README_MD = ROOT / "README.md"
WORKFLOW_VERIFY_YML = ROOT / ".github" / "workflows" / "verify.yml"


def run_command(cmd, cwd=ROOT):
    """Executes a subprocess command and returns (returncode, stdout, stderr)."""
    try:
        res = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        return res.returncode, res.stdout, res.stderr
    except Exception as e:
        return 1, "", str(e)


def audit(verbose=False):
    """Runs the 22-category verification suite from scripts/verify.py."""
    cmd = [sys.executable, str(VERIFY_PY)]
    if verbose:
        cmd.append("--verbose")
    code, stdout, stderr = run_command(cmd)
    return {
        "status": "clean" if code == 0 else ("warning" if code == 2 else "error"),
        "returncode": code,
        "output": stdout + stderr
    }


def rebuild_search_index():
    """Regenerates SEARCH_STATIC_INDEX in assets/js/data/search-index.js via extract_index.py."""
    code, stdout, stderr = run_command([sys.executable, str(EXTRACT_INDEX_PY)])
    return {
        "success": code == 0,
        "output": stdout + stderr
    }


def update_knowledge_graph():
    """Updates graphify AST knowledge graph."""
    code, stdout, stderr = run_command(["graphify", "update", "."])
    return {
        "success": code == 0,
        "output": stdout + stderr
    }


def get_site_stats():
    """Collects structured metrics and telemetry across the portfolio site."""
    html_files = sorted([f for f in ROOT.glob("*.html") if not f.name.startswith("google")])
    projects_count = 0
    achievements_count = 0
    
    if PROJECTS_HTML.exists():
        content = PROJECTS_HTML.read_text(encoding="utf-8")
        projects_count = len(re.findall(r'<h3[^>]*class="[^"]*project-title', content)) or len(re.findall(r'<details[^>]*class="[^"]*project-card', content))
        
    if ACHIEVEMENTS_HTML.exists():
        content = ACHIEVEMENTS_HTML.read_text(encoding="utf-8")
        achievements_count = len(re.findall(r'<h3[^>]*class="[^"]*achievement-title', content)) or len(re.findall(r'class="[^"]*achievement-item', content))

    sw_version = "unknown"
    if SW_JS.exists():
        sw_text = SW_JS.read_text(encoding="utf-8")
        match = re.search(r"CACHE_NAME\s*=\s*['\"]([^'\"]+)['\"]", sw_text)
        if match:
            sw_version = match.group(1)

    graph_nodes = 0
    graph_edges = 0
    if GRAPH_REPORT.exists():
        g_text = GRAPH_REPORT.read_text(encoding="utf-8")
        match = re.search(r"(\d+)\s+nodes\s+·\s+(\d+)\s+edges", g_text)
        if match:
            graph_nodes = int(match.group(1))
            graph_edges = int(match.group(2))

    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "total_html_pages": len(html_files),
        "html_pages": [f.name for f in html_files],
        "project_count": projects_count,
        "achievement_count": achievements_count,
        "service_worker_cache": sw_version,
        "graph_nodes": graph_nodes,
        "graph_edges": graph_edges
    }


def get_current_version():
    """Extracts the latest version string from SITE_RELEASES[0] in assets/js/data/releases.js."""
    if RELEASES_JS.exists():
        releases_text = RELEASES_JS.read_text(encoding="utf-8")
        m = re.search(r"version:\s*['\"]v?([\d.]+)['\"]", releases_text)
        if m:
            return f"v{m.group(1)}"
    return "v49"


def compute_next_version(current_v, bump_type="patch"):
    """Computes the next point release (patch) or major integer release."""
    clean = current_v.lower().lstrip("v")
    parts = clean.split(".")
    major = int(parts[0]) if parts[0].isdigit() else 49
    
    if bump_type == "major":
        return f"v{major + 1}"
    
    # Patch bump: 49 -> 49.1, 49.1 -> 49.2, etc.
    if len(parts) > 1 and parts[1].isdigit():
        patch = int(parts[1]) + 1
    else:
        patch = 1
    return f"v{major}.{patch}"


def sync_metadata(version_tag=None):
    """Syncs version tag across sw.js, script.js, verify.py, tracker, and sitemap.xml."""
    results = []
    
    if not version_tag:
        version_tag = get_current_version()

    clean_v = version_tag.lower().strip()
    if not clean_v.startswith("v"):
        clean_v = f"v{clean_v}"

    # 1. Update Service Worker Cache Version & Header
    if SW_JS.exists():
        sw_text = SW_JS.read_text(encoding="utf-8")
        cache_name = f"aaradhya-portfolio-{clean_v}"
        new_sw = re.sub(
            r"(CACHE_NAME\s*=\s*['\"])[^'\"]+(['\"])",
            lambda m: f"{m.group(1)}{cache_name}{m.group(2)}",
            sw_text
        )
        new_sw = re.sub(r"Service Worker.*?\(v[\d.]+\)", f"Service Worker — Aaradhya Dev Tamrakar Portfolio ({clean_v})", new_sw)
        SW_JS.write_text(new_sw, encoding="utf-8")
        results.append(f"Updated sw.js cache name and header to '{clean_v}'")

    # 2. Update script.js Header & Dynamic Module Loader
    if SCRIPT_JS.exists():
        script_text = SCRIPT_JS.read_text(encoding="utf-8")
        new_script = re.sub(r"SHARED SCRIPT.*?\(v[\d.]+\)", f"SHARED SCRIPT — aaradhyadt.github.io ({clean_v})", script_text)
        new_script = re.sub(r"Dynamic Module Loader\s*\(v[\d.]+\)", f"Dynamic Module Loader ({clean_v})", new_script)
        SCRIPT_JS.write_text(new_script, encoding="utf-8")
        results.append(f"Updated script.js headers to '{clean_v}'")

    # 3. Update verify.py
    if VERIFY_PY.exists():
        v_text = VERIFY_PY.read_text(encoding="utf-8")
        new_v = re.sub(r"aaradhyadt\.github\.io\s*\(v[\d.]+\)", f"aaradhyadt.github.io ({clean_v})", v_text)
        new_v = re.sub(r"Portfolio Site Verification Suite\s*\(v[\d.]+\)", f"Portfolio Site Verification Suite ({clean_v})", new_v)
        VERIFY_PY.write_text(new_v, encoding="utf-8")
        results.append(f"Updated verify.py suite headers to '{clean_v}'")

    # 4. Update Tracker Header & Timestamp (MD009/MD026 compliant)
    if TRACKER_MD.exists():
        today_ymd = datetime.date.today().strftime("%Y-%m-%d")
        tr_text = TRACKER_MD.read_text(encoding="utf-8")
        new_tr = re.sub(r"# Portfolio Website Tracker\s*—\s*v[\d.]+", f"# Portfolio Website Tracker — {clean_v}", tr_text)
        new_tr = re.sub(r"(?m)^(?:##\s*)?\\?[_*]?Last updated.*$", f"Last updated: _{today_ymd}_", new_tr)
        clean_lines = [line.rstrip() for line in new_tr.splitlines()]
        new_tr = "\n".join(clean_lines) + "\n"
        TRACKER_MD.write_text(new_tr, encoding="utf-8")
        results.append(f"Updated TRACKER.md title to '{clean_v}' and timestamp to '{today_ymd}'")

    # 5. Update sitemap.xml timestamps
    if SITEMAP_XML.exists():
        today_ymd = datetime.date.today().strftime("%Y-%m-%d")
        site_text = SITEMAP_XML.read_text(encoding="utf-8")
        new_sitemap = re.sub(r"<lastmod>[^<]+</lastmod>", f"<lastmod>{today_ymd}</lastmod>", site_text)
        SITEMAP_XML.write_text(new_sitemap, encoding="utf-8")
        results.append(f"Updated sitemap.xml timestamps to '{today_ymd}'")

    # 6. Update JS Module Headers
    if MODULES_DIR.exists():
        mod_count = 0
        for mod_path in sorted(MODULES_DIR.glob("*.js")):
            mod_text = mod_path.read_text(encoding="utf-8")
            new_mod = re.sub(r"\(v[\d.]+\)", f"({clean_v})", mod_text, count=1)
            if new_mod != mod_text:
                mod_path.write_text(new_mod, encoding="utf-8")
                mod_count += 1
        results.append(f"Updated {mod_count} JS module headers in assets/js/modules/ to '{clean_v}'")

    # 7. Update site_automation.py Header Docstring
    self_path = Path(__file__).resolve()
    if self_path.exists():
        self_text = self_path.read_text(encoding="utf-8")
        new_self = re.sub(r"Aaradhya-Dev-Tamrakar\.github\.io\s*\(v[\d.]+\)", f"Aaradhya-Dev-Tamrakar.github.io ({clean_v})", self_text, count=1)
        if new_self != self_text:
            self_path.write_text(new_self, encoding="utf-8")
            results.append(f"Updated site_automation.py header to '{clean_v}'")

    # 9. Update README.md version comments
    if README_MD.exists():
        readme_text = README_MD.read_text(encoding="utf-8")
        new_readme = re.sub(r"(sw\.js\s*#\s*PWA Service Worker\s*\()(v[\d.]+)", rf"\g<1>{clean_v}", readme_text)
        new_readme = re.sub(r"(script\.js\s*#\s*Core site engine[^\n]*\()(v[\d.]+)", rf"\g<1>{clean_v}", new_readme)
        if new_readme != readme_text:
            README_MD.write_text(new_readme, encoding="utf-8")
            results.append(f"Updated README.md version annotations to '{clean_v}'")

    # 10. Update .github/workflows/verify.yml header
    if WORKFLOW_VERIFY_YML.exists():
        wf_text = WORKFLOW_VERIFY_YML.read_text(encoding="utf-8")
        today_ymd = datetime.date.today().strftime("%Y-%m-%d")
        new_wf = re.sub(r"# Last updated:\s*[\d-]+\s*\(v[\d.]+\)", f"# Last updated: {today_ymd} ({clean_v})", wf_text)
        if new_wf != wf_text:
            WORKFLOW_VERIFY_YML.write_text(new_wf, encoding="utf-8")
            results.append(f"Updated verify.yml workflow header to '{clean_v}'")

    return results


def bump_version(bump_type="patch", explicit_version=None, title=None, highlights=None):
    """Bumps version and propagates across all metadata files."""
    current_v = get_current_version()
    
    if explicit_version:
        new_v = explicit_version.lower().strip()
        if not new_v.startswith("v"):
            new_v = f"v{new_v}"
    else:
        new_v = compute_next_version(current_v, bump_type=bump_type)

    actions = [f"Bumping version from {current_v} -> {new_v} ({bump_type})"]

    # 1. Update SITE_RELEASES in assets/js/data/releases.js
    if RELEASES_JS.exists():
        releases_text = RELEASES_JS.read_text(encoding="utf-8")
        today = datetime.date.today().strftime("%Y-%m-%d")

        if bump_type == "major" or (explicit_version and not explicit_version.startswith(current_v)):
            rel_title = title or f"Major Release {new_v}"
            rel_highlights = highlights or [
                f"Core updates and architectural improvements for {new_v}",
                f"PWA & Cache: Bumped Service Worker cache to aaradhya-portfolio-{new_v}"
            ]
            hl_json = ",\n".join([f"      {json.dumps(h)}" for h in rel_highlights])
            clean_sha = f"rel{new_v.replace('.', '').replace('v', '')}"
            new_block = f"""  {{\n    version: '{new_v}',\n    date: '{today}',\n    sha: '{clean_sha}',\n    title: {json.dumps(rel_title)},\n    highlights: [\n{hl_json}\n    ]\n  }},"""
            new_releases = re.sub(r"(const SITE_RELEASES = \[\s*)", r"\1" + new_block + "\n", releases_text, count=1)
            RELEASES_JS.write_text(new_releases, encoding="utf-8")
            actions.append(f"Prepended new release block for {new_v} in releases.js")

            # Update Tracker log for major bump
            update_tracker(new_v, rel_title, rel_highlights)
        else:
            new_releases = re.sub(r"(const SITE_RELEASES = \[\s*\{\s*version:\s*['\"])[^'\"]+(['\"])",
                                  rf"\g<1>{new_v}\g<2>", releases_text, count=1)
            RELEASES_JS.write_text(new_releases, encoding="utf-8")
            actions.append(f"Updated SITE_RELEASES[0].version to '{new_v}' in releases.js")

    # 2. Sync all metadata
    sync_results = sync_metadata(new_v)
    actions.extend(sync_results)

    return {
        "previous_version": current_v,
        "new_version": new_v,
        "bump_type": bump_type,
        "actions": actions
    }


def update_tracker(version, title, highlights):
    """Appends a new version entry to dev-logs/PortfolioWebsite_TRACKER.md."""
    if not TRACKER_MD.exists():
        return {"success": False, "error": "Tracker file not found."}
    
    today = datetime.date.today().strftime("%Y-%m-%d")
    clean_highlights = [h.replace("\r", " ").replace("\n", " ").strip() for h in highlights if h.strip()]
    highlights_md = "\n".join([f"  - {h}" for h in clean_highlights])
    entry = f"- **{version} — {title}.** Shipped {title.lower()}.\n{highlights_md}\n\n"
    
    content = TRACKER_MD.read_text(encoding="utf-8")
    meta_idx = content.find("## Meta")
    if meta_idx != -1:
        header_end = content.find("\n", meta_idx)
        if header_end != -1:
            insert_pos = header_end + 1
            new_content = content[:insert_pos] + entry + content[insert_pos:]
            
            new_content = re.sub(r"# Portfolio Website Tracker\s*—\s*v[\d.]+", f"# Portfolio Website Tracker — {version}", new_content)
            new_content = re.sub(r"(?m)^(?:##\s*)?\\?[_*]?Last updated.*$", f"Last updated: _{today}_", new_content)
            clean_lines = [line.rstrip() for line in new_content.splitlines()]
            new_content = "\n".join(clean_lines) + "\n"
            
            TRACKER_MD.write_text(new_content, encoding="utf-8")
            return {"success": True, "entry": entry.strip()}
    return {"success": False, "error": "Failed to locate ## Meta section in tracker."}


def main():
    parser = argparse.ArgumentParser(description="Site Hyper-Automation Engine")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("audit", help="Run verification suite")
    subparsers.add_parser("stats", help="Get site statistics and metrics")
    subparsers.add_parser("rebuild-index", help="Extract and regenerate search index")
    subparsers.add_parser("update-graph", help="Update Graphify AST knowledge graph")

    subparsers.add_parser("bump-patch", help="Auto-increment point/patch release (e.g. v49.1 -> v49.2)")
    
    major_p = subparsers.add_parser("bump-major", help="Bump to next major release (e.g. v49 -> v50)")
    major_p.add_argument("--title", default=None, help="Title of release")
    major_p.add_argument("--highlights", nargs="+", default=None, help="List of highlights")

    sync_p = subparsers.add_parser("sync-metadata", help="Sync metadata & SW cache version")
    sync_p.add_argument("--version", default=None, help="Version tag (e.g. v49; auto-detected if omitted)")

    tracker_p = subparsers.add_parser("update-tracker", help="Add entry to Portfolio Tracker")
    tracker_p.add_argument("--version", required=True, help="Version string (e.g. v49)")
    tracker_p.add_argument("--title", required=True, help="Title of release")
    tracker_p.add_argument("--highlights", nargs="+", required=True, help="List of highlights")

    args = parser.parse_args()

    if args.command == "audit":
        res = audit(verbose=True)
        print(json.dumps(res, indent=2))
    elif args.command == "stats":
        print(json.dumps(get_site_stats(), indent=2))
    elif args.command == "rebuild-index":
        res = rebuild_search_index()
        print(json.dumps(res, indent=2))
    elif args.command == "update-graph":
        res = update_knowledge_graph()
        print(json.dumps(res, indent=2))
    elif args.command == "bump-patch":
        res = bump_version(bump_type="patch")
        print(json.dumps(res, indent=2))
    elif args.command == "bump-major":
        res = bump_version(bump_type="major", title=args.title, highlights=args.highlights)
        print(json.dumps(res, indent=2))
    elif args.command == "sync-metadata":
        res = sync_metadata(args.version)
        print(json.dumps(res, indent=2))
    elif args.command == "update-tracker":
        res = update_tracker(args.version, args.title, args.highlights)
        print(json.dumps(res, indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
