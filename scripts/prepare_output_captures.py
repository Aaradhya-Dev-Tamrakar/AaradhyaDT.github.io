"""Prepare real project outputs for browser capture; never substitute test logs.

HTML reports are copied byte-for-byte. Markdown is rendered without rewriting.
CLI transcripts contain actual command output from bounded, local example runs.
Existing populated fellowship media is frozen. No publishing or model calls.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import html
import json
import os
import shutil
import subprocess
import sys
import tempfile

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
BASE = Path('F:/Aaradhya-Dev-Tamrakar')
FUSE = Path('C:/Users/Aaradhya/Downloads/_Organized/Fuse AI Fellowship')
WORK = Path(tempfile.gettempdir())/'portfolio-output-captures'
STYLE = '''body{margin:0;background:#10100e;color:#e8e3da;font:17px/1.6 Arial,sans-serif}
main{max-width:1260px;margin:auto;padding:36px}h1{font:32px Georgia,serif;color:#d5b17a}
pre{padding:24px;background:#191a17;border:1px solid #4a4031;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font:17px/1.5 Consolas,monospace}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #494137;padding:10px;text-align:left}th{background:#28251f}a{color:#d5b17a}small{color:#aaa}img{max-width:100%}'''


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(path, args):
    result = subprocess.run(args,cwd=path,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=60,
                            env=dict(os.environ,PYTHONIOENCODING='utf-8'))
    if result.returncode:
        raise RuntimeError(result.stdout+result.stderr)
    return result.stdout+result.stderr


def page(title, body):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>{html.escape(title)}</title><style>{STYLE}</style></head><body><main>{body}</main></body></html>'


def main():
    WORK.mkdir(exist_ok=True)
    soup=BeautifulSoup((ROOT/'projects.html').read_text(encoding='utf-8'),'html.parser')
    records=[]
    ledger=ROOT/'data/output-captures.json'
    frozen=json.loads(ledger.read_text(encoding='utf-8'))['frozen_aif_assets'] if ledger.exists() else {}
    for card in soup.select('details.project-card[data-fuse-week]'):
        if ledger.exists():
            break
        img=card.select_one('.project-preview-img')
        if img:
            for p in (ROOT/img['src']).parent.glob('*'):
                if p.is_file(): frozen[p.relative_to(ROOT).as_posix()]=sha(p)
    for name,expected in frozen.items():
        assert sha(ROOT/name)==expected,'Existing AIF artifact changed: '+name

    def add(pid,slug,caption,source,repo,kind='report',name='output.html'):
        folder=ROOT/'assets/images/projects'/slug
        folder.mkdir(parents=True,exist_ok=True)
        target=folder/name
        shutil.copyfile(source,target)
        revision=run(repo,['git','rev-parse','HEAD']).strip()
        records.append(dict(id=pid,slug=slug,caption=caption,type=kind,artifact=name,
                            source_file=source.name,source_sha256=sha(source),source_revision=revision,
                            source_state='modified' if run(repo,['git','status','--porcelain']).strip() else 'clean',
                            captured_at=datetime.now(timezone.utc).isoformat()))
        return folder

    bias=BASE/'BiasAperture'
    add('p-025','biasaperture','Audit dossier generated 19 Oct 2026 · FairFace race evaluation',
        bias/'report/audit_report_val_resnet_race.html',bias)
    w16=FUSE/'M4/WK16/fuseAiF_wk16_agentic_assistant'
    md=w16/'eval/results/REPORT.md'
    # Pandoc renders the saved report verbatim; no new evaluation is implied.
    fragment=run(w16,['pandoc',str(md),'-f','gfm','-t','html'])
    rendered=WORK/'w16.html'
    rendered.write_text(page('Verified Agent — saved evaluation report',fragment),encoding='utf-8')
    folder=add('p-046','fuse-wk16','Saved agent evaluation · run 20261003_154842 · four cases',rendered,w16)
    shutil.copyfile(md,folder/'source-report.md')
    records[-1]['source_file']='eval/results/REPORT.md'
    records[-1]['source_sha256']=sha(md)
    w17=FUSE/'M5/WK17/fuseAiF_wk17_agentic_mlops'
    add('p-043','fuse-wk17','Saved agent regression report · prompt versions v1–v3',w17/'reports/agent_regression_report.html',w17)
    w18=FUSE/'M5/WK18/fuseAiF_wk18_trustworthy_ai_guardrails'
    add('p-044','fuse-wk18','Guardrail technical report · 18 Oct 2026',w18/'docs/REPORT.html',w18)

    fleet=BASE/'Fleet-Orchestrator'
    dag=WORK/'example-dag.json'
    dag.write_text(json.dumps({'tasks':[
        {'id':'inspect','duration':2,'predecessors':[]},
        {'id':'implement','duration':5,'predecessors':['inspect']},
        {'id':'document','duration':3,'predecessors':['inspect']},
        {'id':'verify','duration':2,'predecessors':['implement','document']},
        {'id':'review','duration':1,'predecessors':['verify']}]}),encoding='utf-8')
    command=['python','tools/dag_planner.py','plan',str(dag)]
    output=run(fleet,command)
    transcript=WORK/'fleet.html'
    transcript.write_text(page('Fleet Orchestrator — dependency schedule',
        '<h1>Fleet Orchestrator / CPM planner</h1><p>Local five-task example. Planning only; no jobs dispatched.</p><pre>'+html.escape(output)+'</pre>'),encoding='utf-8')
    folder=add('p-040','fleet-orchestrator','Actual CPM planner output · local example · no jobs dispatched',transcript,fleet,'command')
    shutil.copyfile(dag,folder/'example-dag.json')
    (folder/'stdout.txt').write_text(output,encoding='utf-8')
    records[-1]['command']='python tools/dag_planner.py plan example-dag.json'

    # Demonstrate snapshot/restore in a disposable sample directory, not live IDE settings.
    sync=BASE/'Agent-Customization-Sync'
    sample=WORK/'sample-config';sample.mkdir(exist_ok=True)
    (sample/'AGENTS.md').write_text('# Example project rules\n\nKeep changes scoped. Verify output before delivery.\n',encoding='utf-8')
    archives=WORK/'sample-snapshots';restored=WORK/'sample-restored'
    commands=[['python','-m','agent_customization_sync.cli','snapshot','--src',str(sample),'--snapshot-dir',str(archives),'--tag','portfolio-example'],
              ['python','-m','agent_customization_sync.cli','restore','--latest','--target',str(restored),'--snapshot-dir',str(archives),'--no-backup']]
    outputs=[run(sync,c) for c in commands]
    assert sha(sample/'AGENTS.md')==sha(restored/'AGENTS.md')
    raw='\n'.join(outputs)
    # Replace only the scratch directory path in the public transcript.
    public=raw.replace(str(WORK),'<example-workspace>')
    transcript=WORK/'sync.html'
    transcript.write_text(page('Customization Sync — snapshot and restore',
        '<h1>Customization Sync / snapshot → restore</h1><p>Actual CLI run on an isolated example configuration. Live IDE settings were not changed.</p><pre>'+html.escape(public)+'</pre><small>Temporary directory paths shortened for display.</small>'),encoding='utf-8')
    folder=add('p-041','agent-customization-sync','Actual snapshot and restore · isolated example configuration',transcript,sync,'command')
    (folder/'stdout.txt').write_text(public,encoding='utf-8')

    crypto=Path('F:/AaradhyaDT/AI')
    commands=[['python','cli.py','solve','SEND','MORE','MONEY'],
              ['python','cli.py','check','SEND','MORE','MONEY','9567','1085','10652'],
              ['python','cli.py','solve','TWO','TWO','FOUR','--all']]
    output='\n\n'.join('$ '+' '.join(c)+'\n'+run(crypto,c).strip() for c in commands)
    transcript=WORK/'crypto.html'
    transcript.write_text(page('Cryptarithmetic — solved puzzles',
        '<h1>Cryptarithmetic / solver output</h1><pre>'+html.escape(output)+'</pre>'),encoding='utf-8')
    folder=add('p-020','crypto','Actual solver run · SEND + MORE = MONEY and all TWO + TWO = FOUR solutions',transcript,crypto,'command')
    (folder/'stdout.txt').write_text(output,encoding='utf-8')

    pdf=WORK/'md2pdf-readme.pdf'
    if pdf.exists():
        add('p-029','md2pdf','PDF produced by md2pdf · README input · simple renderer',pdf,BASE/'Utility/md2pdf-desktop','pdf','output.pdf')

    (ROOT/'data/output-captures.json').write_text(json.dumps({'frozen_aif_assets':frozen,'captures':records},indent=2),encoding='utf-8')
    print(f'Prepared {len(records)} real outputs. Browser screenshots still required.')


if __name__=='__main__': main()
