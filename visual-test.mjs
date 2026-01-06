/**
 * Visual Analysis with Screenshots
 * Captures the actual state of the navigation
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3003';
const SCREENSHOT_DIR = './test-screenshots';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function visualAnalysis() {
  console.log('📸 Starting Visual Analysis with Screenshots...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to homepage
    console.log('1️⃣  Loading homepage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage-initial.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 01-homepage-initial.png');

    // Check initial navigation state
    console.log('\n2️⃣  Checking initial navigation...');
    const observeTab = page.locator('button:has-text("Observe")');
    const launchTab = page.locator('button:has-text("Launch")');

    console.log(`  Observe tab visible: ${await observeTab.isVisible()}`);
    console.log(`  Launch tab visible: ${await launchTab.isVisible()}`);

    // Click Observe tab first
    console.log('\n3️⃣  Clicking Observe tab...');
    await observeTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-observe-tab-active.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 02-observe-tab-active.png');

    // Check Observe sub-navigation
    const exploreLink = page.locator('nav a:has-text("Explore")');
    const skyMapLink = page.locator('nav a:has-text("Sky Map")');
    console.log(`  Explore link visible: ${await exploreLink.isVisible()}`);
    console.log(`  Sky Map link visible: ${await skyMapLink.isVisible()}`);

    // Click Launch tab
    console.log('\n4️⃣  Clicking Launch tab...');
    await launchTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-launch-tab-active.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 03-launch-tab-active.png');

    // Check Launch sub-navigation with detailed selectors
    console.log('\n5️⃣  Checking Launch sub-navigation...');

    // Check all possible link selectors
    const upcomingLinkExact = page.locator('a[href="/launch"]');
    const liveLinkExact = page.locator('a[href="/live"]');
    const agenciesLinkExact = page.locator('a[href="/agencies"]');
    const vehiclesLinkExact = page.locator('a[href="/vehicles"]');

    console.log('  Links by href attribute:');
    console.log(`    /launch: ${await upcomingLinkExact.count()} found, visible: ${await upcomingLinkExact.first().isVisible().catch(() => false)}`);
    console.log(`    /live: ${await liveLinkExact.count()} found, visible: ${await liveLinkExact.first().isVisible().catch(() => false)}`);
    console.log(`    /agencies: ${await agenciesLinkExact.count()} found, visible: ${await agenciesLinkExact.first().isVisible().catch(() => false)}`);
    console.log(`    /vehicles: ${await vehiclesLinkExact.count()} found, visible: ${await vehiclesLinkExact.first().isVisible().catch(() => false)}`);

    // Get all links in the nav
    const allNavLinks = page.locator('nav a');
    const navLinkCount = await allNavLinks.count();
    console.log(`\n  Total nav links found: ${navLinkCount}`);
    for (let i = 0; i < navLinkCount; i++) {
      const href = await allNavLinks.nth(i).getAttribute('href');
      const text = await allNavLinks.nth(i).textContent();
      const visible = await allNavLinks.nth(i).isVisible();
      console.log(`    [${i}] href="${href}" text="${text?.trim()}" visible=${visible}`);
    }

    // Navigate to /launch page directly
    console.log('\n6️⃣  Navigating to /launch page...');
    await page.goto(`${BASE_URL}/launch`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-launch-page.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 04-launch-page.png');

    // Check header on launch page
    console.log('\n7️⃣  Checking header on launch page...');
    const launchPageNav = page.locator('nav a');
    const launchPageNavCount = await launchPageNav.count();
    console.log(`  Nav links on launch page: ${launchPageNavCount}`);
    for (let i = 0; i < Math.min(launchPageNavCount, 10); i++) {
      const href = await launchPageNav.nth(i).getAttribute('href');
      const text = await launchPageNav.nth(i).textContent();
      const visible = await launchPageNav.nth(i).isVisible();
      console.log(`    [${i}] href="${href}" text="${text?.trim()}" visible=${visible}`);
    }

    // Check page content
    console.log('\n8️⃣  Checking launch page content...');
    const h1 = await page.locator('h1').first().textContent();
    const nextLaunchSection = page.locator('h2:has-text("Next Launch")');
    const upcomingSection = page.locator('h2:has-text("Upcoming Launches")');

    console.log(`  H1: ${h1}`);
    console.log(`  Next Launch section: ${await nextLaunchSection.isVisible()}`);
    console.log(`  Upcoming Launches section: ${await upcomingSection.isVisible()}`);

    // Mobile view test
    console.log('\n9️⃣  Testing mobile view (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-mobile-home.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 05-mobile-home.png');

    await page.goto(`${BASE_URL}/launch`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-launch.png'), fullPage: true });
    console.log('  ✓ Screenshot saved: 06-mobile-launch.png');

    console.log('\n✨ Visual analysis complete!');
    console.log(`📁 Screenshots saved to: ${path.resolve(SCREENSHOT_DIR)}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

visualAnalysis();
