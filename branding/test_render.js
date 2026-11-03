const puppeteer = require('/home/next/next projects/touriva/scripts/node_modules/puppeteer-core');
const path = require('path');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 450, deviceScaleFactor: 1 });

  const mdiCssPath = path.resolve(__dirname, '../frontEnd/touriva/node_modules/@mdi/font/css/materialdesignicons.css');
  const pngPath = path.resolve(__dirname, 'logo/touriva-logo-256.png');
  const svgPath = path.resolve(__dirname, 'logo/touriva-logo.svg');

  const html = `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="file://${mdiCssPath}">
  <style>
    body { background: #173F35; margin: 0; padding: 40px; display: flex; gap: 40px; align-items: center; justify-content: center; }
    .box { display: flex; flex-direction: column; align-items: center; color: #FAF8F2; font-family: sans-serif; font-size: 14px; }
    .icon-font { font-size: 256px; width: 256px; height: 256px; line-height: 256px; text-align: center; color: #D9B98C; display: inline-block; }
    p { margin-top: 15px; }
  </style>
</head>
<body>
  <div class="box">
    <i class="mdi mdi-compass-rose icon-font"></i>
    <p>MDI Font Icon (256px)</p>
  </div>
  <div class="box">
    <img src="file://${pngPath}" width="256" height="256">
    <p>Generated PNG (256px)</p>
  </div>
  <div class="box">
    <img src="file://${svgPath}" width="256" height="256">
    <p>Generated SVG (256px)</p>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.resolve(__dirname, 'test_render_compare.png') });
  console.log('Success! Screenshot saved to branding/test_render_compare.png');
  await browser.close();
}
test().catch(console.error);
