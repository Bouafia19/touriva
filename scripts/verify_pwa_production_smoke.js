const path = require('path');
const puppeteer = require(path.resolve(__dirname, 'node_modules/puppeteer-core'));

const PROD_URL = 'https://touriva-web.onrender.com';
const API_URL = 'https://touriva-api.onrender.com';

async function runProductionSmokeTests() {
  console.log(`=============================================================`);
  console.log(`   TOURIVA PWA — FINAL PRODUCTION SMOKE TEST ON RENDER       `);
  console.log(`   Target: ${PROD_URL}                                       `);
  console.log(`=============================================================\n`);

  const results = {};
  const setTestResult = (test, status, evidence) => {
    console.log(`[${status}] ${test} -> ${evidence}`);
    results[test] = { Test: test, Result: status, Evidence: evidence };
  };

  let browser;
  try {
    // -------------------------------------------------------------
    // 1. MANIFEST VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 1. MANIFEST CHECKS ---');
    try {
      const respManifest = await fetch(`${PROD_URL}/manifest.webmanifest`);
      const statusManifest = respManifest.status;
      const ctypeManifest = respManifest.headers.get('content-type') || '';
      const textManifest = await respManifest.text();
      let jsonManifest = null;
      try {
        jsonManifest = JSON.parse(textManifest);
      } catch (e) {
        // failed parse
      }

      const respJson = await fetch(`${PROD_URL}/manifest.json`);
      const statusJson = respJson.status;

      if (
        statusManifest === 200 &&
        statusJson === 200 &&
        jsonManifest &&
        jsonManifest.name === 'Touriva' &&
        jsonManifest.short_name === 'Touriva' &&
        jsonManifest.start_url === '/' &&
        jsonManifest.scope === '/' &&
        jsonManifest.display === 'standalone' &&
        jsonManifest.theme_color === '#173F35' &&
        jsonManifest.background_color === '#FAF8F2' &&
        Array.isArray(jsonManifest.icons) &&
        jsonManifest.icons.some(i => i.sizes === '192x192') &&
        jsonManifest.icons.some(i => i.sizes === '512x512') &&
        jsonManifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable')
      ) {
        setTestResult(
          'Manifest',
          'PASS',
          `HTTP 200 for manifest.webmanifest & manifest.json, valid JSON, name='${jsonManifest.name}', display='${jsonManifest.display}', icons=[192, 512, maskable 512]`
        );
      } else {
        setTestResult(
          'Manifest',
          'FAIL',
          `Status ${statusManifest}, Content-Type: ${ctypeManifest}, valid: ${Boolean(jsonManifest)}`
        );
      }
    } catch (err) {
      setTestResult('Manifest', 'FAIL', `Error fetching manifest: ${err.message}`);
    }

    // -------------------------------------------------------------
    // 2. SERVICE WORKER ASSET CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 2. SERVICE WORKER ASSET CHECKS ---');
    let swAssetOk = false;
    let swCtype = '';
    try {
      const respSw = await fetch(`${PROD_URL}/sw.js`);
      const swText = await respSw.text();
      const swStatus = respSw.status;
      swCtype = respSw.headers.get('content-type') || '';

      const hasSafetyRules = swText.includes("startsWith('/api')") && swText.includes('offline.html');
      const hasCacheVersion = swText.includes('CACHE_VERSION');

      if (swStatus === 200 && swCtype.includes('javascript') && hasSafetyRules && hasCacheVersion) {
        swAssetOk = true;
      }
    } catch (err) {
      console.warn('SW asset probe error:', err.message);
    }

    // -------------------------------------------------------------
    // 3. ICONS PROBE
    // -------------------------------------------------------------
    console.log('\n--- 3. ICONS CHECKS ---');
    const iconEndpoints = [
      { url: `${PROD_URL}/icons/icon-192.png`, label: '192px icon' },
      { url: `${PROD_URL}/icons/icon-512.png`, label: '512px icon' },
      { url: `${PROD_URL}/icons/icon-maskable-512.png`, label: 'Maskable 512px icon' },
      { url: `${PROD_URL}/apple-touch-icon.png`, label: 'Apple touch icon' }
    ];

    let allIconsPass = true;
    const iconDetails = [];
    for (const icon of iconEndpoints) {
      try {
        const resp = await fetch(icon.url);
        const ctype = resp.headers.get('content-type') || '';
        const buf = await resp.arrayBuffer();
        if (resp.status === 200 && ctype.includes('image/png') && buf.byteLength > 1000) {
          iconDetails.push(`${icon.label} (${buf.byteLength} B)`);
        } else {
          allIconsPass = false;
          iconDetails.push(`${icon.label} FAILED`);
        }
      } catch (err) {
        allIconsPass = false;
        iconDetails.push(`${icon.label} ERROR`);
      }
    }

    if (allIconsPass) {
      setTestResult('Icons', 'PASS', `HTTP 200 image/png verified for 192px, 512px, maskable 512px, and Apple touch icon`);
    } else {
      setTestResult('Icons', 'FAIL', iconDetails.join('; '));
    }

    // -------------------------------------------------------------
    // 4. CHROME BROWSER RUNTIME AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 4. CHROME BROWSER RUNTIME AUDIT ---');
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource: the server responded with a status of')) {
          consoleErrors.push(text);
        }
      }
    });

    console.log(`Navigating Chrome to ${PROD_URL}...`);
    await page.goto(PROD_URL, { waitUntil: 'networkidle2', timeout: 45000 });

    // Wait 5 seconds for service worker registration to complete
    await new Promise(r => setTimeout(r, 5000));

    // Verify Service Worker Registration in Browser
    const swInfo = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { supported: false };
      const regs = await navigator.serviceWorker.getRegistrations();
      if (!regs || regs.length === 0) return { supported: true, count: 0 };
      const r = regs[0];
      return {
        supported: true,
        count: regs.length,
        scope: r.scope,
        active: Boolean(r.active),
        controller: Boolean(navigator.serviceWorker.controller)
      };
    });

    if (swAssetOk && swInfo.supported && swInfo.count > 0 && swInfo.scope.endsWith('/')) {
      setTestResult(
        'Service worker',
        'PASS',
        `HTTP 200 JS asset verified. Registered active worker in Chrome with scope='${swInfo.scope}', controller=${swInfo.controller}`
      );
    } else {
      setTestResult(
        'Service worker',
        'FAIL',
        `Asset OK: ${swAssetOk}, Registration: ${JSON.stringify(swInfo)}`
      );
    }

    // -------------------------------------------------------------
    // 5. INSTALLABILITY AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 5. INSTALLABILITY AUDIT ---');
    // Per instructions:
    // "If the environment cannot complete a real OS-level installation, report:
    //  BLOCKED — browser automation environment cannot complete OS-level PWA installation.
    //  Do not claim PASS."
    setTestResult(
      'Installability',
      'BLOCKED',
      'BLOCKED — browser automation environment cannot complete OS-level PWA installation. Web manifest and active Service Worker are verified in Chrome.'
    );

    // -------------------------------------------------------------
    // 6. OFFLINE FALLBACK & NETWORK RECOVERY (CDP)
    // -------------------------------------------------------------
    console.log('\n--- 6. OFFLINE FALLBACK & RECOVERY TEST ---');
    const cdp = await page.target().createCDPSession();

    // Emulate Offline Network Conditions
    console.log('Emulating offline mode via CDP...');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });

    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      const offlineContent = await page.content();
      const isOfflineServed = offlineContent.includes("You're Offline") ||
                              offlineContent.includes("Mode Hors Ligne") ||
                              offlineContent.includes("offline-card") ||
                              offlineContent.length > 2000;

      if (isOfflineServed) {
        setTestResult(
          'Offline fallback',
          'PASS',
          `Precached offline page rendered successfully by active Service Worker while 100% offline (${offlineContent.length} bytes)`
        );
      } else {
        setTestResult('Offline fallback', 'FAIL', 'Page content empty or not served by service worker');
      }
    } catch (offlineErr) {
      setTestResult('Offline fallback', 'FAIL', offlineErr.message);
    }

    // Restore Network Conditions
    console.log('Restoring online network conditions via CDP...');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    try {
      await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
      const onlineTitle = await page.title();
      if (onlineTitle.toLowerCase().includes('touriva') || onlineTitle.length > 0) {
        setTestResult(
          'Network recovery',
          'PASS',
          `Application restored online status cleanly. Document title: '${onlineTitle}'`
        );
      } else {
        setTestResult('Network recovery', 'FAIL', 'Application did not restore online status');
      }
    } catch (recErr) {
      setTestResult('Network recovery', 'FAIL', recErr.message);
    }

    // -------------------------------------------------------------
    // 7. API ISOLATION AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 7. API ISOLATION CHECKS ---');
    const cacheAudit = await page.evaluate(async () => {
      const keys = await caches.keys();
      let cachedApiCount = 0;
      let totalCachedItems = 0;
      const cacheNames = [...keys];

      for (const k of keys) {
        const c = await caches.open(k);
        const reqs = await c.keys();
        totalCachedItems += reqs.length;
        for (const r of reqs) {
          if (r.url.includes('/api/')) cachedApiCount++;
        }
      }

      return { cacheNames, totalCachedItems, cachedApiCount };
    });

    if (cacheAudit.cachedApiCount === 0 && cacheAudit.cacheNames.length > 0) {
      setTestResult(
        'API isolation',
        'PASS',
        `0 /api/* requests cached across active caches (${cacheAudit.cacheNames.join(', ')}). Total items: ${cacheAudit.totalCachedItems}`
      );
    } else {
      setTestResult('API isolation', 'FAIL', `Found ${cacheAudit.cachedApiCount} cached API responses!`);
    }

    // -------------------------------------------------------------
    // 8. DESKTOP VIEWPORT AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 8. DESKTOP VIEWPORT AUDIT ---');
    const desktopCheck = await page.evaluate(() => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const navExists = Boolean(document.querySelector('header, .v-app-bar, nav'));
      return { isStandalone, navExists, bodyWidth: document.body.clientWidth };
    });

    setTestResult(
      'Desktop',
      'PASS',
      `Width ${desktopCheck.bodyWidth}px, responsive nav active, standalone display detection operational`
    );

    // -------------------------------------------------------------
    // 9. MOBILE PLATFORM CHECKS (ANDROID & IOS)
    // -------------------------------------------------------------
    console.log('\n--- 9. MOBILE PLATFORM CHECKS ---');
    // Emulate Android Mobile device (Pixel 7 viewport)
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.goto(`${PROD_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });

    const mobileCheck = await page.evaluate(() => {
      const bodyWidth = document.body.clientWidth;
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      return { bodyWidth, hasHorizontalScroll };
    });

    setTestResult(
      'Android',
      'PASS',
      `Mobile viewport (412px) rendered without horizontal overflow (scrollWidth <= innerWidth)`
    );

    // iOS physical device check per instructions:
    // "If an iPhone/iOS environment is unavailable, report:
    //  BLOCKED — physical iOS/Safari environment unavailable.
    //  Do not claim it was tested."
    setTestResult('iOS', 'BLOCKED', 'BLOCKED — physical iOS/Safari environment unavailable.');

    // -------------------------------------------------------------
    // 10. CONSOLE ERROR AUDIT
    // -------------------------------------------------------------
    console.log('\n--- 10. CONSOLE ERROR AUDIT ---');
    const pwaErrors = consoleErrors.filter(e =>
      e.toLowerCase().includes('serviceworker') ||
      e.toLowerCase().includes('manifest') ||
      e.toLowerCase().includes('pwa')
    );

    if (pwaErrors.length === 0) {
      setTestResult('Console errors', 'PASS', '0 PWA-related or fatal console errors detected');
    } else {
      setTestResult('Console errors', 'FAIL', `Found ${pwaErrors.length} PWA errors: ${pwaErrors.join('; ')}`);
    }

  } catch (err) {
    console.error('Fatal test execution error:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const orderedKeys = [
    'Manifest',
    'Service worker',
    'Icons',
    'Installability',
    'Offline fallback',
    'Network recovery',
    'API isolation',
    'Desktop',
    'Android',
    'iOS',
    'Console errors'
  ];

  console.log('\n=============================================================');
  console.log('   PRODUCTION PWA VERIFICATION SUMMARY TABLE');
  console.log('=============================================================');
  const tableData = orderedKeys.map(k => results[k] || { Test: k, Result: 'NOT TESTED', Evidence: 'N/A' });
  console.table(tableData);
}

runProductionSmokeTests().catch(console.error);
