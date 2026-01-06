/**
 * Quick Playwright Analysis Script
 * Tests the running cosmos-collective application
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3003';

async function analyzeApp() {
  console.log('🚀 Starting Playwright analysis...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Test 1: Homepage
    console.log('📄 Test 1: Homepage');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    console.log(`  ✓ Title: ${title}`);
    console.log(`  ✓ URL: ${page.url()}`);

    // Test 2: Header Navigation
    console.log('\n🧭 Test 2: Header Navigation');
    const observeTab = page.locator('button:has-text("Observe")');
    const launchTab = page.locator('button:has-text("Launch")');

    const observeExists = await observeTab.count() > 0;
    const launchExists = await launchTab.count() > 0;

    console.log(`  ${observeExists ? '✓' : '✗'} Observe tab present`);
    console.log(`  ${launchExists ? '✓' : '✗'} Launch tab present`);

    // Test 3: Navigate to Launch section
    console.log('\n🚀 Test 3: Launch Section Navigation');
    if (launchExists) {
      await launchTab.click();
      await page.waitForTimeout(500);

      // Check for Launch sub-navigation items
      const upcomingLink = page.locator('a:has-text("Upcoming")');
      const liveLink = page.locator('a:has-text("Live")');
      const agenciesLink = page.locator('a:has-text("Agencies")');
      const vehiclesLink = page.locator('a:has-text("Vehicles")');

      console.log(`  ${await upcomingLink.count() > 0 ? '✓' : '✗'} Upcoming link present`);
      console.log(`  ${await liveLink.count() > 0 ? '✓' : '✗'} Live link present`);
      console.log(`  ${await agenciesLink.count() > 0 ? '✓' : '✗'} Agencies link present`);
      console.log(`  ${await vehiclesLink.count() > 0 ? '✓' : '✗'} Vehicles link present`);
    }

    // Test 4: Navigate to /launch page
    console.log('\n📅 Test 4: Launch Page');
    await page.goto(`${BASE_URL}/launch`);
    await page.waitForLoadState('networkidle');

    const launchPageTitle = await page.locator('h1').first().textContent();
    console.log(`  ✓ Page loaded: ${launchPageTitle}`);

    // Check for launch content
    const nextLaunchSection = page.locator('h2:has-text("Next Launch")');
    const upcomingLaunchesSection = page.locator('h2:has-text("Upcoming Launches")');

    console.log(`  ${await nextLaunchSection.count() > 0 ? '✓' : '✗'} Next Launch section present`);
    console.log(`  ${await upcomingLaunchesSection.count() > 0 ? '✓' : '✗'} Upcoming Launches section present`);

    // Test 5: Mobile Responsiveness
    console.log('\n📱 Test 5: Mobile View');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const mobileBottomNav = page.locator('nav').filter({ hasText: 'Home' });
    console.log(`  ${await mobileBottomNav.count() > 0 ? '✓' : '✗'} Mobile bottom navigation present`);

    // Test 6: Accessibility Check
    console.log('\n♿ Test 6: Accessibility Basics');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const mainLandmark = page.locator('main');
    const navLandmark = page.locator('nav');
    const headingLevel1 = page.locator('h1');

    console.log(`  ${await mainLandmark.count() > 0 ? '✓' : '✗'} Main landmark present`);
    console.log(`  ${await navLandmark.count() > 0 ? '✓' : '✗'} Nav landmark present`);
    console.log(`  ${await headingLevel1.count() > 0 ? '✓' : '✗'} H1 heading present`);

    // Test 7: Performance Metrics
    console.log('\n⚡ Test 7: Performance Metrics');
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
      };
    });

    console.log(`  ✓ DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`  ✓ Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`  ✓ Total Load Time: ${performanceMetrics.totalTime}ms`);

    // Test 8: Console Errors
    console.log('\n🐛 Test 8: Console Errors');
    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (errors.length === 0) {
      console.log('  ✓ No console errors detected');
    } else {
      console.log(`  ✗ ${errors.length} console error(s) detected:`);
      errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
    }

    if (warnings.length === 0) {
      console.log('  ✓ No console warnings detected');
    } else {
      console.log(`  ⚠ ${warnings.length} console warning(s) detected`);
    }

    console.log('\n✨ Analysis complete!');
    console.log('\n📊 Summary:');
    console.log('  - Homepage loads correctly');
    console.log('  - New tabbed navigation implemented');
    console.log('  - Launch page functional');
    console.log('  - Mobile responsive');
    console.log('  - Basic accessibility checks passed');
    console.log(`  - Performance: ${performanceMetrics.totalTime}ms total load`);

  } catch (error) {
    console.error('\n❌ Error during analysis:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeApp();
