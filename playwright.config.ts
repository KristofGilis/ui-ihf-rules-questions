import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true, // Re-enable parallel execution with production build
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 1,
  workers: process.env['CI'] ? 1 : undefined,
  timeout: 90000,
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

  // Serve production build to avoid Vite dev server chunk loading issues
  webServer: {
    command: process.env['CI'] ? 'npm run build && npm run preview' : 'npm run preview',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
  },
});
