"""Pages packaging must preserve runtime assets without publishing local files."""

import importlib.util
import re
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "build_site", Path(__file__).resolve().parents[2] / "scripts/build_site.py"
)
BUILD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILD)


class BuildSiteTests(unittest.TestCase):
    def test_service_worker_precache_remains_deployable(self):
        root = Path(__file__).resolve().parents[2]
        source = (root / "sw.js").read_text(encoding="utf-8")
        match = re.search(r"STATIC_ASSETS\s*=\s*\[(.*?)\];", source, re.DOTALL)
        self.assertIsNotNone(match)
        assets = re.findall(r"['\"]([^'\"]+)['\"]", match.group(1))
        self.assertGreater(len(assets), 0)
        for asset in assets:
            if asset == "./":
                continue
            path = asset.removeprefix("./")
            self.assertTrue(BUILD.is_public(path), path)
            self.assertTrue((root / path).is_file(), path)

    def test_runtime_selection(self):
        for path in ("index.html", "google123.html", "sw.js", "site.webmanifest",
                     "assets/images/branding/nepal-flag.svg", "assets/js/data/graph-data.js",
                     "data/quantitative-claims.json"):
            self.assertTrue(BUILD.is_public(path), path)
        for path in ("AGENTS.md", "chat_history/private.md", "graphify-out/graph.json",
                     "clean_codebase_payload.txt", "dev-logs/export.md", "scripts/tool.py",
                     ".env", "data/private.json", "../assets/private.txt", "/assets/private.txt"):
            self.assertFalse(BUILD.is_public(path), path)

    def test_only_tracked_public_files_are_copied(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "assets").mkdir()
            (root / "index.html").write_text("homepage", encoding="utf-8")
            (root / "assets/public.svg").write_text("svg", encoding="utf-8")
            (root / "assets/local-secret.txt").write_text("private", encoding="utf-8")
            (root / "AGENTS.md").write_text("rules", encoding="utf-8")
            result = subprocess.CompletedProcess([], 0, b"index.html\0assets/public.svg\0AGENTS.md\0")
            with patch.object(BUILD.subprocess, "run", return_value=result):
                self.assertEqual(BUILD.build_site(root, root / "public"), 2)
                with self.assertRaises(FileExistsError):
                    BUILD.build_site(root, root / "public")
            files = {p.relative_to(root / "public").as_posix()
                     for p in (root / "public").rglob("*") if p.is_file()}
            self.assertEqual(files, {"index.html", "assets/public.svg"})


if __name__ == "__main__":
    unittest.main()
