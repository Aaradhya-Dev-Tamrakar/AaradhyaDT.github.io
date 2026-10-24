#!/usr/bin/env python3
"""
OpenGraph Social Preview Card Generator
=========================================
Generates 1200x630 OpenGraph social preview cards (SVG & HTML) for the master site,
individual projects, and specific domain tracks.

Usage:
  python scripts/generate_og_cards.py --all
  python scripts/generate_og_cards.py --card master
  python scripts/generate_og_cards.py --card project --id spark
  python scripts/generate_og_cards.py --list
  python scripts/generate_og_cards.py --dry-run
"""

import argparse
import base64
import html
import os
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "assets", "images", "og")

CARDS_DATA = [
    {
        "id": "master",
        "title": "Aaradhya Dev Tamrakar",
        "subtitle": "ML evaluation · AI workflows · Embedded ML",
        "badge": "PORTFOLIO & RESEARCH",
        "meta": "Electronics student · Kathmandu, Nepal",
        "tags": [
            "Edge AI",
            "Computer Vision",
            "Embedded Systems",
            "Robotics",
            "Web Engineering",
        ],
        "accent": "#d4a85a",
        "accent2": "#6dbfaa",
    },
    {
        "id": "spark",
        "title": "SPARK Edge-AI Wearable",
        "subtitle": "Micro-CNN INT8 with On-Device SHAP Explainability",
        "badge": "FEATURED PROJECT · HARDWARE & AI",
        "meta": "ESP32-S3 · TensorFlow Lite Micro · IMU Sensor Fusion · 42ms Inference",
        "tags": ["Edge AI", "TFLite Micro", "Explainable AI", "C++", "Hardware"],
        "accent": "#d4a85a",
        "accent2": "#fb923c",
    },
    {
        "id": "fuse-ai",
        "title": "Fuse AI Text-to-SQL & Analytics Engine",
        "subtitle": "5-Stage Agentic NL-to-SQL Pipeline with AST Verification",
        "badge": "FELLOWSHIP RESEARCH",
        "meta": "100% Spider Benchmark · PyMC Bayesian Inference · Churn ROC-AUC 0.841",
        "tags": [
            "LLM Agents",
            "Text-to-SQL",
            "Bayesian Stats",
            "Time Series",
            "FastAPI",
        ],
        "accent": "#6dbfaa",
        "accent2": "#3b82f6",
    },
    {
        "id": "gcsbr",
        "title": "GCSBR Autonomous Balancing Robot",
        "subtitle": "Dual-Loop Real-Time PID & Complementary Kalman Filter",
        "badge": "ROBOTICS & EMBEDDED SYSTEMS",
        "meta": "MPU6050 6-DOF IMU · High-Torque N20 Encoders · FreeRTOS Firmware",
        "tags": ["Robotics", "Control Systems", "PID Tuning", "C/C++", "Hardware"],
        "accent": "#10b981",
        "accent2": "#06b6d4",
    },
    {
        "id": "alpha",
        "title": "Alpha Android Super-App",
        "subtitle": "Modern Multi-Module Android Architecture & Offline Engine",
        "badge": "MOBILE & CLOUD PLATFORM",
        "meta": "Kotlin · Jetpack Compose · Coroutines/Flow · Room DB · Material 3",
        "tags": ["Android", "Kotlin", "Jetpack Compose", "Clean Architecture", "PWA"],
        "accent": "#a855f7",
        "accent2": "#ec4899",
    },
]


def embedded_webp(relative_path: str) -> str:
    """Embed local artwork so exported SVGs need no network or relative assets."""
    encoded = base64.b64encode((Path(REPO_ROOT) / relative_path).read_bytes()).decode(
        "ascii"
    )
    return f"data:image/webp;base64,{encoded}"


def render_identity_card() -> str:
    """Compose the personal introduction with one portrait and one ADT signature."""
    portrait = embedded_webp("assets/images/photo.webp")
    signature = embedded_webp("assets/images/branding/adt-gold.webp")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="identity-title">
  <title id="identity-title">Aaradhya Dev Tamrakar - electronics student building ML systems and AI workflows</title>
  <defs><clipPath id="portrait-circle"><circle cx="976" cy="285" r="148" /></clipPath></defs>
  <rect width="1200" height="630" fill="#0f0e0c" />
  <rect x="32" y="32" width="1136" height="566" rx="8" fill="none" stroke="#39352e" />
  <image href="{signature}" x="64" y="64" width="112" height="70" />
  <text x="64" y="202" fill="#d4a85a" font-family="monospace" font-size="16" letter-spacing="2">ELECTRONICS STUDENT · KATHMANDU</text>
  <text x="60" y="292" fill="#f5f1e8" font-family="Georgia, serif" font-size="70">Aaradhya Dev</text>
  <text x="60" y="372" fill="#d4a85a" font-family="Georgia, serif" font-size="70" font-style="italic">Tamrakar</text>
  <text x="64" y="436" fill="#e4ded4" font-family="Arial, sans-serif" font-size="24">Building ML systems and efficient AI workflows.</text>
  <circle cx="976" cy="285" r="156" fill="none" stroke="#d4a85a" />
  <image href="{portrait}" x="828" y="137" width="296" height="296" preserveAspectRatio="xMidYMin slice" clip-path="url(#portrait-circle)" />
  <path d="M64 500H1136" stroke="#39352e" />
  <text x="64" y="553" fill="#b5ada0" font-family="Arial, sans-serif" font-size="20">ML evaluation · AI workflows · Embedded ML</text>
  <text x="1136" y="553" text-anchor="end" fill="#d4a85a" font-family="monospace" font-size="18">aaradhyadt.github.io</text>
</svg>'''


def render_maskable_icon() -> str:
    """Keep the entire mark within the central 80-percent mask-safe circle."""
    icon = embedded_webp("assets/images/branding/adt-gold-icon-512.webp")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f0e0c" />
  <image href="{icon}" x="112" y="112" width="288" height="288" />
</svg>'''


def rasterize_identity_assets() -> None:
    """Export exact PNG sizes using installed Chrome and optional Playwright."""
    from playwright.sync_api import sync_playwright

    targets = [
        (Path(OUTPUT_DIR) / "og-master.svg", 1200, 630),
        (Path(REPO_ROOT) / "assets/images/branding/adt-maskable.svg", 512, 512),
    ]
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        try:
            for source, width, height in targets:
                page = browser.new_page(
                    viewport={"width": width, "height": height}, device_scale_factor=1
                )
                try:
                    page.set_content(
                        "<style>html,body{margin:0;overflow:hidden}</style>"
                        + source.read_text(encoding="utf-8")
                    )
                    page.wait_for_function(
                        "Array.from(document.querySelectorAll('image')).every(el => el.href.baseVal.startsWith('data:'))"
                    )
                    # Decode embedded SVG images before capturing the composition.
                    page.evaluate("""async () => {
                        await document.fonts.ready;
                        await Promise.all(Array.from(document.querySelectorAll('image'), el => {
                            const img = new Image(); img.src = el.href.baseVal; return img.decode();
                        }));
                    }""")
                    output = source.with_suffix(".png")
                    page.screenshot(path=str(output))
                    print(f"[SUCCESS] Rasterized: {output}")
                finally:
                    page.close()
        finally:
            browser.close()


def render_svg_card(data: dict[str, Any]) -> str:
    """Renders a high-resolution 1200x630 SVG OpenGraph card with cyber/engineering styling."""
    if data.get("id") == "master":
        return render_identity_card()

    title = html.escape(data["title"])
    subtitle = html.escape(data["subtitle"])
    badge = html.escape(data["badge"])
    meta = html.escape(data["meta"])
    accent = data.get("accent", "#d4a85a")
    accent2 = data.get("accent2", "#6dbfaa")
    tags = data.get("tags", [])

    tags_svg = []
    x_offset = 80
    for tag in tags:
        tag_esc = html.escape(tag)
        tag_w = len(tag) * 11 + 32
        tags_svg.append(f"""
        <g transform="translate({x_offset}, 490)">
            <rect width="{tag_w}" height="38" rx="6" fill="#161513" stroke="{accent}" stroke-opacity="0.3" stroke-width="1.5" />
            <text x="{tag_w / 2}" y="24" fill="#eeeae2" font-family="'DM Mono', monospace, sans-serif" font-size="14" font-weight="500" text-anchor="middle" letter-spacing="0.05em">{tag_esc}</text>
        </g>
        """)
        x_offset += tag_w + 14

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f0e0c" />
            <stop offset="50%" stop-color="#161513" />
            <stop offset="100%" stop-color="#090807" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="{accent}" />
            <stop offset="100%" stop-color="{accent2}" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />
        </pattern>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="30" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>

    <!-- Background Layer -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <rect width="1200" height="630" fill="url(#grid)" />

    <!-- Ambient Glow Orbs -->
    <circle cx="1100" cy="100" r="180" fill="{accent}" fill-opacity="0.08" filter="url(#glow)" />
    <circle cx="150" cy="550" r="160" fill="{accent2}" fill-opacity="0.06" filter="url(#glow)" />

    <!-- Outer Frame & Accent Border -->
    <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5" />
    <rect x="24" y="24" width="1152" height="6" fill="url(#accentGrad)" />

    <!-- Top Badge -->
    <g transform="translate(80, 85)">
        <rect width="320" height="34" rx="4" fill="{accent}" fill-opacity="0.12" stroke="{accent}" stroke-opacity="0.35" stroke-width="1.2" />
        <text x="160" y="22" fill="{accent}" font-family="'DM Mono', monospace, sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="0.15em">{badge}</text>
    </g>

    <!-- Title & Subtitle -->
    <text x="80" y="210" fill="#f8f5ee" font-family="'Playfair Display', Georgia, serif" font-size="52" font-weight="700" letter-spacing="-0.02em">{title}</text>
    <text x="80" y="280" fill="#eeeae2" font-family="'Inter', -apple-system, sans-serif" font-size="26" font-weight="400" opacity="0.9">{subtitle}</text>

    <!-- Metadata Row -->
    <text x="80" y="345" fill="#b3ada4" font-family="'Inter', -apple-system, sans-serif" font-size="19" font-weight="400">{meta}</text>

    <!-- Decorative Divider Line -->
    <line x1="80" y1="420" x2="1120" y2="420" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1" />

    <!-- Tags Row -->
    {"".join(tags_svg)}

    <!-- Watermark / Footer Domain -->
    <g transform="translate(940, 560)">
        <text x="0" y="0" fill="#b3ada4" font-family="'DM Mono', monospace, sans-serif" font-size="16" font-weight="500">aaradhyadt.github.io</text>
    </g>
</svg>
"""


def generate_cards(target_id: str | None = None, dry_run: bool = False) -> list[str]:
    """Generates OG SVG cards into the output directory."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    generated = []
    cards_to_process = [
        c for c in CARDS_DATA if target_id is None or c["id"] == target_id
    ]

    if not cards_to_process:
        print(f"[ERROR] No card found matching ID: {target_id}", file=sys.stderr)
        return []

    for card in cards_to_process:
        filename = f"og-{card['id']}.svg"
        out_path = os.path.join(OUTPUT_DIR, filename)
        svg_content = render_svg_card(card)

        if dry_run:
            print(f"[DRY RUN] Would write {len(svg_content)} bytes to: {out_path}")
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(svg_content.strip() + "\n")
            print(f"[SUCCESS] Generated: {out_path}")

        generated.append(out_path)

        if card["id"] == "master" and not dry_run:
            maskable = Path(REPO_ROOT) / "assets/images/branding/adt-maskable.svg"
            maskable.write_text(render_maskable_icon() + "\n", encoding="utf-8")
            generated.append(str(maskable))

    return generated


def main():
    parser = argparse.ArgumentParser(
        description="OpenGraph Social Preview Card Generator"
    )
    parser.add_argument(
        "--all", action="store_true", help="Generate all defined OG preview cards"
    )
    parser.add_argument(
        "--card",
        type=str,
        help="Generate a specific card by ID (e.g. master, spark, fuse-ai)",
    )
    parser.add_argument(
        "--list", action="store_true", help="List all available card templates"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview generation without writing files",
    )
    parser.add_argument(
        "--raster",
        action="store_true",
        help="Export master/social and maskable PNGs (requires Playwright and installed Chrome)",
    )

    args = parser.parse_args()
    if args.raster and (args.dry_run or args.list or args.card not in (None, "master")):
        parser.error("--raster requires master generation without --dry-run or --list")

    if args.list:
        print("\nAvailable OpenGraph Card Templates:")
        print("-----------------------------------")
        for card in CARDS_DATA:
            print(f" - ID: {card['id']:<10} | Title: {card['title']}")
        print()
        return

    if args.all:
        generate_cards(None, dry_run=args.dry_run)
    elif args.card:
        generate_cards(args.card, dry_run=args.dry_run)
    else:
        # Default: generate master card
        generate_cards("master", dry_run=args.dry_run)

    if args.raster:
        rasterize_identity_assets()


if __name__ == "__main__":
    main()
