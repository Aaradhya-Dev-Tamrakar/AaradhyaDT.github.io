#!/usr/bin/env python3
"""
site_automation.py — Hyper-Automation Engine for Aaradhya-Dev-Tamrakar.github.io (v53.4)

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

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

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
VERSION_FILE = ROOT / "VERSION"
PYPROJECT_TOML = ROOT / "pyproject.toml"


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
    """Runs the 24-category verification suite from scripts/verify.py."""
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
        if BeautifulSoup:
            soup = BeautifulSoup(content, "html.parser")
            projects = soup.select("#projectsGrid .project-card") or soup.select(".project-card, h3.project-title")
            projects_count = len(projects)
        else:
            projects_count = len(re.findall(r'<h3[^>]*class="[^"]*project-title', content)) or len(re.findall(r'<details[^>]*class="[^"]*project-card', content))
        
    if ACHIEVEMENTS_HTML.exists():
        content = ACHIEVEMENTS_HTML.read_text(encoding="utf-8")
        if BeautifulSoup:
            soup = BeautifulSoup(content, "html.parser")
            achievements = soup.select("#achievementsList .achievement-item") or soup.select(".achievement-item, h3.achievement-title")
            achievements_count = len(achievements)
        else:
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


def evaluate_bump_recommendation():
    """
    Evaluates current working tree modifications against an objective 5-pillar
    decision matrix to determine whether a Major (v52) or Minor/Patch (v51.x) release
    is warranted, providing human- and machine-readable explanations.
    """
    code, stdout, _ = run_command(["git", "status", "--porcelain"])
    status_lines = [
        line.rstrip("\r\n") for line in stdout.splitlines()
        if line.strip() and "assets/js/last-commit.json" not in line
    ]
    
    current_v = get_current_version()
    next_major = compute_next_version(current_v, bump_type="major")
    next_patch = compute_next_version(current_v, bump_type="patch")

    if not status_lines:
        return {
            "recommended_bump": "none",
            "current_version": current_v,
            "suggested_version": current_v,
            "score": 0,
            "triggers": [],
            "domains_touched": [],
            "explanation": "Working tree is clean. No version bump necessary."
        }

    paths = []
    added_files = []
    deleted_files = []
    modified_files = []

    for line in status_lines:
        if len(line) < 4:
            continue
        status_code = line[:2].strip()
        raw_path = line[3:].strip().strip('"')
        if " -> " in raw_path:
            raw_path = raw_path.split(" -> ")[-1].strip().strip('"')
        paths.append(raw_path)
        
        if "A" in status_code or "??" in status_code:
            added_files.append(raw_path)
        elif "D" in status_code:
            deleted_files.append(raw_path)
        else:
            modified_files.append(raw_path)

    triggers = []
    major_score = 0

    # Pillar 1: Core Architecture & Runtime Tooling Overhaul (+4 pts)
    infra_patterns = [r"pyproject\.toml$", r"uv\.lock$", r"^\.github/workflows/", r"^scripts/", r"sync\.ps1$"]
    infra_matches = [p for p in paths if any(re.search(pat, p) for pat in infra_patterns)]
    if infra_matches:
        triggers.append(
            f"Pillar 1 (Infrastructure & Tooling): Modified {len(infra_matches)} runtime/CI/automation file(s) ({', '.join(infra_matches[:3])})"
        )
        major_score += 4

    # Pillar 2: Breaking PWA Cache & Client-Side Lifecycles (+4 pts)
    pwa_matches = [p for p in paths if re.search(r"^(sw\.js|site\.webmanifest|assets/js/script\.js)$", p)]
    if pwa_matches:
        triggers.append(
            f"Pillar 2 (PWA & Client Lifecycle): Modified core service worker or bootloader ({', '.join(pwa_matches)}) requiring global client cache invalidation"
        )
        major_score += 4

    # Pillar 3: New Surface or Top-Level Page Addition/Removal (+4 pts)
    html_added = [p for p in added_files if p.endswith(".html") and "/" not in p]
    html_deleted = [p for p in deleted_files if p.endswith(".html") and "/" not in p]
    if html_added or html_deleted:
        triggers.append(
            f"Pillar 3 (Surface Addition/Removal): Top-level HTML page lifecycle change (+{len(html_added)} / -{len(html_deleted)})"
        )
        major_score += 4

    # Pillar 4: Structural Modularization & Contract Evolution (+4 pts)
    mod_changes = [p for p in paths if re.search(r"^assets/js/(modules|data)/", p) or re.search(r"^assets/css/modules/", p)]
    if len(mod_changes) >= 3 or any(p in added_files or p in deleted_files for p in mod_changes):
        triggers.append(
            f"Pillar 4 (Structural Modularization): Broad module layer changes ({len(mod_changes)} modules touched/added/deleted)"
        )
        major_score += 4

    # Pillar 5: Cross-System Milestone Scope Threshold (+4 pts)
    domains = set()
    for p in paths:
        if p.endswith(".html"):
            domains.add("HTML Pages")
        elif p.startswith("assets/css/"):
            domains.add("CSS Styling")
        elif p.startswith("assets/js/"):
            domains.add("JavaScript Runtime")
        elif p.startswith("scripts/"):
            domains.add("Automation Tooling")
        elif p.startswith(".github/"):
            domains.add("CI/CD Workflows")
        elif p.startswith("dev-logs/") or p.endswith(".md"):
            domains.add("Documentation & Tracker")

    if len(domains) >= 4:
        triggers.append(
            f"Pillar 5 (Cross-Domain Milestone): Changes span {len(domains)} distinct functional domains ({', '.join(sorted(domains))})"
        )
        major_score += 4

    # Decision Logic: Any single pillar condition (score >= 4) warrants Major release
    if major_score >= 4:
        recommended = "major"
        explanation = (
            f"Major release ({next_major}) is recommended (Pillars Triggered: {len(triggers)}/5, Confidence Score: {major_score}/20). "
            f"Changes satisfy critical architectural threshold. Pass `.\\sync.ps1 -Major` to promote."
        )
    else:
        recommended = "patch"
        explanation = (
            f"Minor / Point release ({next_patch}) is appropriate (Score: {major_score}/20). "
            f"Changes are localized or routine content/styling updates."
        )

    return {
        "recommended_bump": recommended,
        "current_version": current_v,
        "suggested_version": next_major if recommended == "major" else next_patch,
        "score": major_score,
        "triggers": triggers,
        "domains_touched": sorted(list(domains)),
        "explanation": explanation
    }


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
        new_tr = re.sub(
            r"(\|\s*\*\*PWA Service Worker & Offline Caching\*\*\s*\|\s*\*\*Active \(`aaradhya-portfolio-)v?[\d.]+(\`\)\*\*)",
            rf"\g<1>{clean_v}\g<2>",
            new_tr
        )
        clean_lines = [line.rstrip() for line in new_tr.splitlines()]
        new_tr = "\n".join(clean_lines) + "\n"
        TRACKER_MD.write_text(new_tr, encoding="utf-8")
        results.append(f"Updated TRACKER.md title to '{clean_v}', PWA cache status, and timestamp to '{today_ymd}'")

    # 5. Update sitemap.xml timestamps
    if SITEMAP_XML.exists():
        today_ymd = datetime.date.today().strftime("%Y-%m-%d")
        site_text = SITEMAP_XML.read_text(encoding="utf-8")
        new_sitemap = re.sub(r"<lastmod>[^<]+</lastmod>", f"<lastmod>{today_ymd}</lastmod>", site_text)
        SITEMAP_XML.write_text(new_sitemap, encoding="utf-8")
        results.append(f"Updated sitemap.xml timestamps to '{today_ymd}'")

    # 6. Update JS Module Headers & terminal.js Fallback Strings
    if MODULES_DIR.exists():
        mod_count = 0
        for mod_path in sorted(MODULES_DIR.glob("*.js")):
            mod_text = mod_path.read_text(encoding="utf-8")
            new_mod = re.sub(r"\(v[\d.]+\)", f"({clean_v})", mod_text, count=1)
            if mod_path.name == "terminal.js":
                new_mod = re.sub(
                    r"(SITE_RELEASES\[0\](?:\?)?\.version\s*:\s*['\"])v?[\d.]+(['\"])",
                    rf"\g<1>{clean_v}\g<2>",
                    new_mod
                )
            if new_mod != mod_text:
                mod_path.write_text(new_mod, encoding="utf-8")
                mod_count += 1
        results.append(f"Updated {mod_count} JS module headers and fallbacks in assets/js/modules/ to '{clean_v}'")

    # 7. Update site_automation.py Header Docstring
    self_path = Path(__file__).resolve()
    if self_path.exists():
        self_text = self_path.read_text(encoding="utf-8")
        new_self = re.sub(r"Aaradhya-Dev-Tamrakar\.github\.io\s*\(v[\d.]+\)", f"Aaradhya-Dev-Tamrakar.github.io ({clean_v})", self_text, count=1)
        if new_self != self_text:
            self_path.write_text(new_self, encoding="utf-8")
            results.append(f"Updated site_automation.py header to '{clean_v}'")

    # 9. Update README.md version comments and badge
    if README_MD.exists():
        readme_text = README_MD.read_text(encoding="utf-8")
        new_readme = re.sub(r"(img\.shields\.io/badge/version-)v?[\d.]+(-blue\.svg)", rf"\g<1>{clean_v}\g<2>", readme_text)
        new_readme = re.sub(r"(sw\.js\s*#\s*PWA Service Worker\s*\()(v[\d.]+)", rf"\g<1>{clean_v}", new_readme)
        new_readme = re.sub(r"(script\.js\s*#\s*Core site engine[^\n]*\()(v[\d.]+)", rf"\g<1>{clean_v}", new_readme)
        if new_readme != readme_text:
            README_MD.write_text(new_readme, encoding="utf-8")
            results.append(f"Updated README.md version badge and annotations to '{clean_v}'")

    # 10. Update .github/workflows/verify.yml header
    if WORKFLOW_VERIFY_YML.exists():
        wf_text = WORKFLOW_VERIFY_YML.read_text(encoding="utf-8")
        today_ymd = datetime.date.today().strftime("%Y-%m-%d")
        new_wf = re.sub(r"# Last updated:\s*[\d-]+\s*\(v[\d.]+\)", f"# Last updated: {today_ymd} ({clean_v})", wf_text)
        if new_wf != wf_text:
            WORKFLOW_VERIFY_YML.write_text(new_wf, encoding="utf-8")
            results.append(f"Updated verify.yml workflow header to '{clean_v}'")

    # 11. Update VERSION file
    if VERSION_FILE.exists():
        VERSION_FILE.write_text(f"{clean_v}\n", encoding="utf-8")
        results.append(f"Updated VERSION file to '{clean_v}'")

    # 12. Update pyproject.toml
    if PYPROJECT_TOML.exists():
        py_text = PYPROJECT_TOML.read_text(encoding="utf-8")
        # Extract digits: v51 -> 51.0.0, v50.28 -> 50.28.0
        v_nums = clean_v.lstrip("v").split(".")
        if len(v_nums) == 1:
            semver = f"{v_nums[0]}.0.0"
        elif len(v_nums) == 2:
            semver = f"{v_nums[0]}.{v_nums[1]}.0"
        else:
            semver = ".".join(v_nums[:3])
        new_py = re.sub(r'version\s*=\s*"[^"]+"', f'version = "{semver}"', py_text)
        if new_py != py_text:
            PYPROJECT_TOML.write_text(new_py, encoding="utf-8")
            results.append(f"Updated pyproject.toml version to '{semver}'")

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
            new_block = f"  {{\n    version: '{new_v}',\n    date: '{today}',\n    sha: '{clean_sha}',\n    title: {json.dumps(rel_title)},\n    highlights: [\n{hl_json}\n    ]\n  }},"
            new_releases = re.sub(r"const SITE_RELEASES = \[\s*", f"const SITE_RELEASES = [\n{new_block}\n  ", releases_text, count=1)
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


def update_tracker(version, title, highlights=None):
    """
    Inserts a new major version release block into dev-logs/PortfolioWebsite_TRACKER.md.
    Maintains Markdownlint compliance (MD009 trailing spaces, MD026 trailing colons, MD036 emphasis).
    """
    if not TRACKER_MD.exists():
        return {"success": False, "error": "Tracker file not found."}
    
    today = datetime.date.today().strftime("%Y-%m-%d")
    clean_highlights = [h.replace("\r", " ").replace("\n", " ").strip() for h in (highlights or []) if h.strip()]
    if clean_highlights:
        highlights_md = "\n".join([f"  - {h}" for h in clean_highlights])
        entry = f"- **{version} (Major Release) — {title}.** Shipped {title.lower()}.\n{highlights_md}\n\n"
    else:
        entry = f"- **{version} (Major Release) — {title}.** Core architectural updates and improvements.\n\n"
    
    content = TRACKER_MD.read_text(encoding="utf-8")
    
    # Update title header and Last updated date
    content = re.sub(r"# Portfolio Website Tracker\s*—\s*v[\d.]+", f"# Portfolio Website Tracker — {version}", content)
    content = re.sub(r"(?m)^(?:##\s*)?\\?[_*]?Last updated.*$", f"Last updated: _{today}_", content)

    # Insert new release block after the 'Last updated:' subtitle
    match = re.search(r"(?m)^Last updated:\s*_[^_]+_\s*\n*", content)
    if match:
        insert_pos = match.end()
        new_content = content[:insert_pos] + "\n" + entry + content[insert_pos:].lstrip("\r\n")
    else:
        heading_match = re.search(r"(?m)^#\s+[^\n]+\n*", content)
        if heading_match:
            insert_pos = heading_match.end()
            new_content = content[:insert_pos] + f"\nLast updated: _{today}_\n\n" + entry + content[insert_pos:].lstrip("\r\n")
        else:
            new_content = f"# Portfolio Website Tracker — {version}\n\nLast updated: _{today}_\n\n{entry}" + content

    # Clean trailing whitespace across all lines to satisfy MD009
    clean_lines = [line.rstrip() for line in new_content.splitlines()]
    new_content = "\n".join(clean_lines).strip() + "\n"
    
    TRACKER_MD.write_text(new_content, encoding="utf-8")
    return {"success": True, "entry": entry.strip()}


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

    subparsers.add_parser("evaluate-bump", help="Evaluate whether pending changes warrant a major or minor bump")

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
    elif args.command == "evaluate-bump":
        res = evaluate_bump_recommendation()
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
