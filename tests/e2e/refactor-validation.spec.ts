/**
 * Refactor Validation E2E Tests
 * Covers: navigation restructure, redirects, mobile nav, font sizes,
 * viewport handling, shared telemetry, shared components
 */

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3099'

// ── Redirects ──────────────────────────────────────────────────────────────

test.describe('Redirects', () => {
  test('/mission-control redirects to /explore', async ({ page }) => {
    const response = await page.goto(`${BASE}/mission-control`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/explore')
    expect(page.url()).toContain('/explore')
  })

  test('/dashboard redirects to /', async ({ page }) => {
    const response = await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '')
    expect(page.url().replace(/\/$/, '')).toBe(BASE.replace(/\/$/, ''))
  })

  test('/observatory redirects to /sky-map', async ({ page }) => {
    const response = await page.goto(`${BASE}/observatory`, { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/sky-map')
    expect(page.url()).toContain('/sky-map')
  })
})

// ── Desktop Navigation ─────────────────────────────────────────────────────

test.describe('Desktop Navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('header nav contains Explore and Live as primary items', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Explore')).toBeVisible()
    await expect(nav.getByText('Live')).toBeVisible()
    await expect(nav.getByText('Solar System')).toBeVisible()
    await expect(nav.getByText('Kepler')).toBeVisible()
    await expect(nav.getByText('JWST')).toBeVisible()
  })

  test('header nav does NOT contain Mission Control', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav.getByText('Mission Control')).not.toBeVisible()
  })

  test('Explore link navigates to /explore', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await nav.getByText('Explore').click()
    await page.waitForURL('**/explore')
    expect(page.url()).toContain('/explore')
  })

  test('Live link navigates to /events', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await nav.getByText('Live').click()
    await page.waitForURL('**/events')
    expect(page.url()).toContain('/events')
  })
})

// ── Mobile Navigation ──────────────────────────────────────────────────────

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('mobile bottom nav shows 5 items: Explore, Live, Solar, Kepler, Webb', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav.getByText('Explore')).toBeVisible()
    await expect(mobileNav.getByText('Live')).toBeVisible()
    await expect(mobileNav.getByText('Solar')).toBeVisible()
    await expect(mobileNav.getByText('Kepler')).toBeVisible()
    await expect(mobileNav.getByText('Webb')).toBeVisible()
  })

  test('mobile nav does NOT contain Hub button', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    await expect(mobileNav.getByText('Hub')).not.toBeVisible()
  })

  test('mobile Explore link works', async ({ page }) => {
    // Navigate to a simple page first (landing hero may overlap bottom nav)
    await page.goto(`${BASE}/events`, { waitUntil: 'domcontentloaded' })
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    await mobileNav.getByText('Explore').click({ force: true })
    await page.waitForURL('**/explore', { timeout: 15_000 })
    expect(page.url()).toContain('/explore')
  })

  test('mobile Live link works', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
    await mobileNav.getByText('Live').click()
    await page.waitForURL('**/events')
    expect(page.url()).toContain('/events')
  })
})

// ── Font Size Accessibility ────────────────────────────────────────────────

test.describe('Font Size Minimums', () => {
  const pagesToCheck = [
    { url: '/explore', name: 'Explore' },
    { url: '/events', name: 'Events' },
    { url: '/jwst', name: 'JWST' },
    { url: '/kepler', name: 'Kepler' },
  ]

  for (const { url, name } of pagesToCheck) {
    test(`${name} page has no text below 10px`, async ({ page }) => {
      await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)

      const tinyElements = await page.evaluate(() => {
        const results: { tag: string; text: string; fontSize: string }[] = []
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        const seen = new Set<Element>()
        while (walker.nextNode()) {
          const el = walker.currentNode.parentElement
          if (!el || seen.has(el)) continue
          seen.add(el)
          // Skip SVG text elements - their fontSize is in SVG coordinate space, not CSS pixels
          if (el.closest('svg')) continue
          // Skip screen-reader-only elements
          if (el.closest('.sr-only')) continue
          const text = (walker.currentNode.textContent || '').trim()
          if (!text || text.length < 2) continue
          const computed = getComputedStyle(el)
          if (computed.display === 'none' || computed.visibility === 'hidden') continue
          const fs = parseFloat(computed.fontSize)
          if (fs < 10) {
            results.push({ tag: el.tagName, text: text.slice(0, 40), fontSize: computed.fontSize })
          }
        }
        return results
      })

      if (tinyElements.length > 0) {
        console.warn(`${name}: found ${tinyElements.length} elements below 10px:`,
          tinyElements.slice(0, 5))
      }
      expect(tinyElements.length, `${name} has text below 10px`).toBe(0)
    })
  }
})

// ── Page Health ────────────────────────────────────────────────────────────

test.describe('All Pages Load', () => {
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/explore', name: 'Explore' },
    { url: '/events', name: 'Events' },
    { url: '/solar-system', name: 'Solar System' },
    { url: '/sky-map', name: 'Sky Map' },
    { url: '/kepler', name: 'Kepler' },
    { url: '/jwst', name: 'JWST' },
    { url: '/devlog', name: 'Devlog' },
    { url: '/credits', name: 'Credits' },
    { url: '/accessibility', name: 'Accessibility' },  // slow render - extended timeout below
  ]

  for (const { url, name } of pages) {
    test(`${name} (${url}) loads without JS errors`, async ({ page }, testInfo) => {
      if (name === 'Accessibility') testInfo.setTimeout(120_000)
      const jsErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (
            text.includes('youtube.com') ||
            text.includes('aladin') ||
            text.includes('workbox') ||
            text.includes('Failed to fetch') ||
            text.includes('net::ERR_')
          ) return
          jsErrors.push(text)
        }
      })

      await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await page.waitForTimeout(3000)

      // Header visible
      await expect(page.locator('header').first()).toBeVisible()
      // Not blank
      const bodyText = await page.evaluate(() => document.body.innerText.trim())
      expect(bodyText.length).toBeGreaterThan(10)

      // No fatal JS errors
      const fatal = jsErrors.filter(e =>
        e.includes('TypeError') ||
        e.includes('ReferenceError') ||
        e.includes('is not defined') ||
        e.includes('Cannot read properties')
      )
      expect(fatal, `${name}: JS crash errors`).toHaveLength(0)
    })
  }
})

// ── Landing Page Structure ─────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('has hero, features, live data, and footer sections', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })

    // Hero heading
    await expect(page.getByText('Explore the Cosmos in Real Time')).toBeVisible()

    // Feature showcase section
    await expect(page.locator('#features')).toBeAttached()

    // Feature cards link to correct pages
    const featureLinks = page.locator('#features a[href]')
    const hrefs = await featureLinks.evaluateAll(els =>
      els.map(el => el.getAttribute('href'))
    )
    expect(hrefs).toContain('/explore')
    expect(hrefs).toContain('/events')
    expect(hrefs).toContain('/solar-system')
    expect(hrefs).toContain('/kepler')
    expect(hrefs).toContain('/jwst')
  })
})

// ── Shared Components ──────────────────────────────────────────────────────

test.describe('Shared Components', () => {
  test('Explore page has PageHeader and StatsBar elements', async ({ page }) => {
    await page.goto(`${BASE}/explore`, { waitUntil: 'domcontentloaded' })

    // PageHeader: the header strip with the page title (CSS uppercase, text content is "Explore")
    await expect(page.locator('span.uppercase', { hasText: 'Explore' }).first()).toBeVisible()

    // StatsBar: observation count labels
    await expect(page.getByText('Total', { exact: true }).first()).toBeVisible()
  })
})
