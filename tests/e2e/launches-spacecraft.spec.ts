/**
 * E2E Tests: Launch Tracker + Spacecraft Encyclopedia
 */

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3099'

// ── Spacecraft Page ────────────────────────────────────────────────────────

test.describe('Spacecraft Encyclopedia', () => {
  test('page loads with header and stats', async ({ page }) => {
    await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.getByText('Spacecraft', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Active', { exact: true }).first()).toBeVisible()
  })

  test('filter buttons and cards render after client load', async ({ page }) => {
    await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })

    // Wait for dynamic SpacecraftExplorer to load
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 15_000 })

    // Filter buttons visible
    const allBtn = page.getByRole('button', { name: /^All \(/ })
    await expect(allBtn).toBeVisible()

    const spaceTelescopeBtn = page.getByRole('button', { name: /Space Telescopes/ })
    await expect(spaceTelescopeBtn).toBeVisible()

    // Cards visible
    const cards = page.locator('[class*="rounded-xl"]').filter({ has: page.locator('h3') })
    await expect(cards.first()).toBeVisible()
  })

  test('search filters results', async ({ page }) => {
    await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 15_000 })

    await page.fill('input[placeholder*="Search"]', 'Hubble')
    await page.waitForTimeout(300)

    await expect(page.getByText('Hubble Space Telescope', { exact: false }).first()).toBeVisible()
  })

  test('clicking a card opens detail modal', async ({ page }) => {
    await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 15_000 })

    // Click first card (it's a button element)
    const firstCard = page.locator('button[class*="rounded-xl"]').filter({ has: page.locator('h3') }).first()
    await firstCard.click()

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Specifications')).toBeVisible()
  })

  test('no JS errors on page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('net::ERR_') || text.includes('Failed to fetch') || text.includes('youtube') || text.includes('workbox')) return
        errors.push(text)
      }
    })

    await page.goto(`${BASE}/spacecraft`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    const fatal = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('Cannot read properties')
    )
    expect(fatal).toHaveLength(0)
  })
})

// ── Navigation ─────────────────────────────────────────────────────────────

test.describe('Spacecraft Navigation', () => {
  test('desktop nav includes Spacecraft link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav.getByText('Spacecraft')).toBeVisible()
  })

  test('mobile nav includes Hardware link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    await expect(mobileNav.getByText('Hardware')).toBeVisible()
  })
})

// ── Launch Tracker on Events Page ──────────────────────────────────────────

test.describe('Launch Tracker', () => {
  test('Events page has Upcoming Launches section', async ({ page }) => {
    await page.goto(`${BASE}/events`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(8000)

    await expect(page.getByText('Upcoming Launches')).toBeVisible()
  })
})
