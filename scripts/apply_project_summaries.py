"""Render compact summaries from shared project copy without changing case studies."""
import json
import re
from html import escape
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent


def render_summaries(page, summaries):
    seen = set()

    def render(match):
        card = match.group()
        soup = BeautifulSoup(card, 'html.parser')
        project = soup.find('details')['id']
        seen.add(project)
        story = soup.select_one('.project-story p')
        label = story.find('strong')
        if label:
            label.decompose()
        tablet = story.get_text(' ', strip=True)
        mobile = summaries[project]
        if len(mobile.split()) > 14:
            raise ValueError(f'{project}: mobile summary exceeds 14 words')
        markup = ('<p class="mobile-project-summary">'
                  f'<span class="phone-copy">{escape(mobile)}</span>'
                  f'<span class="tablet-copy">{escape(tablet)}</span></p>')
        return re.sub(r'<p class="mobile-project-summary">.*?</p>',
                      lambda _: markup, card, count=1, flags=re.S)

    result = re.sub(r'<details\b[^>]*class="project-card\b.*?</details>',
                    render, page, flags=re.S)
    if seen != summaries.keys():
        raise ValueError('Compact summary IDs must match the project inventory')
    return result


def main():
    target = ROOT / 'projects.html'
    summaries = json.loads((ROOT / 'data/project-summaries.json').read_text(encoding='utf-8'))
    target.write_text(render_summaries(target.read_text(encoding='utf-8'), summaries),
                      encoding='utf-8', newline='\n')
    print(f'Rendered {len(summaries)} mobile and tablet summaries')


if __name__ == '__main__':
    main()
