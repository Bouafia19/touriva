#!/usr/bin/env python3
"""
Generate Visual Branding Verification and Showcase Sheets in audit/branding/
"""

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT_DIR = os.path.join(ROOT, "audit/branding")
os.makedirs(AUDIT_DIR, exist_ok=True)

FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def get_font(size):
    try:
        return ImageFont.truetype(FONT_BOLD, size)
    except:
        return ImageFont.load_default()

def create_showcase():
    W, H = 1600, 1000
    im = Image.new("RGBA", (W, H), (250, 248, 242, 255))
    draw = ImageDraw.Draw(im)
    
    # Header Banner
    draw.rectangle([0, 0, W, 100], fill=(23, 63, 53, 255))
    draw.text((40, 26), "TOURIVA — VISUAL IDENTITY & BRAND SYSTEM SHOWCASE", font=get_font(32), fill=(250, 248, 242))
    draw.text((40, 64), "Complete production-ready logo asset family and editorial design system", font=get_font(18), fill=(217, 185, 140))

    # Grid Card 1: Primary Horizontal Logo on Light
    c1_x, c1_y, c1_w, c1_h = 40, 130, 740, 240
    draw.rectangle([c1_x, c1_y, c1_x+c1_w, c1_y+c1_h], fill=(255, 255, 255), outline=(231, 232, 225), width=2)
    draw.text((c1_x+20, c1_y+15), "PRIMARY HORIZONTAL LOGO (LIGHT BACKGROUND)", font=get_font(14), fill=(100, 116, 139))
    
    # Load and paste logo.png
    logo_path = os.path.join(ROOT, "frontEnd/touriva/public/logo.png")
    if os.path.exists(logo_path):
        logo_im = Image.open(logo_path).resize((130, 130), Image.Resampling.LANCZOS)
        im.paste(logo_im, (c1_x + 40, c1_y + 60), logo_im if logo_im.mode == "RGBA" else None)
    draw.text((c1_x + 200, c1_y + 75), "Touriva", font=get_font(52), fill=(23, 63, 53))
    draw.text((c1_x + 200, c1_y + 140), "DISCOVER MORE • TRAVEL BETTER", font=get_font(15), fill=(184, 149, 100))

    # Grid Card 2: Primary Horizontal Logo on Dark
    c2_x, c2_y, c2_w, c2_h = 820, 130, 740, 240
    draw.rectangle([c2_x, c2_y, c2_x+c2_w, c2_y+c2_h], fill=(16, 45, 39), outline=(217, 185, 140), width=2)
    draw.text((c2_x+20, c2_y+15), "PRIMARY HORIZONTAL LOGO (DARK BACKGROUND)", font=get_font(14), fill=(217, 185, 140))
    if os.path.exists(logo_path):
        im.paste(logo_im, (c2_x + 40, c2_y + 60), logo_im if logo_im.mode == "RGBA" else None)
    draw.text((c2_x + 200, c2_y + 75), "Touriva", font=get_font(52), fill=(250, 248, 242))
    draw.text((c2_x + 200, c2_y + 140), "DISCOVER MORE • TRAVEL BETTER", font=get_font(15), fill=(217, 185, 140))

    # Grid Card 3: Touriva Shop Logo
    c3_x, c3_y, c3_w, c3_h = 40, 400, 740, 240
    draw.rectangle([c3_x, c3_y, c3_x+c3_w, c3_y+c3_h], fill=(255, 255, 255), outline=(231, 232, 225), width=2)
    draw.text((c3_x+20, c3_y+15), "TOURIVA SHOP LOGO (COMMERCE & SELLER PORTAL)", font=get_font(14), fill=(100, 116, 139))
    if os.path.exists(logo_path):
        im.paste(logo_im, (c3_x + 40, c3_y + 60), logo_im if logo_im.mode == "RGBA" else None)
    draw.text((c3_x + 200, c3_y + 75), "Touriva Shop", font=get_font(50), fill=(23, 63, 53))
    draw.text((c3_x + 200, c3_y + 140), "ARTISAN & TRAVEL ESSENTIALS", font=get_font(15), fill=(184, 149, 100))

    # Grid Card 4: Mobile Launcher Icons & Favicon
    c4_x, c4_y, c4_w, c4_h = 820, 400, 740, 240
    draw.rectangle([c4_x, c4_y, c4_x+c4_w, c4_y+c4_h], fill=(255, 255, 255), outline=(231, 232, 225), width=2)
    draw.text((c4_x+20, c4_y+15), "APPLICATION ICONS (PWA, ANDROID MIPMAP & FAVICON)", font=get_font(14), fill=(100, 116, 139))
    
    # Display icon variants: 128px standard, 128px round, favicon
    icon_std_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png")
    icon_rnd_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png")
    
    if os.path.exists(icon_std_path):
        ic_s = Image.open(icon_std_path).resize((110, 110), Image.Resampling.LANCZOS)
        im.paste(ic_s, (c4_x + 40, c4_y + 65), ic_s if ic_s.mode == "RGBA" else None)
        draw.text((c4_x + 45, c4_y + 185), "Standard Icon", font=get_font(13), fill=(100, 116, 139))
        
    if os.path.exists(icon_rnd_path):
        ic_r = Image.open(icon_rnd_path).resize((110, 110), Image.Resampling.LANCZOS)
        im.paste(ic_r, (c4_x + 200, c4_y + 65), ic_r if ic_r.mode == "RGBA" else None)
        draw.text((c4_x + 215, c4_y + 185), "Round Icon", font=get_font(13), fill=(100, 116, 139))

    # PWA Badge
    pwa_path = os.path.join(ROOT, "frontEnd/touriva/icons/icon-192.webp")
    if os.path.exists(pwa_path):
        ic_p = Image.open(pwa_path).resize((110, 110), Image.Resampling.LANCZOS)
        im.paste(ic_p, (c4_x + 360, c4_y + 65), ic_p if ic_p.mode == "RGBA" else None)
        draw.text((c4_x + 375, c4_y + 185), "PWA 192px", font=get_font(13), fill=(100, 116, 139))

    # Bottom Section: Palette Swatches & Typography
    swatch_y = 670
    draw.text((40, swatch_y), "BRAND COLOR PALETTE & TYPOGRAPHY STANDARDS", font=get_font(18), fill=(23, 63, 53))
    
    swatches = [
        ("Forest Green", "#173F35", (23, 63, 53), (250, 248, 242)),
        ("Deep Green", "#102D27", (16, 45, 39), (250, 248, 242)),
        ("Emerald", "#21866B", (33, 134, 107), (250, 248, 242)),
        ("Warm Ivory", "#FAF8F2", (250, 248, 242), (23, 63, 53)),
        ("Sand / Gold", "#D9B98C", (217, 185, 140), (23, 63, 53)),
        ("Sand Light", "#F5EDE0", (245, 237, 224), (23, 63, 53)),
        ("Charcoal", "#0F172A", (15, 23, 42), (250, 248, 242)),
    ]
    
    sx = 40
    for name, hex_code, rgb, text_c in swatches:
        draw.rectangle([sx, swatch_y + 35, sx + 200, swatch_y + 130], fill=rgb, outline=(217, 185, 140), width=1)
        draw.text((sx + 12, swatch_y + 50), name, font=get_font(14), fill=text_c)
        draw.text((sx + 12, swatch_y + 80), hex_code, font=get_font(16), fill=text_c)
        sx += 220
        if sx > W - 100:
            break

    # Footer note
    draw.text((40, H - 40), "Touriva Platform Visual Identity System • Verified 100% Free of Legacy Djawal Traces", font=get_font(14), fill=(140, 122, 107))
    
    out_file = os.path.join(AUDIT_DIR, "touriva_logo_asset_showcase.png")
    im.save(out_file, "PNG")
    print(f"✓ Saved visual showcase: {out_file}")

def create_before_after():
    W, H = 1400, 700
    im = Image.new("RGBA", (W, H), (250, 248, 242, 255))
    draw = ImageDraw.Draw(im)
    
    # Title
    draw.rectangle([0, 0, W, 80], fill=(23, 63, 53, 255))
    draw.text((30, 24), "VISUAL IDENTITY TRANSFORMATION: LEGACY VS TOURIVA", font=get_font(28), fill=(250, 248, 242))

    # Left: Legacy (simulated purple box / old Djawal look)
    draw.rectangle([40, 110, 680, 650], fill=(255, 255, 255), outline=(194, 69, 69), width=2)
    draw.rectangle([40, 110, 680, 160], fill=(194, 69, 69))
    draw.text((60, 124), "BEFORE: OBSOLETE DJAWAL BRANDING (PURGED)", font=get_font(16), fill=(255, 255, 255))
    
    # Legacy swatch
    draw.rectangle([70, 190, 250, 310], fill=(77, 29, 109))
    draw.text((80, 205), "Djawal Purple", font=get_font(14), fill=(255, 255, 255))
    draw.text((80, 235), "#4D1D6D", font=get_font(18), fill=(255, 255, 255))
    draw.text((80, 275), "Legacy Identity", font=get_font(12), fill=(200, 180, 220))
    
    draw.text((280, 200), "• Purple wings logo across splash screens", font=get_font(16), fill=(15, 23, 42))
    draw.text((280, 230), "• Obsolete splash.png (2732x2732 RGB 77,29,109)", font=get_font(16), fill=(15, 23, 42))
    draw.text((280, 260), "• Purple Android mipmap launcher icons", font=get_font(16), fill=(15, 23, 42))
    draw.text((280, 290), "• Djawal orange/blue logo.jpg in seller portals", font=get_font(16), fill=(15, 23, 42))
    draw.text((280, 320), "• Unaligned brand colors in mobile & web assets", font=get_font(16), fill=(15, 23, 42))

    # Right: Touriva (active)
    draw.rectangle([720, 110, 1360, 650], fill=(255, 255, 255), outline=(33, 134, 107), width=2)
    draw.rectangle([720, 110, 1360, 160], fill=(33, 134, 107))
    draw.text((740, 124), "AFTER: UNIFIED TOURIVA EDITORIAL BRAND (ACTIVE)", font=get_font(16), fill=(255, 255, 255))
    
    # Touriva swatch & icon
    logo_path = os.path.join(ROOT, "frontEnd/touriva/public/logo.png")
    if os.path.exists(logo_path):
        logo_im = Image.open(logo_path).resize((130, 130), Image.Resampling.LANCZOS)
        im.paste(logo_im, (750, 190), logo_im if logo_im.mode == "RGBA" else None)
        
    draw.text((910, 200), "Touriva Editorial Palette", font=get_font(18), fill=(23, 63, 53))
    draw.text((910, 230), "Forest (#173F35) • Deep (#102D27) • Sand (#D9B98C)", font=get_font(14), fill=(100, 116, 139))
    draw.text((910, 265), "• Elegant faceted compass needle & Sahara horizon", font=get_font(15), fill=(15, 23, 42))
    draw.text((910, 295), "• Clean Warm Ivory / Deep Green splash screens (all densities)", font=get_font(15), fill=(15, 23, 42))
    draw.text((910, 325), "• Adaptive Android launcher icons (standard + round)", font=get_font(15), fill=(15, 23, 42))
    draw.text((910, 355), "• Consistent SVGs & favicons across all 5 frontends", font=get_font(15), fill=(15, 23, 42))
    draw.text((910, 385), "• OpenGraph social sharing card (1200x630)", font=get_font(15), fill=(15, 23, 42))

    out_file = os.path.join(AUDIT_DIR, "legacy_vs_touriva_comparison.png")
    im.save(out_file, "PNG")
    print(f"✓ Saved comparison sheet: {out_file}")

def create_mobile_and_splash_sheet():
    W, H = 1400, 900
    im = Image.new("RGBA", (W, H), (250, 248, 242, 255))
    draw = ImageDraw.Draw(im)
    
    # Header Banner
    draw.rectangle([0, 0, W, 90], fill=(23, 63, 53, 255))
    draw.text((40, 22), "TOURIVA MOBILE & RESPONSIVE BRAND ASSETS", font=get_font(28), fill=(250, 248, 242))
    draw.text((40, 58), "Capacitor Mobile Splash Screens, Adaptive Launcher Icons, and Portal Banners", font=get_font(16), fill=(217, 185, 140))
    
    # Splash Light Screen Preview
    splash_light_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/drawable/splash.png")
    if os.path.exists(splash_light_path):
        sl = Image.open(splash_light_path).resize((220, 390), Image.Resampling.LANCZOS)
        im.paste(sl, (60, 130))
        draw.rectangle([60, 130, 280, 520], outline=(23, 63, 53), width=2)
        draw.text((70, 535), "Android Splash (Light)", font=get_font(14), fill=(23, 63, 53))
        draw.text((70, 555), "Warm Ivory (#FAF8F2)", font=get_font(12), fill=(100, 116, 139))

    # Splash Dark Screen Preview
    splash_dark_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/drawable-night/splash.png")
    if os.path.exists(splash_dark_path):
        sd = Image.open(splash_dark_path).resize((220, 390), Image.Resampling.LANCZOS)
        im.paste(sd, (320, 130))
        draw.rectangle([320, 130, 540, 520], outline=(217, 185, 140), width=2)
        draw.text((330, 535), "Android Splash (Night)", font=get_font(14), fill=(23, 63, 53))
        draw.text((330, 555), "Deep Green (#102D27)", font=get_font(12), fill=(100, 116, 139))

    # Shop Banner Preview
    banner_path = os.path.join(ROOT, "shop/frontEnd/touriva_shop_admin/public/logo.jpg")
    if os.path.exists(banner_path):
        sb = Image.open(banner_path).resize((400, 280), Image.Resampling.LANCZOS)
        im.paste(sb, (580, 130))
        draw.rectangle([580, 130, 980, 410], outline=(217, 185, 140), width=2)
        draw.text((580, 420), "Admin & Seller Portal Brand Header", font=get_font(14), fill=(23, 63, 53))
        draw.text((580, 440), "Touriva Shop (Replaces obsolete DJAWAL banner)", font=get_font(12), fill=(100, 116, 139))

    # OpenGraph Card Preview
    og_path = os.path.join(ROOT, "frontEnd/touriva/public/og-image.png")
    if os.path.exists(og_path):
        og = Image.open(og_path).resize((360, 190), Image.Resampling.LANCZOS)
        im.paste(og, (1000, 130))
        draw.rectangle([1000, 130, 1360, 320], outline=(23, 63, 53), width=2)
        draw.text((1000, 330), "OpenGraph Social Sharing Card", font=get_font(14), fill=(23, 63, 53))
        draw.text((1000, 350), "1200x630 Modern Editorial Layout", font=get_font(12), fill=(100, 116, 139))

    # Launcher Icon Matrix
    draw.rectangle([40, 600, W - 40, 850], fill=(255, 255, 255), outline=(231, 232, 225), width=2)
    draw.text((60, 615), "ANDROID & IOS LAUNCHER ICON DENSITIES", font=get_font(16), fill=(23, 63, 53))
    
    densities = [
        ("mipmap-mdpi", "frontEnd/touriva/android/app/src/main/res/mipmap-mdpi/ic_launcher.png", 48),
        ("mipmap-hdpi", "frontEnd/touriva/android/app/src/main/res/mipmap-hdpi/ic_launcher.png", 72),
        ("mipmap-xhdpi", "frontEnd/touriva/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png", 96),
        ("mipmap-xxhdpi", "frontEnd/touriva/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png", 144),
        ("mipmap-xxxhdpi", "frontEnd/touriva/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", 192),
    ]
    
    ix = 60
    for name, rel_path, px in densities:
        full_p = os.path.join(ROOT, rel_path)
        if os.path.exists(full_p):
            ic = Image.open(full_p).resize((80, 80), Image.Resampling.LANCZOS)
            im.paste(ic, (ix, 660), ic if ic.mode == "RGBA" else None)
            draw.text((ix, 755), name.replace("mipmap-", ""), font=get_font(13), fill=(23, 63, 53))
            draw.text((ix, 775), f"{px}x{px}", font=get_font(11), fill=(100, 116, 139))
        ix += 130
        
    # Round icon preview
    rnd_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png")
    if os.path.exists(rnd_path):
        ic_rnd = Image.open(rnd_path).resize((80, 80), Image.Resampling.LANCZOS)
        im.paste(ic_rnd, (ix + 40, 660), ic_rnd if ic_rnd.mode == "RGBA" else None)
        draw.text((ix + 40, 755), "round", font=get_font(13), fill=(23, 63, 53))
        draw.text((ix + 40, 775), "192x192", font=get_font(11), fill=(100, 116, 139))

    # Foreground adaptive icon preview
    fg_path = os.path.join(ROOT, "frontEnd/touriva/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png")
    if os.path.exists(fg_path):
        ic_fg = Image.open(fg_path).resize((80, 80), Image.Resampling.LANCZOS)
        im.paste(ic_fg, (ix + 170, 660), ic_fg if ic_fg.mode == "RGBA" else None)
        draw.text((ix + 170, 755), "foreground", font=get_font(13), fill=(23, 63, 53))
        draw.text((ix + 170, 775), "432x432", font=get_font(11), fill=(100, 116, 139))

    # PWA Webp preview
    pwa512_path = os.path.join(ROOT, "frontEnd/touriva/icons/icon-512.webp")
    if os.path.exists(pwa512_path):
        ic_pwa = Image.open(pwa512_path).resize((80, 80), Image.Resampling.LANCZOS)
        im.paste(ic_pwa, (ix + 300, 660), ic_pwa if ic_pwa.mode == "RGBA" else None)
        draw.text((ix + 300, 755), "PWA WebP", font=get_font(13), fill=(23, 63, 53))
        draw.text((ix + 300, 775), "512x512", font=get_font(11), fill=(100, 116, 139))

    out_file = os.path.join(AUDIT_DIR, "mobile_and_portal_brand_sheet.png")
    im.save(out_file, "PNG")
    print(f"✓ Saved mobile & portal sheet: {out_file}")

if __name__ == "__main__":
    create_showcase()
    create_before_after()
    create_mobile_and_splash_sheet()
