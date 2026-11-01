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
const evalApp = (page: Page, expr: string) => page.evaluate(e => (window as any).eval(e), expr) as Promise<any>
const trailSpan = (page: Page, planet: string) => evalApp(page,
  `(t => t[t.length - 1].day - t[0].day)(planets.find(p => p.name === '${planet}').trail)`) as Promise<number>
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
    await expect(page.locator('#trail-days-val')).toHaveText('8 days')
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

  test('with More open the scene moves clear of the sheet and tapping still lands', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#toggle-pause')
    await page.click('#dock-more')
    await page.waitForTimeout(1000) // the scene eases across
    const at = (name: string) => page.evaluate(n => (window as any).eval(`(() => {
      const r = renderer.domElement.getBoundingClientRect();
      const body = '${n}' === 'Sun' ? sun : planets.find(p => p.name === '${n}').mesh;
      const v = body.position.clone().project(camera);
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    })()`), name) as Promise<{ x: number, y: number }>

    const sheet = (await page.locator('#sheet').boundingBox())!
    expect(sheet.x + sheet.width).toBeGreaterThan(1400) // docked to the right edge
    const sun = await at('Sun')
    expect(sun.x).toBeLessThan(sheet.x)
    // Centred in the space left of the sheet, not the window
    expect(Math.abs(sun.x - sheet.x / 2)).toBeLessThan(40)

    const jupiter = await at('Jupiter')
    expect(jupiter.x).toBeLessThan(sheet.x)
    await page.mouse.click(jupiter.x, jupiter.y)
    await expect(page.locator('#follow-target')).toHaveValue('jupiter')
    await page.waitForTimeout(1500)
    const centred = await at('Jupiter')
    expect(Math.abs(centred.x - sheet.x / 2)).toBeLessThan(40)
    expect(errors).toEqual([])
  })

  test('labels stay readable: 11px floor, moon names only for the planet you follow', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.waitForTimeout(500)
    const visible = () => page.evaluate(() => (window as any).eval(`({
      planets: [...planetLabels.values()].filter(l => l.style.display !== 'none').map(l => parseFloat(l.style.fontSize)),
      moons: [...moonLabels.entries()].filter(([, l]) => l.style.display !== 'none').map(([name, l]) => ({ name, size: parseFloat(l.style.fontSize) })),
    })`)) as Promise<{ planets: number[], moons: { name: string, size: number }[] }>

    const overview = await visible()
    expect(overview.planets.length).toBeGreaterThan(5)
    expect(Math.min(...overview.planets)).toBeGreaterThanOrEqual(11)
    expect(overview.moons).toEqual([])

    await page.click('#dock-more')
    await page.selectOption('#follow-target', 'jupiter')
    await page.waitForTimeout(300)
    expect((await visible()).moons).toEqual([]) // following from afar is not near
    await evalApp(page, 'cameraDistance = 60; updateCameraPosition()')
    await page.waitForTimeout(1500)
    const near = await visible()
    expect(near.moons.map(m => m.name)).toContain('Ganymede')
    expect(near.moons.map(m => m.name)).not.toContain('Titan')
    expect(Math.min(...near.moons.map(m => m.size))).toBeGreaterThanOrEqual(11)
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

  test('the galaxy view is gone: no dock button, G is inert, no stray overlays', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await expect(page.locator('#toggle-galaxy')).toHaveCount(0)
    await expect(page.locator('#galaxy-return-btn, #galaxy-info, #galaxy-zoom-indicator')).toHaveCount(0)
    await page.keyboard.press('g')
    await page.waitForTimeout(600)
    await expect(page.locator('#dock')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('Cinema flies its own path with full spirals; a tap keeps it, a drag leaves it', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#dock-view [data-view="cinema"]')
    await pressed(page, '#dock-view [data-view="cinema"]')
    expect(await evalApp(page, 'cameraMode')).toBe('cinematic')
    // The spiral is there at once, not after minutes of recording
    expect(await trailSpan(page, 'Earth')).toBeGreaterThan(700)

    const before = await evalApp(page, 'camera.position.x')
    await page.waitForTimeout(1000)
    expect(Math.abs((await evalApp(page, 'camera.position.x')) - before)).toBeGreaterThan(0.5)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${SHOTS}/1440-cinema.png` })

    await page.mouse.click(720, 200)
    expect(await evalApp(page, 'cameraMode')).toBe('cinematic')
    await page.mouse.move(720, 200)
    await page.mouse.down()
    await page.mouse.move(780, 240, { steps: 4 })
    await page.mouse.up()
    expect(await evalApp(page, 'cameraMode')).toBe('free')
    await pressed(page, '#dock-view [data-view="free"]')
    // Keeps the viewpoint instead of snapping back to the default distance
    expect(await evalApp(page, 'cameraDistance')).toBeGreaterThan(200)

    await page.keyboard.press('c')
    expect(await evalApp(page, 'cameraMode')).toBe('cinematic')
    expect(errors).toEqual([])
  })

  test('trail length is a slider: any span, drawn at once, also while paused, saved', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#toggle-pause')
    await page.click('#dock-more')
    await expect(page.locator('#trail-days')).toHaveAttribute('type', 'range')
    await expect(page.locator('[data-trail]')).toHaveCount(0)

    expect(await trailSpan(page, 'Earth')).toBeLessThan(9)
    await page.locator('#trail-days').fill('1000')
    await expect(page.locator('#trail-days-val')).toHaveText('5.0 years')
    expect(await trailSpan(page, 'Earth')).toBeGreaterThan(1800)
    expect(await evalApp(page, `planets.find(p => p.name === 'Earth').trail.length`)).toBeLessThanOrEqual(802)

    await page.locator('#trail-days').fill('500')
    await expect(page.locator('#trail-days-val')).toHaveText('43 days')
    const span = await trailSpan(page, 'Earth')
    expect(span).toBeGreaterThan(42)
    expect(span).toBeLessThan(44)
    expect(await evalApp(page, `JSON.parse(localStorage.getItem(PERSIST_KEY)).trailDays`)).toBe(43)
    expect(errors).toEqual([])
  })

  test('a view does not save its own trail settings; a slider moved during it does', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    const saved = () => evalApp(page, 'JSON.parse(localStorage.getItem(PERSIST_KEY))')

    await page.click('#dock-view [data-view="cinema"]')
    expect(await trailSpan(page, 'Earth')).toBeGreaterThan(700)
    await page.click('#dock-view [data-view="free"]')
    await page.click('#dock-speed [data-speed="day"]') // any later save still keeps the view's values out
    expect((await saved()).trailDays).toBe(8)
    expect((await saved()).moons).toBe(true)

    await page.click('#dock-view [data-view="cinema"]')
    await page.click('#dock-more')
    await page.locator('#trail-days').fill('500')
    expect((await saved()).trailDays).toBe(43)
    expect(errors).toEqual([])
  })

  test('every view in More sets its camera', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#dock-more')
    await page.screenshot({ path: `${SHOTS}/1440-sheet-views.png` })
    const modes: Record<string, string> = {
      overview: 'free', vortex: 'side', surfboard: 'surfboard', helix: 'helix', chase: 'chase',
    }
    for (const [view, mode] of Object.entries(modes)) {
      await page.click(`#more-views [data-view="${view}"]`)
      await pressed(page, `#more-views [data-view="${view}"]`)
      expect(await evalApp(page, 'cameraMode')).toBe(mode)
      expect(await evalApp(page, 'followTarget')).toBe('sun')
    }
    await page.click('#more-views [data-view="moonwatch"]')
    expect(await evalApp(page, 'followTarget')).toBe('earth')
    await expect(page.locator('#show-moons')).toBeChecked()
    expect(errors).toEqual([])
  })

  test('trail brightness, Sun speed, corona and grid all reach the scene', async ({ page }) => {
    const errors: string[] = []
    await load(page, errors)
    await page.click('#dock-more')

    await page.locator('#trail-opacity').fill('1')
    await expect(page.locator('#trail-opacity-val')).toHaveText('100%')
    expect(await evalApp(page, `trailLines.get('Earth').material.opacity`)).toBe(1)

    await page.locator('#sun-drift').fill('0')
    await expect(page.locator('#sun-drift-val')).toHaveText('Still')
    const z0 = await evalApp(page, 'sun.position.z')
    await page.waitForTimeout(400)
    expect(await evalApp(page, 'sun.position.z')).toBe(z0)

    expect(await evalApp(page, 'coronaParticles')).toBeNull()
    await page.locator('#show-corona').check({ force: true })
    expect(await evalApp(page, 'coronaParticles.visible')).toBe(true)
    await page.locator('#show-corona').uncheck({ force: true })
    expect(await evalApp(page, 'coronaParticles.visible')).toBe(false)

    expect(await evalApp(page, 'referenceGrid.visible')).toBe(false)
    await page.locator('#show-grid').check({ force: true })
    expect(await evalApp(page, 'referenceGrid.visible')).toBe(true)
    expect(errors).toEqual([])
  })

  test('phone width: the accuracy notes move the scene up so the Sun stays in view', async ({ page }) => {
    const errors: string[] = []
    await page.setViewportSize({ width: 390, height: 844 })
    await load(page, errors)
    await page.click('#dock-more')
    await page.click('#tab-tools')
    await page.click('#toggle-accuracy')
    await page.waitForTimeout(1000)
    const panel = (await page.locator('#accuracy-panel').boundingBox())!
    const sunY = await evalApp(page, `(() => {
      const r = renderer.domElement.getBoundingClientRect();
      return r.top + (1 - sun.position.clone().project(camera).y) / 2 * r.height;
    })()`) as number
    expect(sunY).toBeLessThan(panel.y)
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
