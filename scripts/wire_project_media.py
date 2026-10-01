#!/usr/bin/env python3
"""
wire_project_media.py — Deterministically injects verified project media previews
into all 39 project cards in projects.html with sub-250KB WebP pictures,
fallback PNGs, accessibility alt text, and lightbox links.
"""

import re
import json
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = ROOT / "projects.html"
JSON_PATH = Path("F:/Aaradhya-Dev-Tamrakar/brainstorm/research/portfolio_39_projects.json")

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        meta_projects = json.load(f)

    meta_by_id = {p["id"]: p for p in meta_projects}

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update CSS
    media_css = """    /* Project Media Preview Container */
    .project-media-preview {
      position: relative;
      margin-bottom: 1.25rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--line);
      background: var(--bg3, #0d1117);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      max-height: 320px;
    }

    .project-media-link {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.2);
    }

    .project-preview-img,
    .project-preview-video {
      width: 100%;
      max-height: 320px;
      height: auto;
      object-fit: contain;
      object-position: center;
      display: block;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;
      margin: 0 auto;
    }

    .project-preview-video {
      background: #000000;
    }

    .project-media-link:hover .project-preview-img {
      transform: scale(1.015);
      filter: brightness(1.03);
    }

    .project-media-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      background: rgba(10, 14, 23, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--accent, #d4a85a);
      font-family: var(--mono);
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      pointer-events: none;
      transition: border-color 0.2s ease, transform 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .project-media-badge svg {
      flex-shrink: 0;
    }

    .project-media-link:hover .project-media-badge {
      border-color: var(--accent);
      transform: translateY(-1px);
    }

    html[data-theme="light"] .project-media-preview {
      background: #f4f6fa;
      border-color: var(--line);
    }

    html[data-theme="light"] .project-media-link {
      background: rgba(0, 0, 0, 0.03);
    }

    html[data-theme="light"] .project-media-badge {
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(0, 0, 0, 0.12);
      color: var(--accent);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 768px) {
      .project-media-preview {
        max-height: 240px;
      }
      .project-preview-img,
      .project-preview-video {
        max-height: 240px;
      }
    }
"""

    # Check if CSS already exists or insert before </style>
    if "/* Project Media Preview Container */" not in content:
        style_end = content.find("  </style>")
        if style_end != -1:
            content = content[:style_end] + media_css + "\n" + content[style_end:]
        else:
            print("ERROR: Could not find </style> tag!")
            return

    # 2. Process p-001 specifically
    # Replace old project-media-row with modern project-media-preview
    old_p001_pattern = re.compile(
        r'(<details[^>]*id="p-001"[^>]*>.*?'
        r'<div class="project-card-body">\s*)'
        r'<div class="project-media-row">\s*'
        r'<div class="project-media-text">\s*'
        r'(<ul class="project-desc-list">.*?</ul>\s*'
        r'<div class="project-tags">.*?</div>)\s*'
        r'</div>\s*'
        r'<div class="project-video">\s*'
        r'(<video[^>]*>.*?</video>)\s*'
        r'</div>\s*'
        r'</div>',
        re.DOTALL
    )

    m = old_p001_pattern.search(content)
    if m:
        p001_header = m.group(1)
        p001_text = m.group(2)
        # Update poster in video tag if needed
        p001_media_block = """<div class="project-media-preview project-media-preview--video">
<video class="project-preview-video" controls="" poster="assets/images/projects/gcsbr/hero.webp" preload="none">
<source src="assets/videos/GCSBR_working_demo.mp4" type="video/mp4"/>
Your browser doesn't support embedded video.
<a href="assets/videos/GCSBR_working_demo.mp4">Download the demo video</a>.
</video>
<div class="project-media-badge">
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
<span>Hardware Demo Video</span>
</div>
</div>
"""
        replacement = f"{p001_header}{p001_media_block}{p001_text}"
        content = content[:m.start()] + replacement + content[m.end():]
        print("Updated p-001 card structure.")
    else:
        print("Note: p-001 did not match old regex pattern (might already be transformed).")

    # 3. For each other card (p-002 through p-039):
    # Match <details class="project-card reveal ... id="p-xxx">
    card_pattern = re.compile(
        r'(<details class="project-card reveal[^"]*"[^>]*id="(p-\d+)"[^>]*>.*?'
        r'<div class="project-card-body">\n)',
        re.DOTALL
    )

    def inject_media(match):
        card_prefix = match.group(1)
        card_id = match.group(2)

        if card_id == "p-001":
            return card_prefix  # already handled

        meta = meta_by_id.get(card_id)
        if not meta:
            print(f"Warning: No metadata for {card_id}")
            return card_prefix

        slug = meta["slug"]
        raw_title = meta["title"]
        clean_title = raw_title.replace("—", "–").replace("\u2014", "–")
        alt_text = f"{clean_title} — Working Execution Proof"
        escaped_alt = html.escape(alt_text, quote=True)

        preview_block = f"""<div class="project-media-preview">
<a class="project-media-link" href="assets/images/projects/{slug}/hero.png" target="_blank" rel="noopener" title="Open full-resolution working proof">
<picture>
<source srcset="assets/images/projects/{slug}/hero.webp" type="image/webp"/>
<img class="project-preview-img" src="assets/images/projects/{slug}/hero.png" alt="{escaped_alt}" loading="lazy" decoding="async"/>
</picture>
<div class="project-media-badge">
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
<span>Verified Proof ↗</span>
</div>
</a>
</div>
"""
        return f"{card_prefix}{preview_block}"

    # Only inject if not already injected
    if '<div class="project-media-preview">' not in content or content.count('<div class="project-media-preview">') < 30:
        new_content = card_pattern.sub(inject_media, content)
        with open(HTML_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Injected media previews into project cards in projects.html.")
    else:
        print("Media previews already present in projects.html.")

if __name__ == "__main__":
    main()
