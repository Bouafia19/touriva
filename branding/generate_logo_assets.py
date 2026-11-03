#!/usr/bin/env python3
"""
TOURIVA Official Logo Asset Generator & Deployment Tool
======================================================
Converts the official Material Design Icons glyph `mdi-compass-rose` (U+F1382)
into a comprehensive, pixel-perfect asset suite using the exact TOURIVA
sand color (#D9B98C) extracted from the theme definition.

Preserves exact geometry, proportions, antialiasing, and transparent backgrounds.
Eliminates all legacy raster graphics across all 6 applications.
"""

import os
import shutil
import struct
from pathlib import Path

import cairosvg
from PIL import Image

# ─── Configuration ───────────────────────────────────────────────────────────
SAND_COLOR = "#D9B98C"
FOREST_GREEN = "#173F35"
DEEP_GREEN = "#102D27"
WARM_IVORY = "#FAF8F2"

SVG_PATH_D = (
    "M15 9L12 0L9 9L0 12L9 15L12 24L15 15L24 12L15 9"
    "M4 12L10 10L11 12H4"
    "M12 20L10 14L12 13V20"
    "M12 4L14 10L12 11V4"
    "M14 14L13 12H20L14 14"
    "M8.7 17.3L5 19L6.7 15.3L8.3 15.8L8.7 17.3"
    "M17.3 15.3L19 19L15.3 17.3L15.8 15.7L17.3 15.3"
    "M6.7 8.7L5 5L8.7 6.7L8.2 8.2L6.7 8.7"
    "M15.3 6.7L19 5L17.3 8.7L15.7 8.2L15.3 6.7Z"
)

ROOT_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = Path(__file__).resolve().parent / "logo"

# ─── SVG Generators ──────────────────────────────────────────────────────────

def make_svg(size, color=SAND_COLOR, padding_pct=0.0):
    """Generate standalone SVG for the compass rose at the given pixel size."""
    if padding_pct > 0:
        pad = 24 * padding_pct
        vb_min = -pad
        vb_size = 24 + 2 * pad
        viewbox = f"{vb_min} {vb_min} {vb_size} {vb_size}"
    else:
        viewbox = "0 0 24 24"

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{viewbox}">
  <path fill="{color}" d="{SVG_PATH_D}"/>
</svg>'''


def make_adaptive_foreground_svg(size, color=SAND_COLOR):
    """Generate SVG for Android adaptive icon foreground."""
    pad = (36 - 24) / 2  # 6.0
    viewbox = f"{-pad} {-pad} 36 36"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{viewbox}">
  <path fill="{color}" d="{SVG_PATH_D}"/>
</svg>'''


def make_horizontal_brand_svg(dark=True):
    """Generate official horizontal brand SVG with vector compass rose + typography."""
    title_fill = WARM_IVORY if dark else FOREST_GREEN
    tagline_fill = SAND_COLOR if dark else FOREST_GREEN
    tagline_opacity = "0.9" if dark else "0.85"
    class_suffix = "-dark" if dark else ""

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120" width="440" height="120">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .brand-title{class_suffix} {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 46px;
        font-weight: 800;
        letter-spacing: -0.6px;
      }}
      .brand-tagline{class_suffix} {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 3.2px;
      }}
    </style>
  </defs>

  <!-- Official Touriva Compass Rose Mark (Pure Vector) -->
  <g transform="translate(16, 16) scale(3.6666667)">
    <path fill="{SAND_COLOR}" d="{SVG_PATH_D}"/>
  </g>

  <!-- Brand Typography -->
  <g transform="translate(122, 65)">
    <text class="brand-title{class_suffix}" fill="{title_fill}">
      Touri<tspan fill="{SAND_COLOR}">va</tspan>
    </text>
    <text y="24" class="brand-tagline{class_suffix}" fill="{tagline_fill}" opacity="{tagline_opacity}">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>'''


def make_compact_brand_svg():
    """Generate compact navbar brand SVG."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&amp;display=swap');
      .compact-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }}
    </style>
  </defs>
  <!-- Official Touriva Compass Rose Mark (Pure Vector) -->
  <g transform="translate(10, 10) scale(2.0833333)">
    <path fill="{SAND_COLOR}" d="{SVG_PATH_D}"/>
  </g>
  <g transform="translate(70, 48)">
    <text class="compact-title" fill="{WARM_IVORY}">
      Touri<tspan fill="{SAND_COLOR}">va</tspan>
    </text>
  </g>
</svg>'''


def make_stacked_brand_svg():
    """Generate centered stacked brand SVG."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .stacked-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 42px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }}
      .stacked-tagline {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 2.8px;
      }}
    </style>
  </defs>
  <!-- Official Touriva Compass Rose Mark (Pure Vector) -->
  <g transform="translate(112, 16) scale(4)">
    <path fill="{SAND_COLOR}" d="{SVG_PATH_D}"/>
  </g>
  <g transform="translate(160, 165)" text-anchor="middle">
    <text class="stacked-title" fill="{WARM_IVORY}">
      Touri<tspan fill="{SAND_COLOR}">va</tspan>
    </text>
    <text y="24" class="stacked-tagline" fill="{SAND_COLOR}" opacity="0.9">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>'''


def svg_to_png(svg_string, output_path, width, height=None):
    """Convert SVG string to PNG using cairosvg with antialiasing."""
    if height is None:
        height = width
    png_data = cairosvg.svg2png(
        bytestring=svg_string.encode('utf-8'),
        output_width=width,
        output_height=height,
    )
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png_data)
    return png_data


def create_solid_png(output_path, width, height, color_hex):
    """Create a solid color PNG."""
    from PIL import ImageColor
    rgb = ImageColor.getrgb(color_hex)
    img = Image.new('RGBA', (width, height), (*rgb, 255))
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format='PNG')


def create_ico(png_sizes_paths, output_path):
    """Create ICO file containing multiple PNG sizes (16x16, 32x32, 48x48)."""
    images = []
    for path in png_sizes_paths:
        img = Image.open(path).convert('RGBA')
        images.append(img)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    largest = max(images, key=lambda i: i.width)
    sizes = [(img.width, img.height) for img in images]
    largest.save(output_path, format='ICO', sizes=sizes)
    print(f"  ✓ {output_path} (ICO sizes: {[f'{s[0]}x{s[1]}' for s in sizes]})")


def create_webp(png_path, output_path, quality=95):
    """Convert PNG to lossless WebP."""
    img = Image.open(png_path)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format='WEBP', quality=quality, lossless=True)


def create_jpg_logo(png_path, output_path, bg_color=FOREST_GREEN):
    """Convert transparent PNG logo to high-quality JPEG on brand background."""
    from PIL import ImageColor
    img = Image.open(png_path).convert('RGBA')
    bg_rgb = ImageColor.getrgb(bg_color)
    bg = Image.new('RGB', img.size, bg_rgb)
    bg.paste(img, (0, 0), img)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    bg.save(output_path, format='JPEG', quality=95)


# ─── Master Generation Function ──────────────────────────────────────────────

def generate_all_assets():
    BASE_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 65)
    print("TOURIVA Official Logo Asset Generator")
    print(f"Source: mdi-compass-rose (U+F1382) | Exact Sand: {SAND_COLOR}")
    print("=" * 65)

    # 1. Standalone Vector SVG & Variants
    print("\n📐 Generating Master Vector SVGs...")
    svg_path = BASE_DIR / "touriva-logo.svg"
    with open(svg_path, 'w') as f:
        f.write(make_svg(512))
    print(f"  ✓ {svg_path} (512x512 pure vector)")

    with open(BASE_DIR / "symbol.svg", 'w') as f:
        f.write(make_svg(512))
    print(f"  ✓ symbol.svg (512x512 pure vector)")

    # Horizontal Brand Marks (pure vector, NO raster base64)
    with open(BASE_DIR / "logo.svg", 'w') as f:
        f.write(make_horizontal_brand_svg(dark=False))
    print(f"  ✓ logo.svg (Light Brand Mark, Vector)")

    with open(BASE_DIR / "logo-dark.svg", 'w') as f:
        f.write(make_horizontal_brand_svg(dark=True))
    print(f"  ✓ logo-dark.svg (Dark Brand Mark, Vector)")

    with open(BASE_DIR / "logo-stacked.svg", 'w') as f:
        f.write(make_stacked_brand_svg())
    print(f"  ✓ logo-stacked.svg (Stacked Brand Mark, Vector)")

    with open(BASE_DIR / "touriva-logo-compact.svg", 'w') as f:
        f.write(make_compact_brand_svg())
    print(f"  ✓ touriva-logo-compact.svg (Compact Navbar Mark, Vector)")

    # 2. Web PNGs
    print("\n🌐 Generating Web PNG assets (transparent)...")
    web_sizes = {
        "touriva-logo.png": 512,
        "touriva-logo-256.png": 256,
        "touriva-logo-128.png": 128,
        "touriva-logo-64.png": 64,
        "touriva-logo-32.png": 32,
    }
    for filename, size in web_sizes.items():
        svg = make_svg(size)
        out = BASE_DIR / filename
        svg_to_png(svg, out, size)
        print(f"  ✓ {out.name} ({size}x{size} RGBA)")

    # High-res JPEG
    create_jpg_logo(BASE_DIR / "touriva-logo.png", BASE_DIR / "logo.jpg", FOREST_GREEN)
    print("  ✓ logo.jpg (512x512 JPEG on #173F35 background)")

    # 3. Favicon PNGs & ICO
    print("\n🔖 Generating Favicon assets...")
    favicon_sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
    }
    for filename, size in favicon_sizes.items():
        svg = make_svg(size)
        out = BASE_DIR / filename
        svg_to_png(svg, out, size)
        print(f"  ✓ {out.name} ({size}x{size} RGBA)")

    # Apple Touch Icon (180x180)
    svg_180 = make_svg(180)
    svg_to_png(svg_180, BASE_DIR / "apple-touch-icon.png", 180)
    print("  ✓ apple-touch-icon.png (180x180 RGBA)")

    # Multi-size favicon.ico (16, 32, 48)
    ico_sources = [
        BASE_DIR / "favicon-16x16.png",
        BASE_DIR / "favicon-32x32.png",
        BASE_DIR / "favicon-48x48.png",
    ]
    create_ico(ico_sources, BASE_DIR / "favicon.ico")

    # Favicon SVG (standard browser format)
    favicon_svg = make_svg(32)
    with open(BASE_DIR / "favicon.svg", 'w') as f:
        f.write(favicon_svg)
    print("  ✓ favicon.svg (32x32 vector)")

    # 4. PWA Icon Suite
    print("\n📱 Generating PWA icon suite (standard & maskable)...")
    pwa_sizes = [72, 96, 128, 192, 256, 384, 512]
    pwa_dir = BASE_DIR / "pwa"
    pwa_dir.mkdir(exist_ok=True)
    maskable_dir = pwa_dir / "maskable"
    maskable_dir.mkdir(exist_ok=True)

    for size in pwa_sizes:
        # Standard PWA icon
        svg = make_svg(size)
        svg_to_png(svg, pwa_dir / f"icon-{size}x{size}.png", size)
        svg_to_png(svg, pwa_dir / f"icon-{size}.png", size)
        create_webp(pwa_dir / f"icon-{size}x{size}.png", pwa_dir / f"icon-{size}x{size}.webp")
        create_webp(pwa_dir / f"icon-{size}.png", pwa_dir / f"icon-{size}.webp")

        # Maskable PWA icon (10% safe zone padding)
        svg_mask = make_svg(size, padding_pct=0.10)
        svg_to_png(svg_mask, maskable_dir / f"maskable-icon-{size}x{size}.png", size)
        svg_to_png(svg_mask, maskable_dir / f"icon-maskable-{size}.png", size)
        create_webp(maskable_dir / f"maskable-icon-{size}x{size}.png", maskable_dir / f"maskable-icon-{size}x{size}.webp")
        create_webp(maskable_dir / f"icon-maskable-{size}.png", maskable_dir / f"icon-maskable-{size}.webp")

    print(f"  ✓ PWA icons generated: {len(pwa_sizes)} sizes (PNG + WebP + Maskable)")

    # 5. Android Assets
    print("\n🤖 Generating Android launcher & adaptive icons...")
    svg_512 = make_svg(512)
    svg_to_png(svg_512, BASE_DIR / "ic_launcher.png", 512)
    print("  ✓ ic_launcher.png (512x512 master transparent)")

    android_densities = {
        "mipmap-ldpi": 36,
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    android_dir = BASE_DIR / "android"
    android_dir.mkdir(exist_ok=True)

    for density, size in android_densities.items():
        den_dir = android_dir / density
        den_dir.mkdir(exist_ok=True)

        # Standard icon (transparent)
        svg_icon = make_svg(size)
        svg_to_png(svg_icon, den_dir / "ic_launcher.png", size)
        svg_to_png(svg_icon, den_dir / "ic_launcher_round.png", size)

        # Adaptive foreground
        fg_svg = make_adaptive_foreground_svg(size)
        svg_to_png(fg_svg, den_dir / "ic_launcher_foreground.png", size)

        # Adaptive background
        create_solid_png(den_dir / "ic_launcher_background.png", size, size, FOREST_GREEN)

    # Adaptive XML resources
    xml_dir = android_dir / "mipmap-anydpi-v26"
    xml_dir.mkdir(exist_ok=True)

    ic_launcher_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background>
        <inset android:drawable="@mipmap/ic_launcher_background" android:inset="16.7%" />
    </background>
    <foreground>
        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="16.7%" />
    </foreground>
</adaptive-icon>
'''
    with open(xml_dir / "ic_launcher.xml", 'w') as f:
        f.write(ic_launcher_xml)
    with open(xml_dir / "ic_launcher_round.xml", 'w') as f:
        f.write(ic_launcher_xml)
    print("  ✓ Android mipmap density variants & adaptive XML generated (ldpi through xxxhdpi)")

    # 6. WebP Master
    print("\n🖼️  Generating Master WebP...")
    create_webp(BASE_DIR / "touriva-logo.png", BASE_DIR / "touriva-logo.webp")
    print("  ✓ touriva-logo.webp (512x512 lossless)")

    total_files = sum(1 for _ in BASE_DIR.rglob('*') if _.is_file())
    print("\n" + "=" * 65)
    print(f"✅ Generated {total_files} total official assets in: {BASE_DIR}")
    print("=" * 65)


# ─── Application Deployment Function ─────────────────────────────────────────

def apply_to_applications():
    """Deploy the generated official logo assets across all Touriva sub-projects."""
    print("\n" + "=" * 65)
    print("🚀 APPLYING OFFICIAL LOGO ASSETS ACROSS TOURIVA APPLICATIONS")
    print("=" * 65)

    apps = {
        "TOURIVA Web (Main Portal & PWA)": {
            "root": ROOT_DIR / "frontEnd" / "touriva",
            "copies": [
                # public root
                (BASE_DIR / "favicon.ico", "public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "public/favicon.svg"),
                (BASE_DIR / "apple-touch-icon.png", "public/apple-touch-icon.png"),
                (BASE_DIR / "touriva-logo.png", "public/touriva-logo.png"),
                (BASE_DIR / "touriva-logo-256.png", "public/touriva-logo-256.png"),
                (BASE_DIR / "touriva-logo.svg", "public/touriva-logo.svg"),
                (BASE_DIR / "touriva-logo.png", "public/logo.png"),
                (BASE_DIR / "logo.svg", "public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "public/logo-stacked.svg"),
                (BASE_DIR / "touriva-logo-compact.svg", "public/touriva-logo-compact.svg"),
                (BASE_DIR / "logo.jpg", "public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "public/touriva.png"),
                # src/assets
                (BASE_DIR / "favicon.svg", "src/assets/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/logo.png"),
                (BASE_DIR / "logo.svg", "src/assets/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "src/assets/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "src/assets/logo-stacked.svg"),
                (BASE_DIR / "touriva-logo-compact.svg", "src/assets/touriva-logo-compact.svg"),
                (BASE_DIR / "logo.jpg", "src/assets/logo.jpg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/touriva-icon.png"),
                (BASE_DIR / "touriva-logo.png", "src/assets/touriva.png"),
                (BASE_DIR / "touriva-logo.svg", "src/assets/symbol.svg"),
                # capacitor assets
                (BASE_DIR / "touriva-logo.png", "assets/icon-only.png"),
                (BASE_DIR / "touriva-logo.png", "assets/icon-foreground.png"),
                # ios mirrored public
                (BASE_DIR / "favicon.ico", "ios/App/App/public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "ios/App/App/public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "ios/App/App/public/logo.png"),
                (BASE_DIR / "logo.svg", "ios/App/App/public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "ios/App/App/public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "ios/App/App/public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "ios/App/App/public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "ios/App/App/public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "ios/App/App/public/touriva.png"),
                # android embedded web assets
                (BASE_DIR / "favicon.svg", "android/app/src/main/assets/public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "android/app/src/main/assets/public/logo.png"),
                (BASE_DIR / "logo.svg", "android/app/src/main/assets/public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "android/app/src/main/assets/public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "android/app/src/main/assets/public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "android/app/src/main/assets/public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "android/app/src/main/assets/public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "android/app/src/main/assets/public/touriva.png"),
            ]
        },
        "TOURIVA Admin Panel": {
            "root": ROOT_DIR / "frontEnd" / "touriva_adminPanel",
            "copies": [
                (BASE_DIR / "favicon.ico", "public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "public/logo.png"),
                (BASE_DIR / "touriva-logo.png", "public/touriva-logo.png"),
                (BASE_DIR / "touriva-logo.svg", "public/touriva-logo.svg"),
                (BASE_DIR / "logo.svg", "public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "public/touriva.png"),
                (BASE_DIR / "favicon.svg", "src/assets/icons/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/logo.png"),
                (BASE_DIR / "logo.svg", "src/assets/icons/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "src/assets/icons/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "src/assets/icons/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "src/assets/icons/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "src/assets/icons/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/touriva.png"),
            ]
        },
        "TOURIVA Shop Web": {
            "root": ROOT_DIR / "shop" / "frontEnd" / "touriva_shop_web",
            "copies": [
                (BASE_DIR / "favicon.ico", "public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "public/logo.png"),
                (BASE_DIR / "touriva-logo.png", "public/touriva-logo.png"),
                (BASE_DIR / "touriva-logo.svg", "public/touriva-logo.svg"),
                (BASE_DIR / "logo.svg", "public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "public/touriva.png"),
                (BASE_DIR / "favicon.svg", "src/assets/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/logo.png"),
                (BASE_DIR / "logo.svg", "src/assets/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "src/assets/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "src/assets/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "src/assets/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "src/assets/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/touriva.png"),
            ]
        },
        "TOURIVA Shop Admin": {
            "root": ROOT_DIR / "shop" / "frontEnd" / "touriva_shop_admin",
            "copies": [
                (BASE_DIR / "favicon.ico", "public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "public/logo.png"),
                (BASE_DIR / "touriva-logo.png", "public/touriva-logo.png"),
                (BASE_DIR / "touriva-logo.svg", "public/touriva-logo.svg"),
                (BASE_DIR / "logo.svg", "public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "public/touriva.png"),
                (BASE_DIR / "favicon.svg", "src/assets/icons/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/logo.png"),
                (BASE_DIR / "logo.svg", "src/assets/icons/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "src/assets/icons/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "src/assets/icons/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "src/assets/icons/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "src/assets/icons/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/touriva.png"),
            ]
        },
        "TOURIVA Shop Seller Admin": {
            "root": ROOT_DIR / "shop" / "frontEnd" / "touriva_shop_seller_admin",
            "copies": [
                (BASE_DIR / "favicon.ico", "public/favicon.ico"),
                (BASE_DIR / "favicon.svg", "public/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "public/logo.png"),
                (BASE_DIR / "touriva-logo.png", "public/touriva-logo.png"),
                (BASE_DIR / "touriva-logo.svg", "public/touriva-logo.svg"),
                (BASE_DIR / "logo.svg", "public/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "public/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "public/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "public/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "public/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "public/touriva.png"),
                (BASE_DIR / "favicon.svg", "src/assets/icons/favicon.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/logo.png"),
                (BASE_DIR / "logo.svg", "src/assets/icons/logo.svg"),
                (BASE_DIR / "logo-dark.svg", "src/assets/icons/logo-dark.svg"),
                (BASE_DIR / "logo-stacked.svg", "src/assets/icons/logo-stacked.svg"),
                (BASE_DIR / "logo.jpg", "src/assets/icons/logo.jpg"),
                (BASE_DIR / "touriva-logo.svg", "src/assets/icons/symbol.svg"),
                (BASE_DIR / "touriva-logo.png", "src/assets/icons/touriva.png"),
            ]
        },
        "TOURIVA Android Application": {
            "root": ROOT_DIR / "frontEnd" / "touriva" / "android" / "app" / "src" / "main" / "res",
            "densities": ["mipmap-ldpi", "mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"],
        }
    }

    updated_count = 0

    for app_name, config in apps.items():
        print(f"\n📦 Updating: {app_name}")
        app_root = config["root"]
        if not app_root.exists():
            print(f"  ⚠️ Path does not exist: {app_root}")
            continue

        if "copies" in config:
            for src, rel_dest in config["copies"]:
                dest = app_root / rel_dest
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dest)
                print(f"  ✓ Copied -> {rel_dest}")
                updated_count += 1

        if "densities" in config:
            for den in config["densities"]:
                den_src = BASE_DIR / "android" / den
                den_dest = app_root / den
                if den_src.exists():
                    den_dest.mkdir(parents=True, exist_ok=True)
                    for f in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png", "ic_launcher_background.png"]:
                        src_f = den_src / f
                        if src_f.exists():
                            shutil.copy2(src_f, den_dest / f)
                            print(f"  ✓ Copied Android -> {den}/{f}")
                            updated_count += 1

    # Also deploy PWA icons to frontEnd/touriva/public/icons/
    pwa_dest_dir = ROOT_DIR / "frontEnd" / "touriva" / "public" / "icons"
    pwa_dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(BASE_DIR / "apple-touch-icon.png", pwa_dest_dir / "apple-touch-icon.png")

    pwa_src_dir = BASE_DIR / "pwa"
    for f in pwa_src_dir.glob("icon-*.png"):
        shutil.copy2(f, pwa_dest_dir / f.name)
        updated_count += 1
    for f in pwa_src_dir.glob("icon-*.webp"):
        shutil.copy2(f, pwa_dest_dir / f.name)
        updated_count += 1
    for f in (pwa_src_dir / "maskable").glob("icon-maskable-*.png"):
        shutil.copy2(f, pwa_dest_dir / f.name)
        updated_count += 1
    for f in (pwa_src_dir / "maskable").glob("icon-maskable-*.webp"):
        shutil.copy2(f, pwa_dest_dir / f.name)
        updated_count += 1

    print(f"\n  ✓ Deployed full PWA icon set to: frontEnd/touriva/public/icons/")
    print("\n" + "=" * 65)
    print(f"🎉 Successfully updated {updated_count} application asset files across all 6 applications!")
    print("=" * 65)


if __name__ == "__main__":
    import sys
    generate_all_assets()
    if len(sys.argv) > 1 and sys.argv[1] == "--apply":
        apply_to_applications()
