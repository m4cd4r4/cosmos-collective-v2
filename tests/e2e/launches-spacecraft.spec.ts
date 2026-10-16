/**
 * E2E Tests: Launch Tracker + Spacecraft Encyclopedia
 *
 * The spacecraft encyclopedia had its own route until the 2026-10-14 prune.
 * It is now a tab on /events, reached directly at /events#spacecraft, so every
 * test here drives that tab. The coverage is the same; only the entry changed.
 */

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3099'
const SPACECRAFT = `${BASE}/events#spacecraft`

/** Open /events on the Spacecraft tab and wait for the catalogue to mount. */
async function openSpacecraftTab(page: import('@playwright/test').Page) {
  await page.goto(SPACECRAFT, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[placeholder*="Search"]', { timeout: 20_000 })
}

// ── Spacecraft tab on /events ──────────────────────────────────────────────

test.describe('Spacecraft Encyclopedia', () => {
  test('tab loads with the catalogue count', async ({ page }) => {
    await page.goto(SPACECRAFT, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    await expect(page.locator('header').first()).toBeVisible()
    const tab = page.getByRole('tab', { name: /Spacecraft \(\d+\)/ })
    await expect(tab).toBeVisible()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  test('the launches tab is the default when no hash is given', async ({ page }) => {
    await page.goto(`${BASE}/events`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const launches = page.getByRole('tab', { name: /Upcoming Launches/ })
    await expect(launches).toHaveAttribute('aria-selected', 'true')
  })

  test('filter buttons and cards render after client load', async ({ page }) => {
    await openSpacecraftTab(page)

    const allBtn = page.getByRole('button', { name: /^All \(/ })
    await expect(allBtn).toBeVisible()

    const spaceTelescopeBtn = page.getByRole('button', { name: /Space Telescopes/ })
    await expect(spaceTelescopeBtn).toBeVisible()

    const cards = page.locator('[class*="rounded-xl"]').filter({ has: page.locator('h3') })
    await expect(cards.first()).toBeVisible()
  })

  test('search filters results', async ({ page }) => {
    await openSpacecraftTab(page)

    await page.fill('input[placeholder*="Search"]', 'Hubble')
    await page.waitForTimeout(300)

    await expect(page.getByText('Hubble Space Telescope', { exact: false }).first()).toBeVisible()
  })

  test('clicking a card opens detail modal', async ({ page }) => {
    await openSpacecraftTab(page)

    const firstCard = page.locator('button[class*="rounded-xl"]').filter({ has: page.locator('h3') }).first()
    await firstCard.click()

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Specifications')).toBeVisible()
  })

  test('no JS errors on the tab', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('net::ERR_') || text.includes('Failed to fetch') || text.includes('youtube') || text.includes('workbox')) return
        errors.push(text)
      }
    })

    await page.goto(SPACECRAFT, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    const fatal = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('Cannot read properties')
    )
    expect(fatal).toHaveLength(0)
  })
})

// ── Navigation ─────────────────────────────────────────────────────────────

test.describe('Spacecraft Navigation', () => {
  test('the old /spacecraft URL lands on the Spacecraft tab', async ({ page }) => {
    const response = await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), '/spacecraft must not 404').toBeLessThan(400)
    await page.waitForURL(url => url.pathname === '/events')
    await page.waitForTimeout(2000)

    const tab = page.getByRole('tab', { name: /Spacecraft \(\d+\)/ })
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  test('the footer reaches the catalogue', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    const links = await page.locator('footer a[href]').evaluateAll(els =>
      els.map(el => el.getAttribute('href')),
    )
    expect(links).toContain('/events#spacecraft')
    expect(links, 'no footer link may point at the cut route').not.toContain('/spacecraft')
  })
})

// ── Launch Tracker on Events Page ──────────────────────────────────────────

test.describe('Launch Tracker', () => {
  test('Events page has an Upcoming Launches tab, selected by default', async ({ page }) => {
    await page.goto(`${BASE}/events`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    await expect(page.getByRole('tab', { name: /Upcoming Launches/ })).toBeVisible()
  })
})
