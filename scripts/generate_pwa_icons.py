#!/usr/bin/env python3
"""
generate_pwa_icons.py — PWA Raster Icon Generator for AaradhyaDT.github.io
Generates standard 192x192 and 512x512 PNG icons for PWA installability and manifest compliance.
"""

import os
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "assets" / "images"

EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
]

def find_browser():
    for p in EDGE_PATHS:
        if os.path.exists(p):
            return p
    return None

def generate_icon(size: int, out_file: Path, browser_path: str):
    rx = int(size * (96 / 512))
    font_size = int(size * (200 / 512))
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: {size}px; height: {size}px; background: transparent; overflow: hidden; }}
  .icon-box {{
    width: {size}px;
    height: {size}px;
    background: #0d0e11;
    border-radius: {rx}px;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .icon-text {{
    font-family: 'Playfair Display', Georgia, serif;
    font-size: {font_size}px;
    font-weight: 400;
    color: #d4a85a;
    letter-spacing: -1px;
    user-select: none;
  }}
</style>
</head>
<body>
  <div class="icon-box">
    <div class="icon-text">ADT</div>
  </div>
</body>
</html>"""

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_content)
        temp_html = f.name

    cmd = [
        browser_path,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={size},{size}",
        "--default-background-color=00000000",
        f"--screenshot={out_file}",
        temp_html
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"Generated {out_file.name} ({size}x{size}) - {out_file.stat().st_size} bytes")
    finally:
        if os.path.exists(temp_html):
            os.remove(temp_html)

def main():
    browser = find_browser()
    if not browser:
        print("Error: Headless browser not found.")
        return 1

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    generate_icon(192, IMAGES_DIR / "icon-192.png", browser)
    generate_icon(512, IMAGES_DIR / "icon-512.png", browser)
    print("PWA icons generation complete.")
    return 0

if __name__ == "__main__":
    main()
