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

test('the nav follows the landing order, hero first', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')).toHaveText([
    'Solar System',
    '550-AU',
    'Explore',
    'Satellites',
    'Sky Map',
    'Kepler',
  ])
})

test('550-AU opens on its first act and every embed file loads', async ({ page }) => {
  const missing: string[] = []
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('/embeds/gravitational-lens/')) missing.push(r.url())
  })
  await page.goto('/gravitational-lens')
  const active = page.frameLocator('iframe').locator('.chapter-rail .chapter[aria-current="true"]')
  await expect(active).toContainText('THE PROBLEM', { timeout: 30000 })
  expect(missing).toEqual([])
})

test('the asteroid card shows the closest approach still to come', async ({ page }) => {
  const hoursFromNow = (h: number) => Date.now() + h * 60 * 60 * 1000
  const neo = (name: string, lunar: string, epoch: number) => ({
    name,
    nasa_jpl_url: `https://ssd.jpl.nasa.gov/${encodeURIComponent(name)}`,
    close_approach_data: [{ epoch_date_close_approach: epoch, miss_distance: { lunar } }],
  })
  await page.route(/\/api\/proxy\/nasa\?endpoint=neo/, (route) =>
    route.fulfill({
      json: {
        element_count: 3,
        near_earth_objects: {
          any: [
            neo('(Already Passed)', '1.0', hoursFromNow(-2)),
            neo('(Farther Away)', '20.0', hoursFromNow(24)),
            neo('(2017 WJ2)', '15.5597', Date.UTC(2099, 10, 5, 12)),
          ],
        },
      },
    }),
  )
  await page.goto('/')
  const card = page.locator('a', { hasText: 'Closest asteroid' })
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('href', 'https://ssd.jpl.nasa.gov/(2017%20WJ2)')
  await expect(card).toContainText('(2017 WJ2)')
  await expect(card).toContainText('15.6 lunar distances · 5 Nov · NASA NeoWs')
  await expect(page.getByText('NASA APOD')).toHaveCount(0)
})
