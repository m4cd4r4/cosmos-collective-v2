import { test, expect, Page } from '@playwright/test'

// Landing page: the live Cinema card, its embed mode, and the one name for 550-AU.
// Run: BASE_URL=http://localhost:3412 npx playwright test -c playwright.local.config.ts landing

// Real GPU: the software renderer runs near 3 fps, so the app correctly gives itself up
test.use({ channel: 'chromium', launchOptions: { args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] } })

const EMBED = '/solar-system/index.html?embed=1'
const evalApp = (page: Page, expr: string) => page.evaluate(e => (window as any).eval(e), expr) as Promise<any>

test('embed mode starts in Cinema with no UI, and leaves saved settings and the welcome alone', async ({ page }) => {
  const saved = JSON.stringify({ speed: 'day', labels: true })
  await page.addInitScript(v => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear()
      localStorage.setItem('solar-system-state-v2', v)
      sessionStorage.setItem('seeded', '1')
    }
  }, saved)
  await page.goto(EMBED)
  await expect.poll(() => evalApp(page, 'frameCount'), { timeout: 30_000 }).toBeGreaterThan(5)

  expect(await evalApp(page, 'state.view')).toBe('cinema')
  expect(await evalApp(page, 'state.speed')).not.toBe('day') // the saved choice was not read
  await expect(page.locator('#dock')).toBeHidden()
  await expect(page.locator('#ui-toggle-btn')).toBeHidden()
  await expect(page.locator('#welcome-prompt')).toHaveCount(0)

  await evalApp(page, "setState({ speed: 'year' })")
  expect(await page.evaluate(() => localStorage.getItem('solar-system-state-v2'))).toBe(saved)
  expect(await page.evaluate(() => localStorage.getItem('solar-vortex-visited'))).toBeNull()
})

const card = (page: Page) => page.locator('#features a[href="/solar-system"]')
const frame = (page: Page) => page.locator('iframe[src*="embed=1"]')

test('desktop: the card loads the app when reached, and stays one link', async ({ page }) => {
  await page.goto('/')
  await expect(frame(page)).toHaveCount(0)

  await card(page).scrollIntoViewIfNeeded()
  await expect(frame(page)).toHaveCount(1, { timeout: 15_000 })
  await expect(frame(page).locator('xpath=..')).toHaveClass(/opacity-100/, { timeout: 45_000 })
  await expect(frame(page)).toHaveCSS('pointer-events', 'none')

  await card(page).click()
  await expect(page).toHaveURL(/\/solar-system$/)
})

test('desktop: the app pauses off screen and resumes when the card returns', async ({ page }) => {
  const frames = () =>
    page.frameLocator('iframe[src*="embed=1"]').locator('body').evaluate(() => (window as any).eval('frameCount')) as Promise<number>

  await page.goto('/')
  await card(page).scrollIntoViewIfNeeded()
  await expect(frame(page).locator('xpath=..')).toHaveClass(/opacity-100/, { timeout: 45_000 })

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(2000) // smooth scroll has to finish before the card leaves
  const paused = await frames()
  await page.waitForTimeout(1000)
  expect(await frames()).toBe(paused)

  await card(page).scrollIntoViewIfNeeded()
  await expect.poll(frames, { timeout: 10_000 }).toBeGreaterThan(paused)
})

test('desktop: the app gives itself up on a device below 2 fps', async ({ page }) => {
  await page.addInitScript(() => {
    if (location.search.includes('embed=1')) window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 800) as unknown as number
  })
  await page.goto('/')
  await card(page).scrollIntoViewIfNeeded()
  await expect(frame(page)).toHaveCount(1, { timeout: 15_000 })
  await expect(frame(page)).toHaveCount(0, { timeout: 45_000 })
})

test('phone: the card shows its image and never loads the app', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await card(page).scrollIntoViewIfNeeded()
  await expect(card(page).locator('img').first()).toBeVisible()
  await page.waitForTimeout(2000)
  await expect(frame(page)).toHaveCount(0)
})

test('the app without the flag is the normal app', async ({ page }) => {
  await page.goto('/solar-system/index.html')
  await expect.poll(() => evalApp(page, 'frameCount'), { timeout: 30_000 }).toBeGreaterThan(5)
  expect(await evalApp(page, 'EMBED')).toBe(false)
  await expect(page.locator('#dock')).toBeVisible()
})

test('copy: one name for 550-AU, two hero links, no install popup', async ({ page }) => {
  await page.goto('/')
  const text = await page.locator('body').innerText()
  for (const gone of ['String of Pearls', 'Grav Lens', '2,700+']) expect(text).not.toContain(gone)
  await expect(page.locator('section[aria-labelledby="hero-heading"] a[href^="/"]')).toHaveCount(2)
  await expect(page.getByRole('dialog', { name: 'Install Cosmos Collective app' })).toHaveCount(0)
})

test('reduced motion: the card never loads the app', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await card(page).scrollIntoViewIfNeeded()
  await expect(card(page).locator('img').first()).toBeVisible()
  await page.waitForTimeout(2000)
  await expect(frame(page)).toHaveCount(0)
})
