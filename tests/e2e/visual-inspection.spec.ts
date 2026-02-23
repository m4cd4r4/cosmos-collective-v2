import { test, expect } from '@playwright/test'

const SCREENSHOT_DIR = 'tests/e2e/screenshots'

// Helper: wait for network to settle then take a full-page screenshot
async function screenshotPage(page: any, name: string) {
  // Wait for network idle-ish (no pending requests for 1s)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000) // let animations/fetches settle
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: true,
  })
}

// Helper: viewport-only screenshot (for above-the-fold)
async function screenshotViewport(page: any, name: string) {
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: false,
  })
}

// ============================================
// 1. HOMEPAGE
// ============================================
test.describe('Homepage', () => {
  test('hero section with solar system iframe', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Wait for iframe to load
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '01-homepage-hero-initial')

    // Wait for hero card to appear (5s delay + buffer)
    await page.waitForTimeout(5000)
    await screenshotViewport(page, '02-homepage-hero-card-revealed')

    // Verify hero card content (card may or may not have appeared depending on timing)
    const heading = page.locator('#hero-heading')
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toContainText('Cosmos')
      await expect(page.locator('text=Live Multi-Wavelength Observatory')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Deep Space Observatory', exact: true })).toBeVisible()
    }
  })

  test('hero card dismiss and solar system interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000) // wait for card

    // Dismiss card by pressing Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    await screenshotViewport(page, '03-homepage-hero-dismissed')
  })

  test('homepage scroll sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000)
    await page.keyboard.press('Escape') // dismiss hero card

    // Scroll through each section
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '04-homepage-section-after-hero')

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '05-homepage-section-mid')

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 3, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '06-homepage-section-telescopes')

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 4, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '07-homepage-section-ska')

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 5, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '08-homepage-section-citizen-science')

    // Full page
    await screenshotPage(page, '09-homepage-full')
  })
})

// ============================================
// 2. OBSERVATORY
// ============================================
test.describe('Observatory', () => {
  test('observatory viewer with observations', async ({ page }) => {
    await page.goto('/observatory', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '10-observatory-initial')

    // Scroll to see observation cards
    await page.evaluate(() => window.scrollBy(0, 400))
    await page.waitForTimeout(1500)
    await screenshotViewport(page, '11-observatory-scrolled')

    // Try clicking an observation if visible
    const obsCard = page.locator('[class*="observation"], [class*="card"]').first()
    if (await obsCard.isVisible()) {
      await obsCard.click()
      await page.waitForTimeout(2000)
      await screenshotViewport(page, '12-observatory-selected')
    }

    await screenshotPage(page, '13-observatory-full')
  })
})

// ============================================
// 3. SKY MAP
// ============================================
test.describe('Sky Map', () => {
  test('sky map viewer with Aladin', async ({ page }) => {
    await page.goto('/sky-map', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000) // Aladin takes time to load
    await screenshotViewport(page, '14-skymap-initial')

    await screenshotPage(page, '15-skymap-full')
  })
})

// ============================================
// 4. EVENTS
// ============================================
test.describe('Events', () => {
  test('events page with ISS, NEO, solar, APOD', async ({ page }) => {
    await page.goto('/events', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000) // live data fetches
    await screenshotViewport(page, '16-events-top')

    // Scroll through sections
    await page.evaluate(() => window.scrollBy(0, 800))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '17-events-mid')

    await page.evaluate(() => window.scrollBy(0, 800))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '18-events-more')

    await page.evaluate(() => window.scrollBy(0, 800))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '19-events-bottom')

    await screenshotPage(page, '20-events-full')
  })
})

// ============================================
// 5. EXPLORE / GALLERY
// ============================================
test.describe('Explore', () => {
  test('explore gallery page', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '21-explore-top')

    await page.evaluate(() => window.scrollBy(0, 600))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '22-explore-gallery')

    await screenshotPage(page, '23-explore-full')
  })
})

// ============================================
// 6. DASHBOARD
// ============================================
test.describe('Dashboard', () => {
  test('dashboard with tabs', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '24-dashboard-initial')

    // Try clicking different tabs
    const tabs = page.locator('[role="tab"], button[data-state]')
    const tabCount = await tabs.count()
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      const tab = tabs.nth(i)
      if (await tab.isVisible()) {
        const tabName = (await tab.textContent())?.trim().replace(/\s+/g, '-').toLowerCase() || `tab-${i}`
        await tab.click()
        await page.waitForTimeout(2000)
        await screenshotViewport(page, `25-dashboard-${tabName}`)
      }
    }

    await screenshotPage(page, '26-dashboard-full')
  })
})

// ============================================
// 7. CITIZEN SCIENCE
// ============================================
test.describe('Citizen Science', () => {
  test('citizen science projects page', async ({ page }) => {
    await page.goto('/citizen-science', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '27-citizen-science-top')

    await page.evaluate(() => window.scrollBy(0, 600))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '28-citizen-science-projects')

    await screenshotPage(page, '29-citizen-science-full')
  })
})

// ============================================
// 8. DEVLOG
// ============================================
test.describe('Devlog', () => {
  test('devlog listing page', async ({ page }) => {
    await page.goto('/devlog', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '30-devlog-listing')

    await screenshotPage(page, '31-devlog-full')
  })

  test('devlog solar system post', async ({ page }) => {
    await page.goto('/devlog/february-2026-interactive-solar-system', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '32-devlog-solar-system-top')

    await page.evaluate(() => window.scrollBy(0, 600))
    await page.waitForTimeout(1500)
    await screenshotViewport(page, '33-devlog-solar-system-mid')

    await screenshotPage(page, '34-devlog-solar-system-full')
  })
})

// ============================================
// 9. KEPLER VISUALIZER
// ============================================
test.describe('Kepler', () => {
  test('kepler page', async ({ page }) => {
    await page.goto('/kepler', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '35-kepler-initial')

    await screenshotPage(page, '36-kepler-full')
  })
})

// ============================================
// 10. SOLAR SYSTEM (standalone page)
// ============================================
test.describe('Solar System', () => {
  test('solar system standalone page', async ({ page }) => {
    await page.goto('/solar-system', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000)
    await screenshotViewport(page, '37-solar-system-standalone')
  })
})

// ============================================
// 11. MOBILE VIEWPORT
// ============================================
test.describe('Mobile views', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14 Pro

  test('homepage mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000)
    await screenshotViewport(page, '38-mobile-homepage-hero')

    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    await screenshotViewport(page, '39-mobile-homepage-dismissed')

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: 'instant' }))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '40-mobile-homepage-scroll')
  })

  test('events mobile', async ({ page }) => {
    await page.goto('/events', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)
    await screenshotViewport(page, '41-mobile-events')

    await page.evaluate(() => window.scrollBy(0, 600))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '42-mobile-events-scroll')
  })

  test('observatory mobile', async ({ page }) => {
    await page.goto('/observatory', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await screenshotViewport(page, '43-mobile-observatory')
  })

  test('sky map mobile', async ({ page }) => {
    await page.goto('/sky-map', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)
    await screenshotViewport(page, '44-mobile-skymap')
  })
})

// ============================================
// 12. NAVIGATION & FOOTER
// ============================================
test.describe('Navigation', () => {
  test('nav bar and footer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    // Screenshot the nav
    const nav = page.locator('nav, header').first()
    if (await nav.isVisible()) {
      await nav.screenshot({ path: `${SCREENSHOT_DIR}/45-navigation-bar.png` })
    }

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(2000)
    await screenshotViewport(page, '46-footer')
  })
})
