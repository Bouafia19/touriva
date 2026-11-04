#!/usr/bin/env python3
"""
TOURIVA — GLOBAL BRANDING SUITE GENERATOR
Generates all derivative branding assets directly from the Single Source of Truth:
/home/next/next projects/touriva/frontEnd/touriva/public/logo.jpg

Requirements:
- Preserve original colors (#173F36 Forest Green background, #D9B88B Gold Emblem)
- Preserve original proportions and facets without distortion or redrawing
- Respect safe zones for PWA maskable icons, Android adaptive icons, and iOS AppIcon
- Support modern Android 12+ SplashScreen API (@drawable/splash_icon) & legacy density splash drawables
- Output browser favicons (multi-res ICO, 16, 32, 48, apple-touch-icon, SVG)
- Synchronize across all 5 frontends and mobile platforms
"""

import os
import sys
import base64
from PIL import Image, ImageDraw, ImageFilter

MASTER_LOGO_PATH = '/home/next/next projects/touriva/frontEnd/touriva/public/logo.jpg'
PROJECT_ROOT = '/home/next/next projects/touriva'

if not os.path.exists(MASTER_LOGO_PATH):
    print(f"FATAL: Master logo not found at {MASTER_LOGO_PATH}")
    sys.exit(1)

master_img = Image.open(MASTER_LOGO_PATH)
if master_img.size != (512, 512):
    print(f"WARNING: Master logo dimensions are {master_img.size}, expected (512, 512)")

BG_FOREST_GREEN = (23, 63, 54)      # #173F36
BG_DEEP_GREEN   = (16, 45, 39)      # #102D27
BG_WARM_IVORY   = (250, 248, 242)   # #FAF8F2
COLOR_SAND_GOLD = (217, 185, 140)   # #D9B98C

print(f"Loaded master logo from: {MASTER_LOGO_PATH}")
print(f"Dimensions: {master_img.size}, Format: {master_img.format}, Mode: {master_img.mode}")

# -------------------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------------------
def make_clean_logo_png(img, size=None, radius=0):
    """Returns a PNG Image of the master logo, optionally scaled and with rounded corners."""
    base = img.convert('RGBA')
    if size and size != base.size:
        base = base.resize(size, Image.Resampling.LANCZOS)
    if radius > 0:
        mask = Image.new('L', base.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle([0, 0, base.size[0], base.size[1]], radius=radius, fill=255)
        rounded = Image.new('RGBA', base.size, (0, 0, 0, 0))
        rounded.paste(base, (0, 0), mask)
        return rounded
    return base

def make_safe_zone_icon(size, safe_scale=0.72, bg_color=BG_FOREST_GREEN, radius=0):
    """
    Creates an icon on a solid background (default #173F36) with the master logo
    centered within the safe zone (safe_scale * size) so that OS masks (circle,
    squircle, rounded rect) never clip the star points.
    """
    canvas = Image.new('RGBA', (size, size), bg_color + (255,))
    logo_sz = int(round(size * safe_scale))
    if logo_sz % 2 != size % 2:
        logo_sz += 1
    scaled_logo = master_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS).convert('RGBA')
    offset = ((size - logo_sz) // 2, (size - logo_sz) // 2)
    canvas.paste(scaled_logo, offset, scaled_logo)
    
    if radius > 0:
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
        out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        out.paste(canvas, (0, 0), mask)
        return out
    return canvas

def make_adaptive_foreground(size, safe_scale=0.666):
    """
    Creates Android adaptive icon foreground layer: transparent background with the
    official logo badge centered in the 72/108dp (66.6%) safe zone.
    """
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    logo_sz = int(round(size * safe_scale))
    scaled_logo = master_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS).convert('RGBA')
    # Use rounded badge so it sits elegantly over background layer
    badge_radius = max(2, int(logo_sz * 0.12))
    mask = Image.new('L', (logo_sz, logo_sz), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, logo_sz, logo_sz], radius=badge_radius, fill=255)
    
    badge = Image.new('RGBA', (logo_sz, logo_sz), (0, 0, 0, 0))
    badge.paste(scaled_logo, (0, 0), mask)
    
    offset = ((size - logo_sz) // 2, (size - logo_sz) // 2)
    canvas.paste(badge, offset, badge)
    return canvas

def make_splash_screen(width, height, bg_color=BG_WARM_IVORY, logo_max_dim=None):
    """
    Generates centered splash screen with the official Touriva logo badge
    on a clean, complementary background.
    """
    canvas = Image.new('RGBA', (width, height), bg_color + (255,))
    if logo_max_dim is None:
        logo_max_dim = int(min(width, height) * 0.35)
    # Ensure minimum visible size and maximum ceiling
    logo_max_dim = max(120, min(logo_max_dim, 480))
    logo_max_dim = min(logo_max_dim, width - 40, height - 40)
    
    scaled_logo = master_img.resize((logo_max_dim, logo_max_dim), Image.Resampling.LANCZOS).convert('RGBA')
    radius = max(8, int(logo_max_dim * 0.12))
    mask = Image.new('L', (logo_max_dim, logo_max_dim), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, logo_max_dim, logo_max_dim], radius=radius, fill=255)
    
    badge = Image.new('RGBA', (logo_max_dim, logo_max_dim), (0, 0, 0, 0))
    badge.paste(scaled_logo, (0, 0), mask)
    
    offset = ((width - logo_max_dim) // 2, (height - logo_max_dim) // 2)
    canvas.paste(badge, offset, badge)
    return canvas

def make_og_image():
    """Generates 1200x630 OpenGraph social preview card."""
    width, height = 1200, 630
    canvas = Image.new('RGBA', (width, height), BG_FOREST_GREEN + (255,))
    draw = ImageDraw.Draw(canvas)
    
    # Left: Official Touriva Logo Badge (360x360)
    badge_size = 360
    scaled_logo = master_img.resize((badge_size, badge_size), Image.Resampling.LANCZOS).convert('RGBA')
    radius = 36
    mask = Image.new('L', (badge_size, badge_size), 0)
    d_mask = ImageDraw.Draw(mask)
    d_mask.rounded_rectangle([0, 0, badge_size, badge_size], radius=radius, fill=255)
    
    badge = Image.new('RGBA', (badge_size, badge_size), (0, 0, 0, 0))
    badge.paste(scaled_logo, (0, 0), mask)
    
    badge_x = 90
    badge_y = (height - badge_size) // 2
    canvas.paste(badge, (badge_x, badge_y), badge)
    
    # Gold decorative border around badge
    draw.rounded_rectangle([badge_x - 3, badge_y - 3, badge_x + badge_size + 3, badge_y + badge_size + 3],
                           radius=radius + 3, outline=COLOR_SAND_GOLD + (160,), width=3)
    
    return canvas

# -------------------------------------------------------------------------
# Build Base64 Master for SVGs
# -------------------------------------------------------------------------
master_png_512 = make_clean_logo_png(master_img, (512, 512))
import io
buffer = io.BytesIO()
master_png_512.save(buffer, format='PNG', optimize=True)
b64_logo_png = base64.b64encode(buffer.getvalue()).decode('utf-8')

# SVGs
SVG_SYMBOL = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,{b64_logo_png}"/>
</svg>'''

SVG_FAVICON = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <clipPath id="favClip">
    <rect width="512" height="512" rx="72" ry="72"/>
  </clipPath>
  <image width="512" height="512" clip-path="url(#favClip)" href="data:image/png;base64,{b64_logo_png}"/>
</svg>'''

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
    <clipPath id="logoClipLight">
      <rect x="16" y="16" width="88" height="88" rx="14" ry="14"/>
    </clipPath>
  </defs>

  <!-- Official Touriva Master Logo Badge -->
  <g clip-path="url(#logoClipLight)">
    <image x="16" y="16" width="88" height="88" href="data:image/png;base64,{b64_logo_png}"/>
  </g>

  <!-- Brand Typography -->
  <g transform="translate(122, 65)">
    <text class="brand-title" fill="#173F35">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
    <text y="24" class="brand-tagline" fill="#173F35" opacity="0.85">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>'''

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
    <clipPath id="logoClipDark">
      <rect x="16" y="16" width="88" height="88" rx="14" ry="14"/>
    </clipPath>
  </defs>

  <!-- Official Touriva Master Logo Badge -->
  <g clip-path="url(#logoClipDark)">
    <image x="16" y="16" width="88" height="88" href="data:image/png;base64,{b64_logo_png}"/>
  </g>

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

SVG_LOGO_STACKED = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .stacked-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-anchor: middle;
      }}
      .stacked-tagline {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2.8px;
        text-anchor: middle;
      }}
    </style>
    <clipPath id="logoClipStacked">
      <rect x="110" y="24" width="100" height="100" rx="16" ry="16"/>
    </clipPath>
  </defs>

  <!-- Official Touriva Master Logo Badge -->
  <g clip-path="url(#logoClipStacked)">
    <image x="110" y="24" width="100" height="100" href="data:image/png;base64,{b64_logo_png}"/>
  </g>

  <!-- Typography -->
  <text x="160" y="168" class="stacked-title" fill="#FAF8F2">
    Touri<tspan fill="#D9B98C">va</tspan>
  </text>
  <text x="160" y="196" class="stacked-tagline" fill="#D9B98C" opacity="0.9">
    DISCOVER MORE • TRAVEL BETTER
  </text>
</svg>'''

SVG_LOGO_COMPACT = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
      .compact-title {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.4px;
      }}
    </style>
    <clipPath id="logoClipCompact">
      <rect x="10" y="11" width="48" height="48" rx="8" ry="8"/>
    </clipPath>
  </defs>

  <!-- Official Touriva Master Logo Badge -->
  <g clip-path="url(#logoClipCompact)">
    <image x="10" y="11" width="48" height="48" href="data:image/png;base64,{b64_logo_png}"/>
  </g>

  <!-- Typography -->
  <g transform="translate(68, 45)">
    <text class="compact-title" fill="#FAF8F2">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
  </g>
</svg>'''

# -------------------------------------------------------------------------
# Asset Generation Output Dictionaries
# -------------------------------------------------------------------------
print("Generating derivative raster and vector branding assets...")

# Favicons
fav_16 = master_img.resize((16, 16), Image.Resampling.LANCZOS)
fav_32 = master_img.resize((32, 32), Image.Resampling.LANCZOS)
fav_48 = master_img.resize((48, 48), Image.Resampling.LANCZOS)
fav_apple = make_safe_zone_icon(180, safe_scale=0.75, radius=0)

# Multi-resolution ICO
ico_buffer = io.BytesIO()
fav_32.save(ico_buffer, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
ico_bytes = ico_buffer.getvalue()

# Desktop ICO (16, 24, 32, 48, 64, 128, 256)
fav_24 = master_img.resize((24, 24), Image.Resampling.LANCZOS)
fav_64 = master_img.resize((64, 64), Image.Resampling.LANCZOS)
fav_128 = master_img.resize((128, 128), Image.Resampling.LANCZOS)
fav_256 = master_img.resize((256, 256), Image.Resampling.LANCZOS)
desktop_ico_buf = io.BytesIO()
fav_256.save(desktop_ico_buf, format='ICO', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
desktop_ico_bytes = desktop_ico_buf.getvalue()

# Social OG Image
og_img = make_og_image()

# Common Web Suite files dictionary: {filename: (type, content/Image)}
common_web_files = {
    'logo.png': ('image', master_png_512),
    'touriva.png': ('image', master_png_512),
    'touriva-logo.png': ('image', master_png_512),
    'touriva-logo-256.png': ('image', fav_256),
    'touriva-icon.png': ('image', master_png_512),
    'symbol.png': ('image', master_png_512),
    'apple-touch-icon.png': ('image', fav_apple),
    'favicon-16x16.png': ('image', fav_16),
    'favicon-32x32.png': ('image', fav_32),
    'favicon-48x48.png': ('image', fav_48),
    'favicon.ico': ('bytes', ico_bytes),
    'desktop.ico': ('bytes', desktop_ico_bytes),
    'favicon.svg': ('text', SVG_FAVICON),
    'symbol.svg': ('text', SVG_SYMBOL),
    'touriva-logo.svg': ('text', SVG_SYMBOL),
    'logo.svg': ('text', SVG_LOGO_LIGHT),
    'logo-dark.svg': ('text', SVG_LOGO_DARK),
    'logo-stacked.svg': ('text', SVG_LOGO_STACKED),
    'touriva-logo-compact.svg': ('text', SVG_LOGO_COMPACT),
}

# WebP
webp_buf = io.BytesIO()
master_png_512.save(webp_buf, format='WEBP', quality=95)
common_web_files['touriva-logo.webp'] = ('bytes', webp_buf.getvalue())

def write_assets_to_dir(target_dir, files_dict):
    os.makedirs(target_dir, exist_ok=True)
    for fname, (ftype, data) in files_dict.items():
        dst = os.path.join(target_dir, fname)
        if ftype == 'image':
            data.save(dst)
        elif ftype == 'bytes':
            with open(dst, 'wb') as f:
                f.write(data)
        elif ftype == 'text':
            with open(dst, 'w', encoding='utf-8') as f:
                f.write(data)
    print(f"  ✓ Updated {len(files_dict)} assets in {target_dir}")

# -------------------------------------------------------------------------
# Distribute to Web Frontends
# -------------------------------------------------------------------------
frontend_dirs = [
    os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'public'),
    os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'src', 'assets'),
    os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva_adminPanel', 'public'),
    os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva_adminPanel', 'src', 'assets', 'icons'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_web', 'public'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_web', 'src', 'assets'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_seller_admin', 'public'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_seller_admin', 'src', 'assets', 'icons'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_admin', 'public'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_admin', 'src', 'assets', 'icons'),
    os.path.join(PROJECT_ROOT, 'branding', 'logo'),
]

print("\n--- Distributing to Web Public & Asset Directories ---")
for fdir in frontend_dirs:
    write_assets_to_dir(fdir, common_web_files)
    # Ensure logo.jpg in target matches master exactly (never modifying original master)
    dst_jpg = os.path.join(fdir, 'logo.jpg')
    if os.path.abspath(dst_jpg) != os.path.abspath(MASTER_LOGO_PATH):
        with open(MASTER_LOGO_PATH, 'rb') as fsrc, open(dst_jpg, 'wb') as fdst:
            fdst.write(fsrc.read())

# Write og-image.png to relevant public directories
og_targets = [
    os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'public', 'og-image.png'),
    os.path.join(PROJECT_ROOT, 'shop', 'frontEnd', 'touriva_shop_web', 'public', 'og-image.png'),
]
for tgt in og_targets:
    og_img.save(tgt)
    print(f"  ✓ Updated OG image: {tgt}")

# -------------------------------------------------------------------------
# PWA Icons Generation (/icons/)
# -------------------------------------------------------------------------
print("\n--- Generating PWA Icons Suite ---")
pwa_sizes = [72, 96, 128, 192, 256, 384, 512]
pwa_icons_dir = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'public', 'icons')
branding_pwa_dir = os.path.join(PROJECT_ROOT, 'branding', 'logo', 'pwa')
branding_pwa_maskable_dir = os.path.join(branding_pwa_dir, 'maskable')
os.makedirs(pwa_icons_dir, exist_ok=True)
os.makedirs(branding_pwa_dir, exist_ok=True)
os.makedirs(branding_pwa_maskable_dir, exist_ok=True)

# Also copy apple-touch-icon.png into icons/
fav_apple.save(os.path.join(pwa_icons_dir, 'apple-touch-icon.png'))

for sz in pwa_sizes:
    # Standard any icon: clean scaling
    std_icon = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
    std_icon.save(os.path.join(pwa_icons_dir, f'icon-{sz}.png'))
    std_icon.save(os.path.join(pwa_icons_dir, f'icon-{sz}x{sz}.png'))
    std_icon.save(os.path.join(pwa_icons_dir, f'icon-{sz}.webp'))
    std_icon.save(os.path.join(pwa_icons_dir, f'icon-{sz}x{sz}.webp'))
    
    std_icon.save(os.path.join(branding_pwa_dir, f'icon-{sz}.png'))
    std_icon.save(os.path.join(branding_pwa_dir, f'icon-{sz}x{sz}.png'))
    std_icon.save(os.path.join(branding_pwa_dir, f'icon-{sz}.webp'))
    std_icon.save(os.path.join(branding_pwa_dir, f'icon-{sz}x{sz}.webp'))

    # Maskable icon: 72% safe zone on #173F36 background
    mask_icon = make_safe_zone_icon(sz, safe_scale=0.72, bg_color=BG_FOREST_GREEN)
    mask_icon.save(os.path.join(pwa_icons_dir, f'icon-maskable-{sz}.png'))
    mask_icon.save(os.path.join(pwa_icons_dir, f'icon-maskable-{sz}.webp'))
    
    mask_icon.save(os.path.join(branding_pwa_maskable_dir, f'icon-maskable-{sz}.png'))
    mask_icon.save(os.path.join(branding_pwa_maskable_dir, f'icon-maskable-{sz}.webp'))
    mask_icon.save(os.path.join(branding_pwa_maskable_dir, f'maskable-icon-{sz}x{sz}.png'))
    mask_icon.save(os.path.join(branding_pwa_maskable_dir, f'maskable-icon-{sz}x{sz}.webp'))

print(f"  ✓ Generated standard and maskable PWA icons in {pwa_icons_dir}")

# -------------------------------------------------------------------------
# Android Native Launcher Icons & Splash Screens
# -------------------------------------------------------------------------
print("\n--- Generating Native Android Resources ---")
android_res_dir = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'android', 'app', 'src', 'main', 'res')

density_map = {
    'mipmap-ldpi': 36,
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

for folder, sz in density_map.items():
    mdir = os.path.join(android_res_dir, folder)
    os.makedirs(mdir, exist_ok=True)
    
    # 1. Standard launcher icon: safe zone on #173F36
    ic_std = make_safe_zone_icon(sz, safe_scale=0.78, bg_color=BG_FOREST_GREEN, radius=int(sz * 0.15))
    ic_std.save(os.path.join(mdir, 'ic_launcher.png'))
    
    # 2. Round launcher icon: circular safe zone on #173F36
    ic_round = make_safe_zone_icon(sz, safe_scale=0.75, bg_color=BG_FOREST_GREEN, radius=sz // 2)
    ic_round.save(os.path.join(mdir, 'ic_launcher_round.png'))
    
    # 3. Adaptive background: solid #173F36
    ic_bg = Image.new('RGBA', (sz, sz), BG_FOREST_GREEN + (255,))
    ic_bg.save(os.path.join(mdir, 'ic_launcher_background.png'))
    
    # 4. Adaptive foreground: emblem centered in 66.6% safe zone on transparent
    ic_fg = make_adaptive_foreground(sz, safe_scale=0.666)
    ic_fg.save(os.path.join(mdir, 'ic_launcher_foreground.png'))
    
    # Centralized branding mirror
    brand_mdir = os.path.join(PROJECT_ROOT, 'branding', 'logo', 'android', folder)
    os.makedirs(brand_mdir, exist_ok=True)
    ic_std.save(os.path.join(brand_mdir, 'ic_launcher.png'))
    ic_round.save(os.path.join(brand_mdir, 'ic_launcher_round.png'))
    ic_bg.save(os.path.join(brand_mdir, 'ic_launcher_background.png'))
    ic_fg.save(os.path.join(brand_mdir, 'ic_launcher_foreground.png'))

print("  ✓ Generated Android mipmaps across all 6 density buckets")

# Android 12+ SplashScreen Animated Icon (@drawable/splash_icon.png)
splash_icon_512 = make_safe_zone_icon(512, safe_scale=0.68, bg_color=BG_FOREST_GREEN, radius=512 // 2)
splash_icon_path = os.path.join(android_res_dir, 'drawable', 'splash_icon.png')
splash_icon_512.save(splash_icon_path)
print(f"  ✓ Generated Android 12+ splash icon: {splash_icon_path}")

# Android legacy splash screens across screen sizes & orientations
splash_specs = [
    ('drawable', 320, 480, BG_WARM_IVORY),
    ('drawable-night', 320, 480, BG_DEEP_GREEN),
    ('drawable-port-ldpi', 240, 320, BG_WARM_IVORY),
    ('drawable-port-night-ldpi', 240, 320, BG_DEEP_GREEN),
    ('drawable-land-ldpi', 320, 240, BG_WARM_IVORY),
    ('drawable-land-night-ldpi', 320, 240, BG_DEEP_GREEN),
    ('drawable-port-mdpi', 320, 480, BG_WARM_IVORY),
    ('drawable-port-night-mdpi', 320, 480, BG_DEEP_GREEN),
    ('drawable-land-mdpi', 480, 320, BG_WARM_IVORY),
    ('drawable-land-night-mdpi', 480, 320, BG_DEEP_GREEN),
    ('drawable-port-hdpi', 480, 800, BG_WARM_IVORY),
    ('drawable-port-night-hdpi', 480, 800, BG_DEEP_GREEN),
    ('drawable-land-hdpi', 800, 480, BG_WARM_IVORY),
    ('drawable-land-night-hdpi', 800, 480, BG_DEEP_GREEN),
    ('drawable-port-xhdpi', 720, 1280, BG_WARM_IVORY),
    ('drawable-port-night-xhdpi', 720, 1280, BG_DEEP_GREEN),
    ('drawable-land-xhdpi', 1280, 720, BG_WARM_IVORY),
    ('drawable-land-night-xhdpi', 1280, 720, BG_DEEP_GREEN),
    ('drawable-port-xxhdpi', 960, 1600, BG_WARM_IVORY),
    ('drawable-port-night-xxhdpi', 960, 1600, BG_DEEP_GREEN),
    ('drawable-land-xxhdpi', 1600, 960, BG_WARM_IVORY),
    ('drawable-land-night-xxhdpi', 1600, 960, BG_DEEP_GREEN),
    ('drawable-port-xxxhdpi', 1280, 1920, BG_WARM_IVORY),
    ('drawable-port-night-xxxhdpi', 1280, 1920, BG_DEEP_GREEN),
    ('drawable-land-xxxhdpi', 1920, 1280, BG_WARM_IVORY),
    ('drawable-land-night-xxxhdpi', 1920, 1280, BG_DEEP_GREEN),
]

for folder, w, h, bg in splash_specs:
    sdir = os.path.join(android_res_dir, folder)
    os.makedirs(sdir, exist_ok=True)
    sp_img = make_splash_screen(w, h, bg_color=bg)
    sp_img.save(os.path.join(sdir, 'splash.png'))

print(f"  ✓ Generated Android splash screens across all {len(splash_specs)} orientations and densities")

# Capacitor source assets (assets/)
cap_assets_dir = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'assets')
os.makedirs(cap_assets_dir, exist_ok=True)
make_safe_zone_icon(1024, safe_scale=0.75, bg_color=BG_FOREST_GREEN).save(os.path.join(cap_assets_dir, 'icon-only.png'))
make_adaptive_foreground(1024, safe_scale=0.666).save(os.path.join(cap_assets_dir, 'icon-foreground.png'))
Image.new('RGBA', (1024, 1024), BG_FOREST_GREEN + (255,)).save(os.path.join(cap_assets_dir, 'icon-background.png'))
make_splash_screen(2732, 2732, bg_color=BG_WARM_IVORY, logo_max_dim=720).save(os.path.join(cap_assets_dir, 'splash.png'))
make_splash_screen(2732, 2732, bg_color=BG_DEEP_GREEN, logo_max_dim=720).save(os.path.join(cap_assets_dir, 'splash-dark.png'))
print(f"  ✓ Updated Capacitor master assets in {cap_assets_dir}")

# -------------------------------------------------------------------------
# iOS Native AppIcon & Splash Screen
# -------------------------------------------------------------------------
print("\n--- Generating Native iOS Resources ---")
ios_app_dir = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'ios', 'App', 'App')
ios_icons_dir = os.path.join(ios_app_dir, 'Assets.xcassets', 'AppIcon.appiconset')
ios_splash_dir = os.path.join(ios_app_dir, 'Assets.xcassets', 'Splash.imageset')

if os.path.exists(ios_app_dir):
    # iOS universal 1024x1024 AppIcon (solid background, safe zone padding so iOS squircle doesn't cut star points)
    ios_icon_1024 = make_safe_zone_icon(1024, safe_scale=0.76, bg_color=BG_FOREST_GREEN)
    ios_icon_1024.save(os.path.join(ios_icons_dir, 'AppIcon-512@2x.png'))
    print(f"  ✓ Generated iOS AppIcon-512@2x.png in {ios_icons_dir}")
    
    # iOS Splash screens (2732x2732)
    ios_splash_light = make_splash_screen(2732, 2732, bg_color=BG_WARM_IVORY, logo_max_dim=720)
    ios_splash_dark  = make_splash_screen(2732, 2732, bg_color=BG_DEEP_GREEN, logo_max_dim=720)
    
    splash_filenames_light = [
        'splash-2732x2732.png',
        'Default@1x~universal~anyany.png',
        'Default@2x~universal~anyany.png',
        'Default@3x~universal~anyany.png',
        'splash-2732x2732-1.png',
        'splash-2732x2732-2.png',
    ]
    splash_filenames_dark = [
        'Default@1x~universal~anyany-dark.png',
        'Default@2x~universal~anyany-dark.png',
        'Default@3x~universal~anyany-dark.png',
    ]
    for fn in splash_filenames_light:
        ios_splash_light.save(os.path.join(ios_splash_dir, fn))
    for fn in splash_filenames_dark:
        ios_splash_dark.save(os.path.join(ios_splash_dir, fn))
    print(f"  ✓ Generated iOS launch screen assets in {ios_splash_dir}")
else:
    print("  Note: iOS App directory not present or path differs.")

print("\n--- ALL ASSETS GENERATED SUCCESSFULLY FROM MASTER LOGO ---")
