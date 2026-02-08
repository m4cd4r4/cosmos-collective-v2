const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 640 }
  });

  await page.goto('https://cosmos-collective-v2.vercel.app', {
    waitUntil: 'networkidle'
  });

  // Wait a bit for animations
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'public/images/social-preview.png',
    fullPage: false
  });

  console.log('Screenshot saved to public/images/social-preview.png');
  console.log('Size: 1280x640px (optimized for GitHub social preview)');

  await browser.close();
})();
