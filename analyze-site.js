/**
 * Site Analysis Script
 * Takes screenshots of all pages and analyzes for accuracy
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://cosmos-collective-v2.vercel.app';

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/explore', name: 'explore' },
  { path: '/explore/jwst-carina-nebula', name: 'explore-carina' },
  { path: '/explore/jwst-smacs-0723', name: 'explore-smacs' },
  { path: '/explore/jwst-stephans-quintet', name: 'explore-stephans' },
  { path: '/explore/jwst-southern-ring', name: 'explore-southern-ring' },
  { path: '/explore/jwst-pillars-creation', name: 'explore-pillars' },
  { path: '/explore/jwst-jupiter', name: 'explore-jupiter' },
  { path: '/sky-map', name: 'sky-map' },
  { path: '/events', name: 'events' },
  { path: '/citizen-science', name: 'citizen-science' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/devlog', name: 'devlog' },
];

async function analyzeImages(page) {
  // Get all images on the page
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
      loaded: img.complete && img.naturalWidth > 0,
      currentSrc: img.currentSrc,
    }));
  });

  return images;
}

async function main() {
  const outputDir = path.join(__dirname, 'screenshots-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const report = {
    timestamp: new Date().toISOString(),
    pages: [],
  };

  for (const pageInfo of PAGES) {
    console.log(`Analyzing: ${pageInfo.name} (${pageInfo.path})`);

    try {
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for images to load
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshotPath = path.join(outputDir, `${pageInfo.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // Analyze images
      const images = await analyzeImages(page);

      // Check for broken images
      const brokenImages = images.filter(img => !img.loaded && img.displayed);
      const loadedImages = images.filter(img => img.loaded);

      // Get page title
      const title = await page.title();

      // Check for specific content issues
      const pageContent = await page.content();

      const pageReport = {
        name: pageInfo.name,
        path: pageInfo.path,
        title,
        screenshot: `${pageInfo.name}.png`,
        totalImages: images.length,
        loadedImages: loadedImages.length,
        brokenImages: brokenImages.length,
        brokenImageDetails: brokenImages.map(img => ({
          src: img.src,
          alt: img.alt,
        })),
        allImages: images.map(img => ({
          src: img.src?.substring(0, 100) + (img.src?.length > 100 ? '...' : ''),
          alt: img.alt,
          loaded: img.loaded,
          dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
        })),
      };

      report.pages.push(pageReport);

      console.log(`  - ${loadedImages.length}/${images.length} images loaded`);
      if (brokenImages.length > 0) {
        console.log(`  - WARNING: ${brokenImages.length} broken images`);
      }

    } catch (error) {
      console.error(`  - ERROR: ${error.message}`);
      report.pages.push({
        name: pageInfo.name,
        path: pageInfo.path,
        error: error.message,
      });
    }
  }

  // Save report
  const reportPath = path.join(outputDir, 'analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  // Print summary
  console.log('\n=== SUMMARY ===');
  let totalBroken = 0;
  for (const pageReport of report.pages) {
    if (pageReport.brokenImages > 0) {
      console.log(`${pageReport.name}: ${pageReport.brokenImages} broken images`);
      totalBroken += pageReport.brokenImages;
    }
  }
  if (totalBroken === 0) {
    console.log('All images loaded successfully!');
  }

  await browser.close();
}

main().catch(console.error);
