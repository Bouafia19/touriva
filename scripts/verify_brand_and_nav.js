const puppeteer = require('./node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../audit/brand_redesign_verified');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  console.log('Launching browser to audit navigation and brand redesign...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Check if "Install Touriva" button exists in the header
    const installBtn = await page.evaluate(() => {
      const header = document.querySelector('.editorial-app-bar');
      if (!header) return null;
      const text = header.innerText || '';
      return {
        hasInstallText: text.includes('Install Touriva') || text.includes('Installer Touriva') || text.includes('تثبيت تريفا'),
        headerText: text
      };
    });

    console.log(`[${vp.name}] Top Navigation has install CTA:`, installBtn.hasInstallText);

    // Check logo image in header
    const logoInfo = await page.evaluate(() => {
      const logoImg = document.querySelector('.header-brand-logo');
      if (!logoImg) return null;
      const rect = logoImg.getBoundingClientRect();
      const imgTag = logoImg.querySelector('img') || logoImg;
      return {
        width: rect.width,
        height: rect.height,
        src: imgTag.getAttribute('src') || logoImg.getAttribute('src'),
        visible: rect.width > 0 && rect.height > 0
      };
    });

    console.log(`[${vp.name}] Logo image:`, logoInfo);

    // Capture screenshot of the header
    const headerEl = await page.$('.editorial-app-bar');
    if (headerEl) {
      await headerEl.screenshot({
        path: path.join(outDir, `header_${vp.name}_${vp.width}px.png`)
      });
      console.log(`[${vp.name}] Saved header screenshot: header_${vp.name}_${vp.width}px.png`);
    }

    // Capture full-page screenshot
    await page.screenshot({
      path: path.join(outDir, `page_${vp.name}_${vp.width}px.png`)
    });
    console.log(`[${vp.name}] Saved page screenshot: page_${vp.name}_${vp.width}px.png`);

    // If mobile or tablet, also test drawer
    if (vp.width <= 768) {
      const navIcon = await page.$('.header-nav-icon');
      if (navIcon) {
        await navIcon.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Check if drawer has install CTA
        const drawerInfo = await page.evaluate(() => {
          const drawer = document.querySelector('.editorial-drawer');
          if (!drawer) return { found: false };
          const text = drawer.innerText || '';
          return {
            found: true,
            hasInstallText: text.includes('Install Touriva') || text.includes('Installer Touriva') || text.includes('تثبيت تريفا')
          };
        });
        console.log(`[${vp.name}] Mobile Drawer has install CTA:`, drawerInfo.hasInstallText);

        const drawerEl = await page.$('.editorial-drawer');
        if (drawerEl) {
          await drawerEl.screenshot({
            path: path.join(outDir, `drawer_${vp.name}_${vp.width}px.png`)
          });
          console.log(`[${vp.name}] Saved drawer screenshot: drawer_${vp.name}_${vp.width}px.png`);
        }
      }
    }
  }

  // Also check Agency Layout at desktop
  console.log('\nTesting Agency Layout at desktop 1280x800...');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:5173/agency/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const agencyHeader = await page.evaluate(() => {
    const bar = document.querySelector('.v-app-bar');
    if (!bar) return { found: false };
    const text = bar.innerText || '';
    return {
      found: true,
      hasInstallText: text.includes('Install Touriva') || text.includes('Installer Touriva')
    };
  });
  console.log('Agency top bar has install CTA:', agencyHeader.hasInstallText);

  await page.screenshot({
    path: path.join(outDir, 'agency_desktop_1280px.png')
  });
  console.log('Saved agency screenshot: agency_desktop_1280px.png');

  await browser.close();
  console.log('\nAll viewport and layout visual verification completed successfully!');
})();
