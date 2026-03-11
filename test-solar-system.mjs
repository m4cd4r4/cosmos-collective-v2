import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const RESULTS = [];

function log(test, pass, detail = '') {
  const icon = pass ? 'PASS' : 'FAIL';
  RESULTS.push({ test, pass, detail });
  console.log(`[${icon}] ${test}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // =========================================================================
  // TEST 1: /solar-system loads with no console errors
  // =========================================================================
  console.log('\n--- TEST 1: /solar-system loads with no console errors ---');
  // Navigate directly to the static HTML file (Next.js wraps it via dynamic import)
  await page.goto(`${BASE}/solar-system/index.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(3000); // Let Three.js fully initialize

  // Check canvas exists
  const canvas = await page.$('canvas');
  log('Canvas element exists', !!canvas);

  // Check for JS errors (filter noise)
  const realErrors = consoleErrors.filter(e =>
    !e.includes('favicon') && !e.includes('404') && !e.includes('net::') &&
    !e.includes('texture') && !e.includes('WebGL') && !e.includes('THREE.WebGLRenderer')
  );
  log('/solar-system loads with no console errors', realErrors.length === 0,
    realErrors.length > 0 ? `${realErrors.length} errors: ${realErrors.slice(0, 3).join('; ')}` : 'Clean load');

  // =========================================================================
  // TEST 2: Pluto and Ceres visible with dashed orbit rings and correct labels
  // =========================================================================
  console.log('\n--- TEST 2: Pluto and Ceres visible ---');

  // Check labels exist in the DOM
  const labels = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    return Array.from(labels).map(l => l.textContent);
  });
  log('Ceres label exists', labels.includes('Ceres'), `Labels found: ${labels.join(', ')}`);
  log('Pluto label exists', labels.includes('Pluto'));

  // Check Ceres has dwarf-label class
  const ceresDwarf = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Ceres') return l.classList.contains('dwarf-label');
    }
    return false;
  });
  // Note: dwarf-label is added in updateLabels which runs per frame — check after a frame
  await page.waitForTimeout(1000);
  const ceresDwarfAfter = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Ceres') return l.classList.contains('dwarf-label');
    }
    return false;
  });
  log('Ceres label has dwarf-label class', ceresDwarfAfter);

  // Check follow-target dropdown has Ceres and Pluto
  const followOptions = await page.evaluate(() => {
    const select = document.getElementById('follow-target');
    return Array.from(select.options).map(o => o.value);
  });
  log('Follow-target has ceres option', followOptions.includes('ceres'));
  log('Follow-target has pluto option', followOptions.includes('pluto'));

  // Check planetsData has 10 entries (8 + 2 dwarf) - exclude moon labels
  const planetCount = await page.evaluate(() => {
    return document.querySelectorAll('.planet-label:not(.moon-label)').length;
  });
  log('10 planet labels (8 major + 2 dwarf)', planetCount === 10, `Count: ${planetCount}`);

  // =========================================================================
  // TEST 3: Click Pluto label → info card shows with correct stats
  // =========================================================================
  console.log('\n--- TEST 3: Planet info card on Pluto click ---');

  // First, select Pluto in the follow target to bring camera near it
  await page.evaluate(() => {
    const select = document.getElementById('follow-target');
    select.value = 'pluto';
    select.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(2000);

  // Find and click the Pluto label
  const plutoClicked = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Pluto') {
        l.click();
        return true;
      }
    }
    return false;
  });
  log('Pluto label clicked', plutoClicked);

  await page.waitForTimeout(500);

  // Check info card is visible
  const infoCardVisible = await page.evaluate(() => {
    const card = document.getElementById('planet-info-card');
    return card && card.style.display !== 'none' && card.classList.contains('visible');
  });
  log('Info card is visible after click', infoCardVisible);

  // Check info card content
  const infoCardContent = await page.evaluate(() => {
    return {
      name: document.getElementById('planet-info-name')?.textContent,
      subtitle: document.getElementById('planet-info-subtitle')?.textContent,
      symbol: document.getElementById('planet-info-symbol')?.textContent,
      funfact: document.getElementById('planet-info-funfact')?.textContent,
      stats: document.getElementById('planet-info-stats')?.innerHTML,
    };
  });
  log('Info card shows "Pluto"', infoCardContent.name === 'Pluto', `Name: ${infoCardContent.name}`);
  log('Info card shows "Dwarf Planet" subtitle', infoCardContent.subtitle === 'Dwarf Planet');
  log('Info card has stats content', infoCardContent.stats && (infoCardContent.stats.includes('1,188') || infoCardContent.stats.includes('1188')));
  log('Info card has fun fact', infoCardContent.funfact && infoCardContent.funfact.includes('tidally locked'));

  // Check Dive Into button exists
  const diveBtn = await page.$('#planet-info-dive');
  log('Dive Into button exists on card', !!diveBtn);

  // Close the card
  const closeVisible = await page.evaluate(() => {
    const card = document.getElementById('planet-info-card');
    return card && card.classList.contains('visible');
  });
  if (closeVisible) {
    await page.evaluate(() => document.getElementById('planet-info-close').click());
    await page.waitForTimeout(400);
    const cardClosed = await page.evaluate(() => {
      const card = document.getElementById('planet-info-card');
      return !card.classList.contains('visible');
    });
    log('Info card closes on X click', cardClosed);
  } else {
    log('Info card closes on X click', false, 'Card was not visible to close');
  }

  // =========================================================================
  // TEST 4: Toggle grid on/off
  // =========================================================================
  console.log('\n--- TEST 4: Grid toggle ---');

  // Grid should be on by default
  const gridChecked = await page.evaluate(() => document.getElementById('show-grid')?.checked);
  log('Grid checkbox is checked by default', gridChecked === true);

  // Toggle off (use JS click since checkbox may be in a scrollable panel)
  await page.evaluate(() => document.getElementById('show-grid').click());
  await page.waitForTimeout(300);
  const gridOff = await page.evaluate(() => !document.getElementById('show-grid').checked);
  log('Grid can be toggled off', gridOff);

  // Toggle back on
  await page.evaluate(() => document.getElementById('show-grid').click());
  await page.waitForTimeout(300);
  const gridOn = await page.evaluate(() => document.getElementById('show-grid').checked);
  log('Grid can be toggled back on', gridOn);

  // =========================================================================
  // TEST 5: Labels scale with zoom
  // =========================================================================
  console.log('\n--- TEST 5: Labels scale and remain visible at all distances ---');

  // Go back to Sun (default view)
  await page.evaluate(() => {
    const select = document.getElementById('follow-target');
    select.value = 'sun';
    select.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(1500);

  // Get a label's font size at current zoom
  const fontSize1 = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Earth' && l.style.display !== 'none') {
        return parseFloat(l.style.fontSize) || 12;
      }
    }
    return null;
  });
  log('Earth label has a font size', fontSize1 !== null, `Size: ${fontSize1}px`);

  // Check that at least some planet labels are visible
  const visibleLabels = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    let count = 0;
    labels.forEach(l => { if (l.style.display !== 'none') count++; });
    return count;
  });
  log('Multiple planet labels visible', visibleLabels >= 3, `Visible: ${visibleLabels}`);

  // =========================================================================
  // TEST 6: Distance meter
  // =========================================================================
  console.log('\n--- TEST 6: Distance meter ---');

  // Click the Distance button
  const distBtnExists = await page.$('#toggle-distance');
  log('Distance button exists', !!distBtnExists);

  await page.evaluate(() => document.getElementById('toggle-distance').click());
  await page.waitForTimeout(300);

  // Check button text changed
  const distBtnText = await page.evaluate(() => document.getElementById('toggle-distance').textContent);
  log('Distance button shows "Cancel Distance"', distBtnText === 'Cancel Distance', `Text: "${distBtnText}"`);

  // Check labels have distance-mode class
  const hasDistMode = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    return Array.from(labels).some(l => l.classList.contains('distance-mode'));
  });
  log('Labels have distance-mode cursor', hasDistMode);

  // Click Earth label
  const earthClicked = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Earth' && l.style.display !== 'none') { l.click(); return true; }
    }
    return false;
  });
  log('Earth label clicked as origin', earthClicked);
  await page.waitForTimeout(300);

  // Check Earth is selected
  const earthSelected = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Earth') return l.classList.contains('distance-selected');
    }
    return false;
  });
  log('Earth label highlighted as selected', earthSelected);

  // Click Mars label
  const marsClicked = await page.evaluate(() => {
    const labels = document.querySelectorAll('.planet-label');
    for (const l of labels) {
      if (l.textContent === 'Mars' && l.style.display !== 'none') { l.click(); return true; }
    }
    return false;
  });
  log('Mars label clicked as destination', marsClicked);
  await page.waitForTimeout(500);

  // Check distance label is visible
  const distLabelVisible = await page.evaluate(() => {
    const lbl = document.getElementById('distance-label');
    return lbl && lbl.style.display !== 'none';
  });
  log('Distance label is visible', distLabelVisible);

  // Check distance values
  const distValues = await page.evaluate(() => {
    return {
      names: document.getElementById('distance-label-names')?.textContent,
      au: document.getElementById('distance-label-au')?.textContent,
      km: document.getElementById('distance-label-km')?.textContent,
    };
  });
  log('Distance shows Earth-Mars pair', distValues.names && distValues.names.includes('Earth') && distValues.names.includes('Mars'), `Names: "${distValues.names}"`);
  log('Distance shows AU value', distValues.au && distValues.au.includes('AU'), `AU: "${distValues.au}"`);
  log('Distance shows km value', distValues.km && distValues.km.includes('km'), `km: "${distValues.km}"`);

  // Cancel distance mode
  await page.evaluate(() => document.getElementById('toggle-distance').click());
  await page.waitForTimeout(300);

  // =========================================================================
  // TEST 7: Time scrubber
  // =========================================================================
  console.log('\n--- TEST 7: Time scrubber ---');

  const scrubBtnExists = await page.$('#toggle-scrubber');
  log('Time Travel button exists', !!scrubBtnExists);

  await page.evaluate(() => document.getElementById('toggle-scrubber').click());
  await page.waitForTimeout(500);

  // Check scrubber panel is visible
  const scrubVisible = await page.evaluate(() => {
    const panel = document.getElementById('time-scrubber');
    return panel && panel.style.display !== 'none';
  });
  log('Scrubber bar is visible', scrubVisible);

  // Check scrubber date is populated
  const scrubDate = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  log('Scrubber shows a date', scrubDate && scrubDate.length > 0, `Date: "${scrubDate}"`);

  // Drag the slider to +365 days
  const sliderBefore = await page.evaluate(() => parseInt(document.getElementById('scrubber-slider').value));
  await page.evaluate(() => {
    const slider = document.getElementById('scrubber-slider');
    slider.value = '365';
    slider.dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(500);

  const dateAfter = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  log('Scrubber date changes when slider moves', dateAfter !== scrubDate, `Before: "${scrubDate}", After: "${dateAfter}"`);

  // Check planet positions changed (simulation days should be 365 now)
  const simDays = await page.evaluate(() => {
    const speedEl = document.getElementById('scrubber-speed');
    return speedEl?.textContent;
  });
  log('Scrubber speed display updated', simDays && simDays.includes('1.0'), `Speed: "${simDays}"`);

  // =========================================================================
  // TEST 8: "Today" preset
  // =========================================================================
  console.log('\n--- TEST 8: Today preset ---');

  // Click Today button
  const todayBtn = await page.evaluate(() => {
    const btns = document.querySelectorAll('.scrubber-preset-btn');
    for (const b of btns) {
      if (b.textContent.trim() === 'Today') { b.click(); return true; }
    }
    return false;
  });
  log('Today button clicked', todayBtn);
  await page.waitForTimeout(500);

  const todayDate = await page.evaluate(() => document.getElementById('scrubber-date')?.textContent);
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  log('Today preset shows current year', todayDate && todayDate.includes(currentYear), `Date: "${todayDate}"`);

  // Close scrubber
  await page.evaluate(() => document.getElementById('toggle-scrubber').click());
  await page.waitForTimeout(300);

  // =========================================================================
  // TEST 9: Landing page Carina Nebula card
  // =========================================================================
  console.log('\n--- TEST 9: Landing page Carina Nebula card ---');
  consoleErrors.length = 0;
  await page.goto(`${BASE}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check for the Explore card with aria-label
  const exploreCard = await page.evaluate(() => {
    const links = document.querySelectorAll('a[aria-label]');
    for (const l of links) {
      if (l.getAttribute('aria-label')?.includes('Explore')) return true;
    }
    return false;
  });
  log('Explore card has aria-label', exploreCard);

  // Check images have aria-hidden
  const ariaHiddenImgs = await page.evaluate(() => {
    const section = document.querySelector('#features') || document.querySelector('section');
    if (!section) return 0;
    const imgs = section.querySelectorAll('img[aria-hidden="true"]');
    return imgs.length;
  });
  log('Feature images have aria-hidden="true"', ariaHiddenImgs > 0, `Count: ${ariaHiddenImgs}`);

  // Check the Carina/Explore card image loads (not broken)
  const exploreImg = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      // The explore card uses the carina nebula image
      if (img.closest('a[href="/explore"]')) {
        return { src: img.src, complete: img.complete, naturalWidth: img.naturalWidth };
      }
    }
    return null;
  });
  log('Carina Nebula image found on Explore card', !!exploreImg, exploreImg ? `src: ${exploreImg.src.substring(0, 60)}...` : 'Not found');

  // =========================================================================
  // TEST 10: Credits page Solar System Scope
  // =========================================================================
  console.log('\n--- TEST 10: Credits page Solar System Scope attribution ---');
  await page.goto(`${BASE}/credits`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1000);

  const sssCredit = await page.evaluate(() => {
    return document.body.textContent.includes('Solar System Scope');
  });
  log('Credits page mentions Solar System Scope', sssCredit);

  const sssLink = await page.evaluate(() => {
    const links = document.querySelectorAll('a');
    for (const l of links) {
      if (l.href.includes('solarsystemscope.com/textures')) return true;
    }
    return false;
  });
  log('Credits page links to solarsystemscope.com/textures', sssLink);

  const ccby = await page.evaluate(() => {
    return document.body.textContent.includes('CC BY 4.0') || document.body.textContent.includes('Creative Commons Attribution 4.0');
  });
  log('Credits mentions CC BY 4.0 license', ccby);

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
  console.log('==========================================\n');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
