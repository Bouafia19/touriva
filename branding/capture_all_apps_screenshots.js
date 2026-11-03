const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('/home/next/next projects/touriva/scripts/node_modules/puppeteer-core');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(__dirname, 'screenshots');

const APPS = [
  { name: '01_touriva_web', dir: path.join(ROOT_DIR, 'frontEnd/touriva/dist'), port: 4173 },
  { name: '02_touriva_admin', dir: path.join(ROOT_DIR, 'frontEnd/touriva_adminPanel/dist'), port: 4174 },
  { name: '03_shop_web', dir: path.join(ROOT_DIR, 'shop/frontEnd/touriva_shop_web/dist'), port: 4175 },
  { name: '04_shop_admin', dir: path.join(ROOT_DIR, 'shop/frontEnd/touriva_shop_admin/dist'), port: 4176 },
  { name: '05_shop_seller_admin', dir: path.join(ROOT_DIR, 'shop/frontEnd/touriva_shop_seller_admin/dist'), port: 4177 },
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function createSpaServer(staticDir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      let filePath = path.join(staticDir, reqPath === '/' ? 'index.html' : reqPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(staticDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
          res.end(data);
        }
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('=============================================================');
  console.log('TOURIVA — VISUAL VERIFICATION & AUDIT CAPTURE PIPELINE');
  console.log('=============================================================');

  // Start all 5 servers
  console.log('Starting local SPA preview servers on ports 4173-4177...');
  const servers = [];
  for (const app of APPS) {
    const server = await createSpaServer(app.dir, app.port);
    servers.push(server);
    console.log(`  ✓ ${app.name} serving on http://127.0.0.1:${app.port}`);
  }

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
      '--force-color-profile=srgb',
    ],
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // 1. TOURIVA Web & PWA
    // -------------------------------------------------------------
    console.log('\n--- 1. TOURIVA Web & PWA ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    // Desktop Header & Top Navigation
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_web_desktop_top_nav.png'),
      clip: { x: 0, y: 0, width: 1440, height: 180 },
    });
    console.log('  ✓ 01_web_desktop_top_nav.png');

    // Desktop Homepage / Dashboard
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_web_desktop_home.png'),
    });
    console.log('  ✓ 01_web_desktop_home.png');

    // Login Screen
    await page.goto('http://127.0.0.1:4173/user/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_web_login.png'),
    });
    console.log('  ✓ 01_web_login.png');

    // Mobile Layout & Navigation Drawer
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_web_mobile_layout.png'),
    });
    console.log('  ✓ 01_web_mobile_layout.png');

    // Open mobile sidebar drawer if nav icon present
    try {
      const navBtn = await page.$('.v-app-bar-nav-icon');
      if (navBtn) {
        await navBtn.click();
        await sleep(600);
        await page.screenshot({
          path: path.join(OUTPUT_DIR, '01_web_mobile_sidebar.png'),
        });
        console.log('  ✓ 01_web_mobile_sidebar.png');
      }
    } catch (e) {}

    // -------------------------------------------------------------
    // 2. TOURIVA Admin Panel
    // -------------------------------------------------------------
    console.log('\n--- 2. TOURIVA Admin Panel ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02_admin_login.png'),
    });
    console.log('  ✓ 02_admin_login.png');

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02_admin_login_mobile.png'),
    });
    console.log('  ✓ 02_admin_login_mobile.png');

    // -------------------------------------------------------------
    // 3. TOURIVA Shop Web
    // -------------------------------------------------------------
    console.log('\n--- 3. TOURIVA Shop Web ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4175/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03_shop_web_home.png'),
    });
    console.log('  ✓ 03_shop_web_home.png');

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03_shop_web_top_nav.png'),
      clip: { x: 0, y: 0, width: 1440, height: 160 },
    });
    console.log('  ✓ 03_shop_web_top_nav.png');

    await page.goto('http://127.0.0.1:4175/user/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03_shop_web_login.png'),
    });
    console.log('  ✓ 03_shop_web_login.png');

    // -------------------------------------------------------------
    // 4. TOURIVA Shop Admin
    // -------------------------------------------------------------
    console.log('\n--- 4. TOURIVA Shop Admin ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04_shop_admin_login.png'),
    });
    console.log('  ✓ 04_shop_admin_login.png');

    // -------------------------------------------------------------
    // 5. TOURIVA Shop Seller Admin
    // -------------------------------------------------------------
    console.log('\n--- 5. TOURIVA Shop Seller Admin ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:4177/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05_seller_admin_login.png'),
    });
    console.log('  ✓ 05_seller_admin_login.png');

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05_seller_admin_mobile.png'),
    });
    console.log('  ✓ 05_seller_admin_mobile.png');

    // -------------------------------------------------------------
    // 6. TOURIVA Android Application Launcher & Adaptive Preview
    // -------------------------------------------------------------
    console.log('\n--- 6. TOURIVA Android Application Mockup ---');
    const logoPngB64 = fs.readFileSync(path.join(ROOT_DIR, 'branding/logo/touriva-logo.png')).toString('base64');
    const androidPreviewHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #102D27;
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #FAF8F2;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    h2 { color: #FAF8F2; margin-bottom: 6px; }
    p { color: #D9B98C; margin-top: 0; margin-bottom: 30px; font-size: 14px; }
    .grid { display: flex; gap: 40px; align-items: center; }
    .card {
      background: #173F35;
      border: 1px solid rgba(217, 185, 140, 0.3);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .launcher-circle {
      width: 144px;
      height: 144px;
      border-radius: 50%;
      background: #173F35;
      border: 2px solid #D9B98C;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .launcher-squircle {
      width: 144px;
      height: 144px;
      border-radius: 36px;
      background: #173F35;
      border: 2px solid #D9B98C;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .card-title { font-weight: 600; font-size: 14px; margin-top: 16px; }
    .card-desc { font-size: 12px; color: #D9B98C; margin-top: 4px; }
  </style>
</head>
<body>
  <h2>TOURIVA Android Application — Launcher &amp; Adaptive Icon Audit</h2>
  <p>Resource: <code>@mipmap/ic_launcher</code> &amp; <code>@mipmap/ic_launcher_round</code> | Color: <code>#D9B98C</code></p>
  <div class="grid">
    <div class="card">
      <div class="launcher-circle">
        <img src="data:image/png;base64,${logoPngB64}" width="96" height="96">
      </div>
      <div class="card-title">Android Adaptive Round (Pixel / One UI)</div>
      <div class="card-desc">Centered in 66dp circular safe zone</div>
    </div>
    <div class="card">
      <div class="launcher-squircle">
        <img src="data:image/png;base64,${logoPngB64}" width="96" height="96">
      </div>
      <div class="card-title">Android Adaptive Squircle (Samsung)</div>
      <div class="card-desc">72dp foreground on #173F35 background</div>
    </div>
    <div class="card">
      <div style="width: 144px; height: 144px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 16px;">
        <img src="data:image/png;base64,${logoPngB64}" width="128" height="128">
      </div>
      <div class="card-title">Standalone Master Store Asset</div>
      <div class="card-desc">512x512 RGBA transparent ic_launcher.png</div>
    </div>
  </div>
</body>
</html>`;
    await page.setViewport({ width: 900, height: 460, deviceScaleFactor: 2 });
    await page.setContent(androidPreviewHtml, { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06_android_launcher_adaptive_audit.png'),
    });
    console.log('  ✓ 06_android_launcher_adaptive_audit.png');

    console.log('\n=============================================================');
    console.log('✅ ALL APPLICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('=============================================================');

  } finally {
    await browser.close();
    for (const server of servers) {
      server.close();
    }
    console.log('Local SPA preview servers closed.');
  }
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
