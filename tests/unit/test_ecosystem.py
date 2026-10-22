"""Protect project coverage, link privacy, and evidence boundaries in the tree."""

import copy
import importlib.util
import json
import unittest
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("generate_ecosystem", ROOT / "scripts/generate_ecosystem.py")
engine = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(engine)


class EcosystemTests(unittest.TestCase):
    def setUp(self):
        self.page = (ROOT / 'projects.html').read_text(encoding='utf-8')
        self.config = json.loads((ROOT / 'data/ecosystem.json').read_text(encoding='utf-8'))

    def test_every_project_has_exactly_one_tree_link_and_no_repository_destination(self):
        page = BeautifulSoup(self.page, 'html.parser')
        tree = BeautifulSoup(engine.render_tree(self.page, self.config), 'html.parser')
        ids = {card['id'] for card in page.select('#projectsGrid details.project-card')}
        links = [link['href'] for link in tree.select('a.ecosystem-node')]
        self.assertEqual(len(links), len(ids))
        self.assertEqual(set(links), {'#' + key for key in ids})
        self.assertFalse(tree.select('[data-payload-link-id], a[href^="https://github.com/"]'))

    def test_generation_preserves_cards_and_is_repeatable(self):
        generated = engine.generated_page(self.page, self.config)
        self.assertEqual(generated, self.page, 'Run scripts/generate_ecosystem.py')
        self.assertEqual(engine.generated_page(generated, self.config), generated)
        before = self.page.split(engine.END, 1)[1]
        self.assertEqual(generated.split(engine.END, 1)[1], before)

    def test_new_project_is_discoverable_without_manual_inventory_edits(self):
        new_card = '<details class="project-card" id="new"><h3 class="project-title">New &amp; useful</h3><a data-payload-link-id="secret">Repo</a></details>'
        page = self.page.replace('<div class="projects-grid" id="projectsGrid">', '<div class="projects-grid" id="projectsGrid">' + new_card)
        soup = BeautifulSoup(engine.render_tree(page, self.config), 'html.parser')
        self.assertEqual(soup.select_one('[data-group="more"] a')['href'], '#new')
        self.assertEqual(soup.select_one('[data-group="more"] a span').get_text(), 'New & useful')
        self.assertNotIn('secret', str(soup))

    def test_stale_membership_and_duplicate_membership_are_rejected(self):
        for value in ('missing-card', self.config['groups'][0]['projects'][0]):
            with self.subTest(value=value):
                config = copy.deepcopy(self.config)
                config['groups'][1]['projects'].append(value)
                with self.assertRaises(ValueError):
                    engine.render_tree(self.page, config)

    def test_connections_require_known_endpoints_and_evidence(self):
        for key, value in (('to', 'unknown'), ('source', ''), ('evidence', ''), ('to', 'p-040'), ('source_commit', 'placeholder'), ('evidence', 'PROVEN')):
            with self.subTest(key=key, value=value):
                config = copy.deepcopy(self.config)
                config['connections'][0][key] = value
                with self.assertRaises(ValueError):
                    engine.render_tree(self.page, config)


if __name__ == '__main__':
    unittest.main()
