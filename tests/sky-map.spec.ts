import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3097'

test.describe('Sky Map - Aladin Lite Integration', () => {
  test('page loads without error boundary', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Should NOT show error boundary
    await expect(page.locator('text=Sky Map Unavailable')).not.toBeVisible({ timeout: 5000 })

    // Header should be visible
    await expect(page.locator('header')).toBeVisible()

    // Page title should be present (screen reader only)
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Interactive Sky Map')
  })

  test('Aladin container is present', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })

    // Aladin container div should exist
    const container = page.locator('[data-testid="aladin-container"]')
    await expect(container).toBeVisible({ timeout: 10000 })
  })

  test('Aladin script loads from CDN', async ({ page }) => {
    const scriptRequests: string[] = []

    page.on('request', (request) => {
      if (request.url().includes('aladin')) {
        scriptRequests.push(request.url())
      }
    })

    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Should have requested Aladin script from CDS
    expect(scriptRequests.some(url =>
      url.includes('aladin.cds.unistra.fr') && url.includes('aladin.js')
    )).toBeTruthy()

    console.log('Aladin script requests:', scriptRequests)
  })

  test('loading state appears initially', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })

    // Should show loading state (or already be loaded)
    const loadingText = page.locator('text=Initializing sky map')
    const aladinContainer = page.locator('[data-testid="aladin-container"]')

    // Either loading is visible OR container is ready (may load very fast)
    const isLoadingOrReady = await Promise.race([
      loadingText.isVisible().then(visible => visible),
      aladinContainer.isVisible().then(() => true)
    ])

    expect(isLoadingOrReady).toBe(true)
  })

  test('sidebar toggle works', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })

    // Wait for page to be ready
    await page.waitForTimeout(2000)

    // Find and click the sidebar toggle button
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first()
    await expect(toggleButton).toBeVisible({ timeout: 10000 })

    await toggleButton.click()
    await page.waitForTimeout(500)

    // Sidebar should now be visible (check for search input)
    await expect(page.locator('input[placeholder*="M31"]')).toBeVisible()

    // Click again to close
    await toggleButton.click()
    await page.waitForTimeout(500)

    // Search input should be hidden
    await expect(page.locator('input[placeholder*="M31"]')).not.toBeVisible()
  })

  test('zoom controls are present', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })

    // Zoom controls should be visible
    await expect(page.locator('button[aria-label="Zoom in"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button[aria-label="Zoom out"]')).toBeVisible()
    await expect(page.locator('button[aria-label="Reset view"]')).toBeVisible()
  })

  test('survey wavelength badge is visible', async ({ page }) => {
    await page.goto(`${BASE}/sky-map`, { waitUntil: 'domcontentloaded' })

    // Current survey indicator should be visible
    await expect(page.locator('text=DSS (Optical)').or(page.locator('text=2MASS')).first()).toBeVisible({ timeout: 10000 })
  })

  test('check for JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
      if (msg.type() === 'warning') warnings.push(msg.text())
    })

    page.on('pageerror', (error) => {
      errors.push(`PAGE ERROR: ${error.message}`)
    })

    await page.goto(`${BASE}/sky-map`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('manifest') &&
        !e.includes('next-auth') &&
        !e.includes('CLIENT_FETCH_ERROR') &&
        !e.includes('/api/auth/')
    )

    console.log('Console errors:', criticalErrors.length ? criticalErrors : 'none')
    console.log('Console warnings:', warnings.length ? warnings.slice(0, 5) : 'none')

    // Should have no critical errors
    expect(criticalErrors.length).toBe(0)
  })

  test.skip('Aladin map initializes successfully', async ({ page }) => {
    // This test checks if window.A (Aladin object) is defined after loading
    // Marked as skip because it depends on external CDN which may be slow

    await page.goto(`${BASE}/sky-map`, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait for Aladin to load (up to 10 seconds)
    await page.waitForTimeout(10000)

    // Check if window.A exists
    const hasAladin = await page.evaluate(() => {
      return typeof (window as any).A !== 'undefined'
    })

    expect(hasAladin).toBe(true)
  })
})
