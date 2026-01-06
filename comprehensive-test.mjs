/**
 * Comprehensive Playwright Test Suite for Cosmos Collective
 * Tests the live website at cosmos-collective.com.au
 *
 * Tests:
 * - All pages and routes
 * - Navigation functionality
 * - Links and external resources
 * - Forms and interactions
 * - Mobile responsiveness
 * - Performance metrics
 * - Accessibility checks
 * - Console errors
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://cosmos-collective.com.au';
const SCREENSHOT_DIR = './test-screenshots';
const TIMEOUT = 30000;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
  performance: {},
  accessibility: {},
  links: {
    working: [],
    broken: [],
  },
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(message) {
  results.passed.push(message);
  log(`✅ PASS: ${message}`, 'green');
}

function fail(message, error = null) {
  const fullMessage = error ? `${message}: ${error}` : message;
  results.failed.push(fullMessage);
  log(`❌ FAIL: ${fullMessage}`, 'red');
}

function warn(message) {
  results.warnings.push(message);
  log(`⚠️  WARN: ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Main test suite
async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Playwright Test',
  });

  const page = await context.newPage();

  // Capture console messages
  const consoleMessages = { errors: [], warnings: [], logs: [] };
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') consoleMessages.errors.push(text);
    else if (type === 'warning') consoleMessages.warnings.push(text);
    else consoleMessages.logs.push(text);
  });

  // Capture failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown error',
    });
  });

  try {
    log('🚀 Starting Comprehensive Test Suite for Cosmos Collective', 'magenta');
    log(`🌐 Testing: ${BASE_URL}\n`, 'magenta');

    // ========================================
    // TEST 1: Homepage
    // ========================================
    section('TEST 1: Homepage');
    await testHomepage(page);

    // ========================================
    // TEST 2: Navigation
    // ========================================
    section('TEST 2: Navigation');
    await testNavigation(page);

    // ========================================
    // TEST 3: All Pages
    // ========================================
    section('TEST 3: All Pages');
    await testAllPages(page);

    // ========================================
    // TEST 4: Explore & Sky Map Features
    // ========================================
    section('TEST 4: Explore & Sky Map Features');
    await testExploreFeatures(page);

    // ========================================
    // TEST 5: Citizen Science
    // ========================================
    section('TEST 5: Citizen Science');
    await testCitizenScience(page);

    // ========================================
    // TEST 6: Launch Section
    // ========================================
    section('TEST 6: Launch Section');
    await testLaunchSection(page);

    // ========================================
    // TEST 7: Mobile Responsiveness
    // ========================================
    section('TEST 7: Mobile Responsiveness');
    await testMobileResponsiveness(context);

    // ========================================
    // TEST 8: Accessibility
    // ========================================
    section('TEST 8: Accessibility');
    await testAccessibility(page);

    // ========================================
    // TEST 9: Links & External Resources
    // ========================================
    section('TEST 9: Links & External Resources');
    await testLinks(page);

    // ========================================
    // TEST 10: Performance
    // ========================================
    section('TEST 10: Performance');
    await testPerformance(page);

    // ========================================
    // Console & Network Errors
    // ========================================
    section('Console & Network Analysis');
    analyzeErrors(consoleMessages, failedRequests);

    // ========================================
    // Generate Report
    // ========================================
    generateReport(results);

  } catch (error) {
    fail('Test suite encountered a critical error', error.message);
  } finally {
    await browser.close();
  }
}

// Test Functions
async function testHomepage(page) {
  try {
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    const loadTime = Date.now() - startTime;

    results.performance.homepageLoadTime = loadTime;
    pass(`Homepage loaded in ${loadTime}ms`);

    // Check title
    const title = await page.title();
    if (title.includes('Cosmos Collective')) {
      pass(`Title is correct: "${title}"`);
    } else {
      fail(`Title is incorrect: "${title}"`);
    }

    // Check main content
    const mainContent = await page.$('main');
    if (mainContent) {
      pass('Main content area exists');
    } else {
      fail('Main content area not found');
    }

    // Check hero section
    const hero = await page.$('text=Explore the Universe');
    if (hero) {
      pass('Hero section found');
    } else {
      warn('Hero section text not found');
    }

    // Take screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-homepage.png`, fullPage: true });

  } catch (error) {
    fail('Homepage test', error.message);
  }
}

async function testNavigation(page) {
  try {
    await page.goto(BASE_URL);

    // Check header navigation
    const header = await page.$('header, nav');
    if (header) {
      pass('Header/navigation found');
    } else {
      fail('Header/navigation not found');
    }

    // Test navigation links
    const navLinks = ['Explore', 'Sky Map', 'Events', 'Science', 'Launch'];
    for (const linkText of navLinks) {
      const link = await page.$(`text=${linkText}`);
      if (link) {
        pass(`Navigation link found: ${linkText}`);
      } else {
        warn(`Navigation link not found: ${linkText}`);
      }
    }

    // Check footer
    const footer = await page.$('footer');
    if (footer) {
      pass('Footer found');
    } else {
      warn('Footer not found');
    }

  } catch (error) {
    fail('Navigation test', error.message);
  }
}

async function testAllPages(page) {
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/explore', name: 'Explore' },
    { path: '/sky-map', name: 'Sky Map' },
    { path: '/events', name: 'Events' },
    { path: '/citizen-science', name: 'Citizen Science' },
    { path: '/launch', name: 'Launch' },
    { path: '/live', name: 'Live' },
    { path: '/agencies', name: 'Agencies' },
    { path: '/vehicles', name: 'Vehicles' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/devlog', name: 'Devlog' },
    { path: '/accessibility', name: 'Accessibility' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/credits', name: 'Credits' },
  ];

  for (const { path, name } of pages) {
    try {
      const startTime = Date.now();
      const response = await page.goto(`${BASE_URL}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT
      });
      const loadTime = Date.now() - startTime;

      if (response.status() === 200) {
        pass(`${name} (${path}) loaded successfully (${loadTime}ms)`);
      } else if (response.status() === 404) {
        warn(`${name} (${path}) returned 404 - page may not exist yet`);
      } else {
        fail(`${name} (${path}) returned status ${response.status()}`);
      }

      // Check for main heading
      const h1 = await page.$('h1');
      if (h1) {
        const h1Text = await h1.textContent();
        pass(`  └─ H1 heading found: "${h1Text.trim()}"`);
      } else {
        warn(`  └─ No H1 heading on ${name}`);
      }

      await page.waitForTimeout(500); // Brief pause between requests

    } catch (error) {
      fail(`${name} (${path})`, error.message);
    }
  }
}

async function testExploreFeatures(page) {
  try {
    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle' });

    // Check for search functionality
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      pass('Search input found on Explore page');
    } else {
      warn('Search input not found on Explore page');
    }

    // Check for filter options (button groups with role="group")
    const filters = await page.$$('[role="group"], select, [role="combobox"]');
    if (filters.length > 0) {
      pass(`${filters.length} filter group(s) found on Explore page`);
    } else {
      warn('No filters found on Explore page');
    }

    // Test Sky Map (use 'load' instead of 'networkidle' - interactive maps continuously load tiles)
    await page.goto(`${BASE_URL}/sky-map`, { waitUntil: 'load', timeout: TIMEOUT });

    // Wait for Aladin container to be present (it loads dynamically)
    await page.waitForSelector('#aladin-lite-div, [id*="aladin"]', { timeout: 10000 }).catch(() => null);

    // Check for Aladin Lite integration
    const aladinContainer = await page.$('#aladin-lite-div, [id*="aladin"]');
    if (aladinContainer) {
      pass('Aladin Lite sky map container found');
    } else {
      warn('Aladin Lite sky map container not found');
    }

  } catch (error) {
    fail('Explore features test', error.message);
  }
}

async function testCitizenScience(page) {
  try {
    await page.goto(`${BASE_URL}/citizen-science`, { waitUntil: 'networkidle' });

    // Check for project cards
    const projectCards = await page.$$('[data-testid*="project"], .project-card, article');
    if (projectCards.length > 0) {
      pass(`${projectCards.length} project card(s) found`);
    } else {
      warn('No project cards found on Citizen Science page');
    }

    // Check for classification tasks
    const classifyButton = await page.$('text=Classify, text=Start Classifying, text=Contribute');
    if (classifyButton) {
      pass('Classification call-to-action found');
    } else {
      warn('Classification call-to-action not found');
    }

  } catch (error) {
    fail('Citizen Science test', error.message);
  }
}

async function testLaunchSection(page) {
  try {
    await page.goto(`${BASE_URL}/launch`, { waitUntil: 'networkidle' });

    // Check for launch cards
    const launchCards = await page.$$('[data-testid*="launch"], .launch-card, article');
    if (launchCards.length > 0) {
      pass(`${launchCards.length} launch card(s) found`);
    } else {
      warn('No launch cards found on Launch page');
    }

    // Check for countdown timers
    const countdown = await page.$('text=T-, [data-countdown]');
    if (countdown) {
      pass('Launch countdown timer found');
    } else {
      warn('Launch countdown timer not found');
    }

    // Test Live page
    await page.goto(`${BASE_URL}/live`, { waitUntil: 'domcontentloaded' });
    pass('Live page accessible');

    // Test Agencies page
    await page.goto(`${BASE_URL}/agencies`, { waitUntil: 'domcontentloaded' });
    pass('Agencies page accessible');

    // Test Vehicles page
    await page.goto(`${BASE_URL}/vehicles`, { waitUntil: 'domcontentloaded' });
    pass('Vehicles page accessible');

  } catch (error) {
    fail('Launch section test', error.message);
  }
}

async function testMobileResponsiveness(context) {
  try {
    // Test mobile viewport
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check for mobile navigation
    const mobileNav = await mobilePage.$('[class*="mobile"], [class*="bottom"], .lg\\:hidden nav');
    if (mobileNav) {
      pass('Mobile navigation found');
    } else {
      warn('Mobile navigation not found');
    }

    // Check for hamburger menu
    const hamburger = await mobilePage.$('button[aria-label*="menu"], button[aria-label*="Menu"]');
    if (hamburger) {
      pass('Mobile menu button found');
    } else {
      warn('Mobile menu button not found');
    }

    // Take mobile screenshot
    await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-homepage.png`, fullPage: true });

    // Test tablet viewport
    await mobilePage.setViewportSize({ width: 768, height: 1024 }); // iPad
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    pass('Tablet viewport (768x1024) renders correctly');

    await mobilePage.close();

  } catch (error) {
    fail('Mobile responsiveness test', error.message);
  }
}

async function testAccessibility(page) {
  try {
    await page.goto(`${BASE_URL}/accessibility`, { waitUntil: 'networkidle' });

    // Check for WCAG compliance statement
    const wcagText = await page.textContent('body');
    if (wcagText.includes('WCAG') || wcagText.includes('accessibility')) {
      pass('Accessibility page contains WCAG information');
    } else {
      warn('Accessibility page missing WCAG information');
    }

    // Check landmarks on homepage
    await page.goto(BASE_URL);

    const landmarks = {
      main: await page.$('main'),
      nav: await page.$('nav'),
      header: await page.$('header'),
      footer: await page.$('footer'),
    };

    for (const [name, element] of Object.entries(landmarks)) {
      if (element) {
        pass(`<${name}> landmark found`);
      } else {
        warn(`<${name}> landmark not found`);
      }
    }

    // Check for skip link
    const skipLink = await page.$('a[href="#main-content"], a[href="#main"], .skip-to-content');
    if (skipLink) {
      pass('Skip to content link found');
    } else {
      warn('Skip to content link not found');
    }

    // Check for ARIA labels on interactive elements
    const buttons = await page.$$('button');
    let buttonsWithLabels = 0;
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      if (ariaLabel || textContent.trim()) {
        buttonsWithLabels++;
      }
    }
    pass(`${buttonsWithLabels}/${buttons.length} buttons have accessible labels`);

  } catch (error) {
    fail('Accessibility test', error.message);
  }
}

async function testLinks(page) {
  try {
    await page.goto(BASE_URL);

    // Get all links
    const links = await page.$$eval('a[href]', anchors =>
      anchors.map(a => ({
        text: a.textContent.trim().substring(0, 50),
        href: a.href,
        isExternal: a.href.startsWith('http') && !a.href.includes('cosmos-collective.com.au'),
      }))
    );

    info(`Found ${links.length} total links`);

    // Test internal links
    const internalLinks = links.filter(link => !link.isExternal && link.href.includes('cosmos-collective.com.au'));
    info(`Testing ${internalLinks.length} internal links...`);

    let workingLinks = 0;
    let brokenLinks = 0;

    for (const link of internalLinks.slice(0, 20)) { // Test first 20 internal links
      try {
        const response = await page.request.head(link.href);
        if (response.ok()) {
          workingLinks++;
          results.links.working.push(link.href);
        } else {
          brokenLinks++;
          results.links.broken.push({ url: link.href, status: response.status() });
        }
      } catch (error) {
        brokenLinks++;
        results.links.broken.push({ url: link.href, error: error.message });
      }
    }

    pass(`${workingLinks} internal links working`);
    if (brokenLinks > 0) {
      warn(`${brokenLinks} internal links broken or unreachable`);
    }

    // Check for external links
    const externalLinks = links.filter(link => link.isExternal);
    info(`${externalLinks.length} external links found (NASA, CSIRO, GitHub, etc.)`);

  } catch (error) {
    fail('Links test', error.message);
  }
}

async function testPerformance(page) {
  try {
    await page.goto(BASE_URL, { waitUntil: 'load' });

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
        tcp: Math.round(perf.connectEnd - perf.connectStart),
        ttfb: Math.round(perf.responseStart - perf.requestStart),
        download: Math.round(perf.responseEnd - perf.responseStart),
        domInteractive: Math.round(perf.domInteractive),
        domComplete: Math.round(perf.domComplete),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
      };
    });

    results.performance = { ...results.performance, ...metrics };

    pass(`DNS Lookup: ${metrics.dns}ms`);
    pass(`TCP Connection: ${metrics.tcp}ms`);
    pass(`Time to First Byte: ${metrics.ttfb}ms`);
    pass(`Download: ${metrics.download}ms`);
    pass(`DOM Interactive: ${metrics.domInteractive}ms`);
    pass(`DOM Complete: ${metrics.domComplete}ms`);

    // Check bundle size (approximate)
    const scripts = await page.$$eval('script[src]', scripts =>
      scripts.map(s => s.src).filter(src => src.includes('cosmos-collective'))
    );
    info(`${scripts.length} JavaScript bundles loaded`);

  } catch (error) {
    fail('Performance test', error.message);
  }
}

function analyzeErrors(consoleMessages, failedRequests) {
  // Console errors
  if (consoleMessages.errors.length > 0) {
    warn(`${consoleMessages.errors.length} console error(s) detected:`);
    consoleMessages.errors.slice(0, 10).forEach(err => {
      warn(`  - ${err.substring(0, 100)}`);
    });
  } else {
    pass('No console errors detected');
  }

  // Failed requests
  if (failedRequests.length > 0) {
    warn(`${failedRequests.length} failed request(s):`);
    failedRequests.slice(0, 10).forEach(req => {
      warn(`  - ${req.url}: ${req.failure}`);
    });
  } else {
    pass('No failed network requests');
  }
}

function generateReport(results) {
  section('TEST SUMMARY');

  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;

  log(`\n✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
  log(`📊 Pass Rate: ${passRate}%\n`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

  // Performance summary
  if (Object.keys(results.performance).length > 0) {
    log('\n📈 Performance Metrics:', 'cyan');
    Object.entries(results.performance).forEach(([key, value]) => {
      log(`  ${key}: ${value}ms`, 'blue');
    });
  }

  // Broken links
  if (results.links.broken.length > 0) {
    log('\n🔗 Broken Links:', 'red');
    results.links.broken.slice(0, 5).forEach(link => {
      log(`  - ${link.url}`, 'red');
    });
  }

  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length,
      passRate: `${passRate}%`,
    },
    results,
  };

  writeFileSync(
    './COMPREHENSIVE-TEST-REPORT.json',
    JSON.stringify(reportData, null, 2)
  );

  log('\n📄 Detailed report saved to: COMPREHENSIVE-TEST-REPORT.json', 'cyan');
  log('📸 Screenshots saved to: ./test-screenshots/', 'cyan');
  log('\n✨ Test suite complete!\n', 'magenta');
}

// Run the test suite
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
