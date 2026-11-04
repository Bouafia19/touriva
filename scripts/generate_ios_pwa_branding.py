#!/usr/bin/env python3
"""
generate_ios_pwa_branding.py
Generates all iOS PWA and Native iOS branding assets from the official master logo.
- Source of truth: frontEnd/touriva/public/logo.jpg
- apple-touch-icon suite: 180x180, 167x167, 152x152, 120x120 (RGB, no alpha, 75% safe scale)
- apple-touch-startup-image suite in public/splash/ for all iPhone & iPad devices
- Native iOS AppIcon (1024x1024) and Splash imageset (2732x2732) on solid #173F36
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

MASTER_LOGO_PATH = '/home/next/next projects/touriva/frontEnd/touriva/public/logo.jpg'
PROJECT_ROOT = '/home/next/next projects/touriva'
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'public')
SPLASH_DIR = os.path.join(PUBLIC_DIR, 'splash')
IOS_RES_DIR = os.path.join(PROJECT_ROOT, 'frontEnd', 'touriva', 'ios', 'App', 'App', 'Assets.xcassets')
BRANDING_DIR = os.path.join(PROJECT_ROOT, 'branding', 'logo')

if not os.path.exists(MASTER_LOGO_PATH):
    print(f"FATAL: Master logo not found at {MASTER_LOGO_PATH}")
    sys.exit(1)

master_img = Image.open(MASTER_LOGO_PATH)
if master_img.size != (512, 512):
    print(f"WARNING: Master logo dimensions are {master_img.size}, expected (512, 512)")

BG_FOREST_GREEN = (23, 63, 54) # #173F36
BG_DEEP_GREEN   = (16, 45, 39) # #102D27
COLOR_WHITE     = (255, 255, 255)

os.makedirs(SPLASH_DIR, exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, 'icons'), exist_ok=True)

# -------------------------------------------------------------------------
# 1. Generate Apple Touch Icons (Opaque RGB, 75% safe-scale on #173F36)
# -------------------------------------------------------------------------
print("--- 1. Generating Apple Touch Icons ---")

def make_apple_touch_icon(size, safe_scale=0.75):
    canvas = Image.new('RGB', (size, size), BG_FOREST_GREEN)
    logo_sz = int(round(size * safe_scale))
    if logo_sz % 2 != size % 2:
        logo_sz += 1
    scaled = master_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS).convert('RGB')
    offset = ((size - logo_sz) // 2, (size - logo_sz) // 2)
    canvas.paste(scaled, offset)
    return canvas

apple_sizes = {
    'apple-touch-icon.png': 180,
    'apple-touch-icon-180x180.png': 180,
    'apple-touch-icon-167x167.png': 167,
    'apple-touch-icon-152x152.png': 152,
    'apple-touch-icon-120x120.png': 120,
}

for fname, sz in apple_sizes.items():
    icon = make_apple_touch_icon(sz, 0.75)
    # Save to public/
    icon.save(os.path.join(PUBLIC_DIR, fname), 'PNG')
    # Save to public/icons/
    icon.save(os.path.join(PUBLIC_DIR, 'icons', fname), 'PNG')
    # Save to branding/logo/
    icon.save(os.path.join(BRANDING_DIR, fname), 'PNG')
    print(f"  ✓ Generated {fname} ({sz}x{sz} RGB)")

# Also copy standard apple-touch-icon.png into frontEnd/touriva/public/icons/apple-touch-icon.png
icon180 = make_apple_touch_icon(180, 0.75)
icon180.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 'PNG')
icon180.save(os.path.join(PUBLIC_DIR, 'icons', 'apple-touch-icon.png'), 'PNG')

# -------------------------------------------------------------------------
# 2. Generate iOS PWA Startup Images (apple-touch-startup-image)
# -------------------------------------------------------------------------
print("\n--- 2. Generating iOS PWA Startup Images ---")

FONT_PATH = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

def make_ios_startup_image(width, height, emblem_ratio=0.28, is_tablet=False):
    canvas = Image.new('RGB', (width, height), BG_FOREST_GREEN)
    
    # Emblem size relative to smaller dimension
    base_dim = min(width, height)
    emblem_sz = int(base_dim * emblem_ratio)
    scaled_emblem = master_img.resize((emblem_sz, emblem_sz), Image.Resampling.LANCZOS).convert('RGB')
    
    emblem_x = (width - emblem_sz) // 2
    # Slightly above center (4% of height offset) for visual balance on mobile
    emblem_y = (height - emblem_sz) // 2 - int(height * 0.03)
    canvas.paste(scaled_emblem, (emblem_x, emblem_y))
    
    # Typography: 'Touriva'
    font_size = max(24, int(base_dim * (0.05 if not is_tablet else 0.04)))
    try:
        font = ImageFont.truetype(FONT_PATH, font_size)
    except:
        font = ImageFont.load_default()
        
    draw = ImageDraw.Draw(canvas)
    text = "Touriva"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    text_x = (width - tw) // 2
    text_y = emblem_y + emblem_sz + int(height * 0.02)
    
    draw.text((text_x, text_y), text, fill=COLOR_WHITE, font=font)
    return canvas

# Standard iOS Device Resolutions (width, height, emblem_ratio, is_tablet)
ios_resolutions = [
    ('apple-splash-1290-2796.png', 1290, 2796, 0.30, False), # iPhone 16/15/14 Pro Max
    ('apple-splash-1179-2556.png', 1179, 2556, 0.30, False), # iPhone 16/15/14 Pro
    ('apple-splash-1284-2778.png', 1284, 2778, 0.30, False), # iPhone 14/13/12 Pro Max, Plus
    ('apple-splash-1170-2532.png', 1170, 2532, 0.30, False), # iPhone 15/14/13/12, Pro
    ('apple-splash-1125-2436.png', 1125, 2436, 0.30, False), # iPhone 13 mini, 12 mini, 11 Pro, X/XS
    ('apple-splash-828-1792.png',   828, 1792, 0.30, False), # iPhone 11, XR
    ('apple-splash-1242-2688.png', 1242, 2688, 0.30, False), # iPhone 11 Pro Max, XS Max
    ('apple-splash-1242-2208.png', 1242, 2208, 0.30, False), # iPhone 8 Plus, 7 Plus, 6s Plus
    ('apple-splash-750-1334.png',   750, 1334, 0.30, False), # iPhone SE 2/3, 8, 7, 6s
    ('apple-splash-2048-2732.png', 2048, 2732, 0.25, True),  # iPad Pro 12.9"
    ('apple-splash-1668-2388.png', 1668, 2388, 0.25, True),  # iPad Pro 11"
    ('apple-splash-1640-2360.png', 1640, 2360, 0.25, True),  # iPad Air 10.9", iPad 10th
    ('apple-splash-1620-2160.png', 1620, 2160, 0.25, True),  # iPad 10.2"
    ('apple-splash-1488-2266.png', 1488, 2266, 0.25, True),  # iPad mini 6th
    ('apple-splash-universal.png', 2048, 2732, 0.25, True),  # Universal Fallback
]

for filename, w, h, ratio, is_tab in ios_resolutions:
    img = make_ios_startup_image(w, h, ratio, is_tab)
    dest_path = os.path.join(SPLASH_DIR, filename)
    img.save(dest_path, 'PNG', optimize=True)
    print(f"  ✓ Generated {filename} ({w}x{h})")

# -------------------------------------------------------------------------
# 3. Native iOS App Assets (Assets.xcassets)
# -------------------------------------------------------------------------
print("\n--- 3. Updating Native iOS Assets (Assets.xcassets) ---")

appicon_path = os.path.join(IOS_RES_DIR, 'AppIcon.appiconset', 'AppIcon-512@2x.png')
native_appicon = make_apple_touch_icon(1024, 0.75)
native_appicon.save(appicon_path, 'PNG')
print(f"  ✓ Updated Native AppIcon-512@2x.png (1024x1024 RGB)")

splash_native_dir = os.path.join(IOS_RES_DIR, 'Splash.imageset')

# Universal 2732x2732 on solid #173F36
native_splash_light = make_ios_startup_image(2732, 2732, 0.24, True)
native_splash_dark  = make_ios_startup_image(2732, 2732, 0.24, True)

# Update light splash images
for f in ['Default@1x~universal~anyany.png', 'Default@2x~universal~anyany.png', 'Default@3x~universal~anyany.png',
          'splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']:
    native_splash_light.save(os.path.join(splash_native_dir, f), 'PNG', optimize=True)
    print(f"  ✓ Updated Native Splash (light): {f}")

# Update dark splash images
for f in ['Default@1x~universal~anyany-dark.png', 'Default@2x~universal~anyany-dark.png', 'Default@3x~universal~anyany-dark.png']:
    native_splash_dark.save(os.path.join(splash_native_dir, f), 'PNG', optimize=True)
    print(f"  ✓ Updated Native Splash (dark): {f}")

print("\nAll iOS PWA & Native branding assets successfully generated!")
