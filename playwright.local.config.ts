import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:3099',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
  },
  outputDir: './tests/e2e/test-results',
  reporter: [['list']],
  workers: 1,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
