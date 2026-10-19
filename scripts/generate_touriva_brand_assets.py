#!/usr/bin/env python3
"""
Touriva Visual Identity Asset Generator
Produces the complete, production-ready Touriva branding family:
- Scalable vector assets (SVG): Horizontal, Stacked, Symbol, Dark, Monochrome, Favicon, Shop
- High-resolution raster assets (PNG, WEBP, JPEG):
  * Square application icons (1024, 512, 192, 128, 96, 72, 48)
  * PWA webp icons (512 down to 48)
  * Android adaptive mipmap launcher icons (ldpi through xxxhdpi, standard + round)
  * Android splash screens across all port, land, and night density variants
  * iOS AppIcon and Splash assets
  * Social / Open Graph sharing banner (1200x630)
- Distributes assets across all five frontends and mobile platforms.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------
# PALETTE DEFINITIONS (Touriva Design System)
# ---------------------------------------------------------
C_FOREST = (23, 63, 53)          # #173F35 (Primary)
C_DEEP_GREEN = (16, 45, 39)      # #102D27 (Deep Editorial Base)
C_EMERALD = (33, 134, 107)       # #21866B (Accent)
C_EMERALD_LIGHT = (13, 148, 136) # #0D9488
C_WARM_IVORY = (250, 248, 242)   # #FAF8F2 (Background)
C_SAND = (217, 185, 140)         # #D9B98C (Editorial Sand)
C_SAND_LIGHT = (245, 237, 224)   # #F5EDE0
C_SAND_DARK = (184, 149, 100)    # #B89564
C_WHITE = (255, 255, 255)
C_CHARCOAL = (15, 23, 42)        # #0F172A
C_SLATE = (100, 116, 139)        # #64748B
C_AMBER = (245, 158, 11)         # #F59E0B

# Try to find high-quality system fonts
FONT_SANS_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
if not os.path.exists(FONT_SANS_BOLD):
    FONT_SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

FONT_SERIF_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
if not os.path.exists(FONT_SERIF_BOLD):
    FONT_SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

# ---------------------------------------------------------
# SVG LOGO TEMPLATES
# ---------------------------------------------------------

SVG_PRIMARY_HORIZONTAL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" width="420" height="120">
  <defs>
    <linearGradient id="trvForestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="60%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvSandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="50%" stop-color="#D9B98C" />
      <stop offset="100%" stop-color="#B89564" />
    </linearGradient>
    <filter id="trvShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#102D27" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Emblem Badge -->
  <g transform="translate(18, 16)" filter="url(#trvShadow)">
    <rect x="0" y="0" width="88" height="88" rx="22" fill="url(#trvForestGrad)" stroke="#D9B98C" stroke-width="1.5" stroke-opacity="0.4" />
    <!-- Subtle Horizon Arc -->
    <path d="M12 68 Q44 56 76 68" stroke="#D9B98C" stroke-width="1.2" fill="none" opacity="0.35" />
    <!-- Stylized Compass / Mountain Needle -->
    <path d="M44 14 L66 66 L44 52 L22 66 Z" fill="#FAF8F2" opacity="0.96" />
    <path d="M44 14 L44 52 L66 66 Z" fill="#D9B98C" opacity="0.38" />
    <!-- Golden Accent Compass Star -->
    <polygon points="44,36 48,44 56,44 50,49 52,57 44,52 36,57 38,49 32,44 40,44" fill="url(#trvSandGrad)" />
    <circle cx="44" cy="46" r="3.5" fill="#FAF8F2" />
  </g>

  <!-- Touriva Typography -->
  <g transform="translate(126, 62)">
    <text font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#173F35" letter-spacing="-0.8">
      Touri<tspan fill="#21866B">va</tspan>
    </text>
    <text y="24" font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#8C7A6B" letter-spacing="3.2">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>"""

SVG_PRIMARY_HORIZONTAL_DARK = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" width="420" height="120">
  <defs>
    <linearGradient id="trvForestGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="60%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvSandGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="50%" stop-color="#D9B98C" />
      <stop offset="100%" stop-color="#B89564" />
    </linearGradient>
  </defs>

  <!-- Emblem Badge -->
  <g transform="translate(18, 16)">
    <rect x="0" y="0" width="88" height="88" rx="22" fill="url(#trvForestGradDark)" stroke="#D9B98C" stroke-width="1.5" stroke-opacity="0.6" />
    <path d="M12 68 Q44 56 76 68" stroke="#D9B98C" stroke-width="1.2" fill="none" opacity="0.45" />
    <path d="M44 14 L66 66 L44 52 L22 66 Z" fill="#FAF8F2" opacity="0.98" />
    <path d="M44 14 L44 52 L66 66 Z" fill="#D9B98C" opacity="0.4" />
    <polygon points="44,36 48,44 56,44 50,49 52,57 44,52 36,57 38,49 32,44 40,44" fill="url(#trvSandGradDark)" />
    <circle cx="44" cy="46" r="3.5" fill="#FAF8F2" />
  </g>

  <!-- Touriva Typography (Light for Dark Backgrounds) -->
  <g transform="translate(126, 62)">
    <text font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#FAF8F2" letter-spacing="-0.8">
      Touri<tspan fill="#D9B98C">va</tspan>
    </text>
    <text y="24" font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#D9B98C" letter-spacing="3.2" opacity="0.9">
      DISCOVER MORE • TRAVEL BETTER
    </text>
  </g>
</svg>"""

SVG_SHOP_HORIZONTAL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 120" width="450" height="120">
  <defs>
    <linearGradient id="trvShopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="60%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvShopSand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="50%" stop-color="#D9B98C" />
      <stop offset="100%" stop-color="#B89564" />
    </linearGradient>
    <filter id="trvShopShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#102D27" flood-opacity="0.2"/>
    </filter>
  </defs>

  <g transform="translate(18, 16)" filter="url(#trvShopShadow)">
    <rect x="0" y="0" width="88" height="88" rx="22" fill="url(#trvShopGrad)" stroke="#D9B98C" stroke-width="1.5" stroke-opacity="0.5" />
    <path d="M12 68 Q44 56 76 68" stroke="#D9B98C" stroke-width="1.2" fill="none" opacity="0.35" />
    <path d="M44 14 L66 66 L44 52 L22 66 Z" fill="#FAF8F2" opacity="0.96" />
    <path d="M44 14 L44 52 L66 66 Z" fill="#D9B98C" opacity="0.38" />
    <polygon points="44,36 48,44 56,44 50,49 52,57 44,52 36,57 38,49 32,44 40,44" fill="url(#trvShopSand)" />
    <circle cx="44" cy="46" r="3.5" fill="#FAF8F2" />
  </g>

  <g transform="translate(126, 62)">
    <text font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="800" fill="#173F35" letter-spacing="-0.8">
      Touriva <tspan fill="#21866B" font-weight="700">Shop</tspan>
    </text>
    <text y="24" font-family="'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#8C7A6B" letter-spacing="3.0">
      ARTISAN &amp; TRAVEL ESSENTIALS
    </text>
  </g>
</svg>"""

SVG_FAVICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <linearGradient id="trvFavForest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="60%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvFavSand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="100%" stop-color="#D9B98C" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="46" fill="url(#trvFavForest)" stroke="#D9B98C" stroke-width="2.5" stroke-opacity="0.4" />
  <!-- Subtle Horizon Curve -->
  <path d="M24 146 Q96 124 168 146" stroke="#D9B98C" stroke-width="2.2" fill="none" opacity="0.35" />
  <!-- Scaled Compass / Mountain symbol -->
  <g transform="translate(16, 12) scale(1.65)">
    <path d="M48 16 L74 72 L48 56 L22 72 Z" fill="#FAF8F2" opacity="0.98" />
    <path d="M48 16 L48 56 L74 72 Z" fill="#D9B98C" opacity="0.38" />
    <polygon points="48,38 52,46 60,46 54,51 56,59 48,54 40,59 42,51 36,46 44,46" fill="url(#trvFavSand)" />
    <circle cx="48" cy="48" r="3.5" fill="#FAF8F2" />
  </g>
</svg>"""

SVG_SYMBOL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="trvSymGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="55%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvSymSand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="100%" stop-color="#D9B98C" />
    </linearGradient>
    <filter id="trvSymShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#102D27" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="184" height="184" rx="48" fill="url(#trvSymGrad)" stroke="#D9B98C" stroke-width="2.5" stroke-opacity="0.5" filter="url(#trvSymShadow)" />
  <path d="M28 152 Q100 130 172 152" stroke="#D9B98C" stroke-width="2.2" fill="none" opacity="0.4" />
  <g transform="translate(18, 14) scale(1.72)">
    <path d="M48 16 L74 72 L48 56 L22 72 Z" fill="#FAF8F2" opacity="0.98" />
    <path d="M48 16 L48 56 L74 72 Z" fill="#D9B98C" opacity="0.4" />
    <polygon points="48,38 52,46 60,46 54,51 56,59 48,54 40,59 42,51 36,46 44,46" fill="url(#trvSymSand)" />
    <circle cx="48" cy="48" r="3.5" fill="#FAF8F2" />
  </g>
</svg>"""

SVG_COMPACT_STACKED = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="trvStkForest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21866B" />
      <stop offset="60%" stop-color="#173F35" />
      <stop offset="100%" stop-color="#102D27" />
    </linearGradient>
    <linearGradient id="trvStkSand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5EDE0" />
      <stop offset="100%" stop-color="#D9B98C" />
    </linearGradient>
  </defs>
  <!-- Centered Emblem -->
  <g transform="translate(72, 20)">
    <rect width="96" height="96" rx="24" fill="url(#trvStkForest)" stroke="#D9B98C" stroke-width="1.5" stroke-opacity="0.4" />
    <path d="M14 74 Q48 62 82 74" stroke="#D9B98C" stroke-width="1.2" fill="none" opacity="0.35" />
    <path d="M48 16 L72 72 L48 58 L24 72 Z" fill="#FAF8F2" opacity="0.96" />
    <path d="M48 16 L48 58 L72 72 Z" fill="#D9B98C" opacity="0.38" />
    <polygon points="48,38 52,46 60,46 54,51 56,59 48,54 40,59 42,51 36,46 44,46" fill="url(#trvStkSand)" />
    <circle cx="48" cy="48" r="3.5" fill="#FAF8F2" />
  </g>
  <!-- Wordmark Below -->
  <text x="120" y="160" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="34" font-weight="800" fill="#173F35" letter-spacing="-0.5">
    Touri<tspan fill="#21866B">va</tspan>
  </text>
  <text x="120" y="184" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="9.5" font-weight="700" fill="#8C7A6B" letter-spacing="2.5">
    DISCOVER MORE • TRAVEL BETTER
  </text>
</svg>"""

# ---------------------------------------------------------
# RASTER ASSET GENERATORS (Pillow)
# ---------------------------------------------------------

def draw_compass_needle(draw, cx, cy, w, h, fill_left=C_WHITE, fill_right=C_SAND, star_color=C_AMBER):
    """Draws a sharp, faceted compass needle emblem."""
    top_y = cy - h // 2
    bot_y = cy + h // 2
    notch_y = cy + h // 6
    left_x = cx - w // 2
    right_x = cx + w // 2
    
    # Left facet
    draw.polygon([(cx, top_y), (left_x, bot_y), (cx, notch_y)], fill=fill_left)
    # Right facet (shaded)
    draw.polygon([(cx, top_y), (right_x, bot_y), (cx, notch_y)], fill=fill_right)
    
    # 8-point compass star at center
    star_r = w // 4
    pts = []
    for i in range(8):
        angle = i * math.pi / 4 - math.pi / 2
        r = star_r if i % 2 == 0 else star_r * 0.45
        pts.append((cx + r * math.cos(angle), (cy - h // 16) + r * math.sin(angle)))
    draw.polygon(pts, fill=star_color)
    draw.ellipse([(cx - star_r//4, (cy - h // 16) - star_r//4), (cx + star_r//4, (cy - h // 16) + star_r//4)], fill=C_WHITE)

def draw_badge(draw, x0, y0, x1, y1, radius, fill_color, border_color=C_SAND):
    """Draws a rounded badge container with border."""
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill_color, outline=border_color, width=max(1, int((x1-x0)*0.015)))

def create_master_icon(size=1024, bg_transparent=False, bg_color=C_FOREST, badge_padding=0.08):
    """Creates high-resolution Touriva master application icon."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0) if bg_transparent else bg_color)
    draw = ImageDraw.Draw(im)
    
    pad = int(size * badge_padding)
    radius = int(size * 0.22)
    # Inner badge
    draw_badge(draw, pad, pad, size - pad, size - pad, radius, C_DEEP_GREEN, C_SAND)
    
    # Stylized horizon curve
    cx = size // 2
    cy = int(size * 0.51)
    arc_y = int(size * 0.76)
    draw.arc([pad + size*0.05, arc_y - size*0.1, size - pad - size*0.05, arc_y + size*0.1], start=185, end=355, fill=(217, 185, 140, 90), width=max(2, int(size*0.008)))
    
    # Compass needle
    needle_w = int(size * 0.46)
    needle_h = int(size * 0.56)
    draw_compass_needle(draw, cx, cy, needle_w, needle_h, fill_left=(250, 248, 242, 250), fill_right=(217, 185, 140, 180), star_color=C_SAND)
    
    return im

def create_adaptive_foreground(size=1024):
    """Creates Android adaptive icon foreground (transparent background, centered symbol)."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    cx = size // 2
    cy = size // 2
    needle_w = int(size * 0.38)
    needle_h = int(size * 0.46)
    draw_compass_needle(draw, cx, cy, needle_w, needle_h, fill_left=(250, 248, 242, 255), fill_right=(217, 185, 140, 210), star_color=C_SAND)
    return im

def create_adaptive_background(size=1024):
    """Creates Android adaptive icon background (deep forest green with subtle gradient / radial accent)."""
    im = Image.new("RGBA", (size, size), C_DEEP_GREEN)
    draw = ImageDraw.Draw(im)
    # Draw soft emerald radial glow
    for r in range(size // 2, 0, -10):
        alpha = int(35 * (1 - r / (size // 2)))
        draw.ellipse([(size//2 - r, size//2 - r), (size//2 + r, size//2 + r)], fill=(33, 134, 107, alpha))
    return im

def create_splash_screen(width, height, is_dark=False):
    """Creates high-resolution splash screen with centered Touriva brand mark and editorial typography."""
    bg = C_DEEP_GREEN if is_dark else C_WARM_IVORY
    text_color = C_WARM_IVORY if is_dark else C_FOREST
    sub_color = C_SAND if is_dark else (140, 122, 107)
    
    im = Image.new("RGBA", (width, height), bg)
    draw = ImageDraw.Draw(im)
    
    # Scale emblem relative to smaller dimension
    min_dim = min(width, height)
    badge_size = int(min_dim * 0.28)
    badge_size = max(64, min(badge_size, 400))
    
    cx = width // 2
    cy = int(height * 0.44)
    
    bx0 = cx - badge_size // 2
    by0 = cy - badge_size // 2
    bx1 = cx + badge_size // 2
    by1 = cy + badge_size // 2
    radius = int(badge_size * 0.25)
    
    badge_bg = (23, 63, 53) if is_dark else (16, 45, 39)
    draw_badge(draw, bx0, by0, bx1, by1, radius, badge_bg, C_SAND)
    
    # Compass needle inside badge
    nw = int(badge_size * 0.52)
    nh = int(badge_size * 0.62)
    draw_compass_needle(draw, cx, cy, nw, nh, fill_left=C_WHITE, fill_right=C_SAND, star_color=C_AMBER)
    
    # Typography: TOU RIVA
    font_main_size = max(18, int(min_dim * 0.055))
    font_sub_size = max(8, int(font_main_size * 0.26))
    
    font_main = get_font(FONT_SANS_BOLD, font_main_size)
    font_sub = get_font(FONT_SANS_BOLD, font_sub_size)
    
    text_y = by1 + int(min_dim * 0.04)
    brand_text = "Touriva"
    sub_text = "DISCOVER MORE • TRAVEL BETTER"
    
    # Draw centered text
    bbox_m = draw.textbbox((0, 0), brand_text, font=font_main)
    mw = bbox_m[2] - bbox_m[0]
    draw.text((cx - mw // 2, text_y), brand_text, font=font_main, fill=text_color)
    
    bbox_s = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text((cx - sw // 2, text_y + int(font_main_size * 1.25)), sub_text, font=font_sub, fill=sub_color)
    
    return im

def create_social_banner(width=1200, height=630):
    """Creates Open Graph 1200x630 social sharing card with editorial layout."""
    im = Image.new("RGBA", (width, height), C_DEEP_GREEN)
    draw = ImageDraw.Draw(im)
    
    # Decorative subtle borders
    draw.rectangle([24, 24, width - 24, height - 24], outline=(217, 185, 140, 80), width=2)
    
    # Left Emblem
    emblem_size = 220
    ex = 140
    ey = height // 2
    bx0, by0 = ex - emblem_size//2, ey - emblem_size//2
    bx1, by1 = ex + emblem_size//2, ey + emblem_size//2
    draw_badge(draw, bx0, by0, bx1, by1, radius=52, fill_color=C_FOREST, border_color=C_SAND)
    draw_compass_needle(draw, ex, ey, int(emblem_size*0.52), int(emblem_size*0.62))
    
    # Typography Right
    tx = 300
    font_tag = get_font(FONT_SANS_BOLD, 18)
    font_title = get_font(FONT_SERIF_BOLD, 74)
    font_tagline = get_font(FONT_SANS_BOLD, 26)
    font_desc = get_font(FONT_SANS_BOLD, 20)
    
    draw.text((tx, 160), "ALGERIA CURATED TRAVEL & TOURISM", font=font_tag, fill=C_SAND)
    draw.text((tx, 200), "Touriva", font=font_title, fill=C_WARM_IVORY)
    draw.text((tx, 305), "Discover More. Travel Better.", font=font_tagline, fill=C_EMERALD)
    draw.text((tx, 360), "Experience authentic Saharan expeditions, Mediterranean coastlines,", font=font_desc, fill=(200, 208, 204))
    draw.text((tx, 395), "Ottoman heritage, and boutique accommodations across Algeria.", font=font_desc, fill=(200, 208, 204))
    
    # Footer tag
    draw.line([(tx, 460), (width - 100, 460)], fill=(217, 185, 140, 100), width=1)
    draw.text((tx, 480), "touriva.com • Verified Experiences & Artisan Travel Goods", font=font_tag, fill=C_SAND)
    
    return im

def create_shop_banner(width=843, height=596):
    """Creates a clean Touriva Shop replacement for obsolete shop admin logo.jpg."""
    im = Image.new("RGBA", (width, height), C_DEEP_GREEN)
    draw = ImageDraw.Draw(im)
    
    draw.rectangle([16, 16, width - 16, height - 16], outline=(217, 185, 140, 90), width=2)
    
    # Center emblem
    cx = width // 2
    cy = int(height * 0.38)
    emblem_size = 180
    bx0, by0 = cx - emblem_size//2, cy - emblem_size//2
    bx1, by1 = cx + emblem_size//2, cy + emblem_size//2
    draw_badge(draw, bx0, by0, bx1, by1, radius=44, fill_color=C_FOREST, border_color=C_SAND)
    draw_compass_needle(draw, cx, cy, int(emblem_size*0.52), int(emblem_size*0.62))
    
    # Title & Subtitle
    font_title = get_font(FONT_SANS_BOLD, 52)
    font_sub = get_font(FONT_SANS_BOLD, 18)
    
    title_text = "Touriva Shop"
    sub_text = "COMMERCE & MERCHANT PORTAL"
    
    tb = draw.textbbox((0, 0), title_text, font=font_title)
    tw = tb[2] - tb[0]
    draw.text((cx - tw//2, by1 + 28), title_text, font=font_title, fill=C_WARM_IVORY)
    
    sb = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = sb[2] - sb[0]
    draw.text((cx - sw//2, by1 + 92), sub_text, font=font_sub, fill=C_SAND)
    
    return im

# ---------------------------------------------------------
# DISTRIBUTION MANAGER
# ---------------------------------------------------------

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def write_text(path, text):
    ensure_dir(os.path.dirname(path))
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)

def save_img(im, path, format=None, quality=95):
    ensure_dir(os.path.dirname(path))
    ext = os.path.splitext(path)[1].lower()
    if ext in [".jpg", ".jpeg"] or format == "JPEG":
        rgb = im.convert("RGB")
        rgb.save(path, "JPEG", quality=quality)
    elif ext == ".webp" or format == "WEBP":
        im.save(path, "WEBP", quality=quality)
    else:
        im.save(path, "PNG")

def main():
    print("=== Generating Touriva Visual Identity Asset Family ===")
    
    # 1. Base Master Images
    print("Creating master icons and splash screens...")
    master_icon = create_master_icon(1024, bg_transparent=False)
    master_icon_trans = create_master_icon(1024, bg_transparent=True)
    adaptive_fg = create_adaptive_foreground(1024)
    adaptive_bg = create_adaptive_background(1024)
    master_splash_light = create_splash_screen(2732, 2732, is_dark=False)
    master_splash_dark = create_splash_screen(2732, 2732, is_dark=True)
    social_banner = create_social_banner(1200, 630)
    shop_banner = create_shop_banner(843, 596)

    # 2. Capacitor Master Source Assets (frontEnd/touriva/assets/)
    cap_assets = os.path.join(ROOT, "frontEnd/touriva/assets")
    save_img(master_icon, os.path.join(cap_assets, "icon-only.png"))
    save_img(adaptive_fg, os.path.join(cap_assets, "icon-foreground.png"))
    save_img(adaptive_bg, os.path.join(cap_assets, "icon-background.png"))
    save_img(master_splash_light, os.path.join(cap_assets, "splash.png"))
    save_img(master_splash_dark, os.path.join(cap_assets, "splash-dark.png"))
    print("✓ Saved Capacitor master source assets")

    # 3. Vector SVG Assets across all 5 Frontends
    svg_destinations = [
        ("frontEnd/touriva/public", SVG_PRIMARY_HORIZONTAL, SVG_FAVICON),
        ("frontEnd/touriva/src/assets", SVG_PRIMARY_HORIZONTAL, SVG_FAVICON),
        ("frontEnd/touriva_adminPanel/public", SVG_PRIMARY_HORIZONTAL, SVG_FAVICON),
        ("frontEnd/touriva_adminPanel/src/assets/icons", SVG_PRIMARY_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_web/public", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_web/src/assets", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_admin/public", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_admin/src/assets/icons", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_seller_admin/public", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
        ("shop/frontEnd/touriva_shop_seller_admin/src/assets/icons", SVG_SHOP_HORIZONTAL, SVG_FAVICON),
    ]

    for folder, logo_svg, fav_svg in svg_destinations:
        target_dir = os.path.join(ROOT, folder)
        write_text(os.path.join(target_dir, "logo.svg"), logo_svg)
        write_text(os.path.join(target_dir, "favicon.svg"), fav_svg)
        write_text(os.path.join(target_dir, "logo-dark.svg"), SVG_PRIMARY_HORIZONTAL_DARK)
        write_text(os.path.join(target_dir, "logo-stacked.svg"), SVG_COMPACT_STACKED)
        write_text(os.path.join(target_dir, "symbol.svg"), SVG_SYMBOL)
    print("✓ Distributed complete SVG asset family across 5 frontends")

    # 4. Standard Raster Logos (512x512 logo.png, logo.jpg, touriva.png)
    icon_512 = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512_trans = master_icon_trans.resize((512, 512), Image.Resampling.LANCZOS)
    
    raster_destinations = [
        "frontEnd/touriva/public",
        "frontEnd/touriva/src/assets",
        "frontEnd/touriva_adminPanel/public",
        "frontEnd/touriva_adminPanel/src/assets/icons",
        "shop/frontEnd/touriva_shop_web/public",
        "shop/frontEnd/touriva_shop_web/src/assets",
        "shop/frontEnd/touriva_shop_admin/public",
        "shop/frontEnd/touriva_shop_admin/src/assets/icons",
        "shop/frontEnd/touriva_shop_seller_admin/public",
        "shop/frontEnd/touriva_shop_seller_admin/src/assets/icons",
    ]

    for folder in raster_destinations:
        target_dir = os.path.join(ROOT, folder)
        save_img(icon_512, os.path.join(target_dir, "logo.png"))
        save_img(icon_512, os.path.join(target_dir, "logo.jpg"))
        save_img(icon_512, os.path.join(target_dir, "touriva.png"))
    print("✓ Distributed 512x512 logo.png, logo.jpg, and touriva.png across 5 frontends")

    # 5. Overwrite obsolete shop admin public/logo.jpg with clean Touriva Shop branding banner
    save_img(shop_banner, os.path.join(ROOT, "shop/frontEnd/touriva_shop_seller_admin/public/logo.jpg"))
    save_img(shop_banner, os.path.join(ROOT, "shop/frontEnd/touriva_shop_admin/public/logo.jpg"))
    print("✓ Replaced obsolete shop admin public/logo.jpg with Touriva Shop brand banner")

    # 6. PWA Icons (frontEnd/touriva/icons/icon-*.webp)
    pwa_dir = os.path.join(ROOT, "frontEnd/touriva/icons")
    for s in [48, 72, 96, 128, 192, 256, 512]:
        resized = master_icon.resize((s, s), Image.Resampling.LANCZOS)
        save_img(resized, os.path.join(pwa_dir, f"icon-{s}.webp"))
    print("✓ Generated PWA webp icons (48px through 512px)")

    # 7. Android Mipmap Launcher Icons
    android_res = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res")
    mipmap_densities = {
        "mipmap-ldpi": 36,
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    # Circular mask for round icons
    for dname, sz in mipmap_densities.items():
        ddir = os.path.join(android_res, dname)
        # Standard icon
        std_icon = master_icon.resize((sz, sz), Image.Resampling.LANCZOS)
        save_img(std_icon, os.path.join(ddir, "ic_launcher.png"))
        
        # Round icon with circular mask
        round_icon = Image.new("RGBA", (sz, sz), (0, 0, 0, 0))
        mask = Image.new("L", (sz, sz), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, sz, sz], fill=255)
        round_icon.paste(std_icon, (0, 0), mask)
        save_img(round_icon, os.path.join(ddir, "ic_launcher_round.png"))
        
        # Adaptive foreground & background
        fg = adaptive_fg.resize((sz, sz), Image.Resampling.LANCZOS)
        bg = adaptive_bg.resize((sz, sz), Image.Resampling.LANCZOS)
        save_img(fg, os.path.join(ddir, "ic_launcher_foreground.png"))
        save_img(bg, os.path.join(ddir, "ic_launcher_background.png"))
    print("✓ Generated all 24 Android mipmap launcher icons (standard, round, adaptive)")

    # 8. Android Splash Screens across all densities and orientations
    splash_specs = [
        ("drawable", 320, 480, False),
        ("drawable-night", 320, 240, True),
        ("drawable-port-ldpi", 240, 320, False),
        ("drawable-port-mdpi", 320, 480, False),
        ("drawable-port-hdpi", 480, 800, False),
        ("drawable-port-xhdpi", 720, 1280, False),
        ("drawable-port-xxhdpi", 960, 1600, False),
        ("drawable-port-xxxhdpi", 1280, 1920, False),
        ("drawable-port-night-ldpi", 240, 320, True),
        ("drawable-port-night-mdpi", 320, 480, True),
        ("drawable-port-night-hdpi", 480, 800, True),
        ("drawable-port-night-xhdpi", 720, 1280, True),
        ("drawable-port-night-xxhdpi", 960, 1600, True),
        ("drawable-port-night-xxxhdpi", 1280, 1920, True),
        ("drawable-land-ldpi", 320, 240, False),
        ("drawable-land-mdpi", 480, 320, False),
        ("drawable-land-hdpi", 800, 480, False),
        ("drawable-land-xhdpi", 1280, 720, False),
        ("drawable-land-xxhdpi", 1600, 960, False),
        ("drawable-land-xxxhdpi", 1920, 1280, False),
        ("drawable-land-night-ldpi", 320, 240, True),
        ("drawable-land-night-mdpi", 480, 320, True),
        ("drawable-land-night-hdpi", 800, 480, True),
        ("drawable-land-night-xhdpi", 1280, 720, True),
        ("drawable-land-night-xxhdpi", 1600, 960, True),
        ("drawable-land-night-xxxhdpi", 1920, 1280, True),
    ]

    for dname, w, h, is_night in splash_specs:
        splash_im = create_splash_screen(w, h, is_dark=is_night)
        save_img(splash_im, os.path.join(android_res, dname, "splash.png"))
    print("✓ Generated all 26 Android splash screens (portrait, landscape, night modes)")

    # 9. iOS Assets
    ios_base = os.path.join(ROOT, "frontEnd/touriva/ios/App/App/Assets.xcassets")
    ios_appicon = os.path.join(ios_base, "AppIcon.appiconset")
    save_img(master_icon, os.path.join(ios_appicon, "AppIcon-512@2x.png"))

    ios_splash = os.path.join(ios_base, "Splash.imageset")
    ios_splash_files = [
        ("Default@1x~universal~anyany.png", False),
        ("Default@2x~universal~anyany.png", False),
        ("Default@3x~universal~anyany.png", False),
        ("Default@1x~universal~anyany-dark.png", True),
        ("Default@2x~universal~anyany-dark.png", True),
        ("Default@3x~universal~anyany-dark.png", True),
        ("splash-2732x2732.png", False),
        ("splash-2732x2732-1.png", False),
        ("splash-2732x2732-2.png", False),
    ]
    for fn, dark in ios_splash_files:
        im = master_splash_dark if dark else master_splash_light
        save_img(im, os.path.join(ios_splash, fn))
    print("✓ Generated iOS AppIcon and Splash.imageset assets")

    # 10. Social / OpenGraph Banner
    og_path = os.path.join(ROOT, "frontEnd/touriva/public/og-image.png")
    save_img(social_banner, og_path)
    save_img(social_banner, os.path.join(ROOT, "shop/frontEnd/touriva_shop_web/public/og-image.png"))
    print("✓ Generated Social / OpenGraph banners (1200x630)")

    # 11. Replace obsolete frontEnd/touriva/src/assets/djawal.png
    legacy_djawal_png = os.path.join(ROOT, "frontEnd/touriva/src/assets/djawal.png")
    if os.path.exists(legacy_djawal_png):
        os.remove(legacy_djawal_png)
        print("✓ Safely removed obsolete legacy asset: frontEnd/touriva/src/assets/djawal.png")
    
    # Save modern Touriva master splash in src/assets
    save_img(master_splash_light, os.path.join(ROOT, "frontEnd/touriva/src/assets/touriva-splash.png"))
    print("✓ Created master Touriva splash in frontEnd/touriva/src/assets/touriva-splash.png")

    print("\n=== Brand Asset Generation Complete! ===")

if __name__ == "__main__":
    main()
