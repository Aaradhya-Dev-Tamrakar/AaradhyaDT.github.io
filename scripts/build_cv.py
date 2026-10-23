#!/usr/bin/env python3
"""Build the public AI/ML CV from the same content as the on-site resume viewer.

Requires reportlab. The retained DOCX is a historical source; current copy lives
in assets/js/data/resume-data.js. No external services or model calls are used.
"""
import argparse
from html import escape
from io import BytesIO
import json
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/js/data/resume-data.js"
OUTPUT = ROOT / "assets/docs/AARADHYA_DEV_TAMRAKAR_CV.pdf"


def ascii_text(value):
    return (value.replace("—", "-").replace("–", "-")
            .replace("·", "|").replace("’", "'"))


def build():
    source = SOURCE.read_text(encoding="utf-8")
    match = re.search(r"const RESUME_DATA\s*=\s*(\{.*\});", source, re.S)
    if not match:
        raise ValueError("Resume data must be a JSON object assigned to RESUME_DATA")
    data = json.loads(match[1])
    ink = colors.HexColor("#17212B")
    muted = colors.HexColor("#435160")
    accent = colors.HexColor("#274C5E")
    styles = {
        "name": ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=21, leading=25, textColor=ink, spaceAfter=5),
        "role": ParagraphStyle("Role", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=accent, spaceAfter=6),
        "contact": ParagraphStyle("Contact", fontName="Helvetica", fontSize=8.3, leading=12, textColor=muted, spaceAfter=9),
        "body": ParagraphStyle("Body", fontName="Helvetica", fontSize=9.8, leading=13.3, textColor=ink, spaceAfter=4),
        "section": ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=accent, spaceBefore=11, spaceAfter=7, keepWithNext=True),
        "item": ParagraphStyle("Item", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=ink, spaceAfter=2, keepWithNext=True),
        "sub": ParagraphStyle("Sub", fontName="Helvetica", fontSize=8.8, leading=12, textColor=muted, spaceAfter=4, keepWithNext=True),
        "bullet": ParagraphStyle("Bullet", fontName="Helvetica", fontSize=9.4, leading=12.8, textColor=ink, leftIndent=9, firstLineIndent=-7, spaceAfter=3),
    }
    def p(value, style="body"):
        return Paragraph(escape(ascii_text(value)), styles[style])
    flow = [p(data["name"], "name"), p(data["subtitle"], "role")]
    flow.append(Paragraph(
        'Kathmandu, Nepal | <link href="mailto:aaradhyadevtmr@gmail.com">aaradhyadevtmr@gmail.com</link> | +977 9844602050<br/>'
        '<link href="https://aaradhyadt.github.io/">aaradhyadt.github.io</link> | '
        '<link href="https://github.com/AaradhyaDT">github.com/AaradhyaDT</link> | '
        '<link href="https://linkedin.com/in/aaradhya-dev-tamrakar">LinkedIn: aaradhya-dev-tamrakar</link>', styles["contact"]))
    flow += [HRFlowable(width="100%", thickness=.65, color=accent), Spacer(1, 9), p(data["summary"])]
    case_ids = {"BiasAperture": "p-025", "Fleet Orchestrator": "p-040", "SPARK": "p-018", "Agent-Customization-Sync": "p-041"}
    sections = data["roles"]["aiml"]["sections"]
    for section in sections:
        if section["title"] == "Fellowships":
            flow += [PageBreak(), p(data["name"], "item"), p("AI/ML Engineering | Experience and technical background", "sub")]
            flow += [p("Applied ML Coursework", "section")]
            flow += [p("ML and agent MLOps workflows", "item"),
                     p("MLflow | FastAPI | Evidently | Airflow", "sub"),
                     p("Built fellowship workflows for experiment tracking, serving, drift monitoring, and scheduled regression evaluation. Agent evaluation tracks prompts and traces; judge-model scores need separate calibration."),
                     p("Trustworthy AI guardrails", "item"),
                     p("Python | Input and output validation | Pydantic", "sub"),
                     p("Implemented coursework checks for prompt injection, sensitive information, output schema compliance, and groundedness, with a golden-case evaluation set.")]
        flow.append(p(section["title"], "section"))
        for entry in section["items"]:
            header = entry["header"]
            link = next(("https://aaradhyadt.github.io/projects.html#" + v for k, v in case_ids.items() if header.startswith(k)), None)
            heading = Paragraph('<link href="'+link+'">'+escape(ascii_text(header))+'</link>', styles["item"]) if link else p(header,"item")
            group = [heading]
            if entry.get("sub"): group.append(p(entry["sub"], "sub"))
            group.extend(p("- " + bullet, "bullet") for bullet in entry.get("bullets", []))
            group.append(Spacer(1, 5))
            flow.append(KeepTogether(group))
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=44, rightMargin=44,
                            topMargin=36, bottomMargin=37, title="Aaradhya Dev Tamrakar - AI ML Engineering CV",
                            author=data["name"], invariant=1)
    def footer(canvas, _doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(muted)
        canvas.drawString(44, 22, "AI/ML engineering | aaradhyadt.github.io")
        canvas.drawRightString(A4[0]-44, 22, str(_doc.page))
        canvas.restoreState()
    doc.build(flow, onFirstPage=footer, onLaterPages=footer)
    return buffer.getvalue()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check the public PDF against current resume content")
    args = parser.parse_args()
    pdf = build()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != pdf:
            raise SystemExit("CV PDF is stale. Run python scripts/build_cv.py")
        print("CV PDF matches current resume data.")
    else:
        OUTPUT.write_bytes(pdf)
        print(f"Built {OUTPUT.name}: {len(pdf):,} bytes")
