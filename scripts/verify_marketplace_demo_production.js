const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, 'node_modules/puppeteer-core'));

const OUT_DIR = path.resolve(__dirname, '../audit/marketplace_demo_verified');
const BRAIN_SCREENSHOTS = '/home/next/.gemini/antigravity-cli/brain/f6d10f75-751a-48db-a5ea-b01b7303ed0e/screenshots';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
if (!fs.existsSync(BRAIN_SCREENSHOTS)) {
  fs.mkdirSync(BRAIN_SCREENSHOTS, { recursive: true });
}

function saveScreenshot(sourcePath, filename) {
  const destPath = path.join(BRAIN_SCREENSHOTS, filename);
  try {
    fs.copyFileSync(sourcePath, destPath);
  } catch (e) {
    console.error('Failed to copy screenshot to brain dir:', e.message);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('================================================================');
  console.log('TOURIVA MARKETPLACE PRODUCTION DEMO VERIFICATION');
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  // -------------------------------------------------------------
  // TEST 1: STOREFRONT DEMO LOGIN & ORDER ACCESS
  // -------------------------------------------------------------
  console.log('\n--- 1. Storefront Demo Login (https://market.touriva.nextchallenge.tech) ---');
  try {
    await page.goto('https://market.touriva.nextchallenge.tech/user/login', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Storefront login loaded.');

    const loginScreenPath = path.join(OUT_DIR, '01_storefront_login_screen.png');
    await page.screenshot({ path: loginScreenPath });
    saveScreenshot(loginScreenPath, '01_storefront_login_screen.png');

    // Click demo customer button
    console.log('Clicking Demo Customer Lynda Meziani...');
    const clickedCustomer = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button.demo-account-btn, button'));
      const btn = btns.find(b => b.textContent.includes('Lynda Meziani') || b.textContent.includes('customer@touriva.test'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log('Customer button clicked:', clickedCustomer);
    await sleep(4000);

    let currentUrl = page.url();
    if (currentUrl.includes('/user/login')) {
      console.log('Fallback: manual credential submission...');
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = '';
        if (inputs[1]) inputs[1].value = '';
      });
      await page.type('input[type="text"]', 'customer@touriva.test');
      await page.type('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await sleep(4000);
      currentUrl = page.url();
    }

    console.log('Storefront post-login URL:', currentUrl);

    const loggedInScreenPath = path.join(OUT_DIR, '02_storefront_logged_in.png');
    await page.screenshot({ path: loggedInScreenPath });
    saveScreenshot(loggedInScreenPath, '02_storefront_logged_in.png');

    const userInfo = await page.evaluate(() => localStorage.getItem('userInfo'));
    console.log('Storefront LocalStorage userInfo present:', !!userInfo);

    // Navigate to user orders
    console.log('Navigating to user orders history...');
    await page.goto('https://market.touriva.nextchallenge.tech/user/orders', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    const ordersScreenPath = path.join(OUT_DIR, '03_storefront_orders_history.png');
    await page.screenshot({ path: ordersScreenPath });
    saveScreenshot(ordersScreenPath, '03_storefront_orders_history.png');
    console.log('Storefront orders history captured.');
  } catch (e) {
    console.error('Storefront test error:', e.message);
  }

  // -------------------------------------------------------------
  // TEST 2: SELLER PORTAL DEMO LOGIN & ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- 2. Seller Portal Demo Login (https://seller.market.touriva.nextchallenge.tech) ---');
  try {
    await page.goto('https://seller.market.touriva.nextchallenge.tech/login', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Seller portal login loaded.');

    const sellerLoginPath = path.join(OUT_DIR, '04_seller_login_screen.png');
    await page.screenshot({ path: sellerLoginPath });
    saveScreenshot(sellerLoginPath, '04_seller_login_screen.png');

    // Click demo seller button
    console.log('Clicking Demo Seller button for Atlas Electronics DZ...');
    const clickedSeller = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button.demo-seller-btn, button'));
      const btn = btns.find(b => b.textContent.includes('Atlas Electronics DZ') || b.textContent.includes('Karim Menouar'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log('Seller button clicked:', clickedSeller);
    await sleep(4000);

    let sellerUrl = page.url();
    if (sellerUrl.includes('/login')) {
      console.log('Fallback: manual seller credential submission...');
      await page.type('input[type="text"], input[type="email"]', 'seller1@touriva.test');
      await page.type('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await sleep(4000);
      sellerUrl = page.url();
    }

    console.log('Seller Portal post-login URL:', sellerUrl);

    const sellerDashPath = path.join(OUT_DIR, '05_seller_dashboard.png');
    await page.screenshot({ path: sellerDashPath });
    saveScreenshot(sellerDashPath, '05_seller_dashboard.png');

    // Navigate to products
    console.log('Navigating to Seller Products...');
    await page.goto('https://seller.market.touriva.nextchallenge.tech/products', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    const sellerProdsPath = path.join(OUT_DIR, '06_seller_products.png');
    await page.screenshot({ path: sellerProdsPath });
    saveScreenshot(sellerProdsPath, '06_seller_products.png');

    // Navigate to orders
    console.log('Navigating to Seller Orders...');
    await page.goto('https://seller.market.touriva.nextchallenge.tech/orders', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    const sellerOrdersPath = path.join(OUT_DIR, '07_seller_orders.png');
    await page.screenshot({ path: sellerOrdersPath });
    saveScreenshot(sellerOrdersPath, '07_seller_orders.png');
    console.log('Seller orders captured.');
  } catch (e) {
    console.error('Seller test error:', e.message);
  }

  // -------------------------------------------------------------
  // TEST 3: OWNER ADMIN DEMO LOGIN & GOVERNANCE
  // -------------------------------------------------------------
  console.log('\n--- 3. Admin Portal Demo Login (https://admin.market.touriva.nextchallenge.tech) ---');
  try {
    await page.goto('https://admin.market.touriva.nextchallenge.tech/login', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Admin portal login loaded.');

    const adminLoginPath = path.join(OUT_DIR, '08_admin_login_screen.png');
    await page.screenshot({ path: adminLoginPath });
    saveScreenshot(adminLoginPath, '08_admin_login_screen.png');

    // Click demo admin button
    console.log('Clicking Demo Admin button...');
    const clickedAdmin = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button.demo-admin-btn, button'));
      const btn = btns.find(b => b.textContent.includes('Touriva Demo Administrator') || b.textContent.includes('Marketplace Administrator'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log('Admin button clicked:', clickedAdmin);
    await sleep(4000);

    let adminUrl = page.url();
    if (adminUrl.includes('/login')) {
      console.log('Fallback: manual admin credential submission...');
      await page.type('input[type="text"], input[type="email"]', 'demo.admin@touriva.example');
      await page.type('input[type="password"]', 'Touriva#Admin2026!Sec');
      await page.click('button[type="submit"]');
      await sleep(4000);
      adminUrl = page.url();
    }

    console.log('Admin Portal post-login URL:', adminUrl);

    const adminDashPath = path.join(OUT_DIR, '09_admin_dashboard.png');
    await page.screenshot({ path: adminDashPath });
    saveScreenshot(adminDashPath, '09_admin_dashboard.png');

    // Navigate to sellers list
    console.log('Navigating to Admin Sellers list...');
    await page.goto('https://admin.market.touriva.nextchallenge.tech/sellers', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    const adminSellersPath = path.join(OUT_DIR, '10_admin_sellers.png');
    await page.screenshot({ path: adminSellersPath });
    saveScreenshot(adminSellersPath, '10_admin_sellers.png');
    console.log('Admin sellers captured.');
  } catch (e) {
    console.error('Admin test error:', e.message);
  }

  await browser.close();
  console.log('\n================================================================');
  console.log('DEMO VERIFICATION COMPLETE. All screenshots preserved.');
  console.log('================================================================');
})();
