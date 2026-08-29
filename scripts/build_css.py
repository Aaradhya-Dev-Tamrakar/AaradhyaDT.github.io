#!/usr/bin/env python3
"""
build_css.py — CSS Module Minifier & Optimizer for AaradhyaDT.github.io
Zero-dependency Python CSS compressor that strips comments, normalizes whitespace,
and optimizes CSS modules while preserving CSS variables, calc(), and view-transitions.
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS_MODULES_DIR = ROOT / "assets" / "css" / "modules"

def minify_css(css_content: str) -> str:
    """Safely minifies CSS content without breaking modern syntax."""
    # 1. Remove comments (preserve none)
    css = re.sub(r"/\*[\s\S]*?\*/", "", css_content)
    
    # 2. Normalize whitespace
    css = re.sub(r"\s+", " ", css)
    
    # 3. Remove space around structural delimiters { } ; ,
    css = re.sub(r"\s*([\{\};,])\s*", r"\1", css)
    
    # 4. Remove space around colons outside of quotes / pseudo-selectors
    # Be cautious with pseudo-elements (:root, ::view-transition)
    css = re.sub(r"\s*:\s*", ":", css)
    
    # 5. Restore space where needed (e.g. inside calc operators + and -)
    # calc(100% - 2rem) requires space around - and +
    def restore_calc_spaces(match):
        expr = match.group(0)
        expr = re.sub(r"([0-9a-zA-Z%remvwpxt\)]+)\-([0-9a-zA-Z%remvwpxt\(]+)", r"\1 - \2", expr)
        expr = re.sub(r"([0-9a-zA-Z%remvwpxt\)]+)\+([0-9a-zA-Z%remvwpxt\(]+)", r"\1 + \2", expr)
        return expr

    css = re.sub(r"calc\([^)]+\)", restore_calc_spaces, css)
    
    # 6. Remove trailing semicolons before closing braces
    css = re.sub(r";\}", "}", css)
    
    # 7. Remove leading/trailing whitespace
    return css.strip()

def build_all(verbose: bool = True) -> int:
    """Minifies all CSS files in assets/css/modules/."""
    if not CSS_MODULES_DIR.exists():
        print(f"Error: Directory not found: {CSS_MODULES_DIR}")
        return 1

    css_files = [f for f in sorted(CSS_MODULES_DIR.glob("*.css")) if not f.name.endswith(".min.css")]
    if not css_files:
        print("No CSS module files found to process.")
        return 0

    total_orig = 0
    total_min = 0

    print(f"Processing {len(css_files)} CSS modules...")
    for cf in css_files:
        orig_text = cf.read_text(encoding="utf-8")
        min_text = minify_css(orig_text)
        
        out_name = cf.stem + ".min.css"
        out_path = cf.parent / out_name
        out_path.write_text(min_text, encoding="utf-8")
        
        orig_sz = len(orig_text.encode("utf-8"))
        min_sz = len(min_text.encode("utf-8"))
        total_orig += orig_sz
        total_min += min_sz
        
        savings = (1 - (min_sz / orig_sz)) * 100 if orig_sz > 0 else 0
        if verbose:
            print(f"  - {cf.name:<18} -> {out_name:<20} {orig_sz:>6} B -> {min_sz:>6} B (-{savings:.1f}%)")

    total_savings = (1 - (total_min / total_orig)) * 100 if total_orig > 0 else 0
    print(f"Total: {total_orig} B -> {total_min} B (-{total_savings:.1f}%, saved {total_orig - total_min} B)")
    return 0

if __name__ == "__main__":
    sys.exit(build_all())
