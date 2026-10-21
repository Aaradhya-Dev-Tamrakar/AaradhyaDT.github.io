"""Month grouping must preserve weekly IDs, links, and other project sections."""
import importlib.util
from pathlib import Path
import unittest

from bs4 import BeautifulSoup


SPEC = importlib.util.spec_from_file_location(
    "add_project", Path(__file__).resolve().parents[2] / "scripts/add_project.py"
)
engine = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(engine)


class FuseMonthTests(unittest.TestCase):
    def fixture(self):
        soup = BeautifulSoup('<div id="projectsGrid"><h2 id="section-fuseaif" class="projects-section-title">Fuse AIF</h2><h2 id="section-personal" class="projects-section-title">Personal</h2></div>', "html.parser")
        header = soup.find(id="section-fuseaif")
        for week in range(18, 0, -1):
            card = BeautifulSoup(f'<details class="project-card" id="week-{week}"><summary><h3 class="project-title">Fusemachines Wk {week} — Coursework</h3></summary><a data-payload-link-id="week-{week}">Repo</a></details>', "html.parser").details
            header.insert_after(card)
        extra = soup.new_tag("a", attrs={"data-payload-link-id": "week-17-second"})
        soup.find(id="week-17").append(extra)
        onm = BeautifulSoup('<details class="project-card" id="onm"><h3 class="project-title">ONM Case Study</h3></details>', "html.parser").details
        soup.find(id="section-personal").insert_before(onm)
        return soup

    def test_all_weeks_grouped_once_without_losing_ids_or_links(self):
        soup = self.fixture()
        ids = {node["id"] for node in soup.select('[id]')}
        links = len(soup.select('[data-payload-link-id]'))
        engine.group_fuse_coursework(soup)
        self.assertEqual([node["data-fuse-month"] for node in soup.select('.fuse-month-card')], ['5', '4', '3', '2', '1'])
        self.assertEqual([len(node.select('details.project-card')) for node in soup.select('.fuse-month-card')], [2, 4, 4, 4, 4])
        self.assertTrue(ids.issubset({node["id"] for node in soup.select('[id]')}))
        self.assertEqual(len(soup.select('[data-payload-link-id]')), links)
        self.assertEqual(len(soup.select('#week-17 [data-payload-link-id]')), 2)
        self.assertIsNone(soup.find(id='onm').find_parent(class_='fuse-months-grid'))
        self.assertEqual(soup.select_one('.project-card--major')['id'], 'week-18')

    def test_repeated_grouping_is_stable(self):
        soup = self.fixture()
        engine.group_fuse_coursework(soup)
        before = str(soup)
        engine.group_fuse_coursework(soup)
        self.assertEqual(str(soup), before)

    def test_new_coursework_is_inserted_into_its_month(self):
        soup = self.fixture()
        engine.group_fuse_coursework(soup)
        card = BeautifulSoup('<details class="project-card" id="new-week"><h3 class="project-title">Fusemachines Week 19 — Next coursework</h3></details>', 'html.parser')
        engine.inject_card(soup, card, section='fuseaif')
        self.assertEqual(soup.find(id='new-week').find_parent(class_='fuse-month-card')['data-fuse-month'], '5')
        self.assertEqual(soup.select_one('.project-card--major')['id'], 'new-week')
        self.assertEqual(len(soup.select('.fuse-months-grid')), 1)


if __name__ == '__main__':
    unittest.main()
