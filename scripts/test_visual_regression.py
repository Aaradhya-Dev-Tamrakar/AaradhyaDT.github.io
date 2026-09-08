#!/usr/bin/env python3
"""
test_visual_regression.py — Automated Visual Regression & Pixel Diff Suite
for aaradhyadt.github.io

Uses system-installed Headless Chrome / Chromium / Edge and Pillow to:
1. Spin up an ephemeral local HTTP server.
2. Capture pixel-accurate viewport snapshots (desktop: 1280x800, mobile: 375x667).
3. Compare against committed reference baselines in tests/visual/baselines/.
4. Highlight visual regressions, layout shifts, or unintended CSS changes.
5. Export side-by-side visual diff heatmaps on threshold breach.

Usage:
  python scripts/test_visual_regression.py                  # Verify against baselines
  python scripts/test_visual_regression.py --update         # Record / update golden baselines
  python scripts/test_visual_regression.py --pages index    # Test specific pages only
  python scripts/test_visual_regression.py --tolerance 0.01 # Set custom tolerance (1%)
"""

import argparse
import http.server
import mimetypes
import os
import shutil
import socketserver
import subprocess
import sys
import threading
import time
from pathlib import Path

# Force UTF-8 output on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

try:
    from PIL import Image, ImageChops, ImageEnhance
except ImportError:
    print("Error: 'pillow' is required for visual regression testing.")
    print("Run: uv add pillow  (or pip install pillow)")
    sys.exit(1)

# Paths
ROOT = Path(__file__).resolve().parent.parent
TESTS_DIR = ROOT / "tests" / "visual"
BASELINES_DIR = TESTS_DIR / "baselines"
DIFFS_DIR = TESTS_DIR / "diffs"
TMP_DIR = TESTS_DIR / ".tmp"

# MIME types
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("application/javascript", ".js")

# Pages to snapshot
CORE_PAGES = [
    "index.html",
    "projects.html",
    "achievements.html",
    "about.html",
    "experience.html",
    "journey.html",
    "contact.html",
]

# Viewport presets: (name, width, height)
VIEWPORTS = [
    ("desktop", 1280, 800),
    ("mobile", 375, 667),
]


class QuietServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        pass  # Quiet during visual runs


def find_browser_executable():
    """Locate headless Chrome, Chromium, or Edge binary on the system."""
    # 1. Check environment variable override
    env_browser = os.environ.get("BROWSER_PATH")
    if env_browser and Path(env_browser).is_file():
        return env_browser

    # 2. Check PATH
    candidates = ["google-chrome", "chrome", "chromium-browser", "chromium", "msedge", "edge"]
    for c in candidates:
        found = shutil.which(c)
        if found:
            return found

    # 3. Windows standard locations
    if sys.platform == "win32":
        win_candidates = [
            Path(os.environ.get("PROGRAMFILES", "C:\\Program Files")) / "Google" / "Chrome" / "Application" / "chrome.exe",
            Path(os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)")) / "Google" / "Chrome" / "Application" / "chrome.exe",
            Path(os.environ.get("LOCALAPPDATA", "")) / "Google" / "Chrome" / "Application" / "chrome.exe",
            Path(os.environ.get("PROGRAMFILES", "C:\\Program Files")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
            Path(os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)")) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        ]
        for p in win_candidates:
            if p.is_file():
                return str(p)

    return None


def capture_screenshot(browser_path, url, width, height, output_path):
    """Execute browser CLI in headless mode to capture a viewport snapshot."""
    cmd = [
        browser_path,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--hide-scrollbars",
        f"--window-size={width},{height}",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=1800",
        f"--screenshot={output_path}",
        url,
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        return res.returncode == 0 and output_path.is_file() and output_path.stat().st_size > 0
    except subprocess.TimeoutExpired:
        return False
    except Exception as e:
        print(f"Error executing browser: {e}")
        return False


def calculate_image_diff(baseline_path, current_path, diff_output_path):
    """
    Compare baseline and current images using Pillow.
    Returns: (diff_ratio, is_identical)
    """
    with Image.open(baseline_path) as img_base, Image.open(current_path) as img_curr:
        # Normalize modes (RGBA)
        img_base = img_base.convert("RGBA")
        img_curr = img_curr.convert("RGBA")

        # Check dimension mismatch
        if img_base.size != img_curr.size:
            # Resize canvas to max dimensions for visual comparison
            max_w = max(img_base.width, img_curr.width)
            max_h = max(img_base.height, img_curr.height)
            canvas_base = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
            canvas_curr = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
            canvas_base.paste(img_base, (0, 0))
            canvas_curr.paste(img_curr, (0, 0))
            img_base = canvas_base
            img_curr = canvas_curr

        # Generate pixel difference
        diff = ImageChops.difference(img_base, img_curr)
        bbox = diff.getbbox()
        if not bbox:
            return 0.0, True

        # Calculate difference ratio
        diff_pixels = 0
        total_pixels = img_base.width * img_base.height
        gray_diff = diff.convert("L")
        # Pixels with perceptible change (>5 out of 255)
        hist = gray_diff.histogram()
        perceptible_diff_pixels = sum(hist[6:])
        diff_ratio = perceptible_diff_pixels / float(total_pixels)

        # If noticeable difference, compose side-by-side diff
        if diff_ratio > 0.0001:
            diff_output_path.parent.mkdir(parents=True, exist_ok=True)
            # Enhance difference for visibility
            enhanced_diff = ImageEnhance.Brightness(gray_diff).enhance(3.0).convert("RGBA")
            # Tint differences in red
            red_overlay = Image.new("RGBA", img_base.size, (255, 0, 0, 160))
            diff_tint = Image.composite(red_overlay, img_base, gray_diff)

            # 3-panel strip: [Baseline | Heatmap Overlay | Current]
            panel_w, panel_h = img_base.width, img_base.height
            strip = Image.new("RGBA", (panel_w * 3, panel_h), (18, 18, 18, 255))
            strip.paste(img_base, (0, 0))
            strip.paste(diff_tint, (panel_w, 0))
            strip.paste(img_curr, (panel_w * 2, 0))
            strip.save(diff_output_path)

        return diff_ratio, diff_ratio == 0.0


def main():
    parser = argparse.ArgumentParser(description="Automated Visual Regression Test Suite")
    parser.add_argument("--update", "--update-baselines", dest="update", action="store_true", help="Record / overwrite baseline screenshots")
    parser.add_argument("--pages", type=str, default="", help="Comma-separated pages to test (e.g. index,projects)")
    parser.add_argument("--tolerance", type=float, default=0.005, help="Perceptible pixel diff tolerance threshold (default: 0.005 = 0.5%%)")
    parser.add_argument("--viewports", type=str, default="", help="Comma-separated viewports (e.g. desktop,mobile)")
    args = parser.parse_args()

    browser = find_browser_executable()
    if not browser:
        print("❌ Error: No compatible Chrome or Edge browser found for headless screenshots.")
        sys.exit(1)

    # Filter pages
    pages = CORE_PAGES
    if args.pages:
        filter_names = [p.strip().lower() for p in args.pages.split(",")]
        pages = [p for p in CORE_PAGES if any(fn in p.lower() for fn in filter_names)]
        if not pages:
            print(f"Error: No matching pages found for filter: {args.pages}")
            sys.exit(1)

    # Filter viewports
    viewports = VIEWPORTS
    if args.viewports:
        v_filters = [v.strip().lower() for v in args.viewports.split(",")]
        viewports = [v for v in VIEWPORTS if v[0] in v_filters]

    # Ensure directories
    BASELINES_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    if DIFFS_DIR.exists():
        shutil.rmtree(DIFFS_DIR)
    DIFFS_DIR.mkdir(parents=True, exist_ok=True)

    # Start ephemeral HTTP server
    server = socketserver.TCPServer(("127.0.0.1", 0), QuietServerHandler)
    port = server.server_address[1]
    base_url = f"http://127.0.0.1:{port}"
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.3)

    print("=" * 65)
    print("  Visual Regression & UI Consistency Engine")
    print(f"  Browser   : {Path(browser).name} ({browser})")
    print(f"  Mode      : {'Update Baselines' if args.update else 'Verify Against Baselines'}")
    print(f"  Tolerance : {args.tolerance * 100:.2f}% max allowed pixel divergence")
    print("=" * 65)

    passed = 0
    failed = 0
    updated = 0

    try:
        for page in pages:
            page_slug = page.replace(".html", "")
            for vp_name, width, height in viewports:
                case_id = f"{page_slug}_{vp_name}"
                url = f"{base_url}/{page}"
                baseline_file = BASELINES_DIR / f"{case_id}.png"
                current_file = TMP_DIR / f"{case_id}.png"
                diff_file = DIFFS_DIR / f"{case_id}_diff.png"

                if args.update:
                    print(f"  [RECORD] Capturing baseline for {case_id} ({width}x{height})...", end="\r")
                    ok = capture_screenshot(browser, url, width, height, baseline_file)
                    if ok:
                        print(f"  ✅ [SAVED] {case_id:<28s} ({width}x{height}) -> {baseline_file.name}")
                        updated += 1
                    else:
                        print(f"  ❌ [FAIL]  Failed to capture {case_id}")
                        failed += 1
                    continue

                # Verification mode
                if not baseline_file.is_file():
                    print(f"  ⚠️  [WARN]  Missing baseline for {case_id}. Run with --update to generate.")
                    failed += 1
                    continue

                print(f"  [CHECK]  Rendering {case_id}...", end="\r")
                ok = capture_screenshot(browser, url, width, height, current_file)
                if not ok:
                    print(f"  ❌ [FAIL]  Failed to capture current frame for {case_id}")
                    failed += 1
                    continue

                diff_ratio, is_identical = calculate_image_diff(baseline_file, current_file, diff_file)
                diff_pct = diff_ratio * 100.0

                if diff_ratio <= args.tolerance:
                    status_note = "identical" if is_identical else f"diff: {diff_pct:.3f}% (within {args.tolerance*100:.1f}%)"
                    print(f"  ✅ [PASS]  {case_id:<28s} -> {status_note}")
                    passed += 1
                else:
                    print(f"  ❌ [REGRESSION] {case_id:<23s} -> diff: {diff_pct:.2f}% > tolerance ({args.tolerance*100:.1f}%)")
                    print(f"            Diff heatmap saved: {diff_file.relative_to(ROOT)}")
                    failed += 1

    finally:
        server.shutdown()
        if TMP_DIR.exists():
            shutil.rmtree(TMP_DIR, ignore_errors=True)

    print("-" * 65)
    if args.update:
        print(f"  Baselines Updated: {updated} captured, {failed} failed.")
        sys.exit(0 if failed == 0 else 1)
    else:
        print(f"  Visual Test Results: {passed} passed, {failed} failed.")
        if failed > 0:
            print("  ❌ Visual regressions detected! Inspect diff images in tests/visual/diffs/")
            sys.exit(1)
        else:
            print("  🎉 Zero visual regressions! UI pixel integrity verified.")
            sys.exit(0)


if __name__ == "__main__":
    main()
