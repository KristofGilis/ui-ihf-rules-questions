import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Disable parallel execution to prevent Vite chunk loading issues
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 1, // Add 1 retry locally for flaky tests
  workers: process.env['CI'] ? 1 : 1, // Use 1 worker to prevent race conditions
  timeout: 90000, // Extend timeout for quiz completion tests
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start webServer in CI; locally we run the server manually
  ...(process.env['CI'] && {
    webServer: {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
  }),
});
