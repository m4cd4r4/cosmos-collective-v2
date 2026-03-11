import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = resolve(__dirname, 'test-screenshots');
mkdirSync(SHOTS_DIR, { recursive: true });

const BASE = 'http://localhost:3001';
const RESULTS = [];
let shotIndex = 0;

function log(test, pass, detail = '') {
  const icon = pass ? 'PASS' : 'FAIL';
  RESULTS.push({ test, pass, detail });
  console.log(`[${icon}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function shot(page, label) {
  shotIndex++;
  const filename = `${String(shotIndex).padStart(2, '0')}-${label}.png`;
  const filepath = `${SHOTS_DIR}/${filename}`;
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`  📸 ${filename}`);
  return filepath;
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // =========================================================================
  // TEST 1: /solar-system loads with no console errors
  // =========================================================================
  console.log('\n--- TEST 1: Solar system loads ---');
  await page.goto(`${BASE}/solar-system/index.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(4000); // Let Three.js fully initialize + loading screen fade

  const canvas = await page.$('canvas');
  log('Canvas element exists', !!canvas);

  const realErrors = consoleErrors.filter(e =>
    !e.includes('favicon') && !e.includes('404') && !e.includes('net::') &&
    !e.includes('texture') && !e.includes('WebGL') && !e.includes('THREE.WebGLRenderer')
  );
  log('/solar-system loads with no console errors', realErrors.length === 0,
    realErrors.length > 0 ? `${realErrors.length} errors: ${realErrors.slice(0, 3).join('; ')}` : 'Clean load');

  await shot(page, 'solar-system-initial-load');

  // =========================================================================
  // TEST 2: Pluto and Ceres visible — zoom out to see full system
  // =========================================================================
  console.log('\n--- TEST 2: Pluto and Ceres visible ---');

  // Scroll out to see all planets including the outer dwarf planets
  await page.evaluate(() => {
    // Simulate scroll wheel to zoom out and see full solar system
    const canvas = document.querySelector('canvas');
    for (let i = 0; i < 12; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true }));
    }
  });
  await page.waitForTimeout(1500);

  const allLabels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.planet-label')).map(l => l.textContent)
  );
  log('Ceres label exists', allLabels.includes('Ceres'), `Found: ${allLabels.join(', ')}`);
  log('Pluto label exists', allLabels.includes('Pluto'));

  await page.waitForTimeout(500);
  const ceresDwarf = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Ceres') return l.classList.contains('dwarf-label');
    }
    return false;
  });
  log('Ceres has dwarf-label class (dashed border)', ceresDwarf);

  const followOptions = await page.evaluate(() =>
    Array.from(document.getElementById('follow-target').options).map(o => o.value)
  );
  log('Follow-target has Ceres option', followOptions.includes('ceres'));
  log('Follow-target has Pluto option', followOptions.includes('pluto'));

  const planetCount = await page.evaluate(() =>
    document.querySelectorAll('.planet-label:not(.moon-label)').length
  );
  log('10 planet labels (8 major + 2 dwarf)', planetCount === 10, `Count: ${planetCount}`);

  await shot(page, 'pluto-ceres-full-system-view');

  // Zoom to Pluto to show it and its dashed orbit
  await page.evaluate(() => {
    const select = document.getElementById('follow-target');
    select.value = 'pluto';
    select.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(2500);
  await shot(page, 'pluto-with-dashed-orbit');

  // =========================================================================
  // TEST 3: Click Pluto label → info card; Dive Into works
  // =========================================================================
  console.log('\n--- TEST 3: Planet info card + Dive Into ---');

  const plutoClicked = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Pluto') { l.click(); return true; }
    }
    return false;
  });
  log('Pluto label clicked', plutoClicked);
  await page.waitForTimeout(600);

  const infoCardVisible = await page.evaluate(() => {
    const card = document.getElementById('planet-info-card');
    return card && card.style.display !== 'none' && card.classList.contains('visible');
  });
  log('Info card visible after click', infoCardVisible);

  const infoContent = await page.evaluate(() => ({
    name: document.getElementById('planet-info-name')?.textContent,
    subtitle: document.getElementById('planet-info-subtitle')?.textContent,
    funfact: document.getElementById('planet-info-funfact')?.textContent,
    stats: document.getElementById('planet-info-stats')?.innerHTML,
  }));
  log('Info card shows "Pluto"', infoContent.name === 'Pluto', `Name: ${infoContent.name}`);
  log('Info card subtitle is "Dwarf Planet"', infoContent.subtitle === 'Dwarf Planet');
  log('Info card has radius stat (1,188 km)', infoContent.stats && (infoContent.stats.includes('1,188') || infoContent.stats.includes('1188')));
  log('Info card has fun fact (tidally locked)', infoContent.funfact?.includes('tidally locked'));

  await shot(page, 'pluto-info-card-open');

  // Test Dive Into button
  const diveBtn = await page.$('#planet-info-dive');
  log('Dive Into button exists on card', !!diveBtn);

  await page.evaluate(() => document.getElementById('planet-info-dive').click());
  await page.waitForTimeout(3000); // Dive animation takes time

  const diveActive = await page.evaluate(() => {
    // Dive activates: dive-hud gets 'visible' class, dive-altitude becomes visible
    const hud = document.getElementById('dive-hud');
    const alt = document.getElementById('dive-altitude');
    return (hud && hud.classList.contains('visible')) || (alt && alt.classList.contains('visible'));
  });
  log('Dive Into triggers dive animation', diveActive);

  await shot(page, 'pluto-dive-mode-active');

  // Exit dive mode via the planet-dive-btn (active state = toggle off)
  await page.evaluate(() => {
    const diveBtn = document.getElementById('planet-dive-btn');
    if (diveBtn && diveBtn.classList.contains('active')) diveBtn.click();
  });
  await page.waitForTimeout(1500);

  // Reopen info card to test close button
  await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Pluto') { l.click(); break; }
    }
  });
  await page.waitForTimeout(500);

  const closeVisible = await page.evaluate(() =>
    document.getElementById('planet-info-card')?.classList.contains('visible')
  );
  if (closeVisible) {
    await page.evaluate(() => document.getElementById('planet-info-close').click());
    await page.waitForTimeout(400);
    const cardClosed = await page.evaluate(() =>
      !document.getElementById('planet-info-card').classList.contains('visible')
    );
    log('Info card closes on X click', cardClosed);
  } else {
    log('Info card closes on X click', false, 'Card was not visible');
  }

  // =========================================================================
  // TEST 4: Toggle grid on/off — concentric rings + glow plane visible
  // =========================================================================
  console.log('\n--- TEST 4: Grid toggle ---');

  // Go back to default sun view, zoom to see grid
  await page.evaluate(() => {
    const select = document.getElementById('follow-target');
    select.value = 'sun';
    select.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(1500);

  const gridChecked = await page.evaluate(() => document.getElementById('show-grid')?.checked);
  log('Grid is ON by default', gridChecked === true);
  await shot(page, 'grid-on-concentric-rings');

  // Toggle grid OFF
  await page.evaluate(() => document.getElementById('show-grid').click());
  await page.waitForTimeout(500);
  const gridOff = await page.evaluate(() => !document.getElementById('show-grid').checked);
  log('Grid toggles OFF', gridOff);
  await shot(page, 'grid-off-no-rings');

  // Toggle grid back ON
  await page.evaluate(() => document.getElementById('show-grid').click());
  await page.waitForTimeout(500);
  const gridOn = await page.evaluate(() => document.getElementById('show-grid').checked);
  log('Grid toggles back ON', gridOn);

  // =========================================================================
  // TEST 5: Labels scale and remain visible at all distances
  // =========================================================================
  console.log('\n--- TEST 5: Labels scale with zoom ---');

  // Zoom in close (scroll in)
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    for (let i = 0; i < 15; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
    }
  });
  await page.waitForTimeout(1200);

  const fontClose = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.style.display !== 'none') {
        return { label: l.textContent, size: parseFloat(l.style.fontSize) || 12 };
      }
    }
    return null;
  });
  log('Labels visible when zoomed in', fontClose !== null, fontClose ? `"${fontClose.label}" at ${fontClose.size}px` : 'none visible');
  await shot(page, 'labels-zoomed-in-large');

  // Zoom out far
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    for (let i = 0; i < 30; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true }));
    }
  });
  await page.waitForTimeout(1200);

  const fontFar = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.style.display !== 'none') {
        return { label: l.textContent, size: parseFloat(l.style.fontSize) || 12 };
      }
    }
    return null;
  });
  log('Labels still visible when zoomed out', fontFar !== null, fontFar ? `"${fontFar.label}" at ${fontFar.size}px` : 'none visible');

  const scalingWorks = fontClose && fontFar && fontClose.size > fontFar.size;
  log('Labels scale down as camera moves farther', scalingWorks,
    fontClose && fontFar ? `close=${fontClose.size}px, far=${fontFar.size}px` : '');

  await shot(page, 'labels-zoomed-out-small');

  // Reset zoom to default
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    for (let i = 0; i < 12; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);

  // =========================================================================
  // TEST 6: Distance meter — Earth to Mars
  // =========================================================================
  console.log('\n--- TEST 6: Distance meter ---');

  const distBtnEl = await page.$('#toggle-distance');
  log('Distance button exists', !!distBtnEl);

  await page.evaluate(() => document.getElementById('toggle-distance').click());
  await page.waitForTimeout(400);

  const distBtnText = await page.evaluate(() => document.getElementById('toggle-distance').textContent.trim());
  log('Distance button changes to "Cancel Distance"', distBtnText === 'Cancel Distance', `Text: "${distBtnText}"`);

  const hasDistMode = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.planet-label')).some(l => l.classList.contains('distance-mode'))
  );
  log('Labels show crosshair cursor (distance-mode)', hasDistMode);

  await shot(page, 'distance-mode-active-crosshair');

  // Click Earth
  const earthClicked = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Earth' && l.style.display !== 'none') { l.click(); return true; }
    }
    return false;
  });
  log('Earth label clicked as origin', earthClicked);
  await page.waitForTimeout(400);

  const earthSelected = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Earth') return l.classList.contains('distance-selected');
    }
    return false;
  });
  log('Earth highlighted as distance origin', earthSelected);

  await shot(page, 'distance-earth-selected');

  // Click Mars
  const marsClicked = await page.evaluate(() => {
    for (const l of document.querySelectorAll('.planet-label')) {
      if (l.textContent === 'Mars' && l.style.display !== 'none') { l.click(); return true; }
    }
    return false;
  });
  log('Mars label clicked as destination', marsClicked);
  await page.waitForTimeout(600);

  const distLabelVisible = await page.evaluate(() => {
    const lbl = document.getElementById('distance-label');
    return lbl && lbl.style.display !== 'none';
  });
  log('Distance readout card visible', distLabelVisible);

  const distValues = await page.evaluate(() => ({
    names: document.getElementById('distance-label-names')?.textContent,
    au: document.getElementById('distance-label-au')?.textContent,
    km: document.getElementById('distance-label-km')?.textContent,
  }));
  log('Distance shows Earth-Mars pair', distValues.names?.includes('Earth') && distValues.names?.includes('Mars'), `"${distValues.names}"`);
  log('AU value shown', distValues.au?.includes('AU'), `"${distValues.au}"`);
  log('km value shown', distValues.km?.includes('km'), `"${distValues.km}"`);

  await shot(page, 'distance-earth-mars-measurement');

  // Cancel distance mode
  await page.evaluate(() => document.getElementById('toggle-distance').click());
  await page.waitForTimeout(400);

  // =========================================================================
  // TEST 7: Time scrubber — slider moves planets
  // =========================================================================
  console.log('\n--- TEST 7: Time scrubber ---');

  const scrubBtnEl = await page.$('#toggle-scrubber');
  log('Time Travel button exists', !!scrubBtnEl);

  await page.evaluate(() => document.getElementById('toggle-scrubber').click());
  await page.waitForTimeout(600);

  const scrubVisible = await page.evaluate(() => {
    const panel = document.getElementById('time-scrubber');
    return panel && panel.style.display !== 'none';
  });
  log('Scrubber bar is visible', scrubVisible);

  const scrubDate = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  log('Scrubber shows starting date', scrubDate && scrubDate.length > 0, `"${scrubDate}"`);

  await shot(page, 'time-scrubber-open-default');

  // Slide forward 1 year
  await page.evaluate(() => {
    const slider = document.getElementById('scrubber-slider');
    slider.value = '365';
    slider.dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(800);

  const dateAfter = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  log('Date updates when slider moves', dateAfter !== scrubDate, `Before: "${scrubDate}" → After: "${dateAfter}"`);

  await shot(page, 'time-scrubber-plus-1-year');

  // Slide back to -1 year
  await page.evaluate(() => {
    const slider = document.getElementById('scrubber-slider');
    slider.value = '-365';
    slider.dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(800);
  await shot(page, 'time-scrubber-minus-1-year');

  // =========================================================================
  // TEST 8: "Today" preset
  // =========================================================================
  console.log('\n--- TEST 8: Today preset ---');

  const todayBtnClicked = await page.evaluate(() => {
    for (const b of document.querySelectorAll('.scrubber-preset-btn')) {
      if (b.textContent.trim() === 'Today') { b.click(); return true; }
    }
    return false;
  });
  log('Today button found and clicked', todayBtnClicked);
  await page.waitForTimeout(600);

  const todayDate = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  const currentYear = new Date().getFullYear().toString();
  log('Today preset shows current year (2026)', todayDate?.includes(currentYear), `"${todayDate}"`);

  await shot(page, 'time-scrubber-today-preset');

  // Close scrubber
  await page.evaluate(() => document.getElementById('toggle-scrubber').click());
  await page.waitForTimeout(400);

  // =========================================================================
  // TEST 9: Landing page — Carina Nebula card
  // =========================================================================
  console.log('\n--- TEST 9: Landing page Carina Nebula card ---');
  consoleErrors.length = 0;

  await page.goto(`${BASE}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  await shot(page, 'landing-page-hero');

  // Scroll to features section
  await page.evaluate(() => {
    const section = document.getElementById('features') || document.querySelector('section:nth-of-type(2)');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);

  const exploreCard = await page.evaluate(() => {
    for (const l of document.querySelectorAll('a[aria-label]')) {
      if (l.getAttribute('aria-label')?.includes('Explore')) return true;
    }
    return false;
  });
  log('Explore card has aria-label', exploreCard);

  const ariaHiddenImgs = await page.evaluate(() => {
    const section = document.querySelector('#features') || document.querySelector('section');
    return section ? section.querySelectorAll('img[aria-hidden="true"]').length : 0;
  });
  log('Feature images have aria-hidden="true"', ariaHiddenImgs > 0, `Count: ${ariaHiddenImgs}`);

  const carinaImg = await page.evaluate(() => {
    for (const img of document.querySelectorAll('img')) {
      if (img.closest('a[href="/explore"]')) {
        return { src: img.src, complete: img.complete, w: img.naturalWidth };
      }
    }
    return null;
  });
  log('Carina Nebula image found on Explore card', !!carinaImg, carinaImg ? carinaImg.src.substring(0, 70) : 'Not found');
  // Next.js lazy-loads images; verify the src points to ESA Webb CDN (correct URL after earlier fix)
  log('Carina image points to ESA Webb CDN (correct URL)', carinaImg?.src?.includes('esawebb.org'), carinaImg ? carinaImg.src.substring(0, 70) : '');

  await shot(page, 'landing-page-carina-nebula-card');

  // =========================================================================
  // TEST 10: Credits page — Solar System Scope attribution
  // =========================================================================
  console.log('\n--- TEST 10: Credits page SSS attribution ---');

  await page.goto(`${BASE}/credits`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1000);

  const sssText = await page.evaluate(() => document.body.textContent.includes('Solar System Scope'));
  log('Credits mentions Solar System Scope', sssText);

  const sssLink = await page.evaluate(() => {
    for (const l of document.querySelectorAll('a')) {
      if (l.href.includes('solarsystemscope.com/textures')) return true;
    }
    return false;
  });
  log('Credits links to solarsystemscope.com/textures', sssLink);

  const ccby = await page.evaluate(() =>
    document.body.textContent.includes('CC BY 4.0') || document.body.textContent.includes('Creative Commons Attribution 4.0')
  );
  log('Credits mentions CC BY 4.0 license', ccby);

  await shot(page, 'credits-page-sss-attribution');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n==========================================');
  console.log('            TEST SUMMARY');
  console.log('==========================================');
  const passed = RESULTS.filter(r => r.pass).length;
  const failed = RESULTS.filter(r => !r.pass).length;
  console.log(`Total: ${RESULTS.length}  |  PASS: ${passed}  |  FAIL: ${failed}`);
  if (failed > 0) {
    console.log('\nFailed tests:');
    RESULTS.filter(r => !r.pass).forEach(r => {
      console.log(`  [FAIL] ${r.test}${r.detail ? ' — ' + r.detail : ''}`);
    });
  }
  console.log(`\nScreenshots saved to: ${SHOTS_DIR}`);
  console.log('==========================================\n');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
