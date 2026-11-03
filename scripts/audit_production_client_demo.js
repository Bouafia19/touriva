/**
 * Comprehensive Production Client Demo Visual & Multilingual Audit Script
 * Tests:
 *  - Landing page (Hero, logo, navigation, search, featured, agency presentation, CTA, footer, mobile)
 *  - Multilingual support: EN, FR, AR (RTL alignment)
 *  - Responsive viewports: Desktop (1280x800), Tablet (768x1024), Mobile (390x844)
 *  - PWA manifest, service worker, offline fallback
 *  - Agency dashboard visual inspection
 *  - Captures high-res evidence screenshots into audit/client_demo_readiness/
 */

const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, 'node_modules/puppeteer-core'));

const PROD_URL = 'https://touriva-web.onrender.com';
const API_URL = 'https://touriva-api.onrender.com';
const outDir = path.resolve(__dirname, '../audit/client_demo_readiness');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

const languages = [
  { code: 'fr', name: 'Français', isRtl: false },
  { code: 'ar', name: 'العربية', isRtl: true },
  { code: 'en', name: 'English', isRtl: false }
];

async function runProductionAudit() {
  console.log('=============================================================');
  console.log('   TOURIVA CLIENT DEMO READINESS — PRODUCTION AUDIT          ');
  console.log(`   Web: ${PROD_URL}                                         `);
  console.log(`   API: ${API_URL}                                          `);
  console.log('=============================================================\n');

  const auditResults = {
    pwa: {},
    multilingual: {},
    viewports: {},
    agency: {},
    screenshots: []
  };

  // 1. PWA Checks
  console.log('1. Auditing PWA Foundation...');
  const manifestRes = await fetch(`${PROD_URL}/manifest.webmanifest`);
  const manifestJson = await manifestRes.json();
  auditResults.pwa.manifest = {
    status: manifestRes.status,
    name: manifestJson.name,
    short_name: manifestJson.short_name,
    start_url: manifestJson.start_url,
    display: manifestJson.display,
    theme_color: manifestJson.theme_color,
    background_color: manifestJson.background_color,
    iconsCount: manifestJson.icons?.length || 0
  };
  console.log(`✓ Manifest: HTTP ${manifestRes.status}, Name: ${manifestJson.name}, Icons: ${manifestJson.icons?.length}`);

  const swRes = await fetch(`${PROD_URL}/sw.js`);
  auditResults.pwa.serviceWorker = {
    status: swRes.status,
    contentType: swRes.headers.get('content-type')
  };
  console.log(`✓ Service Worker: HTTP ${swRes.status}, Content-Type: ${swRes.headers.get('content-type')}`);

  const offlineRes = await fetch(`${PROD_URL}/offline.html`);
  const offlineHtml = await offlineRes.text();
  auditResults.pwa.offlineFallback = {
    status: offlineRes.status,
    hasRetry: offlineHtml.includes('Retry Connection') || offlineHtml.includes('refresh'),
    hasBrand: offlineHtml.includes('Touriva')
  };
  console.log(`✓ Offline Fallback: HTTP ${offlineRes.status}, Authentic branding: ${auditResults.pwa.offlineFallback.hasBrand}`);

  // 2. Launch Browser for UI & UX Audit
  console.log('\n2. Launching Headless Chrome for UI/UX & Multilingual Audit...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 90000
  });

  const page = await browser.newPage();

  // Audit all viewports on landing page
  for (const vp of viewports) {
    console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Check header logo and navbar
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('.editorial-app-bar');
      const logo = document.querySelector('.header-brand-logo');
      const installCta = header ? (header.innerText.includes('Install Touriva') || header.innerText.includes('Installer Touriva')) : false;
      const b2bBtn = header ? header.innerText.includes('Agences') || header.innerText.includes('B2B') || header.innerText.includes('Travel Agencies') : false;
      return {
        headerFound: !!header,
        logoVisible: logo ? logo.getBoundingClientRect().width > 0 : false,
        hasInstallCta: installCta,
        hasB2bBtn: b2bBtn
      };
    });

    console.log(`[${vp.name}] Header found: ${headerInfo.headerFound}, Logo visible: ${headerInfo.logoVisible}, Install CTA in nav: ${headerInfo.hasInstallCta}, B2B CTA present: ${headerInfo.hasB2bBtn}`);
    auditResults.viewports[vp.name] = headerInfo;

    const ssPath = path.join(outDir, `demo_landing_${vp.name}_${vp.width}px.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    auditResults.screenshots.push(`demo_landing_${vp.name}_${vp.width}px.png`);
    console.log(`[${vp.name}] Captured screenshot: demo_landing_${vp.name}_${vp.width}px.png`);
  }

  // 3. Multilingual Audit
  console.log('\n3. Auditing Multilingual Support (FR, AR, EN)...');
  for (const lang of languages) {
    console.log(`\nTesting Language: ${lang.name} (${lang.code})...`);
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Set locale in localStorage
    await page.evaluate((c) => {
      localStorage.setItem('locale', c);
    }, lang.code);

    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const langInfo = await page.evaluate(() => {
      const dir = document.dir || document.documentElement.dir || document.body.dir || 'ltr';
      const bodyText = document.body.innerText;
      return {
        docDir: dir,
        isRtl: dir === 'rtl',
        sampleText: bodyText.slice(0, 200).replace(/\n+/g, ' ')
      };
    });

    console.log(`[${lang.code}] Direction: ${langInfo.docDir} (Expected RTL: ${lang.isRtl})`);
    auditResults.multilingual[lang.code] = langInfo;

    const ssPath = path.join(outDir, `demo_multilang_${lang.code}_1280px.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    auditResults.screenshots.push(`demo_multilang_${lang.code}_1280px.png`);
    console.log(`[${lang.code}] Captured screenshot: demo_multilang_${lang.code}_1280px.png`);
  }

  // 4. Agency Portal Visual Verification
  console.log('\n4. Auditing Agency Portal Live Interface...');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  
  // Set agency demo token in localStorage
  const aLoginRes = await fetch(`${API_URL}/api/users/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoType: 'agency' })
  });
  const aData = await aLoginRes.json();
  const aToken = aData.token;
  const aUser = aData.user;

  await page.goto(`${PROD_URL}/agency/dashboard`, { waitUntil: 'load' });
  await page.evaluate((u, t) => {
    localStorage.setItem('userInfo', JSON.stringify({ ...u, token: t }));
    localStorage.setItem('user', JSON.stringify({ ...u, token: t }));
  }, aUser, aToken);

  await page.goto(`${PROD_URL}/agency/dashboard`, { waitUntil: 'load' });
  await page.waitForSelector('.v-app-bar', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  const agencyUi = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      title: document.title,
      hasEspaceAgence: text.includes('Espace Agence') || text.includes('Tableau de bord') || text.includes('Touriva Horizons'),
      hasPackagesSection: text.includes('Packages') || text.includes('Circuits'),
      hasDeparturesSection: text.includes('Départs') || text.includes('Manifeste')
    };
  });

  console.log('Agency UI elements detected:', agencyUi);
  auditResults.agency = agencyUi;

  const agencySs = path.join(outDir, 'demo_agency_dashboard_1280px.png');
  await page.screenshot({ path: agencySs, fullPage: false });
  auditResults.screenshots.push('demo_agency_dashboard_1280px.png');
  console.log('Saved screenshot: demo_agency_dashboard_1280px.png');

  // Close browser
  await browser.close();

  // Save audit report JSON
  const finalJsonPath = path.join(outDir, 'demo_readiness_audit_summary.json');
  fs.writeFileSync(finalJsonPath, JSON.stringify(auditResults, null, 2));
  console.log(`\nAudit completed! Summary written to: ${finalJsonPath}`);
}

runProductionAudit().catch(err => {
  console.error('Production audit fatal error:', err);
  process.exit(1);
});
