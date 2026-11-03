#!/usr/bin/env python3
"""
Touriva Brand Suite Generator
Generates all modern Touriva vector (SVG) and raster (PNG, WEBP, ICO) brand assets
using the Nano Banana generated symbol mark and Touriva official color palette:
  - Deep Forest Green: #173F35
  - Deep Green / Shadow: #102D27
  - Warm Ivory: #FAF8F2
  - Sand Gold Accent: #D9B98C
  - Emerald Accent: #21866B
"""

import os
import sys
import base64
import math
from PIL import Image, ImageDraw, ImageFilter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva')
PUBLIC_DIR = os.path.join(FRONTEND_DIR, 'public')
ICONS_DIR = os.path.join(PUBLIC_DIR, 'icons')
ASSETS_DIR = os.path.join(FRONTEND_DIR, 'src', 'assets')

PRIMARY_SYM_PATH = '/home/next/.gemini/antigravity-cli/brain/55a98dbe-c491-4b57-a8ad-47afa01d1400/extracted_symbol.png'
LIGHT_SYM_PATH = '/home/next/.gemini/antigravity-cli/brain/55a98dbe-c491-4b57-a8ad-47afa01d1400/symbol_light_for_dark_bg.png'

def read_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

b64_primary = read_b64(PRIMARY_SYM_PATH)
b64_light = read_b64(LIGHT_SYM_PATH)

sym_primary_img = Image.open(PRIMARY_SYM_PATH).convert('RGBA')
sym_light_img = Image.open(LIGHT_SYM_PATH).convert('RGBA')

# -------------------------------------------------------------
# 1. GENERATE SVGs
# -------------------------------------------------------------

# A. logo.svg (Light Background / Default)
SVG_LOGO_LIGHT = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120" width="440" height="120">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .brand-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 46px;
        font-weight: 800;
        letter-spacing: -0.6px;
      }}
      .brand-tagline {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 3.2px;
      }}
    </style>
  </defs>

  <!-- Modern Touriva Travel Tech Symbol Mark -->
  <image href="data:image/png;base64,{b64_primary}" x="16" y="16" width="88" height="88" preserveAspectRatio="xMidYMid meet"/>

  <!-- Brand Typography -->
  <g transform="translate(122, 65)">
    <text class="brand-title" fill="#173F35">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
    <text y="24" class="brand-tagline" fill="#8C7A6B" opacity="0.95">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>'''

# B. logo-dark.svg (Dark Background / Navbar / Splash)
SVG_LOGO_DARK = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 120" width="440" height="120">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .brand-title-dark {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 46px;
        font-weight: 800;
        letter-spacing: -0.6px;
      }}
      .brand-tagline-dark {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 3.2px;
      }}
    </style>
  </defs>

  <!-- Modern Touriva Travel Tech Symbol Mark (Light on Dark) -->
  <image href="data:image/png;base64,{b64_light}" x="16" y="16" width="88" height="88" preserveAspectRatio="xMidYMid meet"/>

  <!-- Brand Typography -->
  <g transform="translate(122, 65)">
    <text class="brand-title-dark" fill="#FAF8F2">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
    <text y="24" class="brand-tagline-dark" fill="#D9B98C" opacity="0.9">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>'''

# C. logo-stacked.svg (Centered Vertical Logo)
SVG_LOGO_STACKED = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .stacked-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 42px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-anchor: middle;
      }}
      .stacked-tagline {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 3px;
        text-anchor: middle;
      }}
    </style>
  </defs>

  <image href="data:image/png;base64,{b64_primary}" x="105" y="14" width="110" height="110" preserveAspectRatio="xMidYMid meet"/>

  <text x="160" y="168" class="stacked-title" fill="#173F35">
    Touri<tspan fill="#D9B98C">va</tspan>
  </text>
  <text x="160" y="196" class="stacked-tagline" fill="#8C7A6B">
    DISCOVER MORE • TRAVEL BETTER
  </text>
</svg>'''

# D. touriva-logo-compact.svg (Header Compact)
SVG_LOGO_COMPACT = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&amp;display=swap');
      .compact-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 34px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }}
    </style>
  </defs>
  <image href="data:image/png;base64,{b64_light}" x="6" y="8" width="54" height="54" preserveAspectRatio="xMidYMid meet"/>
  <g transform="translate(68, 47)">
    <text class="compact-title" fill="#FAF8F2">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
  </g>
</svg>'''

# E. symbol.svg (Square Pure Symbol)
SVG_SYMBOL = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <image href="data:image/png;base64,{b64_primary}" x="12" y="12" width="176" height="176" preserveAspectRatio="xMidYMid meet"/>
</svg>'''

# F. favicon.svg (Tab Favicon with Squircle Badge)
SVG_FAVICON = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="16" fill="#173F35"/>
  <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#D9B98C" stroke-width="1.5" stroke-opacity="0.6"/>
  <image href="data:image/png;base64,{b64_light}" x="8" y="8" width="48" height="48" preserveAspectRatio="xMidYMid meet"/>
</svg>'''

# Write SVGs to public/ and src/assets/
svg_targets = [
    ('logo.svg', SVG_LOGO_LIGHT),
    ('logo-dark.svg', SVG_LOGO_DARK),
    ('logo-stacked.svg', SVG_LOGO_STACKED),
    ('touriva-logo-compact.svg', SVG_LOGO_COMPACT),
    ('symbol.svg', SVG_SYMBOL),
    ('favicon.svg', SVG_FAVICON),
]

for name, content in svg_targets:
    p_pub = os.path.join(PUBLIC_DIR, name)
    p_ast = os.path.join(ASSETS_DIR, name)
    with open(p_pub, 'w', encoding='utf-8') as f:
        f.write(content)
    with open(p_ast, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated SVG: {name}")

# -------------------------------------------------------------
# 2. GENERATE PWA ICONS & BADGES
# -------------------------------------------------------------

def create_pwa_icon(size, is_maskable=False):
    """
    Creates a premium PWA icon:
    - Forest Green gradient background (#173F35 -> #102D27)
    - Subtle gold accent border
    - Centered light symbol
    """
    img = Image.new('RGBA', (size, size), (23, 63, 53, 255))
    
    # Draw radial gradient or dark corners
    draw = ImageDraw.Draw(img)
    center = size / 2.0
    max_dist = math.sqrt(2 * (center ** 2))
    
    # Subtle dark corner shading
    for y in range(size):
        for x in range(size):
            dist = math.sqrt((x - center)**2 + (y - center)**2)
            ratio = dist / max_dist
            # Interpolate between #173F35 (23, 63, 53) and #102D27 (16, 45, 39)
            r = int(23 - (23 - 16) * ratio)
            g = int(63 - (63 - 45) * ratio)
            b = int(53 - (53 - 39) * ratio)
            img.putpixel((x, y), (r, g, b, 255))
            
    draw = ImageDraw.Draw(img)
    
    # Gold accent border for non-maskable icons
    if not is_maskable:
        margin = max(2, int(size * 0.02))
        border_width = max(1, int(size * 0.015))
        draw.rectangle(
            [margin, margin, size - margin - 1, size - margin - 1],
            outline=(217, 185, 140, 110),
            width=border_width
        )
    
    # Scale and center symbol
    # Safe zone for maskable is 60% of size; for normal is 72%
    scale_factor = 0.58 if is_maskable else 0.70
    sym_size = int(size * scale_factor)
    if sym_size % 2 != 0:
        sym_size += 1
        
    resized_sym = sym_light_img.resize((sym_size, sym_size), Image.Resampling.LANCZOS)
    offset = (size - sym_size) // 2
    img.paste(resized_sym, (offset, offset), resized_sym)
    
    return img

# Sizes to generate in public/icons/
standard_sizes = [72, 96, 128, 192, 256, 384, 512]

for s in standard_sizes:
    # Standard icon
    icon_std = create_pwa_icon(s, is_maskable=False)
    png_path = os.path.join(ICONS_DIR, f'icon-{s}.png')
    webp_path = os.path.join(ICONS_DIR, f'icon-{s}.webp')
    icon_std.save(png_path, 'PNG', optimize=True)
    icon_std.save(webp_path, 'WEBP', quality=95)
    print(f"Generated PWA icon: icon-{s}.png & .webp")
    
    # Maskable icon
    icon_mask = create_pwa_icon(s, is_maskable=True)
    m_png_path = os.path.join(ICONS_DIR, f'icon-maskable-{s}.png')
    m_webp_path = os.path.join(ICONS_DIR, f'icon-maskable-{s}.webp')
    icon_mask.save(m_png_path, 'PNG', optimize=True)
    icon_mask.save(m_webp_path, 'WEBP', quality=95)
    print(f"Generated PWA maskable icon: icon-maskable-{s}.png & .webp")

# Apple touch icon (180x180)
apple_icon = create_pwa_icon(180, is_maskable=False)
apple_icon.save(os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 'PNG', optimize=True)
apple_icon.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 'PNG', optimize=True)
print("Generated apple-touch-icon.png in icons/ and public/")

# Favicon.ico (multi-resolution 16, 32, 48)
fav_icons = [create_pwa_icon(sz, is_maskable=False) for sz in [16, 32, 48]]
fav_icons[0].save(
    os.path.join(PUBLIC_DIR, 'favicon.ico'),
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=fav_icons[1:]
)
print("Generated multi-resolution favicon.ico")

# -------------------------------------------------------------
# 3. GENERATE FULL BRAND LOGO PNGs (logo.png, touriva.png, touriva-icon.png)
# -------------------------------------------------------------

# Primary transparent symbol (512x512)
sym_512 = sym_primary_img.resize((512, 512), Image.Resampling.LANCZOS)
sym_512.save(os.path.join(PUBLIC_DIR, 'touriva-icon.png'), 'PNG', optimize=True)
sym_512.save(os.path.join(PUBLIC_DIR, 'symbol.png'), 'PNG', optimize=True)
sym_512.save(os.path.join(ASSETS_DIR, 'touriva-icon.png'), 'PNG', optimize=True)

# App icon 512 as logo.png & touriva.png in public and src/assets/
app_icon_512 = create_pwa_icon(512, is_maskable=False)
app_icon_512.save(os.path.join(PUBLIC_DIR, 'logo.png'), 'PNG', optimize=True)
app_icon_512.save(os.path.join(PUBLIC_DIR, 'touriva.png'), 'PNG', optimize=True)
app_icon_512.save(os.path.join(ASSETS_DIR, 'logo.png'), 'PNG', optimize=True)
app_icon_512.save(os.path.join(ASSETS_DIR, 'touriva.png'), 'PNG', optimize=True)
print("Generated logo.png and touriva.png in public/ and src/assets/")

# Splash Screen (src/assets/touriva-splash.png) - 1284 x 2778
splash = Image.new('RGBA', (1284, 2778), (16, 45, 39, 255))
splash_sym = sym_light_img.resize((480, 480), Image.Resampling.LANCZOS)
# Center symbol vertically slightly higher than center
splash.paste(splash_sym, ((1284 - 480) // 2, (2778 - 480) // 2 - 120), splash_sym)
splash.save(os.path.join(ASSETS_DIR, 'touriva-splash.png'), 'PNG', optimize=True)
print("Generated touriva-splash.png in src/assets/")

# Open Graph Image (public/og-image.png) - 1200 x 630
og = Image.new('RGBA', (1200, 630), (23, 63, 53, 255))
og_sym = sym_light_img.resize((260, 260), Image.Resampling.LANCZOS)
og.paste(og_sym, ((1200 - 260) // 2, 140), og_sym)
og.save(os.path.join(PUBLIC_DIR, 'og-image.png'), 'PNG', optimize=True)
print("Generated og-image.png in public/")

print("\nAll brand assets successfully generated!")
