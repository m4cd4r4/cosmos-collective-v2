import { test, expect } from '@playwright/test'

// Landing page polish: the one name for 550-AU, the hero, the Solar System card.
// Run: BASE_URL=http://localhost:3414 npx playwright test -c playwright.local.config.ts landing

test('copy: one name for 550-AU, two hero links, no install popup', async ({ page }) => {
  await page.goto('/')
  const text = await page.locator('body').innerText()
  for (const gone of ['String of Pearls', 'Grav Lens', '2,700+']) expect(text).not.toContain(gone)
  await expect(page.locator('section[aria-labelledby="hero-heading"] a[href^="/"]')).toHaveCount(2)
  await expect(page.getByRole('dialog', { name: 'Install Cosmos Collective app' })).toHaveCount(0)
})

test('the Solar System card is one link with its image and no live frame', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('#features a[href="/solar-system"]')
  await card.scrollIntoViewIfNeeded()
  await expect(card.locator('img')).toBeVisible()
  await page.waitForTimeout(2000)
  await expect(page.locator('iframe')).toHaveCount(0)
  await card.click()
  await expect(page).toHaveURL(/\/solar-system$/)
})
