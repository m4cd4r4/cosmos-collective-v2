import { test, expect, Page } from '@playwright/test'

// Smoke test for the solar system dock and More sheet (public/solar-system/index.html).
// Backfilled onto existing code (tdd-guard:allow).
// Run: npx playwright test -c playwright.local.config.ts solar-dock

const APP = '/solar-system/index.html'
const SHOTS = 'tests/e2e/screenshots/solar-dock'

async function load(page: Page, errors: string[]) {
  page.on('pageerror', e => errors.push(e.message))
  await page.addInitScript(() => { try { localStorage.clear() } catch {} })
  await page.goto(APP)
  // The overlay fades out (opacity 0, pointer-events none) rather than leaving the layout
  await expect(page.locator('#loading-overlay')).toHaveClass(/\bhidden\b/, { timeout: 30_000 })
  await expect(page.locator('#dock')).toBeVisible()
  // First visit offers the tour; skip it
  await page.locator('#welcome-skip').click({ timeout: 10_000 })
  await expect(page.locator('#welcome-prompt')).toHaveCount(0)
}

const simDays = (page: Page) => page.evaluate(() => (window as any).eval('simulationDays') as number)
const pressed = (page: Page, sel: string) => expect(page.locator(sel)).toHaveAttribute('aria-pressed', 'true')

test.describe('solar system dock', () => {
  test('loads with the dock visible and no page errors', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await pressed(page, '#dock-speed [data-speed="week"]')
    await pressed(page, '#dock-view [data-view="free"]')
    await expect(page.locator('#sheet')).toBeHidden()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${SHOTS}/1440-load.png` })
    expect(errors).toEqual([])
  })

  test('play/pause stops the clock and speed maps to days per second', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)

    await page.click('#toggle-pause')
    await expect(page.locator('#toggle-pause')).toHaveAttribute('aria-label', 'Play')
    const a = await simDays(page)
    await page.waitForTimeout(800)
    expect(await simDays(page)).toBe(a)

    await page.click('#toggle-pause')
    await expect(page.locator('#toggle-pause')).toHaveAttribute('aria-label', 'Pause')

    await page.click('#dock-speed [data-speed="year"]')
    await pressed(page, '#dock-speed [data-speed="year"]')
    const t0 = await simDays(page)
    await page.waitForTimeout(1000)
    const perSec = (await simDays(page)) - t0
    // 365.25 d/s; headless frame pacing is loose, so allow a wide band
    expect(perSec).toBeGreaterThan(200)
    expect(perSec).toBeLessThan(550)
    expect(errors).toEqual([])
  })

  test('More opens the sheet and Reset restores every default', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)

    await page.click('#dock-speed [data-speed="year"]')
    await page.click('#dock-view [data-view="top"]')
    await page.click('#toggle-pause')

    await page.click('#dock-more')
    await expect(page.locator('#sheet')).toBeVisible()
    await expect(page.locator('#dock-more')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#panel-look')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/1440-sheet-look.png` })

    await page.click('#look-presets [data-look="kid"]')
    await pressed(page, '#look-presets [data-look="kid"]')
    await page.locator('#show-labels').uncheck({ force: true })

    await page.click('#tab-time')
    await expect(page.locator('#panel-time')).toBeVisible()
    await page.click('#tab-tools')
    await expect(page.locator('#panel-tools')).toBeVisible()

    await page.click('#reset-view')
    await pressed(page, '#dock-speed [data-speed="week"]')
    await pressed(page, '#dock-view [data-view="free"]')
    await expect(page.locator('#toggle-pause')).toHaveAttribute('aria-label', 'Pause')
    await expect(page.locator('body')).not.toHaveClass(/\bkid\b/)
    // Reset closes the sheet too
    await expect(page.locator('#sheet')).toBeHidden()
    await page.click('#dock-more')
    await page.click('#tab-look')
    await pressed(page, '#look-presets [data-look="explorer"]')
    await pressed(page, '#trail-length [data-trail="short"]')
    await expect(page.locator('#show-labels')).toBeChecked()
    expect(Math.abs(await simDays(page))).toBeLessThan(200)
    expect(errors).toEqual([])
  })

  test('tapping a planet centres it, a second tap opens its card', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#toggle-pause')
    await page.waitForTimeout(300)
    const at = () => page.evaluate(() => (window as any).eval(`(() => {
      const r = renderer.domElement.getBoundingClientRect();
      const v = planets.find(p => p.name === 'Jupiter').mesh.position.clone().project(camera);
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    })()`)) as Promise<{ x: number, y: number }>
    let p = await at()
    await page.mouse.click(p.x, p.y)
    await expect(page.locator('#follow-target')).toHaveValue('jupiter')
    await expect(page.locator('#planet-dive-btn .dive-target')).toHaveText('Jupiter')
    await page.waitForTimeout(1500) // camera glides to the new target
    p = await at()
    await page.mouse.click(p.x, p.y)
    await expect(page.locator('#planet-info-card')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('? opens the shortcuts and Esc closes it', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.keyboard.press('?')
    await expect(page.locator('#help-overlay')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#help-overlay')).toBeHidden()
    expect(errors).toEqual([])
  })

  test('galaxy view leaves no invisible click traps and Esc returns', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#toggle-galaxy')
    await expect(page.locator('#galaxy-return-btn')).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(500)

    // Every element that is invisible but still catches clicks is a trap
    const traps = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0 || cs.display === 'none') return
        if (cs.pointerEvents === 'none' || cs.visibility === 'hidden') return
        if (parseFloat(cs.opacity) === 0 && el.parentElement && getComputedStyle(el.parentElement).pointerEvents !== 'none') {
          out.push(el.id || el.className.toString() || el.tagName)
        }
      })
      return out
    })
    expect(traps).toEqual([])
    await expect(page.locator('#dock')).toBeHidden()
    await page.screenshot({ path: `${SHOTS}/1440-galaxy.png` })

    await page.keyboard.press('Escape')
    await expect(page.locator('#dock')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('#toggle-galaxy')).toHaveAttribute('aria-pressed', 'false')
    expect(errors).toEqual([])
  })

  test('phone width: dock fits, targets are 44px, sheet opens', async ({ page }) => {
    const errors: string[] = []
    await page.setViewportSize({ width: 390, height: 844 })
    await load(page, errors)
    const box = await page.locator('#dock').boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    const small = await page.$$eval('#dock button', bs =>
      bs.filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44) })
        .map(b => b.id || b.textContent!.trim()))
    expect(small).toEqual([])
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${SHOTS}/390-load.png` })
    await page.click('#dock-more')
    await expect(page.locator('#sheet')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/390-sheet-look.png` })
    expect(errors).toEqual([])
  })
})
