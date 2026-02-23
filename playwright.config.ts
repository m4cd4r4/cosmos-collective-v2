import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,       // 30s per page × 4 snapshots + overhead
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'https://cosmos-collective.com.au',
    headless: false,
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    trace: 'on-first-retry',
    // Give external APIs time to respond
    navigationTimeout: 30_000,
  },
  outputDir: './tests/e2e/screenshots',
  reporter: [['html', { open: 'never' }], ['list']],
  // Run pages sequentially so screenshots are easy to follow
  workers: 1,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
