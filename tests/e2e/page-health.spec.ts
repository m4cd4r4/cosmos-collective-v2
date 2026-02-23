/**
 * Page Health — Visual Load Test
 * Visits every updated page, screenshots at 0s / 10s / 20s / 30s,
 * and asserts the page stays rendered and responsive throughout.
 */

import { test, expect, type Page } from '@playwright/test'

const BASE = 'https://cosmos-collective.com.au'

const PAGES = [
  { slug: '/',              label: 'Home' },
  { slug: '/events',        label: 'Live Events' },
  { slug: '/explore',       label: 'Explore' },
  { slug: '/devlog',        label: 'Devlog' },
  { slug: '/jwst',          label: 'JWST Explorer' },
  { slug: '/kepler',        label: 'Kepler Explorer' },
  { slug: '/sky-map',       label: 'Sky Map' },
  { slug: '/observatory',   label: 'Observatory' },
  { slug: '/privacy',       label: 'Privacy' },
  { slug: '/terms',         label: 'Terms' },
  { slug: '/credits',       label: 'Credits' },
  { slug: '/accessibility', label: 'Accessibility' },
]

/** Wait N ms and screenshot */
async function snap(page: Page, label: string, slug: string, t: number) {
  await page.waitForTimeout(t * 1000)
  await page.screenshot({
    path: `tests/screenshots/health/${slug.replace(/\//g, '_') || 'home'}_${t}s.png`,
    fullPage: false,
  })
}

/** Assert the page is still alive — nav header present, no crash overlay */
async function assertAlive(page: Page, label: string) {
  // Site nav header — sticky top bar, first <header> on every page
  await expect(
    page.locator('header').first(),
    `${label}: site nav header missing`
  ).toBeVisible()
  // No unhandled error overlay (Next.js dev error modal)
  const errorOverlay = page.locator('#nextjs-portal, [data-nextjs-dialog]')
  await expect(errorOverlay, `${label}: error overlay visible`).not.toBeVisible()
  // Page must not be blank (body has content)
  const bodyText = await page.evaluate(() => document.body.innerText.trim())
  expect(bodyText.length, `${label}: page appears blank`).toBeGreaterThan(10)
}

/** Check for console errors (non-fatal 404s for external CDN assets are expected) */
function watchConsole(page: Page, label: string): string[] {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Ignore known external / third-party noise
      if (
        text.includes('youtube.com') ||
        text.includes('aladin') ||
        text.includes('workbox') ||
        text.includes('Failed to fetch') ||  // external API may be unavailable in CI
        text.includes('net::ERR_ABORTED')
      ) return
      errors.push(text)
    }
  })
  return errors
}

// ── Tests ─────────────────────────────────────────────────────────────────

for (const { slug, label } of PAGES) {
  test(`${label} — loads and stays stable for 30s`, async ({ page }) => {
    const consoleErrors = watchConsole(page, label)

    // Navigate — wait for network to quiet down
    await page.goto(`${BASE}${slug}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Ensure screenshots dir exists
    await page.evaluate(() => { /* noop — just gives playwright a tick */ })

    // t=0: immediately after load
    await snap(page, label, slug, 0)
    await assertAlive(page, label)

    // t=10s
    await snap(page, label, slug, 10)
    await assertAlive(page, label)

    // t=20s
    await snap(page, label, slug, 10)  // another 10s wait from previous snap
    await assertAlive(page, label)

    // t=30s
    await snap(page, label, slug, 10)
    await assertAlive(page, label)

    // Report console errors (soft — don't fail on external API noise)
    if (consoleErrors.length > 0) {
      console.warn(`⚠️  ${label} console errors:\n  ${consoleErrors.join('\n  ')}`)
    }

    // Verify no JS-crashing errors (only truly unexpected ones fail the test)
    const fatalErrors = consoleErrors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('is not defined') ||
      e.includes('Cannot read properties')
    )
    expect(fatalErrors, `${label}: JS crash errors`).toHaveLength(0)
  })
}
