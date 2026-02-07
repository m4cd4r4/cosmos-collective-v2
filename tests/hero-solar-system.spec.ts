import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3097'

test.describe('Hero Section - Solar System Background', () => {
  test('renders Solar System iframe as hero background', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    // Solar System iframe should be present in the hero section
    const iframe = page.locator('iframe[src="/solar-system/index.html"]').first()
    await expect(iframe).toBeVisible({ timeout: 10000 })

    // Hero card overlay should be visible initially
    const heroHeading = page.locator('#hero-heading')
    await expect(heroHeading).toBeVisible()
    await expect(heroHeading).toContainText('Universe')

    // CTA buttons should be present
    await expect(page.locator('text=Start Exploring').first()).toBeVisible()
    await expect(page.locator('text=Open Sky Map').first()).toBeVisible()

    // Stats should be visible
    await expect(page.locator('text=JWST Observations').first()).toBeVisible()

    // Dismiss hint should be visible
    await expect(page.locator('text=Click outside or press').first()).toBeVisible()

    // Take screenshot with card visible
    await page.screenshot({ path: 'tests/screenshots/hero-with-card.png', fullPage: false })
    console.log('Screenshot saved: hero-with-card.png')
  })

  test('dismisses card when clicking X button', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    // Wait for hero card
    const heroHeading = page.locator('#hero-heading')
    await expect(heroHeading).toBeVisible({ timeout: 10000 })

    // Click the X close button
    const closeButton = page.locator('button[aria-label="Close overlay"]')
    await expect(closeButton).toBeVisible()
    await closeButton.click()

    // Card should be gone
    await expect(heroHeading).not.toBeVisible({ timeout: 5000 })

    // Solar System iframe should still be present and interactive
    const iframe = page.locator('iframe[src="/solar-system/index.html"]').first()
    await expect(iframe).toBeVisible()

    // Take screenshot with card dismissed
    await page.screenshot({ path: 'tests/screenshots/hero-dismissed.png', fullPage: false })
    console.log('Screenshot saved: hero-dismissed.png')
  })

  test('dismisses card when clicking outside', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    const heroHeading = page.locator('#hero-heading')
    await expect(heroHeading).toBeVisible({ timeout: 10000 })

    // Click the backdrop (outside the card)
    const backdrop = page.locator('[aria-label="Dismiss overlay to interact with Solar System"]')
    await backdrop.click({ position: { x: 10, y: 10 } })

    // Card should be gone
    await expect(heroHeading).not.toBeVisible({ timeout: 5000 })
  })

  test('dismisses card on Escape key', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    const heroHeading = page.locator('#hero-heading')
    await expect(heroHeading).toBeVisible({ timeout: 10000 })

    // Focus the backdrop and press Escape
    const backdrop = page.locator('[aria-label="Dismiss overlay to interact with Solar System"]')
    await backdrop.focus()
    await page.keyboard.press('Escape')

    // Card should be gone
    await expect(heroHeading).not.toBeVisible({ timeout: 5000 })
  })

  test('Solar System nav item removed from header', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    // "Solar System" should NOT be in the nav
    const solarNavItem = page.locator('nav[aria-label="Main navigation"] >> text=Solar System')
    await expect(solarNavItem).not.toBeVisible()

    // Other nav items should still be present
    await expect(page.locator('nav[aria-label="Main navigation"] >> text=Explore')).toBeVisible()
    await expect(page.locator('nav[aria-label="Main navigation"] >> text=Sky Map')).toBeVisible()
  })

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // Filter out known non-critical errors (auth/session 500s expected without DB)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('manifest') &&
        !e.includes('next-auth') &&
        !e.includes('CLIENT_FETCH_ERROR') &&
        !e.includes('/api/auth/') &&
        !e.includes('the server responded with a status of 500')
    )

    console.log('Console errors:', criticalErrors.length ? criticalErrors : 'none')
    expect(criticalErrors.length).toBe(0)
  })
})
