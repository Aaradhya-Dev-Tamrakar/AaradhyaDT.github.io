#!/usr/bin/env python3
"""
test_e2e.py — End-to-End Integration & Smoke Testing Engine for aaradhyadt.github.io
Spins up a lightweight local server and validates:
1. HTTP 200 response & Content-Type for all 10 HTML pages
2. 404 handler routing and template rendering
3. All 37 Service Worker precached static assets resolve over HTTP
4. Noscript navigation and footer fallback presence
"""

import http.server
import mimetypes
import os
import re
import socketserver
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent

# Register MIME types
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("application/javascript", ".js")


class QuietTestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        pass  # Quiet during automated test runs

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            try:
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(ROOT / "404.html", "rb") as f_404:
                    self.wfile.write(f_404.read())
            except Exception:
                super().send_error(code, message, explain)
        else:
            super().send_error(code, message, explain)


def run_e2e_suite():
    print("=" * 60)
    print("  Starting E2E Integration & Smoke Testing Suite")
    print("=" * 60)

    # Bind to an ephemeral free port
    server = socketserver.TCPServer(("127.0.0.1", 0), QuietTestHandler)
    port = server.server_address[1]
    base_url = f"http://127.0.0.1:{port}"

    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.2)

    passed = 0
    failed = 0

    def assert_test(name, condition, extra=""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name} {extra}")
            failed += 1

    try:
        # 1. Test all 10 HTML pages over HTTP
        html_files = sorted([f.name for f in ROOT.glob("*.html") if not f.name.startswith("google")])
        for page in html_files:
            url = f"{base_url}/{page}"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "E2E-Smoke-Runner"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    assert_test(f"HTTP 200: {page}", resp.status == 200)
                    ctype = resp.headers.get("Content-Type", "")
                    assert_test(f"Content-Type HTML: {page}", "text/html" in ctype)
            except Exception as e:
                assert_test(f"HTTP Fetch: {page}", False, str(e))

        # 2. Test 404 Routing
        missing_url = f"{base_url}/nonexistent-page-test.html"
        try:
            req = urllib.request.Request(missing_url, headers={"User-Agent": "E2E-Smoke-Runner"})
            urllib.request.urlopen(req, timeout=5)
            assert_test("HTTP 404 Status for Missing Route", False, "Expected 404 status")
        except urllib.error.HTTPError as e:
            assert_test("HTTP 404 Status for Missing Route", e.code == 404)
            body = e.read().decode("utf-8", errors="replace")
            assert_test("404 Custom Template Rendered", "Page Not Found" in body or "404" in body)

        # 3. Test Service Worker precached assets
        sw_file = ROOT / "sw.js"
        if sw_file.exists():
            sw_text = sw_file.read_text(encoding="utf-8")
            m = re.search(r"PRECACHE_ASSETS\s*=\s*\[(.*?)\];", sw_text, re.DOTALL)
            if m:
                raw_assets = re.findall(r"['\"]([^'\"]+)['\"]", m.group(1))
                checked_assets = 0
                asset_errors = 0
                for asset in raw_assets:
                    clean_asset = asset.lstrip("./")
                    if not clean_asset:
                        continue
                    asset_url = f"{base_url}/{clean_asset}"
                    try:
                        req = urllib.request.Request(asset_url, headers={"User-Agent": "E2E-Smoke-Runner"})
                        with urllib.request.urlopen(req, timeout=5) as resp:
                            if resp.status != 200:
                                asset_errors += 1
                            checked_assets += 1
                    except Exception:
                        asset_errors += 1
                assert_test(f"SW Precache Assets HTTP Resolution ({checked_assets} assets)", asset_errors == 0)

        # 4. Test Noscript Navigation and Footer Fallbacks
        for page in html_files:
            file_path = ROOT / page
            content = file_path.read_text(encoding="utf-8")
            assert_test(f"Noscript Nav: {page}", "<noscript>" in content and "nav-links" in content)
            assert_test(f"Noscript Footer: {page}", "<noscript>" in content and "Privacy Policy" in content)

    finally:
        server.shutdown()
        server.server_close()

    print("-" * 60)
    print(f"  E2E Smoke Results: {passed} passed, {failed} failed")
    print("=" * 60)
    return failed == 0


if __name__ == "__main__":
    success = run_e2e_suite()
    sys.exit(0 if success else 1)

