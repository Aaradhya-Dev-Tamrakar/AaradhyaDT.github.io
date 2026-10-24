"""Guard compact copy against stale IDs, lost evidence, and repeated generation."""
import importlib.util
import json
from pathlib import Path
import unittest

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('project_summaries', ROOT / 'scripts/apply_project_summaries.py')
engine = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(engine)


class ProjectSummaryTests(unittest.TestCase):
    def setUp(self):
        self.page = (ROOT / 'projects.html').read_text(encoding='utf-8')
        self.summaries = json.loads((ROOT / 'data/project-summaries.json').read_text(encoding='utf-8'))

    def test_current_copy_is_generated_and_idempotent(self):
        rendered = engine.render_summaries(self.page, self.summaries)
        self.assertEqual(rendered, self.page)
        self.assertEqual(engine.render_summaries(rendered, self.summaries), rendered)

    def test_refresh_preserves_full_case_studies_and_destinations(self):
        changed = dict(self.summaries, **{'p-025': 'Fellowship vision-model audit capstone.'})
        before = BeautifulSoup(self.page, 'html.parser')
        after = BeautifulSoup(engine.render_summaries(self.page, changed), 'html.parser')
        for old, new in zip(before.select('details.project-card'), after.select('details.project-card')):
            self.assertEqual(old['id'], new['id'])
            self.assertEqual(str(old.select_one('.project-card-body')), str(new.select_one('.project-card-body')))

    def test_rejects_unbounded_copy(self):
        changed = dict(self.summaries, **{'p-025': 'word ' * 15})
        with self.assertRaisesRegex(ValueError, '14 words'):
            engine.render_summaries(self.page, changed)

    def test_rejects_untracked_project_copy(self):
        changed = dict(self.summaries, **{'p-999': 'Untracked project.'})
        with self.assertRaisesRegex(ValueError, 'inventory'):
            engine.render_summaries(self.page, changed)
