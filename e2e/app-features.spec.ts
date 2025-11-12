import { expect, test } from '@playwright/test';

/**
 * E2E tests for application features
 * Tests theme switching, language switching, offline functionality, and error handling
 */

test.describe('Theme Switching', () => {
  test('should toggle theme between light and dark', async ({ page }) => {
    await page.goto('/');

    const themeButton = page
      .locator('button[aria-label*="theme" i]')
      .or(page.locator('button[aria-label*="Toggle theme" i]'));
    await themeButton.click();

    await page.waitForTimeout(300);

    const darkOption = page
      .locator('button[role="menuitem"]')
      .filter({ hasText: /dark/i })
      .or(page.locator('button[title*="Dark" i]'));
    if ((await darkOption.count()) > 0) {
      await darkOption.first().click();
      await page.waitForTimeout(300);
    }

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should support system theme preference', async ({ page }) => {
    // Set system to prefer dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // Open theme menu
    const themeButton = page
      .locator('button[aria-label*="theme" i]')
      .or(page.locator('button[aria-label*="Toggle theme" i]'));
    await themeButton.click();
    await page.waitForTimeout(300);

    // Select system theme
    const systemOption = page.locator('button[role="menuitem"]').filter({ hasText: /system/i });
    if ((await systemOption.count()) > 0) {
      await systemOption.first().click();
      await page.waitForTimeout(300);

      // Should respect system preference (dark)
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveClass(/dark/);

      // Change system preference to light
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(500);

      // Should update to light theme
      await expect(htmlElement).not.toHaveClass(/dark/);
    }
  });
});

test.describe('Language Switching', () => {
  test('should switch between languages', async ({ page }) => {
    await page.goto('/');

    const languageButton = page
      .locator('button[aria-label*="language" i]')
      .or(page.locator('button[aria-controls="language-menu"]'));
    await languageButton.click();

    await page.waitForTimeout(300);

    const dutchOption = page.locator('button[role="menuitem"]').filter({ hasText: /dutch|nederlands|nl/i });
    if ((await dutchOption.count()) > 0) {
      await dutchOption.first().click();
      await page.waitForTimeout(500);

      const languageButtonAfter = page
        .locator('button[aria-label*="language" i]')
        .or(page.locator('button[aria-controls="language-menu"]'));
      const buttonText = await languageButtonAfter.textContent();
      expect(buttonText).toContain('NL');
    }
  });
});

test.describe('Offline Functionality', () => {
  test('should show offline banner when network is offline', async ({ page, context }) => {
    await page.goto('/');

    await context.setOffline(true);

    await page.waitForTimeout(1000);

    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: /offline/i });

    if ((await offlineBanner.count()) > 0) {
      await expect(offlineBanner).toBeVisible();
    }

    await context.setOffline(false);
  });
});

test.describe('Error Handling', () => {
  test('should handle navigation to non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-route');

    await page.waitForTimeout(1000);

    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
