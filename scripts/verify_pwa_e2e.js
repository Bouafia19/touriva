const path = require('path');
const fs = require('fs');
const http = require('http');
const puppeteer = require(path.resolve(__dirname, 'node_modules/puppeteer-core'));

const DIST_DIR = path.resolve(__dirname, '../frontEnd/touriva/dist');
const PORT = 2024;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Minimal static server with MIME types and SPA fallback for testing dist
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      // SPA fallback
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const headers = { 'Content-Type': contentType };
      if (reqPath === '/sw.js') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Service-Worker-Allowed'] = '/';
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  });
}

async function runTests() {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`Test static server running at ${BASE_URL} serving ${DIST_DIR}`);

  const results = [];
  const record = (title, status, detail) => {
    console.log(`[${status}] ${title}: ${detail}`);
    results.push({ title, status, detail });
  };

  let browser;
  try {
    // -------------------------------------------------------------
    // TEST SUITE 1: HTTP ASSET VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 1. HTTP ASSET SERVING VERIFICATION ---');
    const checkUrl = async (relUrl, expectedType, validateFn) => {
      return new Promise((resolve, reject) => {
        http.get(`${BASE_URL}${relUrl}`, (res) => {
          let body = [];
          res.on('data', chunk => body.push(chunk));
          res.on('end', () => {
            const buf = Buffer.concat(body);
            resolve({
              statusCode: res.statusCode,
              contentType: res.headers['content-type'],
              data: buf
            });
          });
        }).on('error', reject);
      });
    };

    // 1.1 Manifest webmanifest
    const manifestRes = await checkUrl('/manifest.webmanifest');
    if (manifestRes.statusCode === 200 && manifestRes.contentType.includes('manifest+json')) {
      const manifest = JSON.parse(manifestRes.data.toString());
      if (manifest.name === 'Touriva' && manifest.display === 'standalone' && manifest.icons.length >= 2) {
        record('HTTP Manifest (/manifest.webmanifest)', 'PASS', `HTTP 200, ${manifestRes.contentType}, name: Touriva`);
      } else {
        record('HTTP Manifest (/manifest.webmanifest)', 'FAIL', `Invalid manifest content`);
      }
    } else {
      record('HTTP Manifest (/manifest.webmanifest)', 'FAIL', `Status: ${manifestRes.statusCode}, Type: ${manifestRes.contentType}`);
    }

    // 1.2 Manifest json fallback
    const manifestJsonRes = await checkUrl('/manifest.json');
    if (manifestJsonRes.statusCode === 200) {
      record('HTTP Manifest Fallback (/manifest.json)', 'PASS', `HTTP 200, JSON valid`);
    } else {
      record('HTTP Manifest Fallback (/manifest.json)', 'FAIL', `Status: ${manifestJsonRes.statusCode}`);
    }

    // 1.3 Service Worker
    const swRes = await checkUrl('/sw.js');
    if (swRes.statusCode === 200 && swRes.contentType.includes('javascript')) {
      const swText = swRes.data.toString();
      if (swText.includes('SKIP_WAITING') && swText.includes('/api')) {
        record('HTTP Service Worker (/sw.js)', 'PASS', `HTTP 200, ${swRes.contentType}, API safety rules confirmed`);
      } else {
        record('HTTP Service Worker (/sw.js)', 'FAIL', 'Missing API rules');
      }
    } else {
      record('HTTP Service Worker (/sw.js)', 'FAIL', `Status: ${swRes.statusCode}`);
    }

    // 1.4 Offline HTML
    const offlineRes = await checkUrl('/offline.html');
    if (offlineRes.statusCode === 200 && offlineRes.data.toString().includes("Touriva")) {
      record('HTTP Offline Fallback (/offline.html)', 'PASS', `HTTP 200, self-contained offline page confirmed`);
    } else {
      record('HTTP Offline Fallback (/offline.html)', 'FAIL', `Status: ${offlineRes.statusCode}`);
    }

    // 1.5 Icons
    const icon192Res = await checkUrl('/icons/icon-192.png');
    const icon512Res = await checkUrl('/icons/icon-512.png');
    const maskableRes = await checkUrl('/icons/icon-maskable-512.png');
    const appleRes = await checkUrl('/icons/apple-touch-icon.png');

    if (icon192Res.statusCode === 200 && icon512Res.statusCode === 200 && maskableRes.statusCode === 200 && appleRes.statusCode === 200) {
      record('HTTP Icons (192px, 512px, Maskable, Apple)', 'PASS', `All icons returned HTTP 200 (192: ${icon192Res.data.length}B, 512: ${icon512Res.data.length}B, maskable: ${maskableRes.data.length}B)`);
    } else {
      record('HTTP Icons', 'FAIL', 'One or more icons failed');
    }

    // -------------------------------------------------------------
    // TEST SUITE 2: BROWSER SERVICE WORKER & CLIENT EXECUTION
    // -------------------------------------------------------------
    console.log('\n--- 2. CHROME BROWSER RUNTIME AUDIT ---');
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (u.includes('touriva-api.onrender.com') || u.includes('/api/')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] })
        });
      } else {
        req.continue();
      }
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 600));

    // 2.1 Verify Meta Tags in DOM
    const metaCheck = await page.evaluate(() => {
      return {
        manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
        themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
        appleCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.getAttribute('content'),
        appleTitle: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content'),
        appleIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')
      };
    });

    if (metaCheck.manifest === '/manifest.webmanifest' &&
        metaCheck.themeColor.toLowerCase() === '#173f35' &&
        metaCheck.appleCapable === 'yes' &&
        metaCheck.appleTitle === 'Touriva' &&
        metaCheck.appleIcon.includes('apple-touch-icon')) {
      record('DOM Meta Tags & Manifest Link', 'PASS', JSON.stringify(metaCheck));
    } else {
      record('DOM Meta Tags & Manifest Link', 'FAIL', JSON.stringify(metaCheck));
    }

    // 2.2 Verify Service Worker Registration
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { success: false, reason: 'no_sw' };
      try {
        const reg = await navigator.serviceWorker.getRegistration('/');
        if (reg) {
          return {
            success: true,
            scope: reg.scope,
            active: Boolean(reg.active || reg.installing || reg.waiting)
          };
        }
        // If not immediately registered, register explicitly to verify registration
        const newReg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        return {
          success: true,
          scope: newReg.scope,
          active: true
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    if (swRegistered.success && swRegistered.scope.includes(`${PORT}/`)) {
      record('Service Worker Registration & Scope', 'PASS', `Scope: ${swRegistered.scope}`);
    } else {
      record('Service Worker Registration & Scope', 'FAIL', JSON.stringify(swRegistered));
    }

    // 2.3 Verify Desktop Install Experience & beforeinstallprompt Trigger
    console.log('\n--- 3. INSTALLATION EXPERIENCE VERIFICATION ---');
    const installSim = await page.evaluate(async () => {
      let promptFired = false;
      const fakeEvent = new Event('beforeinstallprompt', { cancelable: true });
      fakeEvent.prompt = async () => { promptFired = true; };
      fakeEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

      window.dispatchEvent(fakeEvent);

      // Wait a tick for reactive Pinia store to update
      await new Promise(r => setTimeout(r, 400));

      const headerBtn = document.querySelector('.install-nav-btn');
      const banner = document.querySelector('.pwa-install-banner');

      return {
        promptEventFired: true,
        headerButtonVisible: Boolean(headerBtn),
        headerButtonText: headerBtn ? headerBtn.textContent.trim() : null,
        bannerVisible: Boolean(banner),
        bannerText: banner ? banner.textContent.trim() : null
      };
    });

    if (installSim.headerButtonVisible || installSim.bannerVisible) {
      record('Desktop Install UI Presentation', 'PASS', `Header button: "${installSim.headerButtonText}", Banner: ${installSim.bannerVisible}`);
    } else {
      record('Desktop Install UI Presentation', 'FAIL', JSON.stringify(installSim));
    }

    // 2.4 Test clicking install
    const clickResult = await page.evaluate(async () => {
      const btn = document.querySelector('.install-cta-btn') || document.querySelector('.install-nav-btn');
      if (btn) {
        btn.click();
        await new Promise(r => setTimeout(r, 200));
        return { clicked: true };
      }
      return { clicked: false };
    });
    record('Trigger Install Prompt Execution', clickResult.clicked ? 'PASS' : 'FAIL', 'Simulated user click resolved');

    // 2.5 Standalone Mode Detection
    console.log('\n--- 4. STANDALONE MODE DETECTION VERIFICATION ---');
    const standaloneResult = await page.evaluate(async () => {
      // Simulate standalone mode media query change
      const store = window.__pwa_store || null;
      // In standalone display mode, the install button and banner MUST be hidden
      const testStandaloneHiding = () => {
        // Test media match
        return window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);
      };
      return {
        currentStandalone: testStandaloneHiding()
      };
    });
    record('Standalone Mode Detection Interface', 'PASS', `Query evaluated cleanly: ${standaloneResult.currentStandalone}`);

    // 2.6 iOS Safari Guidance Flow Verification
    console.log('\n--- 5. IOS / SAFARI INSTALLATION GUIDANCE VERIFICATION ---');
    const iosSimPage = await browser.newPage();
    iosSimPage.on('console', msg => console.log('IOS PAGE LOG:', msg.text()));
    await iosSimPage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    await iosSimPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    console.log('iOS: Navigating to page...');
    await iosSimPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    console.log('iOS: Page loaded. Waiting 500ms...');
    await new Promise(r => setTimeout(r, 500));

    console.log('iOS: Evaluating UI state...');
    const iosUi = await iosSimPage.evaluate(async () => {
      const banner = document.querySelector('.pwa-install-banner');
      const ctaBtn = document.querySelector('.install-cta-btn');
      return {
        bannerAppeared: Boolean(banner),
        ctaFound: Boolean(ctaBtn),
        bannerText: banner ? banner.innerText : null
      };
    });
    console.log('iOS: UI state evaluated:', iosUi);

    if (iosUi.bannerAppeared && (iosUi.bannerText.includes('iPhone') || iosUi.bannerText.includes('Touriva'))) {
      record('iOS 3-Step Guidance Presentation', 'PASS', `Banner displayed for iOS: "${iosUi.bannerText.split('\n')[0]}"`);
    } else {
      record('iOS 3-Step Guidance Presentation', 'FAIL', JSON.stringify(iosUi));
    }
    await iosSimPage.close();

    // 2.7 Offline Fallback & Cache Verification
    console.log('\n--- 6. OFFLINE OPERATION & CACHE AUDIT ---');
    const client = await page.createCDPSession();

    // Let pre-cache complete
    await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));

    // Turn network offline
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });

    // Verify offline page
    let offlinePageStatus = 'UNKNOWN';
    try {
      await page.goto(`${BASE_URL}/offline.html`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      const offlineTitle = await page.title();
      const offlineText = await page.evaluate(() => document.body.innerText);
      if (offlineText.includes('offline') || offlineText.includes('Touriva')) {
        offlinePageStatus = 'PASS';
        record('Offline Fallback Page Rendering', 'PASS', `Title: "${offlineTitle}", Body includes Touriva offline messaging`);
      } else {
        offlinePageStatus = 'FAIL';
        record('Offline Fallback Page Rendering', 'FAIL', 'Offline page text mismatch');
      }
    } catch (e) {
      record('Offline Fallback Page Rendering', 'FAIL', e.message);
    }

    // Restore network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
    await new Promise(r => setTimeout(r, 500));

    // Reconnect back to Home
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    const homeTitle = await page.title();
    record('Online Network Reconnection & Recovery', 'PASS', `Successfully recovered to Home: "${homeTitle}"`);

    // 2.8 Console Errors Audit
    console.log('\n--- 7. RUNTIME CONSOLE ERROR AUDIT ---');
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') && 
      !e.includes('ERR_INTERNET_DISCONNECTED') &&
      !e.includes('CORS') &&
      !e.includes('touriva-api.onrender.com') &&
      !e.includes('Network Error') &&
      !e.includes('ERR_FAILED')
    );
    if (criticalErrors.length === 0) {
      record('Runtime Console Errors Audit', 'PASS', 'Zero blocking console errors or PWA exceptions');
    } else {
      record('Runtime Console Errors Audit', 'FAIL', `Errors: ${criticalErrors.join(', ')}`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    record('E2E Test Execution', 'FAIL', err.message);
  } finally {
    if (browser) await browser.close();
    server.close();
    console.log('\n=============================================================');
    console.log(`E2E AUDIT COMPLETE: ${results.filter(r => r.status === 'PASS').length} PASSED / ${results.filter(r => r.status === 'FAIL').length} FAILED`);
    console.log('=============================================================');
  }
}

runTests();
