"""Release metadata must identify the version commit, even after bot commits."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "site_automation", Path(__file__).resolve().parents[2] / "scripts/site_automation.py"
)
automation = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(automation)


class ReleaseStampTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.version = self.root / "VERSION"
        self.releases = self.root / "releases.js"
        self.git("init", "-q")
        self.git("config", "user.name", "Release Test")
        self.git("config", "user.email", "release-test@example.invalid")
        self.version.write_text("v1\n", encoding="utf-8")
        self.git("add", ".")
        self.git("commit", "-qm", "Initial version")
        old_sha = self.git("rev-parse", "HEAD")
        self.history = "  { version: 'v1', sha: '" + old_sha + "' }\n];\n"
        self.releases.write_text(
            "const SITE_RELEASES = [\n  {\n    version: 'v1.1',\n"
            "    date: '2000-01-01',\n    sha: '" + old_sha + "',\n"
            "    title: 'Stale title',\n    highlights: ['Stale claim']\n  },\n"
            + self.history, encoding="utf-8"
        )
        self.version.write_text("v1.1\n", encoding="utf-8")
        self.git("add", ".")
        self.subject = 'fix(release): correct "quoted" links and C:\\paths'
        self.git("commit", "-qm", self.subject)
        self.release_sha = self.git("rev-parse", "HEAD")
        (self.root / "bot.json").write_text("{}", encoding="utf-8")
        self.git("add", ".")
        self.git("commit", "-qm", "chore: bot metadata")
        original_runner = automation.run_command
        self.addCleanup(patch.stopall)
        patch.object(automation, "VERSION_FILE", self.version).start()
        patch.object(automation, "RELEASES_JS", self.releases).start()
        patch.object(automation, "run_command", lambda cmd: original_runner(cmd, cwd=self.root)).start()

    def git(self, *args):
        env = dict(os.environ, GIT_AUTHOR_DATE="2026-10-20T20:00:00+00:00",
                   GIT_COMMITTER_DATE="2026-10-20T20:00:00+00:00")
        return subprocess.run(["git", *args], cwd=self.root, env=env,
                              capture_output=True, text=True, check=True).stdout.strip()

    def test_replaces_stale_metadata_with_version_commit_and_preserves_history(self):
        result = automation.stamp_release()
        self.assertNotEqual(self.release_sha, self.git("rev-parse", "HEAD"))
        self.assertEqual(result["sha"], self.release_sha)
        self.assertEqual(result["date"], "2026-10-21")
        self.assertEqual(result["title"], self.subject.removeprefix("fix(release): "))
        self.assertEqual(result["highlights"], [])
        content = self.releases.read_text(encoding="utf-8")
        self.assertTrue(content.endswith(self.history))
        self.assertIn(json.dumps(result["title"]), content)
        automation.stamp_release()
        self.assertEqual(self.releases.read_text(encoding="utf-8"), content)

    def test_uncommitted_version_fails_without_rewriting_release(self):
        before = self.releases.read_bytes()
        self.version.write_text("v1.2\n", encoding="utf-8")
        with self.assertRaisesRegex(RuntimeError, "has not been committed"):
            automation.stamp_release()
        self.assertEqual(self.releases.read_bytes(), before)

    def test_git_resolution_failure_does_not_invent_a_sha(self):
        before = self.releases.read_bytes()
        with patch.object(automation, "run_command", return_value=(1, "", "No history")):
            with self.assertRaisesRegex(RuntimeError, "Cannot resolve"):
                automation.stamp_release()
        self.assertEqual(self.releases.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
