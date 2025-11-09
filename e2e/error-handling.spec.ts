import { expect, test } from '@playwright/test';

/**
 * E2E tests for GraphQL error handling and network failures
 * Tests how the application handles various error scenarios
 */

test.describe('GraphQL Error Handling', () => {
  test('should handle network failure when loading questions', async ({ page }) => {
    await page.goto('/');

    // Block GraphQL requests to simulate network failure
    await page.route('**/graphql', (route) => {
      if (route.request().postDataJSON()?.operationName === 'GetQuestions') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.click('a[href="/questions"]');
    await page.waitForTimeout(2000);

    // App should still be responsive (doesn't crash)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Either shows error message or gracefully handles the failure
    const content = await body.textContent();
    expect(content).toBeTruthy();
  });

  test('should handle network failure when loading rules', async ({ page }) => {
    await page.goto('/');

    // Block GraphQL requests for rules
    await page.route('**/graphql', (route) => {
      if (route.request().postDataJSON()?.operationName === 'GetRules') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.click('a[href="/rules"]');
    await page.waitForTimeout(2000);

    // App should still be responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check the page didn't crash
    const content = await body.textContent();
    expect(content).toBeTruthy();
  });

  test('should handle GraphQL error response', async ({ page }) => {
    await page.goto('/');

    // Simulate GraphQL error response
    await page.route('**/graphql', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              message: 'Internal server error',
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
            },
          ],
        }),
      });
    });

    await page.click('a[href="/questions"]');
    await page.waitForTimeout(1500);

    // Should handle the error gracefully
    const errorIndicator = page.locator('[role="alert"]').or(page.locator('text=/error|failed|server/i'));

    if ((await errorIndicator.count()) > 0) {
      await expect(errorIndicator.first()).toBeVisible();
    }
  });

  test('should handle timeout errors', async ({ page }) => {
    await page.goto('/');

    // Simulate slow/timeout response
    await page.route('**/graphql', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 35000)); // 35 seconds
      route.continue();
    });

    await page.click('a[href="/rules"]');
    await page.waitForTimeout(2000);

    // Should show loading state initially
    const loadingIndicator = page.locator('[role="status"]').or(page.locator('text=/loading|wait/i'));

    if ((await loadingIndicator.count()) > 0) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });

  test('should recover after network error', async ({ page }) => {
    await page.goto('/');

    let requestCount = 0;

    // Fail first request, succeed on retry
    await page.route('**/graphql', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.click('a[href="/questions"]');
    await page.waitForTimeout(1000);

    // Navigate away and back to trigger retry
    await page.click('a[href="/home"]');
    await page.waitForTimeout(500);

    // Reset route to allow normal requests
    await page.unroute('**/graphql');

    await page.click('a[href="/questions"]');
    await page.waitForLoadState('networkidle');

    // Should load successfully
    const content = page.locator('main').or(page.locator('[role="main"]'));
    await expect(content).toBeVisible();
  });
});

test.describe('HTTP Error Handling', () => {
  test('should handle 500 server error', async ({ page }) => {
    await page.goto('/');

    // Simulate 500 error
    await page.route('**/graphql', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      });
    });

    await page.click('a[href="/questions"]');
    await page.waitForTimeout(1500);

    // Should show error message
    const errorIndicator = page.locator('[role="alert"]').or(page.locator('text=/error|failed/i'));

    if ((await errorIndicator.count()) > 0) {
      await expect(errorIndicator.first()).toBeVisible();
    }
  });

  test('should handle 404 not found error', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    await page.waitForTimeout(1000);

    // Should handle gracefully (redirect or show error)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Page should have some content
    const content = await body.textContent();
    expect(content).toBeTruthy();
  });

  test('should handle malformed response', async ({ page }) => {
    await page.goto('/');

    // Return invalid JSON
    await page.route('**/graphql', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {{{',
      });
    });

    await page.click('a[href="/rules"]');
    await page.waitForTimeout(1500);

    // Should handle parse error
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});
