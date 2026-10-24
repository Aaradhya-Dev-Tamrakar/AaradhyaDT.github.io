"""Update existing project descriptions without changing project identities or proofs."""
import json
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parent.parent


def invariants(soup):
    return [(c['id'],str(c.summary),[str(x) for x in c.select('.project-media-preview,.project-tags,.project-link,[data-output-caption]')])
            for c in soup.select('details.project-card')]


def main():
    path=ROOT/'projects.html'
    soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    before=invariants(soup)
    narratives=json.loads((ROOT/'data/project-narratives.json').read_text(encoding='utf-8'))
    for pid,paragraphs in narratives.items():
        card=soup.find('details',id=pid)
        assert card is not None and len(paragraphs)==4,pid
        old=card.select_one('.project-story,.project-desc-list')
        assert old is not None,pid
        story=soup.new_tag('div',attrs={'class':'project-story project-desc'})
        labels=['The problem','What I built','Engineering focus','Current boundary']
        if pid=='p-012': labels[1]='Proposed approach'
        if pid=='p-032': labels[1]='Research work'
        if card.has_attr('data-fuse-week'): labels[1]='Coursework implementation'
        for label,body in zip(labels,paragraphs):
            p=soup.new_tag('p')
            strong=soup.new_tag('strong');strong.string=label
            p.append(strong);p.append(' '+body);story.append(p)
        old.replace_with(story)
    assert invariants(soup)==before,'Project identity, links, tags, or proof markup changed'
    assert len(soup.select('.project-card .project-story'))==len(soup.select('details.project-card'))
    from apply_project_summaries import render_summaries
    summaries=json.loads((ROOT/'data/project-summaries.json').read_text(encoding='utf-8'))
    path.write_text(render_summaries(str(soup), summaries),encoding='utf-8')
    print(f'Updated {len(narratives)} descriptions; all project cards now have structured narratives.')


if __name__=='__main__': main()
