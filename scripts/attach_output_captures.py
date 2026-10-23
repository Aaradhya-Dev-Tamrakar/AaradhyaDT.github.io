"""Attach reviewed project output captures to existing cards using DOM operations."""
from pathlib import Path
import hashlib
import json

from bs4 import BeautifulSoup
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent


def main():
    ledger=ROOT/'data/output-captures.json'
    data=json.loads(ledger.read_text(encoding='utf-8'))
    for name,expected in data['frozen_aif_assets'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==expected,name
    file=ROOT/'projects.html'
    soup=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
    updates={r['id'] for r in data['captures']}
    frozen={c['id']:str(c) for c in soup.select('details.project-card[data-fuse-week]')
            if c['id'] not in updates and c.select_one('.project-media-preview')}
    for record in data['captures']:
        folder=ROOT/'assets/images/projects'/record['slug']
        capture=folder/'capture.png'
        with Image.open(capture) as im:
            im.convert('RGB').save(folder/'capture.webp','WEBP',quality=90,method=6)
            width,height=im.size
        record['dimensions']=[width,height]
        record['capture_sha256']=hashlib.sha256(capture.read_bytes()).hexdigest()
        card=soup.find('details',id=record['id'])
        assert card is not None
        relative='assets/images/projects/'+record['slug']+'/'
        label='View report' if record['type'] in {'report','pdf'} else 'View output'
        block=BeautifulSoup('<div class="project-media-preview"><a class="project-media-link" target="_blank" rel="noopener"><picture><source type="image/webp"/><img class="project-preview-img" loading="lazy" decoding="async"/></picture><div class="project-media-badge"><span></span></div></a></div>','html.parser').div
        link=block.a
        link['href']=relative+record['artifact']
        link['title']='Open the full project output'
        block.source['srcset']=relative+'capture.webp'
        block.img.attrs.update(src=relative+'capture.png',alt=record['caption'],width=str(width),height=str(height))
        block.select_one('.project-media-badge span').string=label+' ↗'
        caption=soup.new_tag('p',attrs={'class':'project-desc','data-output-caption':record['id']})
        caption.string=record['caption']
        oldcaption=card.select_one('[data-output-caption]')
        if oldcaption: oldcaption.decompose()
        old=card.select_one('.project-media-preview')
        if old: old.replace_with(block)
        else: card.select_one('.project-card-body').append(block)
        block.insert_after(caption)
        (folder/'capture-meta.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
    for pid,markup in frozen.items():
        assert str(soup.find('details',id=pid))==markup,'Existing AIF card changed: '+pid
    file.write_text(str(soup),encoding='utf-8')
    ledger.write_text(json.dumps(data,indent=2),encoding='utf-8')
    print(f'Attached {len(updates)} actual outputs; preserved {len(frozen)} populated fellowship cards.')


if __name__=='__main__': main()
