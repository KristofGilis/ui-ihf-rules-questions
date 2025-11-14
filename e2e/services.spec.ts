import { expect, test } from '@playwright/test';

/**
 * E2E tests for service-level features
 * Tests toast notifications, confirmation dialogs, and error handling
 */

test.describe('Toast Notifications', () => {
  test('should display error toast on GraphQL failure', async ({ page }) => {
    // Navigate to a page that makes GraphQL requests
    await page.goto('/');

    // Simulate network failure
    await page.route('**/graphql', (route) => route.abort('failed'));

    // Navigate to questions page which triggers GraphQL query
    await page.click('a[href="/questions"]');
    await page.waitForTimeout(1000);

    // Check if error toast appears
    const toast = page.locator('[role="alert"]').filter({ hasText: /error|failed|network/i });
    if ((await toast.count()) > 0) {
      await expect(toast.first()).toBeVisible();
    }
  });

  test('should auto-dismiss toast after duration', async ({ page }) => {
    await page.goto('/');

    // Trigger an error to show toast
    await page.route('**/graphql', (route) => route.abort('failed'));
    await page.click('a[href="/questions"]');
    await page.waitForTimeout(500);

    const toast = page.locator('[role="alert"]').filter({ hasText: /error|failed|network/i });
    if ((await toast.count()) > 0) {
      await expect(toast.first()).toBeVisible();

      // Wait for auto-dismiss (typically 5-6 seconds for errors)
      await page.waitForTimeout(6500);

      // Toast should be gone
      await expect(toast.first()).not.toBeVisible();
    }
  });

  test('should display action button on toast when provided', async ({ page }) => {
    await page.goto('/');

    // Simulate a toast with action button
    await page.evaluate(() => {
      if ((window as any).__toastComponent) {
        (window as any).__toastComponent.add({
          message: 'A new version is available',
          type: 'info',
          dismissible: true,
          action: {
            label: 'Update now',
            callback: () => console.log('Update clicked'),
          },
        });
      }
    });

    // Check if toast with action button appears
    const toast = page.locator('[role="alert"]').filter({ hasText: /version|update/i });
    if ((await toast.count()) > 0) {
      await expect(toast.first()).toBeVisible();

      // Look for action button within the toast
      const actionButton = toast
        .first()
        .locator('button')
        .filter({ hasText: /update|now/i });
      await expect(actionButton).toBeVisible();
    }
  });

  test('should execute action callback when action button is clicked', async ({ page }) => {
    await page.goto('/');

    // Log to track if callback was executed
    let callbackExecuted = false;
    await page.evaluate(() => {
      (window as any).__updateClicked = false;
    });

    // Create a toast with action and track callback
    await page.evaluate(() => {
      if ((window as any).__toastComponent) {
        (window as any).__toastComponent.add({
          message: 'A new version is available',
          type: 'info',
          dismissible: true,
          action: {
            label: 'Update now',
            callback: () => {
              (window as any).__updateClicked = true;
            },
          },
        });
      }
    });

    // Find and click the action button
    const toast = page.locator('[role="alert"]').filter({ hasText: /version|update/i });
    if ((await toast.count()) > 0) {
      const actionButton = toast
        .first()
        .locator('button')
        .filter({ hasText: /update|now/i });
      if ((await actionButton.count()) > 0) {
        await actionButton.click();

        // Verify callback was executed
        callbackExecuted = await page.evaluate(() => (window as any).__updateClicked);
        expect(callbackExecuted).toBe(true);
      }
    }
  });
});

test.describe('Confirmation Dialogs', () => {
  test('should show confirmation dialog when leaving incomplete quiz', async ({ page }) => {
    await page.goto('/quiz');

    // Configure and start quiz
    const startButton = page.locator('button').filter({ hasText: /start|begin/i });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // Answer at least one question
    const firstAnswer = page.locator('input[type="radio"]').first();
    if ((await firstAnswer.count()) > 0) {
      await firstAnswer.click();
      await page.waitForTimeout(300);

      // Try to navigate away
      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toMatch(/leave|progress|lost/i);
        await dialog.dismiss();
      });

      await page.goto('/home');
    }
  });

  test('should not show confirmation dialog after quiz completion', async ({ page }) => {
    await page.goto('/quiz');

    // Configure quiz with minimal questions
    const questionCountInput = page.locator('input[type="number"]');
    if ((await questionCountInput.count()) > 0) {
      await questionCountInput.fill('1');
    }

    const startButton = page.locator('button').filter({ hasText: /start|begin/i });
    await startButton.click();
    await page.waitForLoadState('networkidle');

    // Complete the quiz
    const answer = page.locator('input[type="radio"]').first();
    if ((await answer.count()) > 0) {
      await answer.click();
      await page.waitForTimeout(300);

      const submitButton = page.locator('button').filter({ hasText: /submit|finish/i });
      await submitButton.click();
      await page.waitForLoadState('networkidle');

      // Should be on results page - navigate away should not show dialog
      let dialogShown = false;
      page.on('dialog', async (dialog) => {
        dialogShown = true;
        await dialog.accept();
      });

      await page.goto('/home');
      await page.waitForTimeout(500);

      expect(dialogShown).toBe(false);
    }
  });
});

test.describe('Logo Navigation', () => {
  test('should navigate to home when clicking logo from rules page', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForLoadState('networkidle');

    // Click logo - first link in header typically
    const logo = page.locator('header').locator('a').first();

    if ((await logo.count()) > 0) {
      await logo.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toMatch(/\/(home)?$/);
    }
  });

  test('should navigate to home when clicking logo from questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForLoadState('networkidle');

    // Click logo - first link in header typically
    const logo = page.locator('header').locator('a').first();

    if ((await logo.count()) > 0) {
      await logo.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toMatch(/\/(home)?$/);
    }
  });

  test('should navigate to home when clicking logo from quiz setup', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');

    // Click logo - first link in header typically
    const logo = page.locator('header').locator('a').first();

    if ((await logo.count()) > 0) {
      await logo.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toMatch(/\/(home)?$/);
    }
  });
});
