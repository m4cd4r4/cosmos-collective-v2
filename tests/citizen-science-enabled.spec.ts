import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3097'

test.describe('Citizen Science - Enabled', () => {
  test('no preview mode banner', async ({ page }) => {
    await page.goto(`${BASE}/citizen-science`, { waitUntil: 'domcontentloaded' })

    // Preview banner should NOT exist
    await expect(page.locator('text=Preview Mode')).not.toBeVisible({ timeout: 5000 })

    // Page content should load
    await expect(page.locator('text=Citizen Science').first()).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/citizen-science.png' })
    console.log('Screenshot saved: citizen-science.png')
  })

  test('project list loads with classify buttons', async ({ page }) => {
    await page.goto(`${BASE}/citizen-science`, { waitUntil: 'domcontentloaded' })

    // Project cards should be visible
    const projectCards = page.locator('[data-testid="citizen-science-project"]')
    await expect(projectCards.first()).toBeVisible({ timeout: 10000 })

    // Should have multiple projects
    const count = await projectCards.count()
    expect(count).toBeGreaterThanOrEqual(3)
    console.log(`Found ${count} citizen science projects`)

    // Classify buttons should be present
    const classifyButtons = page.locator('button:has-text("Classify")')
    await expect(classifyButtons.first()).toBeVisible()
  })

  test('classification interface opens when clicking Classify', async ({ page }) => {
    await page.goto(`${BASE}/citizen-science`, { waitUntil: 'domcontentloaded' })

    // Click first Classify button
    const classifyBtn = page.locator('button:has-text("Classify")').first()
    await expect(classifyBtn).toBeVisible({ timeout: 10000 })
    await classifyBtn.click()

    // Classification interface should appear - either the image viewer or project selector
    await expect(
      page.locator('text=Select a Project to Start').or(page.locator('text=Submit')).first()
    ).toBeVisible({ timeout: 10000 })

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/classification-interface.png' })
    console.log('Screenshot saved: classification-interface.png')
  })
})
