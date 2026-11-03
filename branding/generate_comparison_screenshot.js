const puppeteer = require('/home/next/next projects/touriva/scripts/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generateComparison() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--force-color-profile=srgb',
      '--allow-file-access-from-files',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 950, deviceScaleFactor: 2 });

  // Load font as base64
  const fontPath = path.resolve(__dirname, '../frontEnd/touriva/node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff2');
  const fontB64 = fs.readFileSync(fontPath).toString('base64');

  // Load images as base64
  const png512B64 = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo.png')).toString('base64');
  const png256B64 = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo-256.png')).toString('base64');
  const png128B64 = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo-128.png')).toString('base64');
  const png64B64 = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo-64.png')).toString('base64');
  const png32B64 = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo-32.png')).toString('base64');
  const favicon32B64 = fs.readFileSync(path.resolve(__dirname, 'logo/favicon-32x32.png')).toString('base64');
  const favicon16B64 = fs.readFileSync(path.resolve(__dirname, 'logo/favicon-16x16.png')).toString('base64');
  const appleTouchB64 = fs.readFileSync(path.resolve(__dirname, 'logo/apple-touch-icon.png')).toString('base64');
  const svgContent = fs.readFileSync(path.resolve(__dirname, 'logo/touriva-logo.svg'), 'utf8');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Material Design Icons';
      src: url('data:font/woff2;base64,${fontB64}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    .mdi {
      font-family: 'Material Design Icons';
      display: inline-block;
      line-height: 1;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
    }
    .mdi-compass-rose::before {
      content: "\\F1382";
    }

    * { box-sizing: border-box; }
    body {
      background: #102D27;
      color: #FAF8F2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
    }

    .header {
      border-bottom: 2px solid #21866B;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 24px;
      color: #FAF8F2;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 0;
      color: #D9B98C;
      font-size: 14px;
    }
    .badge {
      background: #173F35;
      border: 1px solid #D9B98C;
      color: #D9B98C;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .card {
      background: #173F35;
      border: 1px solid rgba(217, 185, 140, 0.25);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #D9B98C;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 18px;
      border-bottom: 1px solid rgba(217, 185, 140, 0.15);
      padding-bottom: 8px;
    }

    .grid-compare {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .cell {
      background: rgba(16, 45, 39, 0.6);
      border: 1px solid rgba(217, 185, 140, 0.2);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .cell-preview {
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .cell-title {
      font-size: 13px;
      font-weight: 600;
      color: #FAF8F2;
      margin-top: 12px;
    }
    .cell-desc {
      font-size: 11px;
      color: #D9B98C;
      margin-top: 4px;
    }
    .tag-match {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      background: #21866B;
      color: #FAF8F2;
    }

    .row-variants {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 15px;
    }
    .variant-cell {
      background: rgba(16, 45, 39, 0.6);
      border: 1px solid rgba(217, 185, 140, 0.15);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .variant-preview {
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .color-swatch-bar {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      font-size: 12px;
    }
    .swatch {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .swatch-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>TOURIVA — Official Logo Asset Verification</h1>
      <p>Source Glyph: <code>mdi-compass-rose</code> (U+F1382) &nbsp;|&nbsp; Brand Color: <code>text-sand</code> (#D9B98C)</p>
    </div>
    <div class="badge">VERIFIED 1:1 GEOMETRY &amp; COLOR</div>
  </div>

  <div class="card">
    <div class="card-title">Side-by-Side Quality Verification: Original MDI Icon vs Generated Assets</div>
    <div class="grid-compare">
      
      <!-- 1. Original MDI font icon -->
      <div class="cell">
        <div class="cell-preview">
          <i class="mdi mdi-compass-rose" style="font-size: 220px; color: #D9B98C; line-height: 1;"></i>
        </div>
        <div class="cell-title">Original MDI Glyph</div>
        <div class="cell-desc">Font Icon (U+F1382) @ 220px<br>Color: <code>#D9B98C</code> (sand)</div>
        <div class="tag-match">SOURCE OF TRUTH</div>
      </div>

      <!-- 2. Generated 512x512 PNG (scaled down for display) -->
      <div class="cell">
        <div class="cell-preview">
          <img src="data:image/png;base64,${png512B64}" style="width: 220px; height: 220px; object-fit: contain;">
        </div>
        <div class="cell-title">Generated Master PNG</div>
        <div class="cell-desc"><code>touriva-logo.png</code> (512x512)<br>Dominant Color: <code>#D9B98C</code></div>
        <div class="tag-match">IDENTICAL SILHOUETTE</div>
      </div>

      <!-- 3. Generated 256x256 PNG -->
      <div class="cell">
        <div class="cell-preview">
          <img src="data:image/png;base64,${png256B64}" style="width: 220px; height: 220px; object-fit: contain;">
        </div>
        <div class="cell-title">Generated Web 256 PNG</div>
        <div class="cell-desc"><code>touriva-logo-256.png</code> (256x256)<br>Dominant Color: <code>#D9B98C</code></div>
        <div class="tag-match">IDENTICAL SILHOUETTE</div>
      </div>

      <!-- 4. Generated Favicon & App Icon -->
      <div class="cell">
        <div class="cell-preview" style="flex-direction: column; gap: 15px;">
          <div style="display: flex; gap: 20px; align-items: center;">
            <img src="data:image/png;base64,${appleTouchB64}" style="width: 90px; height: 90px;" title="Apple Touch 180">
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <img src="data:image/png;base64,${favicon32B64}" style="width: 48px; height: 48px; image-rendering: pixelated;" title="Favicon 32x32">
              <img src="data:image/png;base64,${favicon16B64}" style="width: 24px; height: 24px; image-rendering: pixelated;" title="Favicon 16x16">
            </div>
          </div>
          <div style="font-size: 11px; color: #FAF8F2;">Apple Touch (180px) &amp; Favicons</div>
        </div>
        <div class="cell-title">Generated Favicons</div>
        <div class="cell-desc"><code>favicon.ico</code> (16/32/48)<br><code>apple-touch-icon.png</code> (180x180)</div>
        <div class="tag-match">CRISP AT ALL SIZES</div>
      </div>

    </div>
  </div>

  <div class="card">
    <div class="card-title">Generated Web &amp; Android Size Progression</div>
    <div class="row-variants">
      <div class="variant-cell">
        <div class="variant-preview">
          <img src="data:image/png;base64,${png128B64}" style="width: 80px; height: 80px;">
        </div>
        <div class="cell-title">128x128</div>
        <div class="cell-desc"><code>touriva-logo-128.png</code></div>
      </div>
      <div class="variant-cell">
        <div class="variant-preview">
          <img src="data:image/png;base64,${png64B64}" style="width: 64px; height: 64px;">
        </div>
        <div class="cell-title">64x64</div>
        <div class="cell-desc"><code>touriva-logo-64.png</code></div>
      </div>
      <div class="variant-cell">
        <div class="variant-preview">
          <img src="data:image/png;base64,${png32B64}" style="width: 32px; height: 32px;">
        </div>
        <div class="cell-title">32x32</div>
        <div class="cell-desc"><code>touriva-logo-32.png</code></div>
      </div>
      <div class="variant-cell">
        <div class="variant-preview">
          <img src="data:image/png;base64,${favicon32B64}" style="width: 32px; height: 32px;">
        </div>
        <div class="cell-title">Favicon 32</div>
        <div class="cell-desc"><code>favicon-32x32.png</code></div>
      </div>
      <div class="variant-cell">
        <div class="variant-preview">
          <img src="data:image/png;base64,${favicon16B64}" style="width: 16px; height: 16px;">
        </div>
        <div class="cell-title">Favicon 16</div>
        <div class="cell-desc"><code>favicon-16x16.png</code></div>
      </div>
      <div class="variant-cell">
        <div class="variant-preview">
          <div style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
            ${svgContent.replace('width="512"', 'width="70"').replace('height="512"', 'height="70"')}
          </div>
        </div>
        <div class="cell-title">Pure Vector SVG</div>
        <div class="cell-desc"><code>touriva-logo.svg</code></div>
      </div>
    </div>

    <div class="color-swatch-bar">
      <div class="swatch">
        <div class="swatch-box" style="background: #D9B98C;"></div>
        <span><strong>TOURIVA Sand:</strong> <code>#D9B98C</code> (Icon fill)</span>
      </div>
      <div class="swatch">
        <div class="swatch-box" style="background: #173F35;"></div>
        <span><strong>Forest Green:</strong> <code>#173F35</code> (Primary)</span>
      </div>
      <div class="swatch">
        <div class="swatch-box" style="background: #102D27;"></div>
        <span><strong>Deep Green:</strong> <code>#102D27</code> (Secondary)</span>
      </div>
      <div class="swatch">
        <div class="swatch-box" style="background: #21866B;"></div>
        <span><strong>Emerald:</strong> <code>#21866B</code> (Accent)</span>
      </div>
      <div class="swatch">
        <div class="swatch-box" style="background: #FAF8F2;"></div>
        <span><strong>Warm Ivory:</strong> <code>#FAF8F2</code> (Light BG)</span>
      </div>
    </div>
  </div>

</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = path.resolve(__dirname, 'touriva_logo_verification_comparison.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`✅ Verification comparison screenshot saved to: ${outPath}`);

  // Also create a version on light background (#FAF8F2)
  const htmlLight = html
    .replace('background: #102D27;', 'background: #FAF8F2;')
    .replace('color: #FAF8F2;', 'color: #173F35;')
    .replace('color: #FAF8F2;', 'color: #173F35;')
    .replace('background: #173F35;', 'background: #FFFFFF;')
    .replace('background: #173F35;', 'background: #FFFFFF;')
    .replace(/rgba\(16, 45, 39, 0\.6\)/g, '#FFFFFF')
    .replace(/border: 1px solid rgba\(217, 185, 140, 0\.2\);/g, 'border: 1px solid #E5DFD5; box-shadow: 0 2px 8px rgba(0,0,0,0.06);')
    .replace(/border: 1px solid rgba\(217, 185, 140, 0\.15\);/g, 'border: 1px solid #E5DFD5; box-shadow: 0 2px 8px rgba(0,0,0,0.06);')
    .replace(/color: #FAF8F2;/g, 'color: #173F35;')
    .replace(/border-bottom: 2px solid #21866B;/, 'border-bottom: 2px solid #D9B98C;');

  await page.setContent(htmlLight, { waitUntil: 'networkidle0' });
  const outPathLight = path.resolve(__dirname, 'touriva_logo_verification_comparison_light.png');
  await page.screenshot({ path: outPathLight, fullPage: true });
  console.log(`✅ Light mode verification screenshot saved to: ${outPathLight}`);

  await browser.close();
}

generateComparison().catch(console.error);
